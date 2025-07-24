# consent_requests.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import jwt
from fastapi import Request, HTTPException
import hashlib
import json
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from typing import Dict
from audit_service import audit_service


load_dotenv()

router = APIRouter()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")
jwtkey = os.getenv("JWT_SECRET_KEY")
supabase_client: Client = create_client(url, key)


class Consent(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    c_id: str
    user_identifier: str
    customer_id: str
    purpose: str
    datafields: List[str]
    status: str
    consent_signature: str
    consent_details: dict
    created_at: datetime
    expiry_date: Optional[datetime]
    fiu_id: str

class ConsentRequest(BaseModel):
    user_identifier: str
    purpose: str
    datafields: List[str]
    consent_signature: str
    consent_details: dict

class SimpleConsentResponse(BaseModel):
    c_id: str
    user_identifier: str
    purpose: str
    datafields: List[str]
    status: str
    status_admin: str
    created_at: datetime
    fiu_id: str
    #expiry_date: Optional[datetime]

class ConsentResponse(BaseModel):
    id: str
    c_id: str
    user_identifier: str
    fiu_id: str
    customer_id: str
    purpose: str
    datafields: List[str]
    status: str
    status_admin: str
    consent_signature: str
    consent_details: dict
    created_at: datetime

def get_current_organization_id(request: Request) -> str:
    
    token = request.headers.get("Authorization")
    
    # print(token) giving value -> None
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, jwtkey, algorithms=["HS256"])
        return payload.get("org_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

from fastapi import Header, HTTPException, status
from typing import Optional

def get_current_organization_id1(authorization: Optional[str] = Header(None)) -> str:
    # Debugging
    print(f"Received Authorization header: {authorization}")
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        # Split "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
            
        payload = jwt.decode(token, jwtkey, algorithms=["HS256"])
        org_id = payload.get("org_id")
        
        if not org_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Organization ID not found in token"
            )
            
        return org_id
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

@router.get("/consents")
async def get_consents(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    try:
        fiu_id = get_current_organization_id1(authorization)
        
        if fiu_id:
        # Fetch consents from Supabase
            response = supabase_client.table('requested_consents') \
                .select('c_id, user_identifier, purpose, status, status_admin, created_at, datafields') \
                .eq('fiu_id', fiu_id) \
                .execute()
            
            if not response.data:
                # Audit the failure
                await audit_service.log_action(
                    consent_id="N/A",
                    action="FETCH",
                    status="ERROR",
                    c_id="CNS-20xx-xxxxx - All",
                    fiu_id=fiu_id,
                    ip_address=request.client.host,
                    detail="Failed to fetch all Consents"
                )
                return []
        
        # Audit the success
            await audit_service.log_action(
                consent_id="N/A",
                action="FETCH",
                status="SUCCESSFUL",
                fiu_id=fiu_id,
                c_id="CNS-20xx-xxxxx - All",
                ip_address=request.client.host,
                detail="Consents Fetched Successfully"
            )
            
            return response.data
        
    except Exception as e:
        # Now fiu_id is guaranteed to be defined (either None or the actual value)
        await audit_service.log_action(
            consent_id="N/A",
            action="FETCH",
            status="ERROR",
            fiu_id=None,  # This will be None if get_current_organization_id failed
            c_id='CNS-20xx-xxxxx',
            ip_address=request.client.host,
            detail=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Failed to fetch consents: {str(e)}")

        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle other exceptions
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/consents-admin", response_model=List[SimpleConsentResponse])
async def get_consents_admin(request: Request):
    try:
        # Fetch all consents with organization information
        response = supabase_client.table('requested_consents') \
            .select('c_id, user_identifier, purpose, status, status_admin, created_at, datafields, fiu_id') \
            .execute()
        
        if not response.data:
            await audit_service.log_action(
                consent_id="N/A",
                action="FETCH",
                status="ERROR",
                c_id="CNS-20xx-xxxxx - All",
                ip_address=request.client.host,
                detail="Failed to fetch all Consents",
                fiu_id=None
            )
            return []

        await audit_service.log_action(
            consent_id="N/A",
            action="FETCH",
            status="SUCCESSFUL",
            c_id="CNS-20xx-xxxxx - All",
            ip_address=request.client.host,
            detail="Consents Fetched Successfully",
            fiu_id=None
        )
        
        return response.data
        
    except Exception as e:
        await audit_service.log_action(
            consent_id="N/A",
            action="FETCH",
            status="ERROR",
            c_id='CNS-20xx-xxxxx',
            ip_address=request.client.host,
            detail=str(e),
            fiu_id=None
        )
        raise HTTPException(status_code=500, detail=f"Failed to fetch consents: {str(e)}")

@router.get("/organizations")
async def get_all_organizations(request: Request):
    try:
        # Fetch all organizations with only necessary fields
        response = supabase_client.table('organizations') \
            .select('id, org_name') \
            .execute()
            
        if not response.data:
            return []
            
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch organizations: {str(e)}")

@router.get("/consents", response_model=List[SimpleConsentResponse])
async def get_consents(request: Request):
    # fiu_id = get_current_organization_id(request)
    # print(fiu_id)
    try:
        fiu_id = get_current_organization_id(request)
        print(fiu_id)
        # Handle organization ID extraction separately
        try:
            fiu_id = get_current_organization_id(request)
            print(fiu_id)     
        except Exception as org_error:
            await audit_service.log_action(
                consent_id="N/A",
                action="FETCH",
                status="ERROR",
                fiu_id=None,
                c_id='CNS-20xx-xxxxx',
                ip_address=request.client.host,
                detail=f"Failed to get organization ID: {str(org_error)}"
            )
            raise HTTPException(status_code=401, detail="Invalid organization credentials")
        
        if fiu_id:
        # Fetch consents from Supabase
            response = supabase_client.table('requested_consents') \
                .select('c_id, user_identifier, purpose, status, status_admin, created_at, datafields') \
                .eq('fiu_id', fiu_id) \
                .execute()
            
            if not response.data:
                # Audit the failure
                await audit_service.log_action(
                    consent_id="N/A",
                    action="FETCH",
                    status="ERROR",
                    c_id="CNS-20xx-xxxxx - All",
                    fiu_id=fiu_id,
                    ip_address=request.client.host,
                    detail="Failed to fetch all Consents"
                )
                return []
        
        # Audit the success
            await audit_service.log_action(
                consent_id="N/A",
                action="FETCH",
                status="SUCCESSFUL",
                fiu_id=fiu_id,
                c_id="CNS-20xx-xxxxx - All",
                ip_address=request.client.host,
                detail="Consents Fetched Successfully"
            )
            
            return response.data
        
    except Exception as e:
        # Now fiu_id is guaranteed to be defined (either None or the actual value)
        await audit_service.log_action(
            consent_id="N/A",
            action="FETCH",
            status="ERROR",
            fiu_id=None,  # This will be None if get_current_organization_id failed
            c_id='CNS-20xx-xxxxx',
            ip_address=request.client.host,
            detail=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Failed to fetch consents: {str(e)}")

# @router.get("/consents", response_model=List[SimpleConsentResponse])
# async def get_consents(request: Request):
#     try:
#         fiu_id = get_current_organization_id(request)
        
#         # Fetch consents from Supabase
#         response = supabase_client.table('requested_consents') \
#             .select('c_id, user_identifier, purpose, status, status_admin, created_at, datafields') \
#             .eq('fiu_id', fiu_id) \
#             .execute()
        
#         if not response.data:
#             # Audit the failure
#             await audit_service.log_action(
#                 consent_id="N/A",
#                 action="FETCH",
#                 status="ERROR",
#                 c_id="CNS-20xx-xxxxx - All",
#                 fiu_id=fiu_id,
#                 ip_address=request.client.host,
#                 detail="Failed to fetch all Consents"
#             )
#             return []
#             # raise HTTPException(status_code=500, detail="Failed to create consent request")

#         # The new Supabase client returns a different response structure
#         # if not response.data:
            
        
#         # Audit the success
#         await audit_service.log_action(
#             consent_id="N/A",
#             action="FETCH",
#             status="SUCCESSFUL",
#             fiu_id=fiu_id,
#             c_id="CNS-20xx-xxxxx - All",
#             ip_address=request.client.host,
#             detail="Consents Fetched Successfully"
#         )
            
#         return response.data
        
#     except Exception as e:
#         await audit_service.log_action(
#             consent_id="N/A",
#             action="FETCH",
#             status="ERROR",
#             fiu_id=fiu_id,
#             c_id = 'CNS-20xx-xxxxx',
#             ip_address=request.client.host,
#             detail=str(e)
#         )
#         raise HTTPException(status_code=500, detail=f"Failed to fetch consents: {str(e)}")


@router.post("/request-consent", response_model=ConsentResponse)
async def request_consent(consent: ConsentRequest, request: Request):
    # Get the latest consent ID to determine next serial number
    latest_consent = supabase_client.table('requested_consents') \
        .select('c_id') \
        .order('created_at', desc=True) \
        .limit(1) \
        .execute()
    
    current_year = datetime.now().year
    serial_number = 1  # Default if no consents exist
    
    if latest_consent.data:
        # Extract serial number from latest c_id if it matches current year
        latest_c_id = latest_consent.data[0]['c_id']
        if latest_c_id and latest_c_id.startswith(f"CNS-{current_year}-"):
            try:
                serial_number = int(latest_c_id.split('-')[2]) + 1
            except (IndexError, ValueError):
                serial_number = 1
    
    c_id = f"CNS-{current_year}-{serial_number:04d}"  # Format: CNS-2023-0001
    
    
    # Fetch customer_id from accounts table
    account_response = supabase_client.table('accounts') \
        .select('customer_id') \
        .eq('account_number', consent.user_identifier) \
        .execute()

    if not account_response.data:
        raise HTTPException(status_code=404, detail="Account you are searching for is not found")

    customer_id = account_response.data[0]['customer_id']

    # Get current organization's ID (assuming it's stored in session or context)
    fiu_id = get_current_organization_id(request)  # Replace with actual logic to get current organization's ID

    # Create SHA-256 hash of consent details
    consent_details_str = json.dumps(consent.consent_details, sort_keys=True)
    consent_signature = hashlib.sha256(consent_details_str.encode()).hexdigest()

    # Insert into requested_consents table
    consent_data = {
        "user_identifier": consent.user_identifier,
        "fiu_id": fiu_id,
        "customer_id": customer_id,
        "purpose": consent.purpose,
        "datafields": consent.datafields,
        "status": "PENDING",
        "status_admin": "PENDING",
        "c_id":c_id,
        "consent_signature": consent_signature,
        "consent_details": consent.consent_details,
        "created_at": datetime.utcnow().isoformat()
    }

    response = supabase_client.table('requested_consents') \
        .insert(consent_data) \
        .execute()

    if not response.data:
        await audit_service.log_action(
            consent_id="N/A",
            action="FETCH",
            fiu_id=fiu_id,
            status="ERROR",
            c_id="CNS-20xx-xxxxx",
            ip_address=request.client.host,
            detail="Failed to create a Consent"
        )
        raise HTTPException(status_code=500, detail="Failed to create consent request")

    await audit_service.log_action(
        consent_id=response.data[0].get('id'),
        action="CREATE",
        status="SUCCESSFUL",
        fiu_id=fiu_id,
        c_id=response.data[0].get('c_id'),
        ip_address=request.client.host,
        detail="Consent Created Successfully"
    )
    return response.data[0]

# @router.get("/consents", response_model=List[Consent])
# async def get_consents(request: Request):
#     try:
#         org_id = get_current_organization_id(request)
        
#         # Fetch consents for the current organization
#         response = supabase_client.table('requested_consents') \
#             .select('*') \
#             .eq('fiu_id', org_id) \
#             .order('created_at', desc=True) \
#             .execute()
            
#         if not response.data:
#             return []
            
#         return response.data
        
#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats", response_model=Dict[str, int])
async def get_consent_stats(request: Request):
    try:
        fiu_id = get_current_organization_id(request)
        
        # Fetch all consents for the organization
        response = supabase_client.table('requested_consents') \
            .select('status, status_admin') \
            .eq('fiu_id', fiu_id) \
            .execute()
        
        counts = {
            'totalRequests': 0,
            'activeConsents': 0,
            'revokedConsents': 0,
            'expiredConsents': 0,
            'pendingConsents': 0,
            'rejectedConsents': 0
        }
        
        for consent in response.data:
            counts['totalRequests'] += 1
            status = get_ui_status(consent['status'], consent['status_admin'])
            
            if status == 'ACTIVE':
                counts['activeConsents'] += 1
            elif status == 'REVOKED':
                counts['revokedConsents'] += 1
            elif status == 'EXPIRED':
                counts['expiredConsents'] += 1
            elif status == 'PENDING':
                counts['pendingConsents'] += 1
            elif status == 'REJECTED':
                counts['rejectedConsents'] += 1
                
        return counts
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch consent stats: {str(e)}")

def get_ui_status(status: str, status_admin: str) -> str:
    if status_admin == 'EXPIRED' or status == 'EXPIRED':
        return 'EXPIRED'
    if status_admin == 'REVOKED':
        return 'REVOKED'
    if status == 'APPROVED' and status_admin == 'APPROVED':
        return 'ACTIVE'
    if status == 'APPROVED' and status_admin == 'PENDING':
        return 'PENDING'
    if status == 'PENDING' and status_admin == 'PENDING':
        return 'PENDING'
    if status == 'APPROVED' and status_admin == 'REJECTED':
        return 'REJECTED'
    if status == 'REJECTED' and status_admin == 'PENDING':
        return 'REJECTED'
    if status == 'PENDING' and status_admin == 'REJECTED':
        return 'REJECTED'
    return 'PENDING'
