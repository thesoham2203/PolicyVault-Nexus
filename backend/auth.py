# from fastapi import APIRouter, HTTPException, status
# from pydantic import BaseModel
# import os, random, time
# import httpx
# from dotenv import load_dotenv
# from supabase import get_phone_from_account
# from utils import create_jwt
# from fastapi.responses import JSONResponse

# load_dotenv()
# router = APIRouter()

# # In-memory OTP cache (for demo — use Redis in production)
# otp_store = {}

# # Load env variables
# RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")
# TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
# TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# TWILIO_FROM = os.getenv("TWILIO_PHONE_NUMBER")

# class StartLoginRequest(BaseModel):
#     account_number: str
#     recaptcha_token: str

# @router.post("/start-login")
# async def start_login(data: StartLoginRequest):
#     try:
#         print(f"Received request for account: {data.account_number}")
        
#         # Verify reCAPTCHA
#         async with httpx.AsyncClient() as client:
#             recaptcha_res = await client.post(
#                 "https://www.google.com/recaptcha/api/siteverify",
#                 data={
#                     "secret": RECAPTCHA_SECRET,
#                     "response": data.recaptcha_token 
#                 },
#                 timeout=10.0
#             )
            
#             recaptcha_data = recaptcha_res.json()
#             print("reCAPTCHA response:", recaptcha_data)
            
#             if not recaptcha_data.get("success"):
#                 error_codes = recaptcha_data.get("error-codes", [])
#                 print("reCAPTCHA errors:", error_codes)
#                 return JSONResponse(
#                     status_code=400,
#                     content={"detail": f"reCAPTCHA failed: {error_codes}"}
#                 )

#         # Database lookup
#         phone = await get_phone_from_account(data.account_number)
#         if not phone:
#             return JSONResponse(
#                 status_code=404,
#                 content={"detail": "Account not found"}
#             )

#         # Generate OTP
#         otp = str(random.randint(100000, 999999))
#         print(f"Generated OTP for {data.account_number}: {otp}")  # For debugging
        
#         return {"message": "OTP sent successfully", "phoneMasked": phone[-4:]}

#     except Exception as e:
#         print(f"Error in start-login: {str(e)}")
#         return JSONResponse(
#             status_code=500,
#             content={"detail": str(e)}
#         )

# class VerifyOtpRequest(BaseModel):
#     account_number: str
#     otp: str

# @router.post("/verify-otp")
# async def verify_otp(data: VerifyOtpRequest):
#     try:
#         account = data.account_number.strip()
#         otp = data.otp.strip()
        
#         record = otp_store.get(account)
        
#         if not record:
#             return JSONResponse(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 content={"detail": "No OTP request found for this account"}
#             )
            
#         if "attempts" not in record:
#             record["attempts"] = 0
            
#         if record["attempts"] >= 3:
#             return JSONResponse(
#                 status_code=status.HTTP_429_TOO_MANY_REQUESTS,
#                 content={"detail": "Too many OTP attempts"}
#             )
            
#         if time.time() > record["expires_at"]:
#             del otp_store[account]
#             return JSONResponse(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 content={"detail": "OTP expired"}
#             )
            
#         if record["otp"] != otp:
#             record["attempts"] += 1
#             return JSONResponse(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 content={"detail": "Incorrect OTP"}
#             )
            
#         # Successful verification
#         del otp_store[account]
#         jwt_token = create_jwt(account)
        
#         return {
#             "message": "Login successful", 
#             "token": jwt_token
#         }
        
#     except Exception as e:
#         print(f"Error in verify-otp: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Internal server error"
#         )

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import os, random, time
import httpx
from dotenv import load_dotenv
from supabase_client import get_phone_from_account, get_customer_name, get_customer_id
from utils import create_jwt

load_dotenv()
router = APIRouter()

# In-memory OTP cache (for demo — use Redis in production)
otp_store = {}

# Load env variables
RECAPTCHA_SECRET = os.getenv("RECAPTCHA_SECRET")
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_PHONE_NUMBER")

class StartLoginRequest(BaseModel):
    account_number: str
    recaptcha_token: str

@router.post("/start-login")
async def start_login(data: StartLoginRequest):
    account = data.account_number.strip()

    # Step 1: reCAPTCHA verification
    async with httpx.AsyncClient() as client:
        recaptcha_res = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": RECAPTCHA_SECRET,
                "response": data.recaptcha_token
            }
        )
        if not recaptcha_res.json().get("success"):
            raise HTTPException(status_code=400, detail="Captcha failed")

    # Step 2: Lookup phone from Supabase
    phone = await get_phone_from_account(account)
    if not phone:
        raise HTTPException(status_code=404, detail="Account not found")

    # Step 3: OTP handling (allow 1 resend max)
    now = time.time()
    entry = otp_store.get(account)
    if entry and entry.get("resend_count", 0) >= 1:
        raise HTTPException(status_code=429, detail="OTP resend limit exceeded")

    otp = str(random.randint(100000, 999999))
    expires_at = now + 30  # 30 seconds

    # Send OTP (real: Twilio / test: print)
    try:
        from twilio.rest import Client
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        message = client.messages.create(
            body=f"[PolicyVault] Your login OTP is: {otp}",
            from_=TWILIO_FROM,
            to=phone
        )
    except Exception as e:
        print(f"[DEBUG] OTP to {phone}: {otp} (simulate send)")
        # For testing/demo without erroring
        # raise HTTPException(status_code=500, detail=f"SMS failed: {str(e)}")

    # Save OTP in memory
    otp_store[account] = {
        "otp": otp,
        "expires_at": expires_at,
        "resend_count": (entry["resend_count"] + 1) if entry else 0
    }

    return {"message": "OTP sent successfully", "phoneMasked": phone[-4:]}

class VerifyOtpRequest(BaseModel):
    account_number: str
    otp: str

# @router.post("/verify-otp")
# async def verify_otp(data: VerifyOtpRequest):
#     account = data.account_number.strip()
#     otp = data.otp.strip()

#     record = otp_store.get(account)

#     if not record:
#         raise HTTPException(status_code=404, detail="No OTP request found")

#     if time.time() > record["expires_at"]:
#         raise HTTPException(status_code=403, detail="OTP expired")

#     if record["otp"] != otp:
#         raise HTTPException(status_code=400, detail="Incorrect OTP")

#     # OTP verified – delete entry & issue JWT
#     del otp_store[account]
#     jwt_token = create_jwt(account)

#     return {"message": "Login successful", "token": jwt_token}

@router.post("/verify-otp")
async def verify_otp(data: VerifyOtpRequest):
    try:
        account = data.account_number.strip()
        otp = data.otp.strip()  # Clean the input
        
        print(f"Verifying OTP for account: {account}")  # Debug
        
        # Check if OTP exists for this account
        if account not in otp_store:
            print(f"No OTP found for account: {account}")
            raise HTTPException(
                status_code=404,
                detail="OTP expired or not found. Please request a new OTP."
            )
            
        record = otp_store[account]
        
        # Check expiration
        if time.time() > record["expires_at"]:
            del otp_store[account]  # Clean up
            raise HTTPException(
                status_code=400,
                detail="OTP expired. Please request a new one."
            )
        
        # Compare OTPs (case-sensitive string comparison)
        if record["otp"] != otp:
            record["attempts"] = record.get("attempts", 0) + 1
            print(f"Failed attempt {record['attempts']} for {account}")
            
            if record["attempts"] >= 3:
                del otp_store[account]
                raise HTTPException(
                    status_code=429,
                    detail="Too many attempts. Please request a new OTP."
                )
                
            raise HTTPException(
                status_code=400,
                detail="Incorrect OTP"
            )
            
        
        # Successful verification
        del otp_store[account]  # Remove used OTP
        jwt_token = create_jwt(account)
        # Fetch customer name
        customer_name = await get_customer_name(account)
        customer_id = await get_customer_id(account)
        print(f"{customer_name}")
        print(f"Successful login for account: {account}")  # Debug
        
        return {
            "message": "Login successful",
            "token": jwt_token,
            "customer_name": customer_name,
            "customer_id": customer_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"OTP verification error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during OTP verification"
        )
    

