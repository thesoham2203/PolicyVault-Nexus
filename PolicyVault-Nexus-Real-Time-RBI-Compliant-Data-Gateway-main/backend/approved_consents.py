# from fastapi import FastAPI, Depends, HTTPException, Query, APIRouter
# from supabase import create_client, Client
# from typing import List, Optional
# from pydantic import BaseModel
# from datetime import date
# import os
# from dotenv import load_dotenv
# import supabase

# router = APIRouter()

# # Supabase client setup
# load_dotenv()
# # Supabase client
# supabase_client = supabase.create_client(
#     os.getenv("SUPABASE_URL"),
#     os.getenv("SUPABASE_SERVICE_ROLE")
# )

# class Consent(BaseModel):
#     id: str
#     fiu_id: str
#     fiu_name: str
#     logo_url: Optional[str]
#     purpose: str
#     datafields: dict
#     status: str
#     status_admin: str
#     expiry_date: Optional[date]
#     requested_date: str
#     actual_expiry: Optional[date]

# @router.get("/api/active-consents/{customer_id}", response_model=List[Consent])
# async def get_active_consents(customer_id: str):
#     try:
#         # Get consents where status and status_admin are both 'APPROVED'
#         consents_response = supabase_client.table('requested_consents').select(
#             """
#             id, 
#             fiu_id, 
#             purpose, 
#             datafields, 
#             status, 
#             status_admin, 
#             created_at, 
#             actual_expiry,
#             organizations: fiu_id (org_name, logo_url)
#             """
#         ).eq('customer_id', customer_id).execute()

#         if consents_response.data is None:
#             return []

#         # Filter consents where both status and status_admin are 'APPROVED'
#         approved_consents = [
#             consent for consent in consents_response.data 
#             if consent.get('status') == 'APPROVED' 
#             and consent.get('status_admin') == 'APPROVED'
#         ]

#         # Format the response
#         formatted_consents = []
#         for consent in approved_consents:
#             org_data = consent.get('organizations', {}) or {}
#             formatted_consents.append({
#                 "id": consent.get('id'),
#                 "fiu_id": consent.get('fiu_id'),
#                 "fiu_name": org_data.get('org_name', 'Unknown Organization'),
#                 "logo_url": org_data.get('logo_url'),
#                 "purpose": consent.get('purpose', ''),
#                 "datafields": consent.get('datafields', {}),
#                 "status": consent.get('status', ''),
#                 "status_admin": consent.get('status_admin', ''),
#                 "expiry_date": consent.get('actual_expiry'),
#                 "requested_date": consent.get('created_at'),
#                 "actual_expiry": consent.get('actual_expiry')
#             })

#         return formatted_consents

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/api/revoke-consent/{consent_id}")
# async def revoke_consent(consent_id: str):
#     try:
#         # Update the consent status to 'REVOKED'
#         response = supabase_client.table('requested_consents').update({
#             'status': 'REVOKED',
#             'status_admin': 'REVOKED'
#         }).eq('id', consent_id).execute()

#         if response.data:
#             return {"success": True, "message": "Consent revoked successfully"}
#         else:
#             return {"success": False, "message": "Failed to revoke consent"}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI, Depends, HTTPException, Query, APIRouter
from supabase import create_client, Client
from typing import List, Optional, Union, Dict
from pydantic import BaseModel
from datetime import date
import os
from dotenv import load_dotenv
import supabase

router = APIRouter()

# Supabase client setup
load_dotenv()
# Supabase client
supabase_client = supabase.create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

class Consent(BaseModel):
    id: str
    fiu_id: str
    fiu_name: str
    logo_url: Optional[str]
    purpose: str
    datafields: Union[Dict[str, bool], List[str]]  # Accepts both dict and list
    status: str
    status_admin: str
    expiry_date: Optional[date] = None
    requested_date: str
    rejection_reason: Optional[str] = None
    actual_expiry: Optional[date] = None


@router.get("/api/active-consents/{customer_id}", response_model=List[Consent])
async def get_active_consents(customer_id: str):
    try:
        # First, get all approved consents for the customer
        consents_response = supabase_client.table('requested_consents').select(
            "id, fiu_id, purpose, datafields, status, status_admin, created_at, actual_expiry"
        ).eq('customer_id', customer_id).execute()

        if not consents_response.data:
            return []

        # Filter consents where both status and status_admin are 'APPROVED'
        approved_consents = [
            consent for consent in consents_response.data 
            if consent.get('status') == 'APPROVED' 
            and consent.get('status_admin') == 'APPROVED'
        ]

        # Get all unique FIU IDs from the approved consents
        fiu_ids = list({consent['fiu_id'] for consent in approved_consents})

        # Get organization details for these FIUs
        orgs_response = supabase_client.table('organizations').select(
            "id, org_name, logo_url"
        ).in_('id', fiu_ids).execute()

        # Create a mapping of fiu_id to organization details
        orgs_map = {org['id']: org for org in orgs_response.data}

        # Format the response
        formatted_consents = []
        for consent in approved_consents:
            org_data = orgs_map.get(consent['fiu_id'], {})
            
            # Convert datafields to dictionary if it's a list
            datafields = consent.get('datafields', {})
            if isinstance(datafields, list):
                datafields = {field: True for field in datafields}
            
            formatted_consents.append({
                "id": consent.get('id'),
                "fiu_id": consent.get('fiu_id'),
                "fiu_name": org_data.get('org_name', 'Unknown Organization'),
                "logo_url": org_data.get('logo_url'),
                "purpose": consent.get('purpose', ''),
                "datafields": datafields,
                "status": consent.get('status', ''),
                "status_admin": consent.get('status_admin', ''),
                "expiry_date": consent.get('actual_expiry'),
                "requested_date": consent.get('created_at'),
                "actual_expiry": consent.get('actual_expiry')
            })

        return formatted_consents

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/api/revoke-consent/{consent_id}")
# async def revoke_consent(consent_id: str):
#     try:
#         # Update the consent status to 'REVOKED'
#         response = supabase_client.table('requested_consents').update({
#             'status': 'REVOKED',
#             'status_admin': 'REVOKED'
#         }).eq('id', consent_id).execute()

#         if response.data:
#             return {"success": True, "message": "Consent revoked successfully"}
#         else:
#             return {"success": False, "message": "Failed to revoke consent"}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/rejected-consents/{customer_id}", response_model=List[Consent])
async def get_rejected_consents(customer_id: str):
    try:
        # Get all consents for the customer
        consents_response = supabase_client.table('requested_consents').select(
            "id, fiu_id, purpose, datafields, status, status_admin, created_at, actual_expiry, rejection_reason"
        ).eq('customer_id', customer_id).execute()

        if not consents_response.data:
            return []

        # Filter consents where status is REJECTED or status_admin is REJECTED
        rejected_consents = [
            consent for consent in consents_response.data 
            if consent.get('status') == 'REJECTED' 
            or consent.get('status_admin') == 'REJECTED'
        ]

        # Get all unique FIU IDs from the rejected consents
        fiu_ids = list({consent['fiu_id'] for consent in rejected_consents})

        # Get organization details for these FIUs
        orgs_response = supabase_client.table('organizations').select(
            "id, org_name, logo_url"
        ).in_('id', fiu_ids).execute()

        # Create a mapping of fiu_id to organization details
        orgs_map = {org['id']: org for org in orgs_response.data}

        # Format the response
        formatted_consents = []
        for consent in rejected_consents:
            org_data = orgs_map.get(consent['fiu_id'], {})
            
            # Convert datafields to dictionary if it's a list
            datafields = consent.get('datafields', {})
            if isinstance(datafields, list):
                datafields = {field: True for field in datafields}
            
            formatted_consents.append({
                "id": consent.get('id'),
                "fiu_id": consent.get('fiu_id'),
                "fiu_name": org_data.get('org_name', 'Unknown Organization'),
                "logo_url": org_data.get('logo_url'),
                "purpose": consent.get('purpose', ''),
                "datafields": datafields,
                "status": consent.get('status', ''),
                "status_admin": consent.get('status_admin', ''),
                "expiry_date": consent.get('actual_expiry'),  # Map actual_expiry to expiry_date
                "requested_date": consent.get('created_at'),
                "actual_expiry": consent.get('actual_expiry'),
                "rejection_reason": consent.get('rejection_reason')
            })

        return formatted_consents

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))