# import os
# import json
# from typing import List, Dict, Optional
# from datetime import datetime, timedelta
# from supabase import create_client, Client
# import asyncio

# class PendingRequestsOperations:
#     def __init__(self):
#         self.supabase_url = os.getenv("SUPABASE_URL")
#         self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE")
        
#         if not self.supabase_url or not self.supabase_key:
#             raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE must be set")
        
#         self.supabase: Client = create_client(self.supabase_url, self.supabase_key)

#     def _format_date(self, date_str: str) -> str:
#         """
#         Format date to dd/mm/yyyy format
#         """
#         try:
#             if isinstance(date_str, str):
#                 date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
#             else:
#                 date_obj = date_str
#             return date_obj.strftime("%d/%m/%Y")
#         except:
#             return date_str

#     def _calculate_days_remaining(self, expiry_date: str) -> int:
#         """
#         Calculate days remaining until expiry
#         """
#         try:
#             if isinstance(expiry_date, str):
#                 expiry_obj = datetime.fromisoformat(expiry_date.replace('Z', '+00:00'))
#             else:
#                 expiry_obj = expiry_date
            
#             today = datetime.now()
#             diff = expiry_obj - today
#             return max(0, diff.days)
#         except:
#             return 0

#     def _process_data_fields(self, datafields: Dict) -> tuple:
#         """
#         Process datafields JSON to separate regular fields and 'other' fields
#         """
#         regular_fields = []
#         other_fields = []
        
#         if not datafields:
#             return regular_fields, other_fields
            
#         for key, value in datafields.items():
#             if key.lower() == 'other' or 'other' in key.lower():
#                 if isinstance(value, list):
#                     other_fields.extend(value)
#                 else:
#                     other_fields.append(str(value))
#             else:
#                 if isinstance(value, list):
#                     regular_fields.extend(value)
#                 elif isinstance(value, bool) and value:
#                     regular_fields.append(key)
#                 elif isinstance(value, str):
#                     regular_fields.append(value)
#                 else:
#                     regular_fields.append(key)
        
#         return regular_fields, other_fields

#     async def get_organization_name(self, fiu_id: str) -> str:
#         """
#         Get organization name from fius table using fiu_id
#         """
#         try:
#             # First try 'organizations' table as mentioned in requirements
#             result = self.supabase.table("organizations").select("name").eq("id", fiu_id).execute()
            
#             if result.data and len(result.data) > 0:
#                 return result.data[0]["name"]
            
#             # Fallback to 'fius' table if organizations doesn't exist
#             result = self.supabase.table("fius").select("name, organization_name").eq("id", fiu_id).execute()
            
#             if result.data and len(result.data) > 0:
#                 # Try organization_name first, then name
#                 return result.data[0].get("organization_name") or result.data[0].get("name", "Unknown Organization")
            
#             return "Unknown Organization"
            
#         except Exception as e:
#             print(f"Error fetching organization name: {e}")
#             return "Unknown Organization"

#     async def get_pending_requests(self, user_id: str) -> List[Dict]:
#         """
#         Get all pending consent requests for a specific user
#         """
#         try:
#             # Query requested_consents table with filters
#             result = self.supabase.table("requested_consents").select(
#                 "id, customer_id, fiu_id, purpose, datafields, created_at, "
#                 "status, status_admin, expiry_of_approval"
#             ).eq("customer_id", user_id).eq("status", "PENDING").eq("status_admin", "PENDING").execute()
            
#             if not result.data:
#                 return []
            
#             formatted_requests = []
            
#             for request in result.data:
#                 # Get organization name
#                 fiu_name = await self.get_organization_name(request["fiu_id"])
                
#                 # Process data fields
#                 regular_fields, other_fields = self._process_data_fields(request.get("datafields"))
                
#                 # Format dates
#                 requested_date = self._format_date(request["created_at"])
#                 expiry_date = self._format_date(request["expiry_of_approval"])
                
#                 # Calculate days remaining
#                 days_remaining = self._calculate_days_remaining(request["expiry_of_approval"])
                
#                 formatted_request = {
#                     "id": request["id"],
#                     "fiu_name": fiu_name,
#                     "status": request["status"].lower(),
#                     "data_fields": regular_fields,
#                     "other_data_fields": other_fields if other_fields else None,
#                     "purpose": request["purpose"],
#                     "requested_date": requested_date,
#                     "expiry_date": expiry_date,
#                     "days_remaining": days_remaining
#                 }
                
#                 formatted_requests.append(formatted_request)
            
#             return formatted_requests
            
#         except Exception as e:
#             print(f"Error in get_pending_requests: {e}")
#             raise e

#     async def update_consent_status(
#         self, 
#         consent_id: str, 
#         user_id: str, 
#         action: str, 
#         reason: Optional[str] = None
#     ) -> bool:
#         """
#         Update consent status to approved or rejected
#         """
#         try:
#             # First verify the consent belongs to the user and is pending
#             existing_consent = self.supabase.table("requested_consents").select(
#                 "id, customer_id, status, status_admin"
#             ).eq("id", consent_id).eq("customer_id", user_id).execute()
            
#             if not existing_consent.data:
#                 return False
            
#             consent_data = existing_consent.data[0]
            
#             # Check if consent is still pending
#             if consent_data["status"] != "PENDING" or consent_data["status_admin"] != "PENDING":
#                 return False
            
#             # Determine new status
#             new_status = "APPROVED" if action == "approve" else "REJECTED"
            
#             # Update only the status field
#             update_data = {
#                 "status": new_status
#             }
            
#             # If rejected and reason provided, you might want to store the reason
#             # This would require adding a reason field to your table schema
#             if action == "reject" and reason:
#                 # You can add reason field to consent_details JSON or create a separate reason field
#                 update_data["consent_details"] = {
#                     "rejection_reason": reason,
#                     "updated_at": datetime.utcnow().isoformat()
#                 }
            
#             # Perform the update
#             result = self.supabase.table("requested_consents").update(
#                 update_data
#             ).eq("id", consent_id).eq("customer_id", user_id).execute()
            
#             return len(result.data) > 0
            
#         except Exception as e:
#             print(f"Error in update_consent_status: {e}")
#             raise e

#     async def get_consent_by_id(self, consent_id: str, user_id: str) -> Optional[Dict]:
#         """
#         Get a specific consent request by ID for the user
#         """
#         try:
#             result = self.supabase.table("requested_consents").select(
#                 "*"
#             ).eq("id", consent_id).eq("customer_id", user_id).execute()
            
#             if result.data and len(result.data) > 0:
#                 return result.data[0]
            
#             return None
            
#         except Exception as e:
#             print(f"Error in get_consent_by_id: {e}")
#             return None
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from typing import List, Optional
import os
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
import supabase
from dotenv import load_dotenv
from typing import List, Optional, Union, Dict
from jose import jwt, JWTError

router = APIRouter()

load_dotenv()
# Supabase client
supabase_client = supabase.create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class DataField(BaseModel):
    name: str
    value: Optional[str] = None

class ConsentRequest(BaseModel):
    id: str
    fiu_name: str
    status: str
    data_fields: List[DataField]
    purpose: str
    requested_date: str
    expiry_date: str
    days_remaining: int

class UpdateConsentStatus(BaseModel):
    status: str
    rejection_reason: Optional[str] = None

def get_organization_name(fiu_id: str) -> str:
    try:
        response = supabase_client.table("organizations").select("org_name").eq("id", fiu_id).execute()
        if response.data:
            print(response.data[0]["org_name"])
            return response.data[0]["org_name"]
        return "Unknown Organization"
    except Exception as e:
        print(f"Error fetching organization name: {e}")
        return "Unknown Organization"


def format_data_fields(datafields: Union[Dict, List, None]) -> List[DataField]:
    fields = []
    
    if not datafields:
        return fields
    
    # Handle dictionary case
    if isinstance(datafields, dict):
        for key, value in datafields.items():
            if key.lower() == "other":
                fields.append(DataField(name="Other", value=str(value)))
            else:
                fields.append(DataField(name=str(key)))
    
    # Handle list case
    elif isinstance(datafields, list):
        for item in datafields:
            if isinstance(item, dict):
                for key, value in item.items():
                    if key.lower() == "other":
                        fields.append(DataField(name="Other", value=str(value)))
                    else:
                        fields.append(DataField(name=str(key)))
            else:
                fields.append(DataField(name=str(item)))
    
    return fields

def parse_date(date_value: Union[str, datetime, None]) -> Optional[datetime]:
    """Parse date from various formats"""
    if not date_value:
        return None
    
    if isinstance(date_value, datetime):
        return date_value
    
    try:
        # Try ISO format first
        if isinstance(date_value, str):
            return datetime.fromisoformat(date_value)
    except ValueError:
        try:
            # Try without timezone if ISO format fails
            return datetime.strptime(date_value.split('.')[0], "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            try:
                # Try just date format
                return datetime.strptime(date_value, "%Y-%m-%d")
            except ValueError:
                return None
            
@router.get("/pending", response_model=List[ConsentRequest])
async def get_pending_consents(current_user_id: str = Query(...)):
    try:
        # print("user:"+current_user_id)
        # Fetch pending consents for the current user
        # const token = localSto
        # print(jwt.decode(, "bf5170b9a428238cce092ac712f262bbbd2189538cb5682b3bafd151cb840d89", algorithms=["HS256"]))
        response = supabase_client.table("requested_consents")\
            .select("*")\
            .eq("customer_id", current_user_id)\
            .eq("status", "PENDING")\
            .eq("status_admin", "PENDING")\
            .execute()
        
        consents = []
        today = datetime.now().date()
        
        for consent in response.data:
            try:
                # Parse dates
                expiry_date = None
                if consent.get("expiry_of_approval"):
                    expiry_date = parse_date(consent["expiry_of_approval"])
                    if expiry_date:
                        expiry_date = expiry_date.date()
                
                days_remaining = (expiry_date - today).days if expiry_date else 0
                
                # Format dates
                requested_date = parse_date(consent.get("created_at"))
                requested_date_str = requested_date.strftime("%d/%m/%Y") if requested_date else ""
                expiry_date_str = expiry_date.strftime("%d/%m/%Y") if expiry_date else ""
                
                # Get organization name
                fiu_name = "Unknown Organization"
                if consent.get("organizations") and consent["organizations"].get("org_name"):
                    fiu_name = consent["organizations"]["org_name"]
                else:
                    fiu_name = get_organization_name(consent.get("fiu_id", ""))
                
                # Process data fields
                datafields = consent.get("datafields", [])
                
                consents.append(ConsentRequest(
                    id=str(consent.get("id", "")),
                    fiu_name=fiu_name,
                    status=consent.get("status", "PENDING"),
                    data_fields=format_data_fields(datafields),
                    purpose=consent.get("purpose", ""),
                    requested_date=requested_date_str,
                    expiry_date=expiry_date_str,
                    days_remaining=days_remaining
                ))
            
            except Exception as e:
                print(f"Error processing consent {consent.get('id')}: {str(e)}")
                continue
        
        return consents
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
# @router.get("/pending", response_model=List[ConsentRequest])
# async def get_pending_consents(current_user_id: str):
#     try:
#         # Fetch pending consents for the current user
#         response = supabase_client.table("requested_consents")\
#             .select("*")\
#             .eq("customer_id", current_user_id)\
#             .eq("status", "PENDING")\
#             .eq("status_admin", "PENDING")\
#             .execute()
        
#         consents = []
#         today = datetime.now().date()
        
#         for consent in response.data:
#             # Handle datetime parsing more robustly
#             expiry_date = None
#             if consent.get("expiry_of_approval"):
#                 try:
#                     # Try ISO format first
#                     if isinstance(consent["expiry_of_approval"], str):
#                         expiry_date = datetime.fromisoformat(consent["expiry_of_approval"]).date()
#                     else:
#                         expiry_date = consent["expiry_of_approval"].date()
#                 except (ValueError, AttributeError):
#                     # Fallback to other formats if needed
#                     pass
            
#             days_remaining = (expiry_date - today).days if expiry_date else 0
            
#             # Format created_at date
#             requested_date_str = ""
#             if consent.get("created_at"):
#                 if isinstance(consent["created_at"], str):
#                     try:
#                         created_at = datetime.fromisoformat(consent["created_at"])
#                         requested_date_str = created_at.strftime("%d/%m/%Y")
#                     except ValueError:
#                         pass
#                 else:
#                     requested_date_str = consent["created_at"].strftime("%d/%m/%Y")
            
#             # Format expiry date
#             expiry_date_str = ""
#             if expiry_date:
#                 expiry_date_str = expiry_date.strftime("%d/%m/%Y")
            
#             consents.append(ConsentRequest(
#                 id=str(consent["id"]),
#                 fiu_name=get_organization_name(consent["fiu_id"]),
#                 status=consent["status"],
#                 data_fields=format_data_fields(consent["datafields"]),
#                 purpose=consent["purpose"],
#                 requested_date=requested_date_str,
#                 expiry_date=expiry_date_str,
#                 days_remaining=days_remaining
#             ))
        
#         return consents
    
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.put("/{consent_id}/status")
async def update_consent_status(consent_id: str, update_data: UpdateConsentStatus):
    try:
        # Validate status against allowed values
        allowed_statuses = ["APPROVED", "REJECTED", "REVOKED", "EXPIRED"]
        if update_data.status not in allowed_statuses:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid status. Allowed values: {', '.join(allowed_statuses)}"
            )
        
        # Update the status field
        update_data_dict = {"status": update_data.status}
        if update_data.rejection_reason:
            update_data_dict["rejection_reason"] = update_data.rejection_reason
            
        update_response = supabase_client.table("requested_consents")\
            .update(update_data_dict)\
            .eq("id", consent_id)\
            .execute()
        
        if not update_response.data:
            raise HTTPException(status_code=404, detail="Consent not found")
        
        return {"message": "Consent status updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))