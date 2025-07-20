from fastapi import APIRouter, Depends, Request, HTTPException
from typing import Optional
from datetime import datetime
from audit_service import audit_service

router = APIRouter()

@router.post("/audit/log")
async def create_audit_log(
    request: Request,
    consent_id: str,
    action: str,
    status: str,
    fiu_id: str,
    c_id: Optional[str] = None,
    detail: Optional[str] = None
):
    """
    Create an audit log entry
    """
    try:
        # Get client IP address
        ip_address = request.client.host if request.client else None

        # Log the action
        audit_log = await audit_service.log_action(
            consent_id=consent_id,
            action=action,
            status=status,
            c_id=c_id,
            ip_address=ip_address,
            detail=detail,
            fiu_id=fiu_id
        )

        return audit_log
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audit/logs")
async def get_audit_logs(
    consent_id: Optional[str] = None,
    action: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    fiu_id: Optional[str] = None
):
    """
    Get audit logs with optional filters
    """
    try:
        query = audit_service.supabase.table('audit_logs').select("*")

        if consent_id:
            query = query.eq('consent_id', consent_id)
        if action:
            query = query.eq('action', action)
        if status:
            query = query.eq('status', status)
        if fiu_id:
            query = query.eq('fiu_id', fiu_id)    
        if start_date:
            query = query.gte('timestamp', start_date.isoformat())
        if end_date:
            query = query.lte('timestamp', end_date.isoformat())

        query = query.order('timestamp', desc=True).limit(limit)
        response = query.execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))