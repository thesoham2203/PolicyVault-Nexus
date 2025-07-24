# routers/auth.py
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import datetime, timedelta
from typing import Optional
import pyotp
from supabase import create_client, Client
from app.config import settings
from app.security.crypto import verify_password, decrypt_data, get_password_hash, get_fernet_key, encrypt_data
from app.security.jwt import create_access_token, verify_token
# from app.utils.email import send_otp_email
from app.utils.geoip import get_geoip_data
from app.ml.anomaly import LoginAnomalyDetector
# from app.security.fingerprint import verify_device_fingerprint
import redis
import json
from pydantic import BaseModel
from jose import jwt
from jose.exceptions import JWTError
from app.schemas.auth import EmailRequest, AdminRegisterRequest, AdminLoginRequest, Token, TokenData
from app.utils.real_ip import get_real_client_ip
from app.utils.device_info import get_device_name_from_user_agent, get_browser_name
from fastapi.responses import JSONResponse
import ipaddress
from fastapi import status

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/login")

router = APIRouter()
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
anomaly_detector = LoginAnomalyDetector()
# redis_client = redis.from_url(settings.redis_url)

# """Basic connection example.
# """

# r = redis.Redis(
#     host='redis-10105.c270.us-east-1-3.ec2.redns.redis-cloud.com',
#     port=10105,
#     decode_responses=True,
#     username="policyvaultadmin",
#     password="ozyV6Y3qYUBk6dwIbsGrt7ItQmi2DTWk",
# )
# success = r.set('foo', 'bar')
# result = r.get('foo')
# print(result)



class AdminLoginRequest(BaseModel):
    email: str
    password: str
    otp: Optional[str] = None
    device_fingerprint: Optional[str] = None
    invite_token: Optional[str] = None

class AdminRegisterRequest(BaseModel):
    email: str
    password: str
    role: str
    terms_accepted: bool
    device_fingerprint: Optional[str] = None
    otp: str

# @router.post("/register")
# async def register_admin(request: Request, admin_data: AdminRegisterRequest):
#     # Check if email already exists
#     existing_admin = supabase.table("admins").select("*").eq("email", admin_data.email).execute()
#     if existing_admin.data:
#         raise HTTPException(status_code=400, detail="Email already registered")
    
#     # Validate role
#     if admin_data.role not in ["SUPER_ADMIN", "AUDITOR", "ORG_ADMIN"]:
#         raise HTTPException(status_code=400, detail="Invalid role")
    
#     # Check terms acceptance
#     if not admin_data.terms_accepted:
#         raise HTTPException(status_code=400, detail="Must accept terms and conditions")
    
#     # Hash password
#     password_hash = get_password_hash(admin_data.password)
    
#     # Generate TOTP secret
#     totp = pyotp.TOTP(pyotp.random_base32())
#     encrypted_secret, salt = encrypt_data(totp.secret)
    
#     # Create admin in database
#     admin = {
#         "email": admin_data.email,
#         "password_hash": password_hash,
#         "totp_secret_encrypted": encrypted_secret,
#         "role": admin_data.role,
#         "terms_accepted": True
#     }
    
#     try:
#         result = supabase.table("admins").insert(admin).execute()
#         new_admin = result.data[0]
        
#         # Log registration
#         ip_address = request.client.host
#         geo_data = get_geoip_data(ip_address)
        
#         supabase.table("admin_audit_logs").insert({
#             "admin_id": new_admin["id"],
#             "action_type": "REGISTER",
#             "ip_address": ip_address,
#             "location_data": geo_data
#         }).execute()
        
#         # Send initial OTP
#         await send_otp_email(admin_data.email)
        
#         return {"message": "Registration successful. Please verify with OTP sent to your email."}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

# Add this email utility function in the same file if you don't want a separate file
# Initialize Redis with your configuration
redis_client = None
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True,
        username=os.getenv('REDIS_USERNAME'),
        password=os.getenv('REDIS_PASSWORD'),
    )
except Exception as e:
    print(f"Failed to connect to Redis: {str(e)}")
    raise

# JWT Configuration
JWT_ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def generate_otp(email: str) -> str:
    """Generate a 6-digit OTP"""
    totp = pyotp.TOTP(pyotp.random_base32(), interval=300)  # 5 minute expiry
    return totp.now()

async def send_otp_email(email: str, otp_code: str):
    """Send OTP email using EmailJS"""
    try:
        # Verify EmailJS configuration
        if not all([settings.emailjs_service_id, settings.emailjs_template_id, settings.emailjs_user_id, settings.emailjs_private_key]):
            raise HTTPException(500, detail="EmailJS configuration incomplete")

        # Prepare payload
        payload = {
            "service_id": settings.emailjs_service_id,
            "template_id": settings.emailjs_template_id2,
            "user_id": settings.emailjs_user_id,
            "accessToken": settings.emailjs_private_key,
            "template_params": {
                "to_email": email,
                "otp_code": otp_code,
                "reply_to": "no-reply@policyvault.nexus.com"
            }
        }

        # Send request to EmailJS
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.emailjs.com/api/v1.0/email/send",
                json=payload,
                timeout=15.0
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=502,
                    detail=f"Email service error: {response.text}"
                )

        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send OTP email: {str(e)}"
        )
    
    
async def store_otp_in_db(email: str, otp_code: str):
    try:
        supabase.table("otp_storage").insert({
            "email": email,
            "otp_code": otp_code,
            "expires_at": datetime.utcnow() + timedelta(minutes=5)
        }).execute()
    except Exception as e:
        print(f"Failed to store OTP in database: {e}")

async def log_admin_action(
    admin_id: Optional[str] = None,
    email: Optional[str] = None,
    action_type: str = "UNKNOWN",
    ip_address: Optional[str] = None,
    # device_fingerprint: Optional[str] = None,
    details: Optional[dict] = None
):
    """Centralized async logging for admin actions"""
    try:
        if not ip_address:
            ip_address = "0.0.0.0"
            
        log_data = {
            "admin_id": admin_id,
            "email": email,
            "action_type": action_type,
            "ip_address": ip_address,
            "location_data": await get_geoip_data(ip_address),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # if device_fingerprint:
        #     log_data["device_fingerprint"] = device_fingerprint
            
        if details:
            log_data["action_details"] = details
            
        supabase.table("admin_audit_logs").insert(log_data).execute()
    except Exception as e:
        print(f"Failed to log admin action: {str(e)}")


def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token with RS256 algorithm"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    # Load your private key (should be in PEM format)
    private_key = settings.jwt_private_key
    if not private_key:
        raise HTTPException(
            status_code=500,
            detail="JWT private key not configured"
        )
    
    encoded_jwt = jwt.encode(
        to_encode,
        private_key,
        algorithm=JWT_ALGORITHM
    )
    return encoded_jwt

def verify_jwt_token(token: str):
    """Verify JWT token with RS256 algorithm"""
    try:
        # Load your public key (should be in PEM format)
        public_key = settings.jwt_public_key
        if not public_key:
            raise HTTPException(
                status_code=500,
                detail="JWT public key not configured"
            )
            
        payload = jwt.decode(
            token,
            public_key,
            algorithms=[JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )

# @router.post("/send-otp")
# async def send_otp(
#     email_data: EmailRequest,
#     background_tasks: BackgroundTasks,
#     request: Request
# ):
#     """Endpoint to send OTP email"""
#     try:
#         # Check if email is already registered
#         existing_admin = supabase.table("admins").select("*").eq("email", email_data.email).execute()
#         # if existing_admin.data:
#         #     raise HTTPException(status_code=400, detail="Email already registered")
        

#         print("Supabase response:", existing_admin)
        
#         if existing_admin.data:
#             print("Email already registered")
#             raise HTTPException(status_code=400, detail="Email already registered")
        
#         print("Adding background task...")
#         # Add to background tasks to avoid blocking
#         background_tasks.add_task(send_otp_email, email_data.email)
        
#         # Log OTP request
#         ip_address = get_real_client_ip(request)
#         geo_data = get_geoip_data(ip_address)
        
#         supabase.table("admin_audit_logs").insert({
#             "action_type": "OTP_REQUEST",
#             "email": email_data.email,
#             "ip_address": ip_address,
#             "location_data": geo_data
#         }).execute()
        
#         return {"message": "OTP is being sent to your email"}
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to initiate OTP sending: {str(e)}"
#         )

@router.post("/send-otp")
async def send_otp(
    email_data: EmailRequest,
    background_tasks: BackgroundTasks,
    request: Request
):
    """Endpoint to send OTP email"""
    try:
        # Check if email is already registered
        existing_admin = supabase.table("admins").select("*").eq("email", email_data.email).execute()
        if existing_admin.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Generate and store OTP
        otp_code = generate_otp(email_data.email)
        redis_client.setex(f"otp:{email_data.email}", 300, otp_code)

        # Prepare email payload
        payload = {
            "service_id": settings.emailjs_service_id,
            "template_id": settings.emailjs_template_id2,
            "user_id": settings.emailjs_user_id,
            "accessToken": settings.emailjs_private_key,
            "template_params": {
                "to_email": email_data.email,
                "otp_code": otp_code,
                "reply_to": "no-reply@policyvault.nexus.com"
            }
        }

        # Send email in background
        background_tasks.add_task(send_emailjs_request, payload)

        # Log OTP request
        ip_address = get_real_client_ip(request)
        geo_data = await get_geoip_data(ip_address)
        
        supabase.table("admin_audit_logs").insert({
            "action_type": "OTP_REQUEST",
            "email": email_data.email,
            "ip_address": ip_address,
            "location_data": geo_data
        }).execute()

        return {"message": "OTP is being sent to your email"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP. Please try again later."
        )

async def send_emailjs_request(payload: dict):
    """Helper function to send email via EmailJS"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.emailjs.com/api/v1.0/email/send",
                json=payload,
                timeout=15.0
            )
            response.raise_for_status()
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

# @router.post("/register")
# async def register_admin(
#     request: Request, 
#     admin_data: AdminRegisterRequest,
#     background_tasks: BackgroundTasks
# ):
#     try:
#         # Verify OTP
#         stored_otp = redis_client.get(f"otp:{admin_data.email}")
#         if not stored_otp or stored_otp != admin_data.otp:
#             raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
#         # Check if email already exists
#         existing_admin = supabase.table("admins").select("*").eq("email", admin_data.email).execute()
#         if existing_admin.data:
#             raise HTTPException(status_code=400, detail="Email already registered")
        
#         # Validate role
#         if admin_data.role not in ["SUPER_ADMIN", "AUDITOR", "ORG_ADMIN"]:
#             raise HTTPException(status_code=400, detail="Invalid role")
        
#         # Check terms acceptance
#         if not admin_data.terms_accepted:
#             raise HTTPException(status_code=400, detail="Must accept terms and conditions")
        
#         # Hash password
#         password_hash = get_password_hash(admin_data.password)
        
#         # Generate TOTP secret
#         totp = pyotp.TOTP(pyotp.random_base32())
#         encrypted_secret, salt = encrypt_data(totp.secret)
        
#         # Create admin in database
#         admin = {
#             "email": admin_data.email,
#             "password_hash": password_hash,
#             "totp_secret_encrypted": encrypted_secret,
#             "role": admin_data.role,
#             "terms_accepted": True
#         }
        
#         result = supabase.table("admins").insert(admin).execute()
#         new_admin = result.data[0]
        
#         # Log registration
#         ip_address = request.client.host
#         geo_data = get_geoip_data(ip_address)
        
#         supabase.table("admin_audit_logs").insert({
#             "admin_id": new_admin["id"],
#             "action_type": "REGISTER",
#             "ip_address": ip_address,
#             "location_data": geo_data
#         }).execute()
        
#         return {"message": "Registration successful. Please login."}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/register")
async def register_admin(
    request: Request, 
    admin_data: AdminRegisterRequest,
    background_tasks: BackgroundTasks
):
    try:
        # Verify OTP first
        stored_otp = redis_client.get(f"otp:{admin_data.email}")
        if not stored_otp or stored_otp != admin_data.otp:
            log_admin_action(
                email=admin_data.email,
                action_type="REGISTER_OTP_FAILED",
                ip_address=get_real_client_ip(request),
                details={"error": "Invalid or expired OTP"}
            )
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Rest of your registration logic...
        # Check if email already exists
        existing_admin = supabase.table("admins").select("*").eq("email", admin_data.email).execute()
        if existing_admin.data:
            log_admin_action(
                email=admin_data.email,
                action_type="REGISTER_DUPLICATE_EMAIL",
                ip_address=get_real_client_ip(request)
            )
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate role
        if admin_data.role not in ["SUPER_ADMIN", "AUDITOR", "ORG_ADMIN"]:
            log_admin_action(
                email=admin_data.email,
                action_type="REGISTER_INVALID_ROLE",
                ip_address=get_real_client_ip(request),
                details={"invalid_role": admin_data.role}
            )
            raise HTTPException(status_code=400, detail="Invalid role")
        
        if admin_data.role == "SUPER_ADMIN":
            # Check if SUPER_ADMIN already exists
            existing_super_admin = supabase.table("admins").select("*").eq("role", "SUPER_ADMIN").execute()
            if existing_super_admin.data:
                log_admin_action(
                    action_type="REGISTER_SUPER_ADMIN_EXISTS",
                    ip_address=get_real_client_ip(request)
                )
                raise HTTPException(
                    status_code=400,
                    detail="Super admin already exists. Only one super admin is allowed."
                )
        
        # Check terms acceptance
        if not admin_data.terms_accepted:
            log_admin_action(
                email=admin_data.email,
                action_type="REGISTER_TERMS_REJECTED",
                ip_address=get_real_client_ip(request)
            )
            raise HTTPException(status_code=400, detail="Must accept terms and conditions")
        
        # Hash password
        password_hash = get_password_hash(admin_data.password)
        
        # Generate TOTP secret
        totp = pyotp.TOTP(pyotp.random_base32())
        encrypted_secret, salt = encrypt_data(totp.secret)
        
        # Create admin in database
        admin = {
            "email": admin_data.email,
            "password_hash": password_hash,
            "totp_secret_encrypted": encrypted_secret,
            "role": admin_data.role,
            "salt": salt,
            "terms_accepted": True,
            "is_active": True
        }
        
        result = supabase.table("admins").insert(admin).execute()
        new_admin = result.data[0]
        
        # Log registration
        ip_address = get_real_client_ip(request)
        geo_data = await get_geoip_data(ip_address)
        user_agent = request.headers.get("user-agent", "Unknown")

        if admin_data.device_fingerprint:
            device_name = get_device_name_from_user_agent(user_agent)

            device_data = {
                "admin_id": new_admin["id"],
                "device_fingerprint": admin_data.device_fingerprint,
                "device_name": device_name,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "last_login": datetime.utcnow().isoformat()
            }

            supabase.table("admin_devices").insert(device_data).execute()

            # supabase.table("admin_devices").insert({
            #     "admin_id": new_admin["id"],
            #     "device_fingerprint": admin_data.device_fingerprint,
            #     "ip_address": ip_address,
            #     "last_login": datetime.utcnow().isoformat()
            # }).execute()
        
        # supabase.table("admin_audit_logs").insert({
        #     "admin_id": new_admin["id"],
        #     "action_type": "REGISTER",
        #     "ip_address": ip_address,
        #     "location_data": geo_data
        # }).execute()

            log_admin_action(
                admin_id=new_admin["id"],
                action_type="DEVICE_REGISTERED",
                ip_address=ip_address,
                details={
                    "device_name": device_name,
                    "fingerprint": admin_data.device_fingerprint[:6] + "..."  # Partial for security
                }
            )
        
        # log_admin_action(
        #     admin_id=new_admin["id"],
        #     email=new_admin["email"],
        #     action_type="REGISTER_SUCCESS",
        #     ip_address=ip_address,
        #     device_fingerprint=admin_data.device_fingerprint,
        #     details={
        #         "role": admin_data.role,
        #         "geo_data": geo_data
        #     }
        # )

        try:
            await log_admin_action(
                admin_id=new_admin["id"],
                email=new_admin["email"],
                action_type="REGISTER_SUCCESS",
                ip_address=ip_address,
                # device_fingerprint=admin_data.device_fingerprint if hasattr(admin_data, 'device_fingerprint') else None,
                details={
                    "role": admin_data.role,
                    "geo_data": geo_data
                }
            )
            print(f"DEBUG: Successfully logged REGISTER_SUCCESS for admin {new_admin['id']}")  # Debug line
        except Exception as log_error:
            print(f"ERROR: Failed to log registration: {str(log_error)}")

        # Delete the used OTP
        redis_client.delete(f"otp:{admin_data.email}")
        
        return {
            "message": "Registration successful",
            "admin_id": new_admin["id"],
            "requires_verification": True
        }
    except Exception as e:
        log_admin_action(
            email=admin_data.email if 'admin_data' in locals() else None,
            action_type="REGISTER_FAILED",
            ip_address=get_real_client_ip(request),
            details={"error": str(e)}
        )
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


async def register_admin_device(
    admin_id: str,
    device_fingerprint: str,
    request: Request
) -> None:
    """Register or update an admin device with comprehensive information"""
    if not device_fingerprint:
        return
        
    user_agent = request.headers.get("user-agent", "Unknown Device")
    device_name = get_device_name_from_user_agent(user_agent)
    ip_address = request.state.real_ip
    
    # Check if device already exists
    existing_device = supabase.table("admin_devices") \
        .select("*") \
        .eq("admin_id", admin_id) \
        .eq("device_fingerprint", device_fingerprint) \
        .execute()
    
    device_data = {
        "admin_id": admin_id,
        "device_fingerprint": device_fingerprint,
        "device_name": device_name,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "last_login": datetime.utcnow().isoformat()
    }
    
    if existing_device.data:
        # Update existing device
        supabase.table("admin_devices") \
            .update(device_data) \
            .eq("id", existing_device.data[0]["id"]) \
            .execute()
    else:
        # Insert new device
        supabase.table("admin_devices").insert(device_data).execute()
    
    # Log the device registration
    log_admin_action(
        admin_id=admin_id,
        action_type="DEVICE_REGISTERED",
        ip_address=ip_address,
        details={
            "device_fingerprint": device_fingerprint,
            "device_name": device_name,
            "user_agent": user_agent
        }
    )

# @router.post("/login")
# @router.post("/login")
# async def admin_login(
#     login_data: AdminLoginRequest,
#     request: Request,
#     background_tasks: BackgroundTasks
# ):
#     """
#     Admin login endpoint with multi-factor authentication
    
#     Flow:
#     1. Verify email/password
#     2. If correct, send OTP (if not provided)
#     3. Verify OTP (if provided)
#     4. Check device fingerprint
#     5. Check IP restrictions
#     6. Generate JWT token
#     """
#     try:
#         # Get real client IP
#         ip_address = get_real_client_ip(request)
#         user_agent = request.headers.get("user-agent", "")
        
#         # Step 1: Verify credentials
#         admin = supabase.table("admins").select("*").eq("email", login_data.email).execute()
#         if not admin.data:
#             await log_admin_action(
#                 email=login_data.email,
#                 action_type="LOGIN_FAILED",
#                 ip_address=ip_address,
#                 details={"error": "Admin not found"}
#             )
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid credentials"
#             )
            
#         admin = admin.data[0]
        
#         # Check if admin is active
#         if not admin.get("is_active", True):
#             await log_admin_action(
#                 admin_id=admin["id"],
#                 action_type="LOGIN_FAILED",
#                 ip_address=ip_address,
#                 details={"error": "Admin account disabled"}
#             )
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Admin account is disabled"
#             )
        
#         # Verify password
#         if not verify_password(login_data.password, admin["password_hash"]):
#             await log_admin_action(
#                 admin_id=admin["id"],
#                 action_type="LOGIN_FAILED",
#                 ip_address=ip_address,
#                 details={"error": "Invalid password"}
#             )
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid credentials"
#             )
        
#         # Check invite token for non-super admins
#         if admin["role"] != "SUPER_ADMIN" and not login_data.invite_token:
#             await log_admin_action(
#                 admin_id=admin["id"],
#                 action_type="LOGIN_FAILED",
#                 ip_address=ip_address,
#                 details={"error": "Invite token required"}
#             )
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Invite token is required for non-super admins"
#             )
        
#             # Verify invite token if provided
#         if admin["role"] != "SUPER_ADMIN" and login_data.invite_token:
#             valid_token = supabase.table("admin_invites").select("*").eq(
#                 "token", login_data.invite_token
#             ).eq("email", login_data.email).eq("is_used", False).execute()
            
#             if not valid_token.data:
#                 await log_admin_action(
#                     admin_id=admin["id"],
#                     action_type="LOGIN_FAILED",
#                     ip_address=ip_address,
#                     details={"error": "Invalid invite token"}
#                 )
#                 raise HTTPException(
#                     status_code=status.HTTP_403_FORBIDDEN,
#                     detail="Invalid or expired invite token"
#                 )
        
#         # Step 2: Handle OTP flow
#         if not login_data.otp:
#             # Generate and send OTP
#             otp_code = generate_otp(admin["email"])
#             redis_client.setex(
#                 f"admin:otp:{admin['email']}", 
#                 settings.otp_expiry_seconds, 
#                 json.dumps({
#                     "admin_id": admin["id"],
#                     "attempts": 0,
#                     "secret": admin["totp_secret_encrypted"],
#                     "salt": "static_salt_for_now"  # In prod, use dynamic salt
#                 })
#             )
            
#             # Send OTP via email
#             background_tasks.add_task(
#                 send_otp_email, 
#                 admin["email"], 
#                 otp_code
#             )
            
#             await log_admin_action(
#                 admin_id=admin["id"],
#                 action_type="LOGIN_OTP_SENT",
#                 ip_address=ip_address,
#                 details={"device": login_data.device_fingerprint}
#             )
            
#             return {
#                 "message": "OTP sent to registered email",
#                 "requires_otp": True,
#                 "admin_id": admin["id"]
#             }
        
#         # Step 3: Verify OTP if provided
#         otp_key = f"admin:otp:{admin['email']}"
#         otp_data = redis_client.get(otp_key)
        
#         if not otp_data:
#             await log_admin_action(
#                 admin_id=admin["id"],
#                 action_type="LOGIN_FAILED",
#                 ip_address=ip_address,
#                 details={"error": "OTP expired or not requested"}
#             )
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="OTP expired or not requested"
#             )
            
#         otp_data = json.loads(otp_data)
        
#         # Decrypt TOTP secret
#         totp_secret = decrypt_data(otp_data["secret"], otp_data["salt"])
#         totp = pyotp.TOTP(totp_secret, interval=settings.otp_expiry_seconds)
        
#         if not totp.verify(login_data.otp):
#             # Increment failed attempts
#             otp_data["attempts"] += 1
#             redis_client.setex(otp_key, settings.otp_expiry_seconds, json.dumps(otp_data))
            
#             if otp_data["attempts"] >= 3:
#                 redis_client.delete(otp_key)
#                 await log_admin_action(
#                     admin_id=admin["id"],
#                     action_type="LOGIN_OTP_LOCKED",
#                     ip_address=ip_address,
#                     details={"attempts": otp_data["attempts"]}
#                 )
#                 raise HTTPException(
#                     status_code=status.HTTP_403_FORBIDDEN,
#                     detail="Too many failed OTP attempts. Please request a new OTP."
#                 )
            
#             await log_admin_action(
#                 admin_id=admin["id"],
#                 action_type="LOGIN_OTP_FAILED",
#                 ip_address=ip_address,
#                 details={"attempts": otp_data["attempts"]}
#             )
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid OTP"
#             )
        
#         # OTP verified - delete it
#         redis_client.delete(otp_key)
        
#         # Step 4: Device verification
#         if login_data.device_fingerprint:
#             device = supabase.table("admin_devices") \
#                 .select("*") \
#                 .eq("admin_id", admin["id"]) \
#                 .eq("device_fingerprint", login_data.device_fingerprint) \
#                 .execute()
            
#             if device.data:
#                 device = device.data[0]
#                 if device["is_blocked"]:
#                     await log_admin_action(
#                         admin_id=admin["id"],
#                         action_type="LOGIN_DEVICE_BLOCKED",
#                         ip_address=ip_address,
#                         details={"device_id": device["id"]}
#                     )
#                     raise HTTPException(
#                         status_code=status.HTTP_403_FORBIDDEN,
#                         detail="This device is blocked from accessing the admin portal"
#                     )
#             else:
#                 # Register new device
#                 device_name = get_device_name_from_user_agent(user_agent)
#                 supabase.table("admin_devices").insert({
#                     "admin_id": admin["id"],
#                     "device_fingerprint": login_data.device_fingerprint,
#                     "device_name": device_name,
#                     "ip_address": ip_address,
#                     "user_agent": user_agent,
#                     "last_login": datetime.utcnow().isoformat()
#                 }).execute()
                
#                 await log_admin_action(
#                     admin_id=admin["id"],
#                     action_type="DEVICE_REGISTERED",
#                     ip_address=ip_address,
#                     details={
#                         "fingerprint": login_data.device_fingerprint,
#                         "device_name": device_name
#                     }
#                 )
        
#         # Step 5: IP restrictions
#         if admin["role"] != "SUPER_ADMIN":
#             allowed_ips = supabase.table("admin_allowed_ips") \
#                 .select("ip_address") \
#                 .eq("admin_id", admin["id"]) \
#                 .execute()
            
#             if allowed_ips.data:
#                 ip_allowed = False
#                 for allowed_ip in allowed_ips.data:
#                     if ipaddress.ip_address(ip_address) in ipaddress.ip_network(allowed_ip["ip_address"]):
#                         ip_allowed = True
#                         break
                
#                 if not ip_allowed:
#                     await log_admin_action(
#                         admin_id=admin["id"],
#                         action_type="LOGIN_IP_BLOCKED",
#                         ip_address=ip_address,
#                         details={"allowed_ips": [ip["ip_address"] for ip in allowed_ips.data]}
#                     )
#                     raise HTTPException(
#                         status_code=status.HTTP_403_FORBIDDEN,
#                         detail="Login not allowed from this IP address"
#                     )
        
#         # Step 6: Anomaly detection
#         geo_data = await get_geoip_data(ip_address)
#         anomaly_score = anomaly_detector.detect_anomaly(
#             timestamp=datetime.utcnow(),
#             location=geo_data,
#             admin_id=admin["id"]
#         )
        
#         if anomaly_score > 0.8:  # High anomaly score
#             await alert_super_admin(
#                 f"Anomalous login detected for admin {admin['email']}",
#                 {
#                     "score": anomaly_score,
#                     "location": geo_data,
#                     "ip": ip_address,
#                     "timestamp": datetime.utcnow().isoformat()
#                 }
#             )
            
#             if anomaly_score > 0.9:  # Very high - block login
#                 await log_admin_action(
#                     admin_id=admin["id"],
#                     action_type="LOGIN_ANOMALY_BLOCKED",
#                     ip_address=ip_address,
#                     details={
#                         "score": anomaly_score,
#                         "location": geo_data
#                     }
#                 )
#                 raise HTTPException(
#                     status_code=status.HTTP_403_FORBIDDEN,
#                     detail="Login blocked due to suspicious activity"
#                 )
        
#         # Step 7: Generate JWT token
#         access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
#         access_token = create_access_token(
#             data={
#                 "sub": admin["email"],
#                 "role": admin["role"],
#                 "admin_id": admin["id"],
#                 "device_fp": login_data.device_fingerprint
#             },
#             expires_delta=access_token_expires
#         )
        
#         # Step 8: Update device last login
#         if login_data.device_fingerprint:
#             supabase.table("admin_devices") \
#                 .update({"last_login": datetime.utcnow().isoformat()}) \
#                 .eq("device_fingerprint", login_data.device_fingerprint) \
#                 .execute()
        
#         # Step 9: Log successful login
#         await log_admin_action(
#             admin_id=admin["id"],
#             action_type="LOGIN_SUCCESS",
#             ip_address=ip_address,
#             details={
#                 "device": login_data.device_fingerprint,
#                 "anomaly_score": anomaly_score,
#                 "location": geo_data
#             }
#         )
        
#         # Step 10: Return token in secure cookie
#         response = JSONResponse(
#             content={
#                 "access_token": access_token,
#                 "token_type": "bearer",
#                 "role": admin["role"],
#                 "admin_id": admin["id"]
#             }
#         )
        
#         response.set_cookie(
#             key="adminToken",
#             value=access_token,
#             httponly=True,
#             secure=True,
#             samesite="strict",
#             max_age=settings.jwt_access_token_expire_minutes * 60,
#             path="/admin"
#         )
        
#         return response
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         await log_admin_action(
#             email=login_data.email,
#             action_type="LOGIN_ERROR",
#             ip_address=get_real_client_ip(request),
#             details={"error": str(e)}
#         )
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Login process failed"
#         )

@router.post("/login")
async def admin_login(
    login_data: AdminLoginRequest,
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Admin login endpoint with multi-factor authentication
    
    Flow:
    1. Verify email/password
    2. For rasikathakur303@gmail.com: require OTP
    3. For other emails: require invite token
    4. Check device fingerprint
    5. Check IP restrictions
    6. Generate JWT token
    """
    try:
        # Get real client IP
        ip_address = get_real_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        
        # Step 1: Verify credentials
        admin = supabase.table("admins").select("*").eq("email", login_data.email).execute()
        if not admin.data:
            await log_admin_action(
                email=login_data.email,
                action_type="LOGIN_FAILED",
                ip_address=ip_address,
                details={"error": "Admin not found"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
            
        admin = admin.data[0]
        
        # Check if admin is active
        if not admin.get("is_active", True):
            await log_admin_action(
                admin_id=admin["id"],
                action_type="LOGIN_FAILED",
                ip_address=ip_address,
                details={"error": "Admin account disabled"}
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin account is disabled"
            )
        
        # Verify password
        if not verify_password(login_data.password, admin["password_hash"]):
            await log_admin_action(
                admin_id=admin["id"],
                action_type="LOGIN_FAILED",
                ip_address=ip_address,
                details={"error": "Invalid password"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Special handling for rasikathakur303@gmail.com
        if login_data.email == "rasikathakur303@gmail.com":
            # Step 2: Handle OTP flow for this specific email
            if not login_data.otp:
                # Generate and send OTP
                otp_code = generate_otp(admin["email"])
                
                # Store OTP data in Redis
                otp_data = {
                    "admin_id": admin["id"],
                    "attempts": 0,
                    "otp_code": otp_code,
                    "created_at": datetime.utcnow().isoformat()
                }
                
                redis_client.setex(
                    f"admin:otp:{admin['email']}", 
                    settings.otp_expiry_seconds, 
                    json.dumps(otp_data)
                )
                
                # Also store simple OTP for quick verification
                redis_client.setex(
                    f"otp:{admin['email']}",
                    settings.otp_expiry_seconds,
                    otp_code
                )
                
                # Send OTP email
                background_tasks.add_task(
                    send_otp_email, 
                    admin["email"], 
                    otp_code
                )
                
                await log_admin_action(
                    admin_id=admin["id"],
                    action_type="LOGIN_OTP_SENT",
                    ip_address=ip_address,
                    details={"device": login_data.device_fingerprint}
                )
                
                return {
                    "message": "OTP sent to registered email",
                    "requires_otp": True,
                    "admin_id": admin["id"]
                }
        else:
            # For other emails, require invite token
            if not login_data.invite_token:
                await log_admin_action(
                    admin_id=admin["id"],
                    action_type="LOGIN_FAILED",
                    ip_address=ip_address,
                    details={"error": "Invite token required"}
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invite token is required for this email"
                )
            
            # Verify invite token if provided
            valid_token = supabase.table("admin_invites").select("*").eq(
                "token", login_data.invite_token
            ).eq("email", login_data.email).eq("is_used", False).execute()
            
            if not valid_token.data:
                await log_admin_action(
                    admin_id=admin["id"],
                    action_type="LOGIN_FAILED",
                    ip_address=ip_address,
                    details={"error": "Invalid invite token"}
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid or expired invite token"
                )
        
        # Step 3: Verify OTP if provided (only for rasikathakur303@gmail.com)
        # if login_data.email == "rasikathakur303@gmail.com" and login_data.otp:
        #     otp_key = f"admin:otp:{admin['email']}"
        #     otp_data = redis_client.get(otp_key)
            
        #     if not otp_data:
        #         await log_admin_action(
        #             admin_id=admin["id"],
        #             action_type="LOGIN_FAILED",
        #             ip_address=ip_address,
        #             details={"error": "OTP expired or not requested"}
        #         )
        #         raise HTTPException(
        #             status_code=status.HTTP_400_BAD_REQUEST,
        #             detail="OTP expired or not requested"
        #         )
                
        #     try:    
        #         otp_data = json.loads(otp_data)

        #         # Get the admin record again to ensure we have the latest salt
        #         admin_record = supabase.table("admins").select("*").eq("id", admin["id"]).execute().data[0]
        #         if not admin_record or not admin_record.get("salt"):
        #             raise HTTPException(
        #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #                 detail="Admin record not found or missing salt"
        #             )
                
        #         # stored_otp_code = redis_client.get(f"otp:{admin['email']}")
        #         # if not stored_otp_code or stored_otp_code != login_data.otp:
        #         # # Decrypt TOTP secret
        #         #     totp_secret = decrypt_data(otp_data["secret"], otp_data["salt"])
        #         #     totp = pyotp.TOTP(totp_secret, interval=settings.otp_expiry_seconds)

        #         # Use the salt from the admin record
        #         totp_secret = decrypt_data(admin_record["totp_secret_encrypted"], admin_record["salt"])
        #         if not totp_secret:
        #             raise HTTPException(
        #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #                 detail="Failed to decrypt TOTP secret"
        #             )
                    
        #         totp = pyotp.TOTP(totp_secret, interval=settings.otp_expiry_seconds)

        #         if not totp.verify(login_data.otp):
        #             # Increment failed attempts
        #             otp_data["attempts"] += 1
        #             # redis_client.setex(otp_key, settings.otp_expiry_seconds, json.dumps(otp_data))
        #             redis_client.setex(
        #                 otp_key, 
        #                 settings.otp_expiry_seconds, 
        #                 json.dumps({
        #                     "admin_id": admin["id"],
        #                     "attempts": 0,
        #                     "secret": admin["totp_secret_encrypted"],
        #                     "salt": admin["salt"]  # Use the actual salt stored with the admin
        #                 })
        #             )
        #             if otp_data["attempts"] >= 3:
        #                 redis_client.delete(otp_key)
        #                 await log_admin_action(
        #                     admin_id=admin["id"],
        #                     action_type="LOGIN_OTP_LOCKED",
        #                     ip_address=ip_address,
        #                     details={"attempts": otp_data["attempts"]}
        #                 )
        #                 raise HTTPException(
        #                     status_code=status.HTTP_403_FORBIDDEN,
        #                     detail="Too many failed OTP attempts. Please request a new OTP."
        #                 )
                    
        #             await log_admin_action(
        #                 admin_id=admin["id"],
        #                 action_type="LOGIN_OTP_FAILED",
        #                 ip_address=ip_address,
        #                 details={"attempts": otp_data["attempts"]}
        #             )
        #             raise HTTPException(
        #                 status_code=status.HTTP_401_UNAUTHORIZED,
        #                 detail="Invalid OTP"
        #             )
        #     except (json.JSONDecodeError, KeyError) as e:
        #         await log_admin_action(
        #             admin_id=admin["id"],
        #             action_type="LOGIN_ERROR",
        #             ip_address=ip_address,
        #             details={"error": f"OTP data corrupted: {str(e)}"}
        #         )
        #         raise HTTPException(
        #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        #             detail="OTP verification failed. Please try again."
        #         )    
            
        #     # OTP verified - delete it
        #     redis_client.delete(otp_key)
        #     redis_client.delete(f"otp:{admin['email']}")

        if login_data.email == "rasikathakur303@gmail.com" and login_data.otp:
            otp_key = f"admin:otp:{admin['email']}"
            otp_data = redis_client.get(otp_key)
            
            if not otp_data:
                await log_admin_action(
                    admin_id=admin["id"],
                    action_type="LOGIN_FAILED",
                    ip_address=ip_address,
                    details={"error": "OTP expired or not requested"}
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="OTP expired or not requested"
                )
                
            try:
                # Simplified OTP verification
                stored_otp = redis_client.get(f"otp:{admin['email']}")
                if not stored_otp or stored_otp != login_data.otp:
                    await log_admin_action(
                        admin_id=admin["id"],
                        action_type="LOGIN_OTP_FAILED",
                        ip_address=ip_address,
                        details={"attempt": 1}  # Track attempts if needed
                    )
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid OTP"
                    )
                
                # OTP verified - clean up
                redis_client.delete(otp_key)
                redis_client.delete(f"otp:{admin['email']}")

            except Exception as e:
                await log_admin_action(
                    admin_id=admin["id"],
                    action_type="LOGIN_ERROR",
                    ip_address=ip_address,
                    details={"error": f"OTP verification failed: {str(e)}"}
                )
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="OTP verification failed"
                )
        
        # Step 4: Device verification
        if login_data.device_fingerprint:
            device = supabase.table("admin_devices") \
                .select("*") \
                .eq("admin_id", admin["id"]) \
                .eq("device_fingerprint", login_data.device_fingerprint) \
                .execute()
            
            if device.data:
                device = device.data[0]
                if device["is_blocked"]:
                    await log_admin_action(
                        admin_id=admin["id"],
                        action_type="LOGIN_DEVICE_BLOCKED",
                        ip_address=ip_address,
                        details={"device_id": device["id"]}
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="This device is blocked from accessing the admin portal"
                    )
            else:
                # Register new device
                device_name = get_device_name_from_user_agent(user_agent)
                supabase.table("admin_devices").insert({
                    "admin_id": admin["id"],
                    "device_fingerprint": login_data.device_fingerprint,
                    "device_name": device_name,
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "last_login": datetime.utcnow().isoformat()
                }).execute()
                
                await log_admin_action(
                    admin_id=admin["id"],
                    action_type="DEVICE_REGISTERED",
                    ip_address=ip_address,
                    details={
                        "fingerprint": login_data.device_fingerprint,
                        "device_name": device_name
                    }
                )
        
        # Step 5: IP restrictions
        if admin["role"] != "SUPER_ADMIN":
            allowed_ips = supabase.table("admin_allowed_ips") \
                .select("ip_address") \
                .eq("admin_id", admin["id"]) \
                .execute()
            
            if allowed_ips.data:
                ip_allowed = False
                for allowed_ip in allowed_ips.data:
                    if ipaddress.ip_address(ip_address) in ipaddress.ip_network(allowed_ip["ip_address"]):
                        ip_allowed = True
                        break
                
                if not ip_allowed:
                    await log_admin_action(
                        admin_id=admin["id"],
                        action_type="LOGIN_IP_BLOCKED",
                        ip_address=ip_address,
                        details={"allowed_ips": [ip["ip_address"] for ip in allowed_ips.data]}
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Login not allowed from this IP address"
                    )
        
        # Step 6: Anomaly detection
        geo_data = await get_geoip_data(ip_address)
        anomaly_score = anomaly_detector.detect_anomaly(
            timestamp=datetime.utcnow(),
            location=geo_data,
            admin_id=admin["id"]  # Pass None for non-admin users
        )
        
        if anomaly_score > 0.8:  # High anomaly score
            await alert_super_admin(
                f"Anomalous login detected for admin {admin['email']}",
                {
                    "score": anomaly_score,
                    "location": geo_data,
                    "ip": ip_address,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            # if anomaly_score > 0.9:  # Very high - block login
            #     await log_admin_action(
            #         admin_id=admin["id"],
            #         action_type="LOGIN_ANOMALY_BLOCKED",
            #         ip_address=ip_address,
            #         details={
            #             "score": anomaly_score,
            #             "location": geo_data
            #         }
            #     )
            #     raise HTTPException(
            #         status_code=status.HTTP_403_FORBIDDEN,
            #         detail="Login blocked due to suspicious activity"
            #     )
        
        # Step 7: Generate JWT token
        access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
        access_token = create_access_token(
            data={
                "sub": admin["email"],
                "role": admin["role"],
                "admin_id": admin["id"],
                "device_fp": login_data.device_fingerprint
            },
            expires_delta=access_token_expires
        )
        
        # Step 8: Update device last login
        if login_data.device_fingerprint:
            supabase.table("admin_devices") \
                .update({"last_login": datetime.utcnow().isoformat()}) \
                .eq("device_fingerprint", login_data.device_fingerprint) \
                .execute()
        
        # Step 9: Log successful login
        await log_admin_action(
            admin_id=admin["id"],
            action_type="LOGIN_SUCCESS",
            ip_address=ip_address,
            details={
                "device": login_data.device_fingerprint,
                "anomaly_score": anomaly_score,
                "location": geo_data
            }
        )
        
        # Step 10: Return token in secure cookie
        response = JSONResponse(
            content={
                "access_token": access_token,
                "token_type": "bearer",
                "role": admin["role"],
                "admin_id": admin["id"]
            }
        )
        
        response.set_cookie(
                key="adminToken",
                value=access_token,
                httponly=True,
                samesite="lax",  # or "strict" depending on your frontend domain
                secure=False     # set to True in production if using HTTPS
        )
#         response.set_cookie(
#             key="adminToken",
#             value=access_token,
#             httponly=True,
#             secure=True,
#             samesite="strict",
#             max_age=settings.jwt_access_token_expire_minutes * 60,
#             path="/admin"
#         )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await log_admin_action(
            email=login_data.email,
            action_type="LOGIN_ERROR",
            ip_address=get_real_client_ip(request),
            details={"error": str(e)}
        )
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login process failed"
        )

# async def login_for_access_token(
#     form_data: AdminLoginRequest,
#     request: Request
# ):
#     try:
#         # First verify credentials
#         admin = supabase.table("admins").select("*").eq("email", form_data.email).execute()
#         if not admin.data:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Incorrect email or password"
#             )
        
#         admin = admin.data[0]
#         if not verify_password(form_data.password, admin["password_hash"]):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Incorrect email or password"
#             )
        
#         # If OTP is required (second factor)
#         if not form_data.otp:
#             # Generate and send OTP
#             otp_code = generate_otp(form_data.email)
#             redis_client.setex(f"otp:{form_data.email}", 300, otp_code)
            
#             # Log OTP request
#             ip_address = request.client.host
#             geo_data = get_geoip_data(ip_address)
            
#             supabase.table("admin_audit_logs").insert({
#                 "admin_id": admin["id"],
#                 "action_type": "LOGIN_OTP_REQUEST",
#                 "ip_address": ip_address,
#                 "location_data": geo_data
#             }).execute()
            
#             return {"message": "OTP sent to your email", "requires_otp": True}
        
#         # Verify OTP
#         stored_otp = r.get(f"otp:{form_data.email}")
#         if not stored_otp or stored_otp != form_data.otp:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid or expired OTP"
#             )
        
#         # Generate JWT token
#         access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#         access_token = create_jwt_token(
#             data={"sub": admin["email"], "role": admin["role"]},
#             expires_delta=access_token_expires
#         )
        
#         # Log successful login
#         ip_address = request.client.host
#         geo_data = get_geoip_data(ip_address)
        
#         supabase.table("admin_audit_logs").insert({
#             "admin_id": admin["id"],
#             "action_type": "LOGIN_SUCCESS",
#             "ip_address": ip_address,
#             "location_data": geo_data,
#             "device_fingerprint": form_data.device_fingerprint
#         }).execute()
        
        # return {
        #     "access_token": access_token,
        #     "token_type": "bearer",
        #     "role": admin["role"]
        # }
#     except Exception as e:
#         # Log failed login attempt
#         if "email" in form_data.dict():
#             ip_address = request.client.host
#             geo_data = get_geoip_data(ip_address)
            
#             supabase.table("admin_audit_logs").insert({
#                 "email": form_data.email,
#                 "action_type": "LOGIN_FAILURE",
#                 "ip_address": ip_address,
#                 "location_data": geo_data,
#                 "device_fingerprint": form_data.device_fingerprint,
#                 "error_details": str(e)
#             }).execute()
        
#         raise HTTPException(
#             status_code=400,
#             detail=str(e)
#         )
    

@router.post("/login/init")
async def initiate_login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    # Verify email and password
    admin = supabase.table("admins").select("*").eq("email", form_data.username).execute()
    if not admin.data:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    admin = admin.data[0]
    
    if not verify_password(form_data.password, admin["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    print(form_data.username)

    # Send OTP
    await send_otp_email(form_data.email)
    
    return {"message": "OTP sent to registered email"}

@router.post("/login/verify")
async def verify_login(request: Request, login_data: AdminLoginRequest):
    # Verify OTP
    otp_key = f"admin:otp:{login_data.email}"
    otp_data = redis_client.get(otp_key)
    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP expired or not requested")
    
    otp_data = json.loads(otp_data)
    
    # Decrypt TOTP secret
    totp_secret = decrypt_data(otp_data["secret"], otp_data["salt"])
    totp = pyotp.TOTP(totp_secret, interval=settings.otp_expiry_seconds)
    
    if not totp.verify(login_data.otp):
        # Increment failed attempts
        otp_data["attempts"] += 1
        redis_client.setex(otp_key, settings.otp_expiry_seconds, json.dumps(otp_data))
        
        if otp_data["attempts"] >= 3:
            redis_client.delete(otp_key)
            raise HTTPException(status_code=400, detail="Too many failed attempts. Request new OTP.")
        
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Get admin data
    admin = supabase.table("admins").select("*").eq("email", login_data.email).execute()
    if not admin.data:
        raise HTTPException(status_code=400, detail="Admin not found")
    
    admin = admin.data[0]
    
    # Verify device fingerprint
    ip_address = request.client.host
    geo_data = get_geoip_data(ip_address)
    
    # Check allowed IPs
    allowed_ips = supabase.table("admin_allowed_ips").select("ip_address").eq("admin_id", admin["id"]).execute()
    if allowed_ips.data:
        ip_allowed = any(ip_address in ip["ip_address"] for ip in allowed_ips.data)
        if not ip_allowed:
            raise HTTPException(status_code=403, detail="Login not allowed from this IP address")
    
    # Check device fingerprint
    if login_data.device_fingerprint:
        device = supabase.table("admin_devices").select("*").eq("admin_id", admin["id"]).eq("device_fingerprint", login_data.device_fingerprint).execute()
        
        if device.data:
            device = device.data[0]
            if device["is_blocked"]:
                raise HTTPException(status_code=403, detail="This device is blocked")
        else:
            # New device - register it
            supabase.table("admin_devices").insert({
                "admin_id": admin["id"],
                "device_fingerprint": login_data.device_fingerprint,
                "ip_address": ip_address,
                "last_login": datetime.utcnow().isoformat()
            }).execute()
    
    # Anomaly detection
    anomaly_score = anomaly_detector.detect_anomaly(datetime.utcnow(), geo_data)
    if anomaly_score > 0.8:  # Threshold for anomaly
        # Alert super admin
        alert_super_admin(admin["id"], f"Anomalous login detected for {admin['email']}. Score: {anomaly_score}")
        
        # Optionally block or require additional verification
        # raise HTTPException(status_code=403, detail="Login blocked due to suspicious activity")
    
    # Create JWT token
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": admin["email"], "role": admin["role"], "admin_id": admin["id"]},
        expires_delta=access_token_expires
    )
    
    # Log successful login
    supabase.table("admin_audit_logs").insert({
        "admin_id": admin["id"],
        "action_type": "LOGIN",
        "ip_address": ip_address,
        "location_data": geo_data,
        "action_details": {"anomaly_score": anomaly_score}
    }).execute()
    
    # Update device last login
    if login_data.device_fingerprint:
        supabase.table("admin_devices").update({"last_login": datetime.utcnow().isoformat()}).eq("device_fingerprint", login_data.device_fingerprint).execute()
    
    # Return token in cookie
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    # response.set_cookie(
    #     key="adminToken",
    #     value=access_token,
    #     httponly=True,
    #     secure=True,
    #     samesite="strict",
    #     max_age=settings.jwt_access_token_expire_minutes * 60,
    #     path="/admin"
    # )

    response.set_cookie(
        key="adminToken",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",  # Or "none" if you need cross-site cookies
        max_age=settings.jwt_access_token_expire_minutes * 60,
        path="/",
        domain="localhost"  # Specify domain if needed
    )
    
    return response

def alert_super_admin(admin_id: str, message: str):
    # Find super admins
    super_admins = supabase.table("admins").select("email").eq("role", "SUPER_ADMIN").execute()
    
    # Send alerts (simplified - would use email/notification system in production)
    for admin in super_admins.data:
        print(f"ALERT for {admin['email']}: {message}")
        # In production, would send email or push notification

# @router.get("/me")
# async def get_current_admin(request: Request, token: str = Depends(oauth2_scheme)):
#     try:
#         payload = verify_token(token)
#         if not payload:
#             raise HTTPException(status_code=401, detail="Invalid token")
        
#         admin = supabase.table("admins").select("*").eq("email", payload.get("sub")).execute()
#         if not admin.data:
#             raise HTTPException(status_code=404, detail="Admin not found")
        
#         return admin.data[0]
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_current_admin(request: Request):
        # Get token from cookie instead of header
    token = request.cookies.get("adminToken")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    admin = supabase.table("admins").select("*").eq("email", payload.get("sub")).execute()
    if not admin.data:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {
            "admin_data":admin.data[0],
            "adminToken":token
    }
    
@router.post("/logout")
async def logout_admin(response: Response):
    response.delete_cookie("adminToken")
    return {"message": "Logged out successfully"}

async def alert_super_admin(subject: str, details: dict):
    """Notify super admins about important events"""
    try:
        super_admins = supabase.table("admins") \
            .select("email") \
            .eq("role", "SUPER_ADMIN") \
            .execute()
        
        for admin in super_admins.data:
            # In production, implement actual email/notification system
            print(f"ALERT for {admin['email']}: {subject}")
            print(json.dumps(details, indent=2))
            
    except Exception as e:
        print(f"Failed to alert super admins: {str(e)}")
