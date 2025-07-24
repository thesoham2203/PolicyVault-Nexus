# from fastapi import FastAPI, HTTPException, Depends, status, APIRouter
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from pydantic import BaseModel
# from typing import List, Optional
# import os
# import jwt
# from datetime import datetime
# import uvicorn
# from pending_requests_operations import PendingRequestsOperations

# router = APIRouter()
# # Security
# security = HTTPBearer()
# # Pydantic models
# class ConsentUpdateRequest(BaseModel):
#     consent_id: str
#     action: str  # "approve" or "reject"
#     reason: Optional[str] = None

# class ConsentResponse(BaseModel):
#     id: str
#     fiu_name: str
#     status: str
#     data_fields: List[str]
#     other_data_fields: Optional[List[str]] = None
#     purpose: str
#     requested_date: str
#     expiry_date: str
#     days_remaining: int

# # Initialize operations
# pending_ops = PendingRequestsOperations()

# # async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
# #     """
# #     Extract user ID from JWT token
# #     """
# #     try:
# #         token = credentials.credentials
# #         print("aaa: "+token)
# #         payload = jwt.decode(
# #             token, 
# #             os.getenv("JWT_SECRET_KEY"), 
# #             algorithms="HS256"
# #         )
# #         user_id = payload.get("sub")
# #         if user_id is None:
# #             raise HTTPException(
# #                 status_code=status.HTTP_401_UNAUTHORIZED,
# #                 detail="Invalid authentication credentials",
# #                 headers={"WWW-Authenticate": "Bearer"},
# #             )
# #         return user_id
# #     except jwt.PyJWTError:
# #         raise HTTPException(
# #             status_code=status.HTTP_401_UNAUTHORIZED,
# #             detail="Invalid authentication credentials",
# #             headers={"WWW-Authenticate": "Bearer"},
# #         )

# async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
#     try:

#         token = credentials.credentials
#         print(jwt.decode(token, "bf5170b9a428238cce092ac712f262bbbd2189538cb5682b3bafd151cb840d89", algorithms=["HS256"]))
#         print("access: "+token)
#         payload = jwt.decode(
#             token, 
#             os.getenv("JWT_SECRET_KEY"), 
#             algorithms=["HS256"]
#         )
#         # Add debug logging
#         print("Decoded token payload:", payload)
#         user_id = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid authentication credentials",
#                 headers={"WWW-Authenticate": "Bearer"},
#             )
#         return user_id
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token has expired",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     except jwt.PyJWTError as e:
#         print("JWT Error:", str(e))
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid authentication credentials",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

# @router.get("/api/pending-requests", response_model=List[ConsentResponse])
# async def get_pending_requests(current_user: str = Depends(get_current_user)):
#     """
#     Get all pending consent requests for the current user
#     """
#     try:
#         requests = await pending_ops.get_pending_requests(current_user)
#         return requests
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error fetching pending requests: {str(e)}"
#         )

# @router.post("/api/consent/update")
# async def update_consent_status(
#     request: ConsentUpdateRequest,
#     current_user: str = Depends(get_current_user)
# ):
#     """
#     Update consent status (approve or reject)
#     """
#     try:
#         if request.action not in ["approve", "reject"]:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Action must be either 'approve' or 'reject'"
#             )
        
#         result = await pending_ops.update_consent_status(
#             consent_id=request.consent_id,
#             user_id=current_user,
#             action=request.action,
#             reason=request.reason
#         )
        
#         if not result:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Consent request not found or not authorized"
#             )
        
#         return {"message": f"Consent request {request.action}d successfully"}
    
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error updating consent status: {str(e)}"
#         )

# @router.get("/health")
# async def health_check():
#     """
#     Health check endpoint
#     """
#     return {"status": "healthy", "timestamp": datetime.utcnow()}

# from fastapi import APIRouter, Depends, HTTPException, Query
# from datetime import datetime
# from typing import List, Optional
# import supabase
# import os
# from dotenv import load_dotenv
# from pydantic import BaseModel

# router = APIRouter()

# load_dotenv()
# supabase_client = supabase.create_client(
#     os.getenv("SUPABASE_URL"),
#     os.getenv("SUPABASE_SERVICE_ROLE")
# )

# class ConsentRequest(BaseModel):
#     id: str
#     fiu_name: str
#     status: str
#     data_fields: List[str]
#     purpose: str
#     requested_date: str
#     expiry_date: str
#     days_remaining: int

# class UpdateConsentStatus(BaseModel):
#     status: str
#     rejection_reason: Optional[str] = None

# def get_organization_name(fiu_id: str) -> str:
#     try:
#         response = supabase_client.table("organizations").select("name").eq("id", fiu_id).execute()
#         return response.data[0]["name"] if response.data else "Unknown Organization"
#     except Exception as e:
#         print(f"Error fetching organization: {e}")
#         return "Unknown Organization"

# def format_data_fields(datafields: dict) -> List[str]:
#     fields = []
#     if datafields:
#         for key, value in datafields.items():
#             if key.lower() == "other":
#                 fields.append(f"Other: {value}")
#             else:
#                 fields.append(key)
#     return fields

# @router.get("/pending", response_model=List[ConsentRequest])
# async def get_pending_consents(current_user_id: str = Query(..., description="Current user ID")):
#     try:
#         response = supabase_client.table("requested_consents").select("*").eq(
#             "customer_id", current_user_id
#         ).eq("status", "PENDING").eq("status_admin", "PENDING").execute()
        
#         consents = []
#         today = datetime.now().date()
        
#         for consent in response.data:
#             expiry_date = None
#             if consent.get("expiry_of_approval"):
#                 try:
#                     expiry_date = datetime.strptime(consent["expiry_of_approval"], "%Y-%m-%d").date()
#                 except:
#                     expiry_date = None
            
#             days_remaining = (expiry_date - today).days if expiry_date else 0
            
#             consents.append(ConsentRequest(
#                 id=str(consent["id"]),
#                 fiu_name=get_organization_name(consent["fiu_id"]),
#                 status=consent["status"],
#                 data_fields=format_data_fields(consent.get("datafields", {})),
#                 purpose=consent["purpose"],
#                 requested_date=consent["created_at"].strftime("%d/%m/%Y") if consent.get("created_at") else "",
#                 expiry_date=expiry_date.strftime("%d/%m/%Y") if expiry_date else "",
#                 days_remaining=days_remaining
#             ))
        
#         return consents
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.put("/{consent_id}/status")
# async def update_consent_status(consent_id: str, update_data: UpdateConsentStatus):
#     try:
#         update_response = supabase_client.table("requested_consents").update({
#             "status": update_data.status
#         }).eq("id", consent_id).execute()
        
#         if not update_response.data:
#             raise HTTPException(status_code=404, detail="Consent not found")
        
#         return {"message": "Consent status updated successfully"}
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from typing import List
import os
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import supabase
from dotenv import load_dotenv

router = APIRouter()

load_dotenv()
supabase_client = supabase.create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class ConsentRequest(BaseModel):
    id: str
    fiu_name: str
    status: str
    data_fields: List[str]
    purpose: str
    requested_date: str
    expiry_date: str
    days_remaining: int

def get_organization_name(fiu_id: str) -> str:
    try:
        response = supabase_client.table("organizations").select("name").eq("id", fiu_id).execute()
        if response.data:
            return response.data[0]["name"]
        return "Unknown Organization"
    except Exception as e:
        print(f"Error fetching organization name: {e}")
        return "Unknown Organization"

def format_data_fields(datafields: dict) -> List[str]:
    fields = []
    if datafields:
        for key, value in datafields.items():
            if key.lower() == "other":
                fields.append(f"Other: {value}")
            else:
                fields.append(key)
    return fields

@router.get("/pending", response_model=List[ConsentRequest])
async def get_pending_consents(current_user_id: str = Query(...)):
    try:
        response = supabase_client.table("requested_consents").select("*").eq("customer_id", current_user_id).eq("status", "PENDING").eq("status_admin", "PENDING").execute()
        consents = []
        today = datetime.now().date()

        for consent in response.data:
            expiry_raw = consent.get("expiry_of_approval")
            created_raw = consent.get("created_at")

            expiry_date = datetime.strptime(expiry_raw, "%Y-%m-%dT%H:%M:%S").date() if expiry_raw else None
            created_date = datetime.strptime(created_raw, "%Y-%m-%dT%H:%M:%S").date() if created_raw else None

            days_remaining = (expiry_date - today).days if expiry_date else 0

            consents.append(ConsentRequest(
                id=str(consent["id"]),
                fiu_name=get_organization_name(consent["fiu_id"]),
                status=consent["status"].lower(),
                data_fields=format_data_fields(consent.get("datafields", {})),
                purpose=consent["purpose"],
                requested_date=created_date.strftime("%d/%m/%Y") if created_date else "",
                expiry_date=expiry_date.strftime("%d/%m/%Y") if expiry_date else "",
                days_remaining=days_remaining
            ))

        return consents

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
