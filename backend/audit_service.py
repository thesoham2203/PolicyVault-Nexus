from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional
from fastapi import HTTPException

load_dotenv()

class AuditService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE")
        self.supabase: Client = create_client(url, key)

    async def log_action(
        self,
        consent_id: str,
        action: str,
        status: str,
        fiu_id: str,
        c_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        detail: Optional[str] = None
    ) -> dict:
        """
        Log an action to the audit log
        """
        try:
            log_data = {
                "consent_id": consent_id,
                "action": action,
                "status": status,
                "c_id": c_id,
                "ip_address": ip_address,
                "detail": detail,
                "fiu_id": fiu_id
            }

            response = self.supabase.table('audit_logs').insert(log_data).execute()
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create audit log")
            
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Audit logging failed: {str(e)}")

# Create a singleton instance
audit_service = AuditService()