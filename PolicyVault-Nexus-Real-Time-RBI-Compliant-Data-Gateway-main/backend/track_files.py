from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
from supabase import create_client, Client
import os
import json

# Initialize router
router = APIRouter(prefix="/api/track-files", tags=["Track Files"])

# Supabase client setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")

def get_supabase_client() -> Client:
    """Get Supabase client instance"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Supabase credentials not configured"
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# Response Models
class DeviceInfo(BaseModel):
    mac: Optional[str] = None
    arch: Optional[str] = None
    os_type: Optional[str] = None
    release: Optional[str] = None
    platform: Optional[str] = None
    node_version: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    device: Optional[str] = None

class LocationInfo(BaseModel):
    ip: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None

class AccessLog(BaseModel):
    id: str
    file_id: str
    org_id: str
    ip_address: Optional[str] = None
    device_info: Optional[DeviceInfo] = None
    location: Optional[LocationInfo] = None
    created_at: str

class FileAccessSummary(BaseModel):
    file_id: str
    c_id: str
    org_name: str
    access_count: int

class TrackFilesResponse(BaseModel):
    file_data: List[FileAccessSummary]
    access_logs: Dict[str, List[AccessLog]]
    total_access: int
    total_files: int
    avg_access: int

def parse_json_field(field_value):
    """Parse JSON string field, return None if invalid or empty"""
    if not field_value:
        return None
    
    if isinstance(field_value, dict):
        return field_value
    
    if isinstance(field_value, str):
        try:
            return json.loads(field_value)
        except json.JSONDecodeError:
            return None
    
    return None

@router.get("/dashboard", response_model=TrackFilesResponse)
async def get_track_files_dashboard(
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get file access dashboard data with:
    - File access counts grouped by file_id
    - Mapped c_id from secure_files
    - Organization names from organizations table
    - Detailed access logs for each file
    """
    try:
        # Step 1: Get all access logs with counts grouped by file_id
        access_logs_response = supabase.table("track_access_logs").select(
            "id, file_id, org_id, ip_address, device_info, location, created_at"
        ).execute()
        
        if not access_logs_response.data:
            return TrackFilesResponse(
                file_data=[],
                access_logs={},
                total_access=0,
                total_files=0,
                avg_access=0
            )
        
        access_logs_data = access_logs_response.data
        
        # Step 2: Group access logs by file_id and count
        file_access_counts = {}
        access_logs_by_file = {}
        
        for log in access_logs_data:
            file_id = log["file_id"]
            
            # Count accesses
            if file_id not in file_access_counts:
                file_access_counts[file_id] = 0
                access_logs_by_file[file_id] = []
            
            file_access_counts[file_id] += 1
            access_logs_by_file[file_id].append(log)
        
        # Step 3: Get unique file_ids and org_ids
        unique_file_ids = list(file_access_counts.keys())
        unique_org_ids = list(set(log["org_id"] for log in access_logs_data))
        
        # Step 4: Fetch secure_files data to get c_id
        secure_files_response = supabase.table("secure_files").select(
            "id, c_id, fiu_id"
        ).in_("id", unique_file_ids).execute()
        
        # Create mapping: file_id -> (c_id, fiu_id)
        file_to_cid_map = {
            file["id"]: {"c_id": file["c_id"], "fiu_id": file["fiu_id"]}
            for file in secure_files_response.data
        }
        
        # Step 5: Fetch organizations data to get org_name
        organizations_response = supabase.table("organizations").select(
            "id, org_name"
        ).in_("id", unique_org_ids).execute()
        
        # Create mapping: org_id -> org_name
        org_to_name_map = {
            org["id"]: org["org_name"]
            for org in organizations_response.data
        }
        
        # Step 6: Build file_data summary
        file_data = []
        for file_id, count in file_access_counts.items():
            if file_id in file_to_cid_map:
                file_info = file_to_cid_map[file_id]
                fiu_id = file_info["fiu_id"]
                org_name = org_to_name_map.get(fiu_id, "Unknown Organization")
                
                file_data.append(FileAccessSummary(
                    file_id=file_id,
                    c_id=file_info["c_id"],
                    org_name=org_name,
                    access_count=count
                ))
        
        # Step 7: Format access logs for response
        formatted_access_logs = {}
        for file_id, logs in access_logs_by_file.items():
            formatted_logs = []
            for log in logs:
                # Parse device_info JSON string
                device_info = None
                device_data = parse_json_field(log.get("device_info"))
                if device_data:
                    device_info = DeviceInfo(**device_data)
                
                # Parse location JSON string
                location = None
                location_data = parse_json_field(log.get("location"))
                if location_data:
                    location = LocationInfo(**location_data)
                
                formatted_logs.append(AccessLog(
                    id=log["id"],
                    file_id=log["file_id"],
                    org_id=log["org_id"],
                    ip_address=log.get("ip_address"),
                    device_info=device_info,
                    location=location,
                    created_at=log["created_at"]
                ))
            
            formatted_access_logs[file_id] = formatted_logs
        
        # Step 8: Calculate statistics
        total_access = sum(file_access_counts.values())
        total_files = len(file_data)
        avg_access = round(total_access / total_files) if total_files > 0 else 0
        
        return TrackFilesResponse(
            file_data=file_data,
            access_logs=formatted_access_logs,
            total_access=total_access,
            total_files=total_files,
            avg_access=avg_access
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching track files data: {str(e)}"
        )

@router.get("/file/{file_id}/logs", response_model=List[AccessLog])
async def get_file_access_logs(
    file_id: str,
    supabase: Client = Depends(get_supabase_client)
):
    """
    Get access logs for a specific file
    """
    try:
        response = supabase.table("track_access_logs").select(
            "id, file_id, org_id, ip_address, device_info, location, created_at"
        ).eq("file_id", file_id).order("created_at", desc=True).execute()
        
        formatted_logs = []
        for log in response.data:
            # Parse device_info JSON string
            device_info = None
            device_data = parse_json_field(log.get("device_info"))
            if device_data:
                device_info = DeviceInfo(**device_data)
            
            # Parse location JSON string
            location = None
            location_data = parse_json_field(log.get("location"))
            if location_data:
                location = LocationInfo(**location_data)
            
            formatted_logs.append(AccessLog(
                id=log["id"],
                file_id=log["file_id"],
                org_id=log["org_id"],
                ip_address=log.get("ip_address"),
                device_info=device_info,
                location=location,
                created_at=log["created_at"]
            ))
        
        return formatted_logs
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching file access logs: {str(e)}"
        )