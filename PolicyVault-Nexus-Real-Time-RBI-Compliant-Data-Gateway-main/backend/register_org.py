# # from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
# # from fastapi.security import APIKeyHeader
# # from fastapi.middleware.cors import CORSMiddleware
# # from pydantic import BaseModel, validator, constr, EmailStr
# # from typing import List, Optional
# # from datetime import datetime
# # import supabase_client
# # import bcrypt
# # import secrets
# # import re
# # import os
# # from dotenv import load_dotenv
# # from fastapi import APIRouter
# # from supabase import create_client, Client


# # router = APIRouter()

# # load_dotenv()

# # # app = FastAPI(title="Organization Registration API")

# # # # CORS Setup
# # # app.add_middleware(
# # #     CORSMiddleware,
# # #     allow_origins=["*"],
# # #     allow_credentials=True,
# # #     allow_methods=["*"],
# # #     allow_headers=["*"],
# # # )

# # # Supabase Client
# # url = os.getenv("SUPABASE_URL")
# # key = os.getenv("SUPABASE_SERVICE_ROLE")  
# # supabase_client: Client = create_client(url, key)

# # # Security
# # api_key_header = APIKeyHeader(name="X-API-KEY")

# # # Models
# # # Pydantic models
# # class OrganizationCreate(BaseModel):
# #     registration_number: constr(min_length=8, max_length=8)
# #     org_name: str
# #     logo_url: Optional[str] = None
# #     website_url: Optional[str] = None
# #     contact_email: EmailStr
# #     contact_number: constr(min_length=10, max_length=10)
# #     location: str
# #     description: Optional[str] = None
# #     industry_type: List[str]
# #     other_industry: Optional[str] = None
# #     password: str
# #     confirm_password: str

# #     @validator('password')
# #     def validate_password(cls, v):
# #         if len(v) < 8:
# #             raise ValueError('Password must be at least 8 characters')
# #         return v

# #     @validator('confirm_password')
# #     def validate_passwords_match(cls, v, values):
# #         if 'password' in values and v != values['password']:
# #             raise ValueError('Passwords do not match')
# #         return v
    
# #     @validator('registration_number')
# #     def validate_oui(cls, v):
# #         if not re.match(r'^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$', v):
# #             raise ValueError('Must be valid OUI format (e.g., AC:DE:48)')
# #         return v

# #     @validator('contact_number')
# #     def validate_phone(cls, v):
# #         if not v.isdigit():
# #             raise ValueError('Phone number must contain only digits')
# #         return v

# #     @validator('industry_type')
# #     def validate_industry(cls, v):
# #         valid_industries = ['Banking', 'Insurance', 'Healthcare', 'Education', 
# #                             'Retail', 'Technology', 'Government', 'Other']
# #         if not v:
# #             raise ValueError('Select at least one industry')
# #         if any(ind not in valid_industries for ind in v):
# #             raise ValueError('Invalid industry selected')
# #         return v

# # class OrganizationResponse(BaseModel):
# #     id: str
# #     org_name: str
# #     contact_email: str
# #     status: str
# #     created_at: datetime
# #     api_key: Optional[str]  


# # # Storage
# # LOGO_BUCKET = "logo-org"

# # async def upload_logo_to_supabase(file: UploadFile):
# #     try:
# #         file_contents = await file.read()
# #         file_path = f"logos/{secrets.token_hex(8)}_{file.filename}"
        
# #         res = supabase_client.storage.from_(LOGO_BUCKET).upload(
# #             file_path,
# #             file_contents,
# #             {"content-type": file.content_type}
# #         )
        
# #         if not res:
# #             raise HTTPException(
# #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #                 detail="Logo upload failed"
# #             )
        
# #         # Get public URL
# #         url = supabase_client.storage.from_(LOGO_BUCKET).get_public_url(file_path)
# #         return url
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail=f"Error uploading logo: {str(e)}"
# #         )

# # # Database Operations
# # async def create_organization(data: dict):
# #     try:
# #         # Check if OUI or email already exists
# #         existing_oui = supabase_client.table('organizations') \
# #             .select('registration_number') \
# #             .eq('registration_number', data['registration_number']) \
# #             .execute()
        
# #         existing_email = supabase_client.table('organizations') \
# #             .select('contact_email') \
# #             .eq('contact_email', data['contact_email']) \
# #             .execute()
        
# #         if existing_oui.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_400_BAD_REQUEST,
# #                 detail="Organization with this OUI already exists"
# #             )
        
# #         if existing_email.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_400_BAD_REQUEST,
# #                 detail="Organization with this email already exists"
# #             )
        
# #         # Hash password
# #         hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
# #         # Generate API key (will be activated after verification)
# #         # api_key = secrets.token_urlsafe(32)
# #         api_key = f"pvk_{secrets.token_urlsafe(32)}"
# #         # Prepare data for insertion
# #         org_data = {
# #             **data,
# #             "password_hash": hashed_pw.decode('utf-8'),
# #             "api_key": api_key,
# #             "status": "PENDING",
# #             "industry_type": data['industry_type'],
# #             "api_key_active": False
# #         }
        
# #         # Remove password field before insertion
# #         org_data.pop('password', None)
        
# #         # Insert into database
# #         response = supabase_client.table('organizations') \
# #             .insert(org_data) \
# #             .execute()
        
# #         if not response.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #                 detail="Failed to create organization"
# #             )
        
# #         return response.data[0]
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail=f"Database error: {str(e)}"
# #         )

# # # Routes
# # # @router.post("/register", response_model=OrganizationResponse)
# # # async def register_organization(
# # #     registration_number: str,
# # #     org_name: str,
# # #     contact_email: str,
# # #     contact_number: str,
# # #     location: str,
# # #     industry_type: List[str],
# # #     password: str,
# # #     confirm_password: str,
# # #     logo: UploadFile = File(None),
# # #     website_url: Optional[str] = None,
# # #     description: Optional[str] = None,
# # #     other_industry: Optional[str] = None
# # # ):
# # #     # Validate password match
# # #     if password != confirm_password:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_400_BAD_REQUEST,
# # #             detail="Passwords do not match"
# # #         )
    
# # #     # Validate password strength
# # #     if len(password) < 8:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_400_BAD_REQUEST,
# # #             detail="Password must be at least 8 characters"
# # #         )
    
# # #     # Upload logo if provided
# # #     logo_url = None
# # #     if logo:
# # #         if not logo.content_type.startswith('image/'):
# # #             raise HTTPException(
# # #                 status_code=status.HTTP_400_BAD_REQUEST,
# # #                 detail="Only image files are allowed for logo"
# # #             )
# # #         logo_url = await upload_logo_to_supabase(logo)
    
# # #     # Validate "Other" industry
# # #     if "Other" in industry_type and not other_industry:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_400_BAD_REQUEST,
# # #             detail="Please specify 'Other' industry"
# # #         )
    
# # #     # Prepare data
# # #     org_data = {
# # #         "registration_number": registration_number,
# # #         "org_name": org_name,
# # #         "logo_url": logo_url,
# # #         "website_url": website_url,
# # #         "contact_email": contact_email,
# # #         "contact_number": contact_number,
# # #         "location": location,
# # #         "description": description,
# # #         "industry_type": industry_type,
# # #         "other_industry": other_industry if "Other" in industry_type else None,
# # #         "password": password
# # #     }
    
# # #     # Create organization
# # #     try:
# # #         organization = await create_organization(org_data)
        
# # #         # TODO: Send verification email with token
# # #         # This would call your email service to send a verification link
        
# # #         return organization
# # #     except HTTPException as he:
# # #         raise he
# # #     except Exception as e:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # #             detail=f"Registration failed: {str(e)}"
# # #         )

# # from fastapi import APIRouter, HTTPException, status
# # from pydantic import BaseModel, validator, constr, EmailStr
# # from typing import List, Optional
# # from datetime import datetime
# # import bcrypt
# # import secrets
# # import re
# # import os
# # from dotenv import load_dotenv
# # from supabase import create_client, Client

# # router = APIRouter()

# # # Load environment variables
# # load_dotenv()

# # # Supabase client setup
# # url = os.getenv("SUPABASE_URL")
# # key = os.getenv("SUPABASE_SERVICE_ROLE")
# # supabase_client: Client = create_client(url, key)

# # # Pydantic models
# # class OrganizationCreate(BaseModel):
# #     registration_number: constr(min_length=8, max_length=8)
# #     org_name: str
# #     logo_url: Optional[str] = None
# #     website_url: Optional[str] = None
# #     contact_email: EmailStr
# #     contact_number: constr(min_length=10, max_length=10)
# #     location: str
# #     description: Optional[str] = None
# #     industry_type: List[str]
# #     other_industry: Optional[str] = None
# #     password: str
# #     confirm_password: str

# #     @validator('password')
# #     def validate_password(cls, v):
# #         if len(v) < 8:
# #             raise ValueError('Password must be at least 8 characters')
# #         return v

# #     @validator('confirm_password')
# #     def validate_passwords_match(cls, v, values):
# #         if 'password' in values and v != values['password']:
# #             raise ValueError('Passwords do not match')
# #         return v

# #     @validator('registration_number')
# #     def validate_oui(cls, v):
# #         if not re.match(r'^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$', v):
# #             raise ValueError('Must be valid OUI format (e.g., AC:DE:48)')
# #         return v

# #     @validator('contact_number')
# #     def validate_phone(cls, v):
# #         if not v.isdigit():
# #             raise ValueError('Phone number must contain only digits')
# #         return v

# #     @validator('industry_type')
# #     def validate_industry(cls, v):
# #         valid_industries = ['Banking', 'Insurance', 'Healthcare', 'Education', 
# #                             'Retail', 'Technology', 'Government', 'Other']
# #         if not v:
# #             raise ValueError('Select at least one industry')
# #         if any(ind not in valid_industries for ind in v):
# #             raise ValueError('Invalid industry selected')
# #         return v

# # class OrganizationResponse(BaseModel):
# #     id: str
# #     org_name: str
# #     contact_email: str
# #     status: str
# #     created_at: datetime


# # # Register organization endpoint
# # @router.post("/register", response_model=OrganizationResponse, status_code=201)
# # async def register_organization(payload: OrganizationCreate):
# #     print("Received payload:", payload.dict())
# #     data = payload.dict()

# #     # Validate "Other" industry
# #     if "Other" in data["industry_type"] and not data.get("other_industry"):
# #         raise HTTPException(
# #             status_code=status.HTTP_400_BAD_REQUEST,
# #             detail="Please specify 'Other' industry"
# #         )

# #     # Check for existing organization by OUI or email
# #     try:
# #         existing_oui = supabase_client.table('organizations') \
# #             .select('registration_number') \
# #             .eq('registration_number', data['registration_number']) \
# #             .execute()

# #         if existing_oui.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_400_BAD_REQUEST,
# #                 detail="Organization with this OUI already exists"
# #             )

# #         existing_email = supabase_client.table('organizations') \
# #             .select('contact_email') \
# #             .eq('contact_email', data['contact_email']) \
# #             .execute()

# #         if existing_email.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_400_BAD_REQUEST,
# #                 detail="Organization with this email already exists"
# #             )

# #         # Hash password
# #         hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
# #         api_key = f"pvk_{secrets.token_urlsafe(32)}"

# #         org_data = {
# #             **data,
# #             "password_hash": hashed_pw,
# #             "api_key": api_key,
# #             "status": "PENDING",
# #             "other_industry": data["other_industry"] if "Other" in data["industry_type"] else None,
# #             "api_key_active": False
# #         }

# #         org_data.pop("password")

# #         # Insert into Supabase
# #         response = supabase_client.table('organizations') \
# #             .insert(org_data) \
# #             .execute()

# #         if not response.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #                 detail="Failed to create organization"
# #             )

# #         response_data = response.data[0]
# #         return {
# #             "id": response_data["id"],
# #             "org_name": response_data["org_name"],
# #             "contact_email": response_data["contact_email"],
# #             "status": response_data["status"],
# #             "created_at": response_data["created_at"],
# #             "api_key": response_data["api_key"]  
# #         }
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail=f"Server error: {str(e)}"
# #         )


# # # @app.post("/upload-logo")
# # # async def upload_logo(file: UploadFile = File(...)):
# # #     try:
# # #         if not file.content_type.startswith('image/'):
# # #             raise HTTPException(
# # #                 status_code=status.HTTP_400_BAD_REQUEST,
# # #                 detail="Only image files are allowed"
# # #             )
        
# # #         url = await upload_logo_to_supabase(file)
# # #         return {"url": url}
# # #     except HTTPException:
# # #         raise
# # #     except Exception as e:
# # #         raise HTTPException(
# # #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# # #             detail=f"Error uploading logo: {str(e)}"
# # #         )

# # # Add this route to your FastAPI app
# # @router.post("/storage/upload-logo")
# # async def storage_upload_logo(file: UploadFile = File(...)):
# #     try:
# #         # Validate file type
# #         if not file.content_type.startswith('image/'):
# #             raise HTTPException(
# #                 status_code=400,
# #                 detail="Only image files are allowed (JPEG, PNG, etc.)"
# #             )

# #         # Verify file size (e.g., 5MB max)
# #         max_size = 5 * 1024 * 1024  # 5MB
# #         file_contents = await file.read()
# #         if len(file_contents) > max_size:
# #             raise HTTPException(
# #                 status_code=400,
# #                 detail="File too large. Max 5MB allowed."
# #             )

# #         # Reset file pointer after reading
# #         await file.seek(0)

# #         # Generate unique filename
# #         file_ext = file.filename.split('.')[-1]
# #         filename = f"{secrets.token_hex(8)}.{file_ext}"
# #         file_path = f"logos/{filename}"

# #         # Upload to Supabase
# #         res = supabase_client.storage.from_(LOGO_BUCKET).upload(
# #             file_path,
# #             file_contents,
# #             {"content-type": file.content_type}
# #         )

# #         if not res:
# #             raise HTTPException(
# #                 status_code=500,
# #                 detail="Failed to upload to storage"
# #             )

# #         # Get public URL
# #         url = supabase_client.storage.from_(LOGO_BUCKET).get_public_url(file_path)
# #         return {"url": url, "filename": filename}

# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=500,
# #             detail=f"Upload failed: {str(e)}"
# #         )

# # @router.get("/verify-organization/{token}")
# # async def verify_organization(token: str):
# #     try:
# #         # TODO: Implement token verification logic
# #         # This would decode the JWT token and update the organization status
        
# #         # Mock implementation
# #         decoded_data = {"org_id": "some-id-from-token"}  # Replace with actual JWT decode
        
# #         # Update organization status
# #         response = supabase_client.table('organizations') \
# #             .update({"status": "APPROVED", "api_key_active": True, "verified_at": datetime.utcnow().isoformat()}) \
# #             .eq("id", decoded_data["org_id"]) \
# #             .execute()
        
# #         if not response.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_404_NOT_FOUND,
# #                 detail="Organization not found"
# #             )
        
# #         return {"message": "Organization verified successfully"}
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail=f"Verification failed: {str(e)}"
# #         )

# # # Protected endpoint example
# # @router.get("/organization", response_model=OrganizationResponse)
# # async def get_organization(api_key: str = Depends(api_key_header)):
# #     try:
# #         # Verify API key
# #         org = supabase_client.table('organizations') \
# #             .select("*") \
# #             .eq("api_key", api_key) \
# #             .eq("status", "APPROVED") \
# #             .eq("api_key_active", True) \
# #             .execute()
        
# #         if not org.data:
# #             raise HTTPException(
# #                 status_code=status.HTTP_401_UNAUTHORIZED,
# #                 detail="Invalid API key or organization not approved"
# #             )
        
# #         return org.data[0]
# #     except Exception as e:
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail=f"Error fetching organization: {str(e)}"
# #         )

# from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
# from fastapi.security import APIKeyHeader
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, validator, constr, EmailStr
# from typing import List, Optional
# from datetime import datetime
# import supabase_client
# import bcrypt
# import secrets
# import re
# import os
# from dotenv import load_dotenv
# from fastapi import APIRouter
# from supabase import create_client, Client

# router = APIRouter()

# load_dotenv()

# # Supabase Client
# url = os.getenv("SUPABASE_URL")
# key = os.getenv("SUPABASE_SERVICE_ROLE")  
# supabase_client: Client = create_client(url, key)

# # Security
# api_key_header = APIKeyHeader(name="X-API-KEY")

# # Models
# class OrganizationCreate(BaseModel):
#     registration_number: str
#     org_name: str
#     logo_url: Optional[str] = None
#     website_url: Optional[str] = None
#     contact_email: EmailStr
#     contact_number: str
#     location: str
#     description: Optional[str] = None
#     industry_type: List[str]
#     other_industry: Optional[str] = None
#     password: str
#     confirm_password: str

#     @validator('registration_number')
#     def validate_oui(cls, v):
#         if not re.match(r'^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$', v):
#             raise ValueError('Must be valid OUI format (e.g., AC:DE:48)')
#         return v.upper()

#     @validator('contact_number')
#     def validate_phone(cls, v):
#         if not v.isdigit() or len(v) != 10:
#             raise ValueError('Phone number must be 10 digits')
#         return v

#     @validator('industry_type')
#     def validate_industry(cls, v):
#         valid_industries = {'Banking', 'Insurance', 'Healthcare', 'Education', 
#                           'Retail', 'Technology', 'Government', 'Other'}
#         if not v:
#             raise ValueError('Select at least one industry')
#         if not set(v).issubset(valid_industries):
#             raise ValueError('Invalid industry selected')
#         return v

#     @validator('password')
#     def validate_password(cls, v):
#         if len(v) < 8:
#             raise ValueError('Password must be at least 8 characters')
#         return v

#     @validator('confirm_password')
#     def validate_passwords_match(cls, v, values):
#         if 'password' in values and v != values['password']:
#             raise ValueError('Passwords do not match')
#         return v

# class OrganizationResponse(BaseModel):
#     id: str
#     org_name: str
#     contact_email: str
#     status: str
#     created_at: datetime
#     api_key: Optional[str]

# # Storage
# LOGO_BUCKET = "logo-org"

# @router.post("/storage/upload-logo")
# async def upload_logo(file: UploadFile = File(...)):
#     try:
#         # Validate file type
#         if not file.content_type.startswith('image/'):
#             raise HTTPException(
#                 status_code=400,
#                 detail="Only image files are allowed"
#             )

#         # Verify file size (5MB max)
#         max_size = 5 * 1024 * 1024
#         file_contents = await file.read()
#         if len(file_contents) > max_size:
#             raise HTTPException(
#                 status_code=400,
#                 detail="File too large. Max 5MB allowed."
#             )

#         # Generate unique filename
#         file_ext = file.filename.split('.')[-1]
#         filename = f"{secrets.token_hex(8)}.{file_ext}"
#         file_path = f"logos/{filename}"

#         # Upload to Supabase
#         res = supabase_client.storage.from_(LOGO_BUCKET).upload(
#             file_path,
#             file_contents,
#             {"content-type": file.content_type}
#         )

#         if not res:
#             raise HTTPException(
#                 status_code=500,
#                 detail="Failed to upload to storage"
#             )

#         # Get public URL
#         url = supabase_client.storage.from_(LOGO_BUCKET).get_public_url(file_path)
#         return {"url": url}

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Upload failed: {str(e)}"
#         )

# @router.post("/register", response_model=OrganizationResponse, status_code=201)
# async def register_organization(payload: OrganizationCreate):
#     try:
#         data = payload.dict()

#         # Check for existing organization
#         existing_oui = supabase_client.table('organizations') \
#             .select('registration_number') \
#             .eq('registration_number', data['registration_number']) \
#             .execute()
        
#         existing_email = supabase_client.table('organizations') \
#             .select('contact_email') \
#             .eq('contact_email', data['contact_email']) \
#             .execute()
        
#         if existing_oui.data:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Organization with this OUI already exists"
#             )
        
#         if existing_email.data:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Organization with this email already exists"
#             )

#         # Hash password
#         hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
#         api_key = f"pvk_{secrets.token_urlsafe(32)}"

#         # Prepare data for insertion
#         org_data = {
#             "registration_number": data['registration_number'],
#             "org_name": data['org_name'],
#             "logo_url": data.get('logo_url'),
#             "website_url": data.get('website_url'),
#             "contact_email": data['contact_email'],
#             "contact_number": data['contact_number'],
#             "location": data['location'],
#             "description": data.get('description'),
#             "industry_type": data['industry_type'],
#             "other_industry": data.get('other_industry') if 'Other' in data['industry_type'] else None,
#             "password_hash": hashed_pw,
#             "api_key": api_key,
#             "status": "PENDING",
#             "api_key_active": False
#         }

#         # Insert into database
#         response = supabase_client.table('organizations') \
#             .insert(org_data) \
#             .execute()
        
#         if not response.data:
#             raise HTTPException(
#                 status_code=500,
#                 detail="Failed to create organization"
#             )

#         return {
#             "id": response.data[0]['id'],
#             "org_name": response.data[0]['org_name'],
#             "contact_email": response.data[0]['contact_email'],
#             "status": response.data[0]['status'],
#             "created_at": response.data[0]['created_at'],
#             "api_key": response.data[0]['api_key']
#         }

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Server error: {str(e)}"
#         )


from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Request
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator, constr, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import supabase_client
import bcrypt
import secrets
import re
import os
from dotenv import load_dotenv
from fastapi import APIRouter
from supabase import create_client, Client
import jwt
from fastapi.responses import JSONResponse
import httpx 

# RESEND_API_KEY = os.getenv("RESEND_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET_Key")
FRONTEND_URL = os.getenv("FRONTEND_BASE_URL")
JWT_ALGORITHM = "HS256"
VERIFICATION_TOKEN_EXPIRE_HOURS = 24
# resend.api_key = RESEND_API_KEY
router = APIRouter(
    prefix="/register_org",
    tags=["Organization Registration"])

load_dotenv()

# app = FastAPI(title="Organization Registration API")

# # CORS Setup
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Supabase Client
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")  
supabase_client: Client = create_client(url, key)

# Security
api_key_header = APIKeyHeader(name="X-API-KEY")

# Models
class EmailRequest(BaseModel):
    email: EmailStr
    org_name: str
    org_id: str

    class Config:
        populate_by_name = True
        fields = {
            'org_id': {'alias': 'org_id'}  # Accepts both formats
        }

# Add this class to your code
class EmailTemplate:
    def __init__(self, data: dict):
        self.verification_link = data["verificationLink"]
        self.org_name = data["org_name"]

    def render(self):
        return f"""
        <div>
            <h1>Verify Your PolicyVault Account</h1>
            <p>Hello {self.org_name},</p>
            <p>Please click below to verify your account:</p>
            <a href="{self.verification_link}">Verify Account</a>
            <p>This link expires in 24 hours.</p>
        </div>
        """
    
# Pydantic models
class OrganizationCreate(BaseModel):
    registration_number: constr(min_length=8, max_length=8)
    org_name: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: EmailStr
    contact_number: constr(min_length=10, max_length=10)
    location: str
    description: Optional[str] = None
    industry_type: List[str]
    other_industry: Optional[str] = None
    password: str

    @validator('registration_number')
    def validate_oui(cls, v):
        if not re.match(r'^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$', v):
            raise ValueError('Must be valid OUI format (e.g., AC:DE:48)')
        return v

    @validator('contact_number')
    def validate_phone(cls, v):
        if not v.isdigit():
            raise ValueError('Phone number must contain only digits')
        return v

    @validator('industry_type')
    def validate_industry(cls, v):
        valid_industries = ['Banking', 'Insurance', 'Healthcare', 'Education', 
                            'Retail', 'Technology', 'Government', 'Other']
        if not v:
            raise ValueError('Select at least one industry')
        if any(ind not in valid_industries for ind in v):
            raise ValueError('Invalid industry selected')
        return v

class OrganizationResponse(BaseModel):
    id: str
    org_name: str
    contact_email: str
    status: str
    created_at: datetime


# Storage
LOGO_BUCKET = "logo-org"

async def upload_logo_to_supabase(file: UploadFile):
    try:
        file_contents = await file.read()
        file_path = f"logos/{secrets.token_hex(8)}_{file.filename}"
        
        res = supabase_client.storage.from_(LOGO_BUCKET).upload(
            file_path,
            file_contents,
            {"content-type": file.content_type}
        )
        
        if not res:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logo upload failed"
            )
        
        # Get public URL
        url = supabase_client.storage.from_(LOGO_BUCKET).get_public_url(file_path)
        return url
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading logo: {str(e)}"
        )

# Database Operations
async def create_organization(data: dict):
    try:
        # Check if OUI or email already exists
        existing_oui = supabase_client.table('organizations') \
            .select('registration_number') \
            .eq('registration_number', data['registration_number']) \
            .execute()
        
        existing_email = supabase_client.table('organizations') \
            .select('contact_email') \
            .eq('contact_email', data['contact_email']) \
            .execute()
        
        if existing_oui.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this OUI already exists"
            )
        
        if existing_email.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this email already exists"
            )
        
        # Hash password
        hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Generate API key (will be activated after verification)
        api_key = secrets.token_urlsafe(32)
        
        # Prepare data for insertion
        org_data = {
            **data,
            "password_hash": hashed_pw.decode('utf-8'),
            "api_key": api_key,
            "status": "PENDING",
            "industry_type": data['industry_type']
        }
        
        # Remove password field before insertion
        org_data.pop('password', None)
        
        # Insert into database
        response = supabase_client.table('organizations') \
            .insert(org_data) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create organization"
            )
        
        return {
        **response.data[0],
        "api_key": api_key  # Ensure this is included at the root level
    }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# Routes
# @router.post("/register", response_model=OrganizationResponse)
# async def register_organization(
#     registration_number: str,
#     org_name: str,
#     contact_email: str,
#     contact_number: str,
#     location: str,
#     industry_type: List[str],
#     password: str,
#     confirm_password: str,
#     logo: UploadFile = File(None),
#     website_url: Optional[str] = None,
#     description: Optional[str] = None,
#     other_industry: Optional[str] = None
# ):
#     # Validate password match
#     if password != confirm_password:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Passwords do not match"
#         )
    
#     # Validate password strength
#     if len(password) < 8:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Password must be at least 8 characters"
#         )
    
#     # Upload logo if provided
#     logo_url = None
#     if logo:
#         if not logo.content_type.startswith('image/'):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Only image files are allowed for logo"
#             )
#         logo_url = await upload_logo_to_supabase(logo)
    
#     # Validate "Other" industry
#     if "Other" in industry_type and not other_industry:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Please specify 'Other' industry"
#         )
    
#     # Prepare data
#     org_data = {
#         "registration_number": registration_number,
#         "org_name": org_name,
#         "logo_url": logo_url,
#         "website_url": website_url,
#         "contact_email": contact_email,
#         "contact_number": contact_number,
#         "location": location,
#         "description": description,
#         "industry_type": industry_type,
#         "other_industry": other_industry if "Other" in industry_type else None,
#         "password": password
#     }
    
#     # Create organization
#     try:
#         organization = await create_organization(org_data)
        
#         # TODO: Send verification email with token
#         # This would call your email service to send a verification link
        
#         return organization
#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Registration failed: {str(e)}"
#         )

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, validator, constr, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
import bcrypt
import secrets
import re
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import jwt
import requests
from fastapi import Request
from fastapi.responses import JSONResponse

router = APIRouter()

# Load environment variables
load_dotenv()

# Supabase client setup
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")
# Add these to your environment variables
EMAILJS_SERVICE_ID = os.getenv("EMAILJS_SERVICE_ID")
EMAILJS_TEMPLATE_ID = os.getenv("EMAILJS_TEMPLATE_ID")
EMAILJS_USER_ID = os.getenv("EMAILJS_USER_ID")  # This is your public key
EMAILJS_PRIVATE_KEY = os.getenv("EMAILJS_PRIVATE_KEY")
supabase_client: Client = create_client(url, key)


# Pydantic models
class OrganizationCreate(BaseModel):
    registration_number: constr(min_length=8, max_length=8)
    org_name: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: EmailStr
    contact_number: constr(min_length=10, max_length=10)
    location: str
    description: Optional[str] = None
    industry_type: List[str]
    other_industry: Optional[str] = None
    password: str

    @validator('registration_number')
    def validate_oui(cls, v):
        if not re.match(r'^[A-F0-9]{2}:[A-F0-9]{2}:[A-F0-9]{2}$', v):
            raise ValueError('Must be valid OUI format (e.g., AC:DE:48)')
        return v

    @validator('contact_number')
    def validate_phone(cls, v):
        if not v.isdigit():
            raise ValueError('Phone number must contain only digits')
        return v

    @validator('industry_type')
    def validate_industry(cls, v):
        valid_industries = ['Banking', 'Insurance', 'Healthcare', 'Education', 
                            'Retail', 'Technology', 'Government', 'Other']
        if not v:
            raise ValueError('Select at least one industry')
        if any(ind not in valid_industries for ind in v):
            raise ValueError('Invalid industry selected')
        return v

class OrganizationResponse(BaseModel):
    id: str
    org_name: str
    registration_number: str
    logo_url: Optional[str]
    website_url: Optional[str]
    contact_email: str
    contact_number: str
    location: str
    description: Optional[str]
    industry_type: List[str]
    other_industry: Optional[str]
    status: str
    created_at: str
    verification_token: Optional[str] = None
    api_key: str  # Now included in response model


# Register organization endpoint
@router.post("/register", response_model=OrganizationResponse, status_code=201)
async def register_organization(payload: OrganizationCreate):
    data = payload.dict()

    # Validate "Other" industry
    if "Other" in data["industry_type"] and not data.get("other_industry"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please specify 'Other' industry"
        )

    # Check for existing organization by OUI or email
    try:
        existing_oui = supabase_client.table('organizations') \
            .select('registration_number') \
            .eq('registration_number', data['registration_number']) \
            .execute()

        if existing_oui.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this OUI already exists"
            )

        existing_email = supabase_client.table('organizations') \
            .select('contact_email') \
            .eq('contact_email', data['contact_email']) \
            .execute()

        if existing_email.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization with this email already exists"
            )

        

        # Hash password
        hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        api_key = secrets.token_urlsafe(32)

        org_data = {
            **data,
            "password_hash": hashed_pw,
            "api_key": api_key,
            "status": "PENDING",
            "other_industry": data["other_industry"] if "Other" in data["industry_type"] else None,
        }

        org_data.pop("password")

        # Insert into Supabase
        response = supabase_client.table('organizations') \
            .insert(org_data) \
            .execute()

        # org = response.data[0]

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create organization"
            )
        
        org = response.data[0]["id"]
        if not org:
            raise HTTPException(
                status_code=500,
                detail="Organization ID not generated"
            )
        

        verification_token = generate_verification_token(response.data[0]["id"])

        return {
            **response.data[0],  # All organization data
            "api_key": api_key,   # Explicitly include at root level
            "verification_token": verification_token,
            "org_id":org
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )

def generate_verification_token(org_id: str) -> str:
    """Generate JWT token for email verification"""
    expiration = datetime.utcnow() + timedelta(hours=VERIFICATION_TOKEN_EXPIRE_HOURS)
    payload = {
        "org_id": org_id,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# @app.post("/upload-logo")
# async def upload_logo(file: UploadFile = File(...)):
#     try:
#         if not file.content_type.startswith('image/'):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Only image files are allowed"
#             )
        
#         url = await upload_logo_to_supabase(file)
#         return {"url": url}
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error uploading logo: {str(e)}"
#         )


# Add this route to your FastAPI app
@router.post("/storage/upload-logo")
async def storage_upload_logo(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed (JPEG, PNG, etc.)"
            )

        # Verify file size (e.g., 5MB max)
        max_size = 5 * 1024 * 1024  # 5MB
        file_contents = await file.read()
        if len(file_contents) > max_size:
            raise HTTPException(
                status_code=400,
                detail="File too large. Max 5MB allowed."
            )

        # Reset file pointer after reading
        await file.seek(0)

        # Generate unique filename
        file_ext = file.filename.split('.')[-1]
        filename = f"{secrets.token_hex(8)}.{file_ext}"
        file_path = f"logos/{filename}"

        # Upload to Supabase
        res = supabase_client.storage.from_(LOGO_BUCKET).upload(
            file_path,
            file_contents,
            {"content-type": file.content_type}
        )

        if not res:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload to storage"
            )

        # Get public URL
        url = supabase_client.storage.from_(LOGO_BUCKET).get_public_url(file_path)
        return {"url": url, "filename": filename}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

# @router.get("/verify-organization/{token}")
# async def verify_organization(token: str):
#     try:
#         # TODO: Implement token verification logic
#         # This would decode the JWT token and update the organization status
        
#         # Mock implementation
#         decoded_data = {"org_id": "some-id-from-token"}  # Replace with actual JWT decode
        
#         # Update organization status
#         response = supabase_client.table('organizations') \
#             .update({"status": "APPROVED"}) \
#             .eq("id", decoded_data["org_id"]) \
#             .execute()
        
#         if not response.data:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Organization not found"
#             )
        
#         return {"message": "Organization verified successfully"}
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Verification failed: {str(e)}"
#         )

@router.get("/verify-organization/{token}")
async def verify_organization(token: str):
    try:
        # Decode token
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        org_id = decoded["org_id"]
        
        # Check if organization exists and is pending
        org = supabase_client.table('organizations') \
            .select('status') \
            .eq('id', org_id) \
            .execute()
            
        if not org.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
            
        current_status = org.data[0]['status']
        
        if current_status == "VERIFIED":
            return {
                "verified": False,
                "message": "Organization is already verified"
            }
            
        if current_status != "PENDING":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Organization cannot be verified"
            )
        
        # Update status to verified
        response = supabase_client.table('organizations') \
            .update({"status": "VERIFIED"}) \
            .eq("id", org_id) \
            .execute()
            
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to verify organization"
            )
            
        return {
            "verified": True,
            "message": "Organization verified successfully"
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification link"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )

# Protected endpoint example
@router.get("/organization", response_model=OrganizationResponse)
async def get_organization(api_key: str = Depends(api_key_header)):
    try:
        # Verify API key
        org = supabase_client.table('organizations') \
            .select("*") \
            .eq("api_key", api_key) \
            .eq("status", "APPROVED") \
            .execute()
        
        if not org.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key or organization not approved"
            )
        
        return org.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching organization: {str(e)}"
        )
    
@router.post("/send-verification-email")
async def send_verification_email(email_data: EmailRequest):
    try:
        # Verify configuration
        if not all([EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID, EMAILJS_PRIVATE_KEY]):
            raise HTTPException(500, detail="EmailJS configuration incomplete")

        token = generate_verification_token(email_data.org_id)
        verification_link = f"{FRONTEND_URL}/verify-org?token={token}"

        # Prepare payload
        payload = {
            "service_id": EMAILJS_SERVICE_ID,
            "template_id": EMAILJS_TEMPLATE_ID,
            "user_id": EMAILJS_USER_ID,
            "accessToken": EMAILJS_PRIVATE_KEY,  # This is critical
            "template_params": {
                "org_name": email_data.org_name,
                "verification_link": verification_link,
                "to_email": email_data.email,
                "reply_to": "no-reply@policyvault.nexus.com"
            }
        }

        # Send request
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

            return {"message": "Verification email sent successfully"}

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise HTTPException(500, detail="Failed to process email request")
        
# async def send_verification_email(request: Request, email_data: EmailRequest):
#     try:
#         # Verify all required EmailJS config is present
#         if not all([EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_USER_ID]):
#             raise HTTPException(
#                 status_code=500,
#                 detail="EmailJS configuration incomplete - check environment variables"
#             )

#         token = jwt.encode({
#             "org_id": email_data.org_id,
#             "exp": datetime.utcnow() + timedelta(hours=24)
#         }, JWT_SECRET, algorithm="HS256")

#         verification_link = f"{FRONTEND_URL}/verify-org?token={token}"

#         # Print debug info (remove in production)
#         print(f"Preparing to send email to: {email_data.email}")
#         print(f"Using template: {EMAILJS_TEMPLATE_ID}")

#         emailjs_data = {
#             "service_id": EMAILJS_SERVICE_ID,
#             "template_id": EMAILJS_TEMPLATE_ID,
#             "user_id": EMAILJS_USER_ID,
#             "template_params": {
#                 "org_name": email_data.org_name,
#                 "verification_link": verification_link,
#                 "to_email": email_data.email,
#                 "reply_to": "no-reply@policyvault.nexus.com"
#             }
#         }

#         # Make the request with timeout and better error handling
#         try:
#             async with httpx.AsyncClient() as client:
#                 response = await client.post(
#                     "https://api.emailjs.com/api/v1.0/email/send",
#                     headers={"Content-Type": "application/json"},
#                     json=emailjs_data,
#                     timeout=10.0
#                 )
#             # response.raise_for_status()  # Raises exception for 4XX/5XX status
#         except requests.exceptions.RequestException as e:
#             print(f"EmailJS API request failed: {str(e)}")
#             if hasattr(e, 'response') and e.response:
#                 print(f"Response content: {e.response.text}")
#             raise HTTPException(
#                 status_code=500,
#                 detail=f"Email service request failed: {str(e)}"
#             )

#         print(f"EmailJS response: {response.status_code} - {response.text}")
#         return {"message": "Verification email sent successfully"}

#     except Exception as e:
#         print(f"Unexpected error in send_verification_email: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to send verification email: {str(e)}"
#         )
    
# async def send_verification_email(request: Request, email_data: EmailRequest):
#     try:
#         # Verify credentials are loaded
#         if not all([os.getenv("EMAILJS_SERVICE_ID"), os.getenv("EMAILJS_TEMPLATE_ID"), os.getenv("EMAILJS_USER_ID")]):
#             raise HTTPException(500, detail="EmailJS configuration incomplete")

#         token = jwt.encode({
#             "org_id": email_data.org_id,
#             "exp": datetime.utcnow() + timedelta(hours=24)
#         }, JWT_SECRET, algorithm="HS256")

#         verification_link = f"{FRONTEND_URL}/verify-org?token={token}"

#         async with httpx.AsyncClient(timeout=30.0) as client:
#             response = await client.post(
#                 "https://api.emailjs.com/api/v1.0/email/send",
#                 json={
#                     "service_id": os.getenv("EMAILJS_SERVICE_ID"),
#                     "template_id": os.getenv("EMAILJS_TEMPLATE_ID"),
#                     "user_id": os.getenv("EMAILJS_USER_ID"),
#                     "template_params": {
#                         "to_email": email_data.email,
#                         "org_name": email_data.org_name,
#                         "verification_link": verification_link,
#                         "reply_to": "no-reply@policyvault.nexus.com"
#                     }
#                 },
#                 headers={"Content-Type": "application/json"}
#             )

#             # Add detailed error logging
#             print(f"EmailJS response: {response.status_code} - {response.text}")

#             if response.status_code != 200:
#                 error_detail = response.json().get("error", "Unknown EmailJS error")
#                 raise HTTPException(500, detail=f"EmailJS error: {error_detail}")

#         return {"message": "Verification email sent successfully"}
        
#     except Exception as e:
#         print(f"Email sending failed: {str(e)}")  # Add this line
#         raise HTTPException(500, detail=f"Failed to send verification email: {str(e)}")
    
# async def send_verification_email(request: Request, email_data: EmailRequest):
#     try:
#         if not RESEND_API_KEY:
#             raise HTTPException(500, detail="Email service not configured")
        
#         # Create verification token (expires in 24 hours)
#         token = jwt.encode({
#             "org_id": email_data.org_id,
#             "exp": datetime.utcnow() + timedelta(hours=24)
#         }, JWT_SECRET, algorithm="HS256")

#         verification_link = f"{FRONTEND_URL}/verify-org?token={token}"

#         # Send email using Resend
#         params = {
#             "from": "PolicyVault Nexus <no-reply@policyvault.nexus.com>", #PolicyVault Nexus <onboarding@resend.dev>
#             "to": [email_data.email],
#             "subject": "Verify Your PolicyVault Nexus Account",
#             "html": f"""
#             <div>
#                 <h1>PolicyVault Verification</h1>
#                 <p>Hello {email_data.org_name},</p>
#                 <p>Click below to verify:</p>
#                 <a href="{verification_link}">VERIFY NOW</a>
#                 <p>Link expires in 24 hours.</p>
#             </div>
#             """
#         }

#         email = resend.Emails.send(params)
#         print(f"Generated token: {token}")  # Check console
#         print(f"Verification link: {verification_link}")  # Verify URL structure

#         if not email.get('id'):
#             raise HTTPException(500, detail="Email API returned no ID")

#         return JSONResponse(
#             status_code=200,
#             content={"message": "Verification email sent successfully"}
#         )
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to send verification email: {str(e)}"
#         )

@router.get("/verify-org")
async def verify_organization(token: str):
    try:
        # Verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        org_id = payload.get("org_id")

        if not org_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid verification token"
            )

        # Check organization status
        org_data = supabase_client.table('organizations') \
            .select('status') \
            .eq('id', org_id) \
            .execute()

        if not org_data.data:
            raise HTTPException(
                status_code=404,
                detail="Organization not found"
            )

        current_status = org_data.data[0]['status']

        if current_status == "VERIFIED":
            return {
                "verified": False,
                "message": "Organization is already verified"
            }

        # Update organization status to VERIFIED
        response = supabase_client.table('organizations') \
            .update({"status": "VERIFIED"}) \
            .eq("id", org_id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to verify organization"
            )

        return {
            "verified": True,
            "message": "Organization verified successfully"
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=400,
            detail="Verification link has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )