# routers.sso.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import jwt
import httpx
from app.config import settings
from app.security.jwt import create_access_token
from app.utils.logging import log_admin_action
from supabase import create_client, Client

router = APIRouter()
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{settings.okta_issuer}/v1/authorize",
    tokenUrl=f"{settings.okta_issuer}/v1/token",
    scopes={"openid": "OpenID Connect", "email": "Email", "profile": "Profile"}
)

async def get_okta_public_keys():
    jwks_url = f"{settings.okta_issuer}/v1/keys"
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        return response.json()

async def verify_okta_token(token: str):
    try:
        # Get Okta public keys
        jwks = await get_okta_public_keys()
        
        # Verify token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.okta_client_id,
            issuer=settings.okta_issuer
        )
        
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.get("/sso/login")
async def sso_login():
    # Redirect to Okta for authentication
    auth_url = (
        f"{settings.okta_issuer}/v1/authorize?"
        f"response_type=code&"
        f"client_id={settings.okta_client_id}&"
        f"redirect_uri={settings.frontend_url}/admin/sso/callback&"
        f"scope=openid%20email%20profile&"
        f"state=some_random_state"
    )
    return {"auth_url": auth_url}

@router.get("/sso/callback")
async def sso_callback(request: Request, code: str):
    # Exchange authorization code for tokens
    token_url = f"{settings.okta_issuer}/v1/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": f"{settings.frontend_url}/admin/sso/callback",
        "client_id": settings.okta_client_id,
        "client_secret": settings.okta_client_secret
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get tokens from Okta")
        
        tokens = response.json()
        id_token = tokens.get("id_token")
        
        # Verify ID token
        payload = await verify_okta_token(id_token)
        email = payload.get("email")
        
        # Check if admin exists
        admin = supabase.table("admins").select("*").eq("email", email).execute()
        if not admin.data:
            raise HTTPException(status_code=403, detail="Admin not registered")
        
        admin = admin.data[0]
        
        # Create JWT token
        access_token = create_access_token(
            data={"sub": admin["email"], "role": admin["role"], "admin_id": admin["id"]}
        )
        
        # Log SSO login
        ip_address = request.client.host
        await log_admin_action(
            admin_id=admin["id"],
            action_type="SSO_LOGIN",
            ip_address=ip_address,
            details={"provider": "Okta"}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": {
                "email": admin["email"],
                "role": admin["role"]
            }
        }
    
# schemas/auth.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class EmailRequest(BaseModel):
    email: EmailStr
    recaptcha_token: Optional[str] = None

class AdminRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str
    terms_accepted: bool
    otp: Optional[str] = None
    device_fingerprint: Optional[str] = None

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
    otp: Optional[str] = None
    device_fingerprint: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# crypto.py
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from passlib.context import CryptContext
import os
from app.config import settings

# Password hashing with Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# AES-256 encryption for TOTP secrets
def get_fernet_key(salt: bytes = None):
    if salt is None:
        salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.jwt_secret_key.encode()))
    return key, salt

def encrypt_data(data: str) -> tuple:
    key, salt = get_fernet_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    return encrypted_data.decode(), salt.hex()

def decrypt_data(encrypted_data: str, salt_hex: str) -> str:
    salt = bytes.fromhex(salt_hex)
    key, _ = get_fernet_key(salt)
    f = Fernet(key)
    decrypted_data = f.decrypt(encrypted_data.encode())
    return decrypted_data.decode()

# jwt.py
import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from jose.exceptions import JWTError
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from app.config import settings

# Generate RSA key pair if not exists
def generate_rsa_keys():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return private_pem, public_pem

# Load or generate keys
private_key_path = "private_key.pem"
public_key_path = "public_key.pem"

if not os.path.exists(private_key_path) or not os.path.exists(public_key_path):
    private_pem, public_pem = generate_rsa_keys()
    with open(private_key_path, "wb") as f:
        f.write(private_pem)
    with open(public_key_path, "wb") as f:
        f.write(public_pem)
else:
    with open(private_key_path, "rb") as f:
        private_pem = f.read()
    with open(public_key_path, "rb") as f:
        public_pem = f.read()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, private_pem, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, public_pem, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None
    
# geoip.py
import os
from pathlib import Path
from geoip2.database import Reader
from geoip2.errors import AddressNotFoundError

# Get the path to your GeoLite2 database
GEOIP_DB_PATH = Path(__file__).parent.parent / "data" / "GeoLite2-City.mmdb"

def get_geoip_data(ip_address: str):
    if not GEOIP_DB_PATH.exists():
        return {"ip": ip_address, "error": "GeoIP database not found"}
        
    try:
        with Reader(str(GEOIP_DB_PATH)) as reader:
            response = reader.city(ip_address)
            return {
                "ip": ip_address,
                "country": response.country.name if response.country.name else "Unknown",
                "city": response.city.name if response.city.name else "Unknown",
                "latitude": response.location.latitude,
                "longitude": response.location.longitude
            }
    except AddressNotFoundError:
        return {"ip": ip_address, "error": "Address not found in database"}
    except Exception as e:
        return {"ip": ip_address, "error": str(e)}
    
# config.py
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_SERVICE_ROLE")
    
    # JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY")
    jwt_algorithm: str = "RS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    
    # EmailJS
    emailjs_service_id: str = os.getenv("EMAILJS_SERVICE_ID")
    emailjs_template_id2: str = os.getenv("EMAILJS_TEMPLATE_ID2")
    emailjs_user_id: str = os.getenv("EMAILJS_USER_ID")
    emailjs_private_key: str = os.getenv("EMAILJS_PRIVATE_KEY")
    
    # Okta
    okta_client_id: str = os.getenv("OKTA_CLIENT_ID")
    okta_client_secret: str = os.getenv("OKTA_CLIENT_SECRET")
    okta_issuer: str = os.getenv("OKTA_ISSUER")
    
    # FingerprintJS
    fingerprintjs_api_key: str = os.getenv("FINGERPRINTJS_API_KEY")

    jwt_private_key: str = os.getenv("JWT_PRIVATE_KEY")
    jwt_public_key: str = os.getenv("JWT_PUBLIC_KEY")
    jwt_algorithm: str = "RS256"
    access_token_expire_minutes: int = 30
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    

    # IPInfo
    ipinfo_token: str = os.getenv("IPINFO_TOKEN")
    
    # Security
    otp_expiry_seconds: int = 300  # 5 minutes
    otp_rate_limit_seconds: int = 60  # 1 minute
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

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

class AdminRegisterRequest(BaseModel):
    email: str
    password: str
    role: str
    terms_accepted: bool
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
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True,
    username=os.getenv('REDIS_USERNAME'),
    password=os.getenv('REDIS_PASSWORD'),
)


# JWT Configuration
JWT_ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def generate_otp(email: str) -> str:
    """Generate a 6-digit OTP"""
    totp = pyotp.TOTP(pyotp.random_base32(), interval=300)  # 5 minute expiry
    return totp.now()

async def send_otp_email(email: str):
    """Send OTP email using EmailJS"""
    try:
        # Generate OTP using your function
        otp_code = generate_otp(email)

        try:
            if not redis_client.ping():
                raise ConnectionError("Redis connection failed")
        except Exception as e:
            print(f"Redis error: {e}")
            # Fallback to database storage if Redis fails
            await store_otp_in_db(email, otp_code)  # Implement this
            return
        
        # Store OTP in Redis with email as key (5 minute expiry)
        redis_client.setex(f"otp:{email}", 300, otp_code)
        
        # Verify EmailJS configuration
        if not all([settings.emailjs_service_id, settings.emailjs_template_id, settings.emailjs_user_id, settings.emailjs_private_key]):
            raise HTTPException(500, detail="EmailJS configuration incomplete")

        # Prepare payload (without app_name as requested)
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
        

        print("Supabase response:", existing_admin)
        
        if existing_admin.data:
            print("Email already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        print("Adding background task...")
        # Add to background tasks to avoid blocking
        background_tasks.add_task(send_otp_email, email_data.email)
        
        # Log OTP request
        ip_address = request.client.host
        geo_data = get_geoip_data(ip_address)
        
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
            detail=f"Failed to initiate OTP sending: {str(e)}"
        )

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
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # Rest of your registration logic...
        # Check if email already exists
        existing_admin = supabase.table("admins").select("*").eq("email", admin_data.email).execute()
        if existing_admin.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate role
        if admin_data.role not in ["SUPER_ADMIN", "AUDITOR", "ORG_ADMIN"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        if admin_data.role == "SUPER_ADMIN":
            # Check if SUPER_ADMIN already exists
            existing_super_admin = supabase.table("admins").select("*").eq("role", "SUPER_ADMIN").execute()
            if existing_super_admin.data:
                raise HTTPException(
                    status_code=400,
                    detail="Super admin already exists. Only one super admin is allowed."
                )
        
        # Check terms acceptance
        if not admin_data.terms_accepted:
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
            "terms_accepted": True
        }
        
        result = supabase.table("admins").insert(admin).execute()
        new_admin = result.data[0]
        
        # Log registration
        ip_address = request.client.host
        geo_data = get_geoip_data(ip_address)
        
        supabase.table("admin_audit_logs").insert({
            "admin_id": new_admin["id"],
            "action_type": "REGISTER",
            "ip_address": ip_address,
            "location_data": geo_data
        }).execute()
        
        # Delete the used OTP
        redis_client.delete(f"otp:{admin_data.email}")
        
        return {"message": "Registration successful. Please login."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
async def login_for_access_token(
    form_data: AdminLoginRequest,
    request: Request
):
    try:
        # First verify credentials
        admin = supabase.table("admins").select("*").eq("email", form_data.email).execute()
        if not admin.data:
            raise HTTPException(
                status_code=400,
                detail="Incorrect email or password"
            )
        
        admin = admin.data[0]
        if not verify_password(form_data.password, admin["password_hash"]):
            raise HTTPException(
                status_code=400,
                detail="Incorrect email or password"
            )
        
        # If OTP is required (second factor)
        if not form_data.otp:
            # Generate and send OTP
            otp_code = generate_otp(form_data.email)
            redis_client.setex(f"otp:{form_data.email}", 300, otp_code)
            
            # Log OTP request
            ip_address = request.client.host
            geo_data = get_geoip_data(ip_address)
            
            supabase.table("admin_audit_logs").insert({
                "admin_id": admin["id"],
                "action_type": "LOGIN_OTP_REQUEST",
                "ip_address": ip_address,
                "location_data": geo_data
            }).execute()
            
            return {"message": "OTP sent to your email", "requires_otp": True}
        
        # Verify OTP
        stored_otp = r.get(f"otp:{form_data.email}")
        if not stored_otp or stored_otp != form_data.otp:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired OTP"
            )
        
        # Generate JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_jwt_token(
            data={"sub": admin["email"], "role": admin["role"]},
            expires_delta=access_token_expires
        )
        
        # Log successful login
        ip_address = request.client.host
        geo_data = get_geoip_data(ip_address)
        
        supabase.table("admin_audit_logs").insert({
            "admin_id": admin["id"],
            "action_type": "LOGIN_SUCCESS",
            "ip_address": ip_address,
            "location_data": geo_data,
            "device_fingerprint": form_data.device_fingerprint
        }).execute()
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "role": admin["role"]
        }
    except Exception as e:
        # Log failed login attempt
        if "email" in form_data.dict():
            ip_address = request.client.host
            geo_data = get_geoip_data(ip_address)
            
            supabase.table("admin_audit_logs").insert({
                "email": form_data.email,
                "action_type": "LOGIN_FAILURE",
                "ip_address": ip_address,
                "location_data": geo_data,
                "device_fingerprint": form_data.device_fingerprint,
                "error_details": str(e)
            }).execute()
        
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    
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
    response.set_cookie(
        key="adminToken",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.jwt_access_token_expire_minutes * 60,
        path="/admin"
    )
    
    return response

def alert_super_admin(admin_id: str, message: str):
    # Find super admins
    super_admins = supabase.table("admins").select("email").eq("role", "SUPER_ADMIN").execute()
    
    # Send alerts (simplified - would use email/notification system in production)
    for admin in super_admins.data:
        print(f"ALERT for {admin['email']}: {message}")
        # In production, would send email or push notification

@router.get("/me")
async def get_current_admin(request: Request, token: str = Depends(oauth2_scheme)):
    try:
        payload = verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        admin = supabase.table("admins").select("*").eq("email", payload.get("sub")).execute()
        if not admin.data:
            raise HTTPException(status_code=404, detail="Admin not found")
        
        return admin.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout_admin(response: Response):
    response.delete_cookie("adminToken")
    return {"message": "Logged out successfully"}

// AdminRegister.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-hot-toast';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';

const AdminRegister = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ORG_ADMIN');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const navigate = useNavigate();
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  useEffect(() => {
  const loadFingerprint = async () => {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    setDeviceFingerprint(result.visitorId);
  };
  loadFingerprint();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (step === 1) {
        // Basic validation
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!termsAccepted) {
          throw new Error('You must accept the terms and conditions');
        }
        
        setStep(2);
      } else if (step === 2) {
        const recaptchaToken = await recaptchaRef.current?.executeAsync();
      
      const response = await axios.post('http://localhost:8000/api/auth/send-otp', { 
        email,
        recaptcha_token: recaptchaToken 
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status !== 200) {
        throw new Error(response.data?.detail || 'Failed to send OTP');
      }
      
      setStep(3);
      toast.success('OTP sent to your email');
      } else {
        // Complete registration
        await axios.post('http://localhost:8000/api/auth/register', {
          email,
          password,
          role,
          terms_accepted: termsAccepted,
          otp,
          device_fingerprint: deviceFingerprint
        });
        
        toast.success('Registration successful! Please login.');
        navigate('/admin/login');
      }
    } catch (err) {
      console.error("Registration error:", err);  // Detailed error logging
    
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        setError(err.response.data?.detail || 'Registration failed');
      } else if (err.request) {
        // The request was made but no response was received
        console.error("No response received:", err.request);
        setError('No response from server');
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", err.message);
        setError('Request failed');
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />

      <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
        {/* Left Side (unchanged) */}
        <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
          <div className="w-full h-full flex flex-col justify-between p-8">
            <span className="flex items-center space-x-2 relative">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                PolicyVault
              </h1>
            </span>

            <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
                PolicyVault <span className="italic font-semibold text-white">ADMIN</span>
              </h1>
              <p className="text-md font-light text-white">
                Secure administration portal for PolicyVault Nexus
              </p>
              <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
                Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Admin Registration</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Email*</label>
                    <input
                      type="email"
                      placeholder="admin@yourorg.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Role*</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    >
                      <option value="ORG_ADMIN">Organization Admin</option>
                      <option value="AUDITOR">Auditor</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                      I accept the Terms and Conditions
                    </label>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="text-center">
                  <p className="mb-4">We'll send an OTP to your email to verify your identity.</p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code*</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Check your email for the OTP code (valid for 5 minutes)
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-md hover:bg-[#1E40AF] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  'Processing...'
                ) : step === 1 ? (
                  'Continue to Verification'
                ) : step === 2 ? (
                  'Send OTP'
                ) : (
                  'Complete Registration'
                )}
              </button>

              {step !== 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step === 3 ? 2 : 1)}
                  className="w-full text-[#1E3A8A] font-medium py-2 rounded-md hover:underline transition-colors"
                >
                  Back
                </button>
              )}

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <a
                  href="/admin/login"
                  className="text-[#1E3A8A] hover:underline font-medium"
                >
                  Login here
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      />
    </div>
  );
};

export default AdminRegister;

// AdminLogin.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { toast } from 'react-hot-toast';
import { useAuth } from '../types/useAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  
  //const navigate = useNavigate();
  //const { login } = useAuth();

  // Initialize fingerprint on component mount
  React.useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceFingerprint(result.visitorId);
    };
    getFingerprint();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (step === 'credentials') {
        // Verify credentials and request OTP
        await axios.post('/api/auth/login/init', {
          username: email,
          password,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        
        setStep('otp');
        toast.success('OTP sent to your email');
      } else {
        // Verify OTP and complete login
        // const response = await axios.post('/api/auth/login/verify', {
        //   email,
        //   password,
        //   otp,
        //   device_fingerprint: deviceFingerprint,
        // });
        
        // // Redirect to dashboard on success
        // navigate('/admin/dashboard');
        const result = await login(email, password, otp);
        if (!result.success) {
          setError(result.error || 'Login failed');
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Login failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-[#DBEAFE]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1E3A8A]" />

      <div className="relative z-10 w-full max-w-5xl h-[80vh] flex rounded-2xl overflow-hidden border border-gray-300 shadow-[0_15px_35px_rgba(0,0,0,0.5),_0_5px_15px_rgba(0,0,0,0.1)] bg-gradient-to-br from-white via-gray-100 to-gray-300 backdrop-blur-sm">
        {/* Left Side (unchanged) */}
        <div className="w-1/2 bg-[#1E3A8A] flex items-center justify-center">
          <div className="w-full h-full flex flex-col justify-between p-8">
            <span className="flex items-center space-x-2 relative">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-shield h-8 w-8 text-indigo-600 z-10 relative"
                >
                  <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
                <div className="absolute inset-0 h-8 w-8 bg-indigo-600/30 rounded-full blur-sm z-0" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
                PolicyVault
              </h1>
            </span>

            <div className="flex-grow flex flex-col justify-center text-[#DBEAFE] text-center">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-[#DBEAFE] to-white bg-clip-text text-transparent tracking-tight drop-shadow-md mb-4">
                PolicyVault <span className="italic font-semibold text-white">ADMIN</span>
              </h1>
              <p className="text-md font-light text-white">
                Secure administration portal for PolicyVault Nexus
              </p>
              <div className="absolute bottom-4 left-20 text-sm text-blue-100 tracking-wide text-center justify-center">
                Empowered by <span className="font-semibold text-white">PolicyVault</span> | Supported by <span className="font-semibold text-white">Canara Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 bg-[#DBEAFE] flex items-center justify-center">
          <div className="w-full max-w-md space-y-6 p-8">
            <h2 className="text-4xl font-bold text-[#1E3A8A]">Admin Login</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 'credentials' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email*</label>
                    <input
                      type="email"
                      placeholder="admin@policyvault.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code*</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Check your email for the OTP code (valid for 5 minutes)
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#1E3A8A] text-white font-semibold py-3 rounded-md hover:bg-[#1E40AF] transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  'Processing...'
                ) : step === 'credentials' ? (
                  'Request OTP'
                ) : (
                  'Verify & Login'
                )}
              </button>

              {step === 'otp' && (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-full text-[#1E3A8A] font-medium py-2 rounded-md hover:underline transition-colors"
                >
                  Back to email/password
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      />
    </div>
  );
};

export default AdminLogin;

🔐 Step 1: SSO Backend Auth (Okta - Free Tier)
Okta Developer Free Tier supports SSO via OAuth2/OIDC.
Set up an Okta app → allow OAuth login for admin users.
Admins redirected to Okta → token received → validate ID token using Okta JWKS endpoint.
Enforce only pre-approved admin emails from Okta.
✅ Feasible under Okta Free Tier (up to 1000 MAUs).
📜 Step 2: Regulatory Compliance
Log:
User consent.
Terms acceptance.
Access control changes.
Timestamps for every auth-related action.
✅ Handled via audit logs + secure logging (step 11).
🧠 Step 3: ML-based Fraud Detection
Use:
Scikit-learn, IsolationForest, PyOD, or Simple LSTM Autoencoder.
Train on login patterns: IP, time-of-day, device fingerprint.
Detect anomalies like login at 3AM or country change.
✅ Feasible with self-hosted model + cron jobs or FastAPI middleware.
📧 Step 4: Email/Password → OTP (EmailJS)
Use EmailJS for email delivery (free for dev testing).
Flow:
Enter email + password → check credentials.
If correct, generate TOTP secret and send OTP via EmailJS.
Store AES-256-encrypted secret in PostgreSQL.
✅ Feasible (EmailJS + PyOTP + AES encryption).
🕒 Step 5: Session Management
Use Set-Cookie with:
http
Copy
Edit
adminToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/admin
Store minimal data in cookie → JWT (RS256) or session ID.
✅ Feasible with FastAPI + client cookies.
🔑 Step 6: JWT (RS256 + Argon2)
Use RS256 with key pair for signing JWTs (adminToken).
Use argon2-cffi to hash passwords.
✅ All are open-source and production-ready for free.
🧊 Step 7: Rate Limiting + IP Whitelisting
Use:
slowapi or FastAPI-Limiter (Redis backend) for rate limiting.
Maintain list of allowed IPs in .env or database.
✅ Fully achievable with open-source.
💻 Step 8: Device Binding (FingerprintJS)
FingerprintJS has a free tier.
Bind fingerprint on first login → store hash in DB.
On future logins, match fingerprint before issuing JWT.
✅ Feasible with FingerprintJS Free plan.
🌐 Step 9: IP Locking
On login:
Store IP in DB/session.
On each request, compare with stored IP.
Force re-login if changed (unless VPN use allowed).
✅ Simple to implement via FastAPI middleware.
🗄️ Step 10: Database Security
AES-256 encrypt sensitive admin data (email, phone).
PostgreSQL RLS:
Use PostgreSQL roles to restrict row access per tenant (multi-bank setup).
✅ Fully supported by PostgreSQL + Python libs like cryptography.
🧾 Step 11: Audit Logs
Log every admin action in DB:
Login/logout, edits, policy changes.
Use structured logging (e.g., loguru, structlog).
✅ Essential and achievable.
📡 Step 12: Office/VPN IP Whitelisting
Allow access only from specific CIDR ranges:
bash
Copy
Edit
e.g., 192.168.1.0/24
Block others by FastAPI middleware.
✅ Free + simple implementation.
🧭 Step 13: Geo-IP Restrictions
Use ipinfo.io or ipapi (free tier) to identify locations.
Block unexpected countries or states.
✅ Can be done with free-tier IP APIs + fallback caching.
🔁 Step 14: Combine IP Whitelisting + VPN
Recommended for internal admin portal.
Use X-Forwarded-For if behind VPN/proxy.
Allow only traffic via known VPN IPs.
✅ Works well with basic firewall + IP checks.
🔐 Step 15: 2FA (TOTP via PyOTP)
Enforce TOTP after password check.
Store encrypted secret in DB.
Validate OTP on each login.
✅ Secure and free.
📜 Step 16: Device Certificate Check
Can be tricky in free tier.
TLS Mutual Auth (mTLS) checks if client has a trusted certificate.
🟡 Harder under free tier unless self-hosted. Best effort:
Issue certs manually to admin laptops.
Configure NGINX or FastAPI mTLS verification.
✅ Feasible with effort, not scalable but works for <10 admins.
🔄 Final Authentication Flow Summary
text
Copy
Edit
Admin → Login Page → Enters Email & Password
   → Argon2 Check
   → If valid → Send OTP via EmailJS
   → Verify OTP (PyOTP + AES-256 secret)
      → Generate Device Fingerprint (FingerprintJS)
         → Compare w/ stored fingerprint
         → Check IP whitelist
         → If valid, generate adminToken (JWT RS256)
            → Set Secure, HttpOnly Cookie
               → All actions logged
                  → Geo-IP anomaly check (ML)