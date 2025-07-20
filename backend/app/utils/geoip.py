# app/utils/geoip.py
import httpx
from fastapi import HTTPException
from app.config import settings

async def get_geoip_data(ip_address: str) -> dict:
    """Async function to get geo location data"""
    if not ip_address or ip_address == "127.0.0.1":
        return {"ip": ip_address, "error": "Local IP address"}
    
    try:
        # Try ipinfo.io first if token is available
        if settings.ipinfo_token:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://ipinfo.io/{ip_address}?token={settings.ipinfo_token}",
                    timeout=5.0
                )
                if response.status_code == 200:
                    return response.json()
        
        # Fallback to free API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://ip-api.com/json/{ip_address}",
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return data
        
        return {"ip": ip_address, "error": "Could not determine location"}
    except Exception as e:
        return {"ip": ip_address, "error": str(e)}