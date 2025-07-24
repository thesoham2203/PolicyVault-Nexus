from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client
import bcrypt
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
from audit_service import audit_service

load_dotenv()

router = APIRouter()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")
jwtkey = os.getenv("JWT_SECRET_KEY")

supabase_client: Client = create_client(url, key)

class LoginRequest(BaseModel):
    email: str
    password: str
    api_key: str
    recaptcha_token: str

class OrganizationResponse(BaseModel):
    registration_number: str
    org_name: str
    logo_url: Optional[str]
    website_url: Optional[str]
    contact_email: str
    contact_number: str
    location: str
    description: Optional[str]
    industry_type: list
    other_industry: Optional[str]

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, jwtkey, algorithm="HS256")
    return encoded_jwt

@router.post("/login")
async def login(request: LoginRequest, request_data: Request):
    # Verify reCAPTCHA token (pseudo-code)
    # if not verify_recaptcha(request.recaptcha_token):
    #     raise HTTPException(status_code=400, detail="Invalid reCAPTCHA token")

    # Fetch organization by email
    org = supabase_client.table('organizations') \
        .select('*') \
        .eq('contact_email', request.email) \
        .execute()

    if not org.data:
        raise HTTPException(status_code=404, detail="Organization not found")

    org_data = org.data[0]

    # Check if organization is verified
    if org_data['status'] != "VERIFIED":
        raise HTTPException(status_code=403, detail="Organization not verified")

    # Check API key
    if org_data['api_key'] != request.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Check password
    if not bcrypt.checkpw(request.password.encode('utf-8'), org_data['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Generate a JWT token
    access_token = create_access_token(data={"sub": org_data['contact_email'], "org_id": org_data['id']})
    print(access_token)

    # Prepare response data
    response_data = {
        "token": access_token,  # Generate a token for the session
        "organization": {
            "registration_number": org_data['registration_number'],
            "org_name": org_data['org_name'],
            "logo_url": org_data['logo_url'],
            "website_url": org_data['website_url'],
            "contact_email": org_data['contact_email'],
            "contact_number": org_data['contact_number'],
            "location": org_data['location'],
            "description": org_data['description'],
            "industry_type": org_data['industry_type'],
            "other_industry": org_data['other_industry']
        }
    }

    if not response_data:
        # await audit_service.log_action(
        #     consent_id="N/A", 
        #     fiu_id=org_data['id'],
        #     action="LOGIN",
        #     status="ERROR",
        #     c_id="CNS-20xx-xxxxx",
        #     ip_address=request_data.client.host,
        #     detail="Login Failed"
        # )
        return []


    # await audit_service.log_action(
    #     consent_id="N/A", 
    #     fiu_id=org_data['id'],
    #     action="LOGIN",
    #     status="SUCCESSFUL",
    #     c_id="CNS-20xx-xxxxx",
    #     ip_address=request_data.client.host,
    #     detail="Login Successful"
    # )

    return response_data

@router.post("/signout")
async def sign_out():
    return {"message": "Signed out successfully"}
