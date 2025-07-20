# app/middleware/real_ip.py
from fastapi import Request
from typing import Optional

def get_real_client_ip(request: Request) -> str:
    """Get the real client IP address, even behind proxies"""
    # Check common proxy headers in order of priority
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # X-Forwarded-For can contain multiple IPs (proxy chain)
        # The client IP is the first one
        client_ip = forwarded_for.split(",")[0].strip()
        if client_ip:
            return client_ip

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to the direct connection IP
    return request.client.host if request.client else "127.0.0.1"