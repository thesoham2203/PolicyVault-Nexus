from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase client setup
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")
supabase = create_client(url, key)

class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    action: str
    consent_id: str
    c_id: Optional[str]
    status: str
    ip_address: Optional[str]
    details: str  # Changed from 'detail' to match your frontend

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

@router.get("/audit-logs/", response_model=List[AuditLogResponse])
async def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action type (FETCH, CREATE)"),
    status: Optional[str] = Query(None, description="Filter by status (SUCCESSFUL, ERROR)"),
    date: Optional[date] = Query(None, description="Filter by date"),  # Changed from start_date/end_date
    limit: int = Query(100, description="Limit number of results"),
    offset: int = Query(0, description="Offset for pagination")
):
    try:
        query = supabase.table("audit_logs") \
            .select("*") \
            .order("timestamp", desc=True) \
            .limit(limit) \
            .range(offset, offset + limit - 1)

        if action:
            query = query.eq("action", action)
        if status:
            query = query.eq("status", status)
        if date:
            start_date = datetime.combine(date, datetime.min.time())
            end_date = datetime.combine(date, datetime.max.time())
            query = query.gte("timestamp", start_date.isoformat()) \
                         .lte("timestamp", end_date.isoformat())

        response = query.execute()

        if not response.data:
            return []

        logs = []
        for log in response.data:
            logs.append({
                "id": log.get("id"),
                "timestamp": log.get("timestamp"),
                "action": log.get("action"),
                "consent_id": log.get("consent_id"),
                "c_id": log.get("c_id"),
                "status": "SUCCESS" if log.get("status") == "SUCCESSFUL" else "ERROR",
                "ip_address": log.get("ip_address"),
                "details": log.get("detail") or "No details available"
            })

        return logs

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch audit logs: {str(e)}"
        )

# @router.get("/audit-logs/", response_model=List[AuditLogResponse])
# async def get_audit_logs(
#     action: Optional[str] = Query(None, description="Filter by action type (FETCH, CREATE)"),
#     status: Optional[str] = Query(None, description="Filter by status (SUCCESSFUL, ERROR)"),
#     date: Optional[date] = Query(None, description="Filter by date"),
#     limit: int = Query(100, description="Limit number of results"),
#     offset: int = Query(0, description="Offset for pagination")
# ):
#     try:
#         query = supabase.table("audit_logs") \
#             .select("*") \
#             .order("timestamp", desc=True) \
#             .limit(limit) \
#             .range(offset, offset + limit - 1)

#         if action:
#             query = query.eq("action", action)
#         if status:
#             query = query.eq("status", status)
#         if date:
#             start_date = datetime.combine(date, datetime.min.time())
#             end_date = datetime.combine(date, datetime.max.time())
#             query = query.gte("timestamp", start_date.isoformat()) \
#                          .lte("timestamp", end_date.isoformat())

#         response = query.execute()

#         if not response.data:
#             return []

#         # Transform data to match the response model
#         logs = []
#         for log in response.data:
#             logs.append({
#                 "id": log.get("id"),
#                 "timestamp": log.get("timestamp"),
#                 "action": log.get("action"),
#                 "consent_id": log.get("consent_id"),
#                 "c_id": log.get("c_id"),
#                 "status": "SUCCESS" if log.get("status") == "SUCCESSFUL" else "ERROR",
#                 "ip_address": log.get("ip_address"),
#                 "details": log.get("detail") or "No details available"  # Map 'detail' to 'details'
#             })

#         return logs

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to fetch audit logs: {str(e)}"
#         )