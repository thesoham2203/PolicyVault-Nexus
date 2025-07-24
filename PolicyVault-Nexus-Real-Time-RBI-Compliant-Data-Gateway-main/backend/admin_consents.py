from fastapi import APIRouter, Depends, HTTPException, Request, Response, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi.responses import StreamingResponse 
import os
import supabase
from dotenv import load_dotenv
from jose import jwt, JWTError
from pydantic import BaseModel
import json
from app.utils.real_ip import get_real_client_ip
from app.utils.geoip import get_geoip_data
from typing import Dict, Any
# from app.crypto_utils import process_secure_data, prepare_vault_data
# from app.vault_utils import create_vault_file
import bcrypt
import secrets
import string
import requests  # For emailjs integration
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

load_dotenv()

router = APIRouter()

# Supabase client
supabase_client = supabase.create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

# JWT Configuration
# SECRET_KEY = os.getenv("JWT_PUBLIC_KEY")
ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

class TokenData(BaseModel):
    sub: str
    role: str
    admin_id: str

class ConsentApproval(BaseModel):
    approved_fields: Dict[str, Any]
    consent_id: str
    expiry_date: Optional[str] = None

class ConsentRejection(BaseModel):
    consent_id: str
    reason: str

class ConsentRevoke(BaseModel):
    consent_id: str

def load_public_key():
    with open("public_key.pem", "rb") as key_file:
        public_key = serialization.load_pem_public_key(
            key_file.read(),
            backend=default_backend()
        )
    return public_key

def get_current_admin(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = request.cookies.get("adminToken")
    if not token:
        raise credentials_exception
    
    try:
        token = request.cookies.get("adminToken")
        PUBLIC_KEY = load_public_key()
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"], options={"verify_aud": False})
        # payload = jwt.decode(token, "SECRET_KEY", algorithms=["RS256"])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        admin_id: str = payload.get("admin_id")
        
        if email is None or role is None or admin_id is None:
            raise credentials_exception
        
        return TokenData(sub=email, role=role, admin_id=admin_id)
    except JWTError:
        raise credentials_exception

@router.get("/admin/pending-consents")
async def get_pending_admin_consents(request: Request):#current_admin: TokenData = Depends(get_current_admin)
    try:
        # print("token:")
        # token = request.cookies.get("adminToken")
        # print("token: "+token)
        token = request.cookies.get("adminToken")
        PUBLIC_KEY = load_public_key()
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"], options={"verify_aud": False})
        email: str = payload.get("sub")
        role: str = payload.get("role")
        admin_id: str = payload.get("admin_id")
        print("admin id"+admin_id)    
        if email is None or role is None or admin_id is None:
            raise credentials_exception
            
        current_admin = TokenData(sub=email, role=role, admin_id=admin_id)
        print(current_admin.role)
        if(current_admin.role != "SUPER_ADMIN"):
            response = supabase_client.table("requested_consents")\
                .select("*, organizations(*)")\
                .eq("status", "APPROVED")\
                .eq("status_admin", "PENDING")\
                .eq("admin_id", current_admin.admin_id).execute()
            
            consents = []
            today = datetime.now().date()
        
        if(current_admin.role == "SUPER_ADMIN"):
            response = supabase_client.table("requested_consents")\
                .select("*, organizations(*)")\
                .eq("status", "APPROVED")\
                .eq("status_admin", "PENDING").execute()
            
            consents = []
            today = datetime.now().date()
        
        for consent in response.data:
            # Parse dates
            expiry_date = None
            if consent.get("expiry_of_approval"):
                expiry_date = datetime.fromisoformat(consent["expiry_of_approval"]).date()
                days_remaining = (expiry_date - today).days
            else:
                days_remaining = 0
            
            # Format dates
            requested_date = datetime.fromisoformat(consent["created_at"]) if consent.get("created_at") else None
            requested_date_str = requested_date.strftime("%d/%m/%Y") if requested_date else ""
            expiry_date_str = expiry_date.strftime("%d/%m/%Y") if expiry_date else ""
            
            # Get organization name
            org_name = consent.get("organizations", {}).get("org_name", "Unknown Organization")
            
            consents.append({
                "id": consent["id"],
                "fiu_name": org_name,
                "status": consent["status"],
                "data_fields": consent.get("datafields"),
                "purpose": consent.get("purpose", ""),
                "requested_date": requested_date_str,
                "expiry_date": expiry_date_str,
                "days_remaining": days_remaining,
                "c_id": consent.get("c_id", ""),
                "fiu_id": consent.get("fiu_id", "")
            })
            print(consents)
        
        return consents
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/consent-details/{consent_id}")
async def get_consent_details(consent_id: str, request: Request):
    try:
        token = get_current_admin(request)
        # Get the consent details
        consent_response = supabase_client.table("requested_consents")\
            .select("*")\
            .eq("id", consent_id)\
            .single()\
            .execute()
        
        consent = consent_response.data
        
        if not consent:
            raise HTTPException(status_code=404, detail="Consent not found")
        
        # Get the customer's account details
        account_response = supabase_client.table("accounts")\
            .select("*")\
            .eq("account_number", consent["user_identifier"])\
            .execute()
        
        account_data = account_response.data[0] if account_response.data else {}
        
        # Get organization details
        org_response = supabase_client.table("organizations")\
            .select("*")\
            .eq("id", consent["fiu_id"])\
            .single()\
            .execute()
        
        org_data = org_response.data if org_response.data else {}
        
        return {
            "consent": consent,
            "account_data": account_data,
            "organization": org_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/approve-consent")
async def approve_consent(
    approval: ConsentApproval, 
    request: Request,
):
    try:
        # Get current admin (make sure this is awaited if async)
        current_admin = get_current_admin(request)
        print(current_admin)
        ip_address = get_real_client_ip(request)
        geo_data = await get_geoip_data(ip_address)
        # Get the consent details
        consent_response = supabase_client.table("requested_consents")\
            .select("*")\
            .eq("id", approval.consent_id)\
            .single()\
            .execute()
        
        consent = consent_response.data
        print(consent)
        if not consent:
            raise HTTPException(status_code=404, detail="Consent not found")
        
        # Get organization details
        org_response = supabase_client.table("organizations")\
            .select("*")\
            .eq("id", consent["fiu_id"])\
            .single()\
            .execute()
        
        org_data = org_response.data
        print("orgdata")
        print(org_data)
        if not org_data:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Generate a random password for the vault
        # password = generate_random_password()
        # print(password)
        # print(consent["customer_id"])
        # Prepare the data for the vault
        vault_data = {
            "consent_id": approval.consent_id,
            "approved_fields": approval.approved_fields,
            "customer_id": consent["customer_id"],
            "fiu_id": consent["fiu_id"],
            "expiry": approval.expiry_date, #consent["expiry_of_approval"],
            "approved_at": datetime.now().isoformat(),
            "approved_by": current_admin.admin_id  # Assuming it's a dictionary
        }
        print("vault data")
        print(vault_data)
        # Create the vault file
        vault_result = await create_vault_file(vault_data, f"consent_{approval.consent_id}")
        print("created vault")
        
        # print("insert: "+vault_result['data']['insert_id'])
        # Hash the password for storage
        # password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update the consent in the database
        current_consent = supabase_client.table("secure_files") \
        .select("*") \
        .order("updated_at", desc=True) \
        .limit(1) \
        .execute()
        
        print("current_consent")
        print(current_admin.admin_id)
        print(approval.consent_id)
        print(consent["c_id"])
        print(consent["fiu_id"])
        # print(current_consent)
        most_recent = current_consent.data[0] 
        print(most_recent["updated_at"])

        update_response = supabase_client.table("secure_files")\
            .update({
                # "status_admin": "APPROVED",
                # "approved_fields": approval.approved_fields,
                # "vault_password": password_hash,
                # "vault_file": vault_result["filename"],
                # "admin_approved_at": datetime.now().isoformat(),
                "admin_id": current_admin.admin_id,
                "consent_id": approval.consent_id,
                "c_id": consent["c_id"],
                "fiu_id": consent["fiu_id"],
                "updated_at": datetime.now().isoformat()
            })\
            .eq("updated_at", most_recent["updated_at"]).execute()
        print("update_response")

        update_responses = supabase_client.table("requested_consents")\
            .update({
                "status_admin": "APPROVED",
                "actual_expiry": approval.expiry_date,
                "admin_id": current_admin.admin_id,
            })\
            .eq("id", approval.consent_id).execute()

        # Send email to the organization
        # print(org_data["email"])
        print(org_data["org_name"])
        print(vault_result["filename"])
        print()
        send_approval_email(
            org_data["contact_email"],
            org_data["org_name"],
            approval.consent_id,
            vault_result["filename"],
        )

        log_data = {
            "admin_id": current_admin.admin_id,
            "email": current_admin.sub,
            "action_type": "APPROVED",
            "ip_address": ip_address,
            "location_data": geo_data,
            "created_at": datetime.utcnow().isoformat(),
            "action_details":{
                "status": "success",
                "message": "Consent approved successfully",
                "consent_id": approval.consent_id
            }
        }
        supabase.table("admin_audit_logs").insert(log_data).execute()
        
        return {
            "status": "success",
            "message": "Consent approved successfully",
            "vault_file": vault_result["filename"],
            # "password": password  # Only for demo - remove in production
        }
    
    except Exception as e:
        log_data = {
            "admin_id": current_admin.admin_id,
            "email": current_admin.sub,
            "action_type": "ERROR",
            "ip_address": ip_address,
            "location_data": geo_data,
            "created_at": datetime.utcnow().isoformat(),
            "action_details":{
                "status": "error",
                "message": f"Error in Approving consent: {e}",
                "consent_id": approval.consent_id
            }
        }
        supabase.table("admin_audit_logs").insert(log_data).execute()
        # logger.error(f"Error approving consent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/admin/approve-consent")
# async def approve_consent(
#     approval: ConsentApproval, 
#     request: Request,
#     # current_admin: TokenData = Depends(get_current_admin)
# ):
#     try:
#         current_admin = get_current_admin(request)
#         print(current_admin)
#         # Get the consent details
#         consent_response = supabase_client.table("requested_consents")\
#             .select("*")\
#             .eq("id", approval.consent_id)\
#             .single()\
#             .execute()
        
#         consent = consent_response.data
        
#         if not consent:
#             raise HTTPException(status_code=404, detail="Consent not found")
        
#         # Get organization details
#         org_response = supabase_client.table("organizations")\
#             .select("*")\
#             .eq("id", consent["fiu_id"])\
#             .single()\
#             .execute()
        
#         org_data = org_response.data
        
#         if not org_data:
#             raise HTTPException(status_code=404, detail="Organization not found")
        
#         # Generate a random password for the vault
#         password = generate_random_password()
        
#         # Prepare the data for the vault
#         vault_data = {
#             "consent_id": approval.consent_id,
#             "approved_fields": approval.approved_fields,
#             "customer_id": consent["customer_id"],
#             "fiu_id": consent["fiu_id"],
#             "expiry": consent["expiry_of_approval"],
#             "approved_at": datetime.now().isoformat(),
#             "approved_by": current_admin.admin_id
#         }
        
#         # Create the vault file
#         vault_result = await create_vault_file(vault_data, f"consent_{approval.consent_id}")
        
#         # Hash the password for storage
#         password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
#         # Update the consent in the database
#         update_response = supabase_client.table("requested_consents")\
#             .update({
#                 "status_admin": "APPROVED",
#                 "approved_fields": approval.approved_fields,
#                 "vault_password": password_hash,
#                 "vault_file": vault_result["filename"],
#                 "admin_approved_at": datetime.now().isoformat(),
#                 "admin_approved_by": current_admin.admin_id
#             })\
#             .eq("id", approval.consent_id)\
#             .execute()
        
#         # Send email to the organization
#         send_approval_email(
#             org_data["email"],
#             org_data["org_name"],
#             approval.consent_id,
#             vault_result["filename"],
#             password
#         )
        
#         return {"status": "success", "message": "Consent approved successfully"}
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/password-vault/{consent_id}")
async def view_password(
    consent_id: str,
    token: str,
    request: Request
):
    """
    One-time password viewing endpoint
    Accessible at: http://localhost:8000/password-vault/{consent_id}?token={temp_token}
    """
    try:
        # Verify the consent_id exists in secure_files
        file_record = supabase_client.table("secure_files") \
            .select("id, pass_id") \
            .eq("consent_id", consent_id) \
            .maybe_single() \
            .execute()
        
        if not file_record.data:
            raise HTTPException(status_code=404, detail="Consent record not found")
        
        pass_id = file_record.data.get("pass_id")
        if not pass_id:
            raise HTTPException(status_code=410, detail="Password already accessed")
        
        # Get the password
        password_record = supabase_client.table("secure_password") \
            .select("password") \
            .eq("id", pass_id) \
            .maybe_single() \
            .execute()
        
        if not password_record.data:
            raise HTTPException(status_code=404, detail="Password not found")
        
        password = password_record.data["password"]
        return {
            "status": "success",
            "password": password_record.data["password"],
            "consent_id": consent_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete("/api/cleanup/{consent_id}")
async def cleanup_password(consent_id: str):
    """
    Internal endpoint for cleaning up password after viewing
    """
    try:
        # Get the pass_id from secure_files
        file_record = supabase_client.table("secure_files") \
            .select("id, pass_id") \
            .eq("consent_id", consent_id) \
            .maybe_single() \
            .execute()
        
        if not file_record.data:
            return {"status": "no record found"}
        
        pass_id = file_record.data.get("pass_id")
        if not pass_id:
            return {"status": "already cleaned"}
        
        # Delete from secure_password
        supabase_client.table("secure_password") \
            .delete() \
            .eq("id", pass_id) \
            .execute()
        
        # Set pass_id to null in secure_files
        supabase_client.table("secure_files") \
            .update({"pass_id": None}) \
            .eq("consent_id", consent_id) \
            .execute()
        
        return {"status": "success"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# def generate_password_link(consent_id: str) -> str:
#     """
#     Generates a one-time password view link
#     """
#     token = secrets.token_urlsafe(32)
    
#     # Store the token temporarily (you might want to use Redis for this)
#     # This example uses a simple in-memory store
#     TEMP_TOKENS[token] = {
#         "consent_id": consent_id,
#         "created_at": datetime.now()
#     }
    
    # return f"http://localhost:8000/password/{consent_id}?token={token}"

import httpx

async def create_vault_file(vault_data: dict, filename: str):
    """Call the external vault creation service"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:3000/vault/create",  # Changed to port 3000
                json=vault_data,
                timeout=30.0
            )
            response.raise_for_status()
            # result = response.json()
            # insert_id = result['data']['insert_id']
            return response.json()
        except httpx.HTTPStatusError as e:
            error_detail = f"HTTP error {e.response.status_code}: {e.response.text()}"
            raise Exception(f"Failed to create vault: {error_detail}")
        except httpx.RequestError as e:
            raise Exception(f"Request failed: {str(e)}")
        
@router.post("/admin/reject-consent")
async def reject_consent(
    rejection: ConsentRejection, 
    request: Request,
    current_admin: TokenData = Depends(get_current_admin)
):
    try:
        ip_address = get_real_client_ip(request)
        geo_data = await get_geoip_data(ip_address)
        # Update the consent status to REJECTED
        update_response = supabase_client.table("requested_consents")\
            .update({
                "status_admin": "REJECTED",
                "rejection_reason": rejection.reason,
                "admin_id": current_admin.admin_id
            })\
            .eq("id", rejection.consent_id)\
            .execute()
        
        log_data = {
            "admin_id": current_admin.admin_id,
            "email": current_admin.sub,
            "action_type": "REJECTED",
            "ip_address": ip_address,
            "location_data": geo_data,
            "created_at": datetime.utcnow().isoformat(),
            "action_details":{
                "status": "success",
                "message": "Consent rejected successfully",
                "reason":rejection.reason,
                "consent_id": rejection.consent_id,
            }
        }
        supabase.table("admin_audit_logs").insert(log_data).execute()
        return {"status": "success", "message": "Consent rejected successfully"}
    
    except Exception as e:
        log_data = {
            "admin_id": current_admin.admin_id,
            "email": current_admin.sub,
            "action_type": "ERROR",
            "ip_address": ip_address,
            "location_data": geo_data,
            "created_at": datetime.utcnow().isoformat(),
            "action_details":{
                "status": "ERROR",
                "message": "Consent not rejected",
                # "reason":rejection.reason,
                "consent_id": rejection.consent_id,
            }
        }
        supabase.table("admin_audit_logs").insert(log_data).execute()
        raise HTTPException(status_code=500, detail=str(e))

from datetime import datetime
from fastapi import HTTPException, Depends
import bcrypt

@router.post("/admin/revoke-consent")
async def revoke_consent(
    revoke: ConsentRevoke, 
    request: Request,
    current_admin: TokenData = Depends(get_current_admin)
):
    try:
        # Generate a new random password (effectively revoking access)
        new_password = generate_random_password()
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        ip_address = get_real_client_ip(request)
        geo_data = await get_geoip_data(ip_address)
        # First update the requested_consents table
        update_consent_response = supabase_client.table("requested_consents")\
            .update({
                "status_admin": "REVOKED",
                # "admin_revoked_at": datetime.now().isoformat(),
                "admin_id": current_admin.admin_id
            })\
            .eq("id", revoke.consent_id)\
            .execute()
        
        if not update_consent_response.data:
            log_data = {
                "admin_id": current_admin.admin_id,
                "email": current_admin.sub,
                "action_type": "REVOKED",
                "ip_address": ip_address,
                "location_data": geo_data,
                "created_at": datetime.utcnow().isoformat(),
                "action_details":{
                    "status": "error",
                    "message": "Consent revoked failed",
                    "consent_id": revoke.consent_id
                }
            }
            supabase.table("admin_audit_logs").insert(log_data).execute()
        
            raise HTTPException(
                status_code=404,
                detail=f"Consent with ID {revoke.consent_id} not found"
            )
        
        # Then update the secure_files table
        update_secure_files_response = supabase_client.table("secure_files")\
            .update({
                "password_hash": password_hash
            })\
            .eq("consent_id", revoke.consent_id)\
            .execute()
        
        if not update_secure_files_response:
            log_data = {
                "admin_id": current_admin.admin_id,
                "email": current_admin.sub,
                "action_type": "REVOKED",
                "ip_address": ip_address,
                "location_data": geo_data,
                "created_at": datetime.utcnow().isoformat(),
                "action_details":{
                    "status": "error",
                    "message": "Consent revoked failed",
                    "consent_id": revoke.consent_id
                }
            }       
            supabase.table("admin_audit_logs").insert(log_data).execute()   
        log_data = {
                "admin_id": current_admin.admin_id,
                "email": current_admin.sub,
                "action_type": "REVOKED",
                "ip_address": ip_address,
                "location_data": geo_data,
                "created_at": datetime.utcnow().isoformat(),
                "action_details":{
                    "status": "SUCCESS",
                    "message": "Consent revoked successfully",
                    "consent_id": revoke.consent_id
                }
            }
        supabase.table("admin_audit_logs").insert(log_data).execute()
        
        return {
            "status": "success",
            "message": "Consent revoked successfully",
            "details": {
                "consent_updated": len(update_consent_response.data),
                "secure_files_updated": len(update_secure_files_response.data)
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        log_data = {
                "admin_id": current_admin.admin_id,
                "email": current_admin.sub,
                "action_type": "REVOKED",
                "ip_address": ip_address,
                "location_data": geo_data,
                "created_at": datetime.utcnow().isoformat(),
                "action_details":{
                    "status": "error",
                    "message": "Consent revoked failed",
                    "consent_id": revoke.consent_id
                }
        }       
        supabase.table("admin_audit_logs").insert(log_data).execute()  
        raise HTTPException(
            status_code=500,
            detail=f"Failed to revoke consent: {str(e)}"
        )

def generate_random_password(length: int = 16) -> str:
    """Generate a secure random password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

from supabase import create_client

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE"))
STORAGE_BUCKET = "vault"
# @router.get("/vault/download/{filename}")
# async def download_file(filename: str):
#     try:
#         # Get download URL (valid for 1 hour by default)
#         download_url = supabase.storage \
#             .from_(STORAGE_BUCKET) \
#             .get_public_url(filename)
        
#         # Stream the file
#         async with httpx.AsyncClient() as client:
#             response = await client.get(download_url)
#             response.raise_for_status()
            
#             return StreamingResponse(
#                 response.iter_bytes(),
#                 media_type=response.headers.get("content-type"),
#                 headers={
#                     "Content-Disposition": f"attachment; filename={filename}"
#                 }
#             )
            
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/vault/download/{filename}")
# async def download_file(filename: str):
#     try:
#         # Assume your file is in a folder inside the bucket
#         file_path = f"vault_files/{filename}"
        
#         # Get public URL
#         download_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(file_path)

#         async with httpx.AsyncClient() as client:
#             response = await client.get(download_url)
#             response.raise_for_status()

#             return StreamingResponse(
#                 response.aiter_bytes(),
#                 media_type=response.headers.get("content-type", "application/octet-stream"),
#                 headers={"Content-Disposition": f"attachment; filename={filename}"}
#             )

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# from fastapi.responses import RedirectResponse

# @router.get("/vault/download/{filename}")
# async def download_file(filename: str):
#     try:
#         # Get public URL
#         download_url = supabase.storage \
#             .from_(STORAGE_BUCKET) \
#             .get_public_url(f"vault_files/{filename}")
        
#         # Redirect to the download URL
#         return RedirectResponse(url=download_url)
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import os
import io
from supabase import create_client

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE"))
STORAGE_BUCKET = "vault"

@router.get("/vault/download/{filename}")
async def download_file(filename: str):
    try:
        # Download the file from Supabase
        response = supabase.storage \
            .from_(STORAGE_BUCKET) \
            .download(f"vault_files/{filename}")
        
        # If the response is None, the file doesn't exist
        if response is None:
            raise HTTPException(status_code=404, detail="File not found")
            
        # Check if the response is already bytes (some Supabase SDK versions return bytes directly)
        if isinstance(response, bytes):
            file_bytes = response
        else:
            # If it's a file-like object or response, read it
            file_bytes = response.read()

        # Return as a downloadable file
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Length": str(len(file_bytes))
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.get("/vault/download/{filename}")
# async def download_file(filename: str):
#     try:
#         # Download the file bytes directly from Supabase
#         file_bytes = supabase.storage \
#             .from_(STORAGE_BUCKET) \
#             .download(f"vault_files/{filename}")
        
#         # Return as a downloadable file
#         return StreamingResponse(
#             iter([file_bytes]),
#             media_type="application/octet-stream",
#             headers={
#                 "Content-Disposition": f"attachment; filename={filename}",
#                 "Content-Length": str(len(file_bytes))
#             }
#         )
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

def send_approval_email(email: str, org_name: str, consent_id: str, filename: str):
    """Send approval email using EmailJS"""
    try:
        emailjs_user_id = os.getenv("EMAILJS_USER_ID3")
        emailjs_service_id = os.getenv("EMAILJS_SERVICE_ID3")
        emailjs_template_id = os.getenv("EMAILJS_APPROVAL_TEMPLATE_ID3")
        emailjs_private_key = os.getenv("EMAIL_JS_PRIVATE_KEY3")
        if not all([emailjs_user_id, emailjs_service_id, emailjs_template_id, emailjs_private_key]):
            raise Exception("EmailJS configuration missing")
        
        # Prepare the download links
        vault_download_link = f"http://localhost:8000/vault/download/{filename}"
        # password_link = f"http://localhost:8000/password/{consent_id}?token={secrets.token_urlsafe(32)}"
        password_link = f"http://localhost:5174/password-vault/{consent_id}?token={secrets.token_urlsafe(32)}"
        data = {
            "service_id": emailjs_service_id,
            "template_id": emailjs_template_id,
            "user_id": emailjs_user_id,
            "accessToken": emailjs_private_key,
            "template_params": {
                "to_email": email,
                "org_name": org_name,
                "consent_id": consent_id,
                "vault_link": vault_download_link,
                "password_link": password_link,
                "download_link": f"http://localhost:5174/vaultview",
                # "password": password  
            }
        }
        
        response = requests.post(
            "https://api.emailjs.com/api/v1.0/email/send",
            headers={"Content-Type": "application/json"},
            data=json.dumps(data)
        )
        
        if response.status_code != 200:
            raise Exception(f"EmailJS API error: {response.text}")
        
    except Exception as e:
        print(f"Error sending email: {e}")
        raise


# # Initialize Supabase client
# url: str = os.environ.get("SUPABASE_URL")
# key: str = os.environ.get("SUPABASE_KEY")
# supabase: Client = create_client(url, key)



@router.get("/admin/audit-logs")
async def get_audit_logs():
    try:
        # First, get all relevant audit logs
        audit_logs_response = supabase.table('admin_audit_logs') \
            .select('id, created_at, email, action_type, action_details') \
            .in_('action_type', ['ERROR', 'APPROVED', 'REVOKED', 'REJECTED']) \
            .execute()
        
        audit_logs = audit_logs_response.data
        
        # Extract all unique consent IDs from admin_details
        consent_ids = []
        for log in audit_logs:
            if log.get('action_details') and 'consent_id' in log['action_details']:
                consent_ids.append(log['action_details']['consent_id'])
        
        # Remove duplicates
        consent_ids = list(set(consent_ids))
        
        # Get all requested consents that match these IDs
        requested_consents = {}
        if consent_ids:
            consents_response = supabase_client.table('requested_consents') \
                .select('id, c_id') \
                .in_('id', consent_ids) \
                .execute()
            
            for consent in consents_response.data:
                requested_consents[consent['id']] = consent.get('c_id', 'N/A')
        
        # Transform the data
        transformed_logs = []
        for log in audit_logs:
            consent_id = 'N/A'
            if log.get('action_details') and 'consent_id' in log['action_details']:
                consent_id = requested_consents.get(log['action_details']['consent_id'], 'N/A')
            
            transformed_log = {
                "id": log.get("id"),
                "created_at": log.get("created_at"),
                "email": log.get("admin_email", "").split("@")[0],  # Get part before @
                "action_type": log.get("action_type", "").lower(),
                "consent_id": consent_id,
                "action_details": log.get("action_details", {})
            }
            transformed_logs.append(transformed_log)
        
        return transformed_logs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Update your Consent model to match the database fields
# class Consentss(BaseModel):
#     id: str
#     c_id: str
#     fiu_id: str 
#     purpose: str
#     status: str
#     status_admin: str
#     datafields: List[str]  
#     user_identifier: str
#     admin_id: str
#     expiry_of_approval: Optional[str] = None  
#     actual_expiry: Optional[str] = None  

#     class Config:
#         from_attributes = True

# class AccountData(BaseModel):
#     account_number: str
#     balance: Optional[float] = None
#     credit_score: Optional[int] = None
#     account_details: Optional[str] = None
#     loan_details: Optional[str] = None
#     repayment_history: Optional[str] = None
#     transaction_history: Optional[str] = None
#     salary_inflow: Optional[float] = None
#     insurance_info: Optional[str] = None
#     nominee_details: Optional[str] = None
#     aadhaar_number: Optional[str] = None
#     pan_number: Optional[str] = None
#     dob: Optional[str] = None

# # Field mapping
# field_mapping = {
#     "account balance": "balance",
#     "credit score": "credit_score",
#     "account details": "account_details",
#     "loan details": "loan_details",
#     "repayment history": "repayment_history",
#     "transaction history": "transaction_history",
#     "salary inflow": "salary_inflow",
#     "insurance info": "insurance_info",
#     "nominee details": "nominee_details",
#     "aadhar number": "aadhaar_number",
#     "pan number": "pan_number",
#     "dob": "dob"
# }

# @router.get("/admin/consents", response_model=List[Consentss])
# async def get_consents(request: Request):
#     try:
#         current_admin = get_current_admin(request)
#         # Check if admin_id is the special admin
#         if current_admin.admin_id == "8643126e-9c0e-4ef5-bc74-4139398dd6c3":
#             # Get all approved consents with approved/revoked/expired admin status
#             response = supabase_client.table('requested_consents').select('*').eq('status', 'APPROVED').in_('status_admin', ['APPROVED', 'REVOKED', 'EXPIRED']).execute()
#         else:
#             # Get only consents for this admin
#             response = supabase_client.table('requested_consents').select('*').eq('status', 'APPROVED').in_('status_admin', ['APPROVED', 'REVOKED', 'EXPIRED']).eq('admin_id', current_admin.admin_id).execute()
        
#         consents = response.data
#         return consents
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/account-data/{user_identifier}", response_model=AccountData)
# async def get_account_data(
#     user_identifier: str, 
#     data_fields: List[str] = Body(...)
# ):
#     try:
#         fields_list = [field.strip() for field in data_fields] if data_fields else []
        
#         # Get account by user_identifier
#         response = supabase_client.table('accounts').select('*').eq('account_number', user_identifier).execute()
        
#         if not response.data:
#             raise HTTPException(status_code=404, detail="Account not found")
        
#         account_data = response.data[0]
        
#         # Filter only the requested fields
#         filtered_data = {}
#         for field in fields_list:
#             mapped_field = field_mapping.get(field.lower())
#             if mapped_field and mapped_field in account_data:
#                 filtered_data[mapped_field] = account_data[mapped_field]
        
#         # Always include account number
#         filtered_data['account_number'] = account_data['account_number']
        
#         return filtered_data
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

class Consentss(BaseModel):
    id: str
    c_id: str
    fiu_id: str 
    purpose: str
    status: str
    status_admin: str
    datafields: List[str]  
    user_identifier: str
    admin_id: str
    expiry_of_approval: Optional[str] = None  
    actual_expiry: Optional[str] = None  

    class Config:
        from_attributes = True
class RepaymentRecord(BaseModel):
    date: str
    amount: float
    status: str

class TransactionRecord(BaseModel):
    date: str
    amount: float
    balance: float
    description: str

class AccountData(BaseModel):
    account_number: str
    balance: Optional[float] = None
    credit_score: Optional[int] = None
    account_details: Optional[dict] = None
    loan_details: Optional[dict] = None
    repayment_history: Optional[List[RepaymentRecord]] = None  
    transaction_history: Optional[List[TransactionRecord]] = None
    salary_inflow: Optional[dict] = None
    insurance_info: Optional[dict] = None
    nominee_details: Optional[dict] = None
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    dob: Optional[str] = None

# Field mapping
field_mapping = {
    "account balance": "balance",
    "credit score": "credit_score",
    "account details": "account_details",
    "loan details": "loan_details",
    "repayment history": "repayment_history",
    "transaction history": "transaction_history",
    "salary inflow": "salary_inflow",
    "insurance info": "insurance_info",
    "nominee details": "nominee_details",
    "aadhar number": "aadhaar_number",
    "pan number": "pan_number",
    "dob": "dob"
}

@router.get("/admin/consents", response_model=List[Consentss])
async def get_consents(request: Request):
    try:
        # Get all approved consents with approved/revoked/expired admin status
        response = supabase_client.table('requested_consents').select('*').eq('status', 'APPROVED').in_('status_admin', ['APPROVED', 'REVOKED', 'EXPIRED']).execute()
        
        consents = response.data
        return consents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/account-data/{user_identifier}", response_model=AccountData)
# async def get_account_data(
#     user_identifier: str, 
#     data_fields: List[str] = Body(...)
# ):
#     try:
#         fields_list = [field.strip() for field in data_fields] if data_fields else []
        
#         # Get account by user_identifier
#         response = supabase_client.table('accounts').select('*').eq('account_number', user_identifier).execute()
        
#         if not response.data:
#             raise HTTPException(status_code=404, detail="Account not found")
        
#         account_data = response.data[0]
        
#         # Filter only the requested fields
#         filtered_data = {}
#         for field in fields_list:
#             mapped_field = field_mapping.get(field.lower())
#             if mapped_field and mapped_field in account_data:
#                 filtered_data[mapped_field] = account_data[mapped_field]
        
#         # Always include account number
#         filtered_data['account_number'] = account_data['account_number']
        
#         return filtered_data
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
field_mappingg = {
    "account details": "account_details",
    "loan details": "loan_details",
    "repayment history": "repayment_history",
    "transaction history": "transaction_history",
    "salary inflow": "salary_inflow",
    "insurance info": "insurance_info",
    "nominee details": "nominee_details",
}

# @router.post("/account-data/{user_identifier}", response_model=AccountData)
# async def get_account_data(
#     user_identifier: str, 
#     data_fields: List[str] = Body(..., embed=True)
# ):
#     try:
#         # Clean and map the requested fields
#         requested_fields = []
#         for field in data_fields:
#             # Remove any whitespace and convert to lowercase for consistent matching
#             clean_field = field.strip().lower()
#             # Get the mapped field name or use the original if not found
#             mapped_field = field_mappingg.get(clean_field, clean_field)
#             requested_fields.append(mapped_field)
        
#         # Get account by user_identifier
#         response = supabase_client.table('accounts').select('*').eq('account_number', user_identifier).execute()
        
#         if not response.data:
#             raise HTTPException(status_code=404, detail="Account not found")
        
#         account_data = response.data[0]
        
#         # Filter only the requested fields
#         filtered_data = {}
#         for field in requested_fields:
#             if field in account_data:
#                 # Convert list to dictionary if needed
#                 if field == 'repayment_history' and isinstance(account_data[field], list):
#                     # Create a dictionary with dates as keys
#                     filtered_data[field] = {
#                         item['date']: item for item in account_data[field]
#                     }
#                 else:
#                     filtered_data[field] = account_data[field]
        
#         # Always include account number
#         filtered_data['account_number'] = account_data['account_number']
        
#         return filtered_data
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.post("/account-data/{user_identifier}", response_model=AccountData)
async def get_account_data(
    user_identifier: str, 
    data_fields: List[str] = Body(..., embed=True)
):
    try:
        # Clean and map the requested fields
        requested_fields = []
        for field in data_fields:
            clean_field = field.strip().lower()
            mapped_field = field_mappingg.get(clean_field, clean_field)
            requested_fields.append(mapped_field)
        
        # Get account data
        response = supabase_client.table('accounts').select('*').eq('account_number', user_identifier).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Account not found")
        
        account_data = response.data[0]
        
        # Filter and format the response
        filtered_data = {'account_number': account_data['account_number']}
        
        for field in requested_fields:
            if field in account_data:
                # Return data in its original format (don't convert lists to dicts)
                filtered_data[field] = account_data[field]
        
        return filtered_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))