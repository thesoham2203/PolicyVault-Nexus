# routers.sso.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import jwt
import httpx
from app.config import settings
from app.security.jwt import create_access_token
from app.utils.logging import log_admin_action
from supabase import create_client, Client

router = APIRouter()
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{settings.okta_issuer}/v1/authorize",
    tokenUrl=f"{settings.okta_issuer}/v1/token",
    scopes={"openid": "OpenID Connect", "email": "Email", "profile": "Profile"}
)

async def get_okta_public_keys():
    jwks_url = f"{settings.okta_issuer}/v1/keys"
    async with httpx.AsyncClient() as client:
        response = await client.get(jwks_url)
        return response.json()

async def verify_okta_token(token: str):
    try:
        # Get Okta public keys
        jwks = await get_okta_public_keys()
        
        # Verify token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience=settings.okta_client_id,
            issuer=settings.okta_issuer
        )
        
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.get("/sso/login")
async def sso_login():
    # Redirect to Okta for authentication
    auth_url = (
        f"{settings.okta_issuer}/v1/authorize?"
        f"response_type=code&"
        f"client_id={settings.okta_client_id}&"
        f"redirect_uri={settings.frontend_url}/admin/sso/callback&"
        f"scope=openid%20email%20profile&"
        f"state=some_random_state"
    )
    return {"auth_url": auth_url}

@router.get("/sso/callback")
async def sso_callback(request: Request, code: str):
    # Exchange authorization code for tokens
    token_url = f"{settings.okta_issuer}/v1/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": f"{settings.frontend_url}/admin/sso/callback",
        "client_id": settings.okta_client_id,
        "client_secret": settings.okta_client_secret
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get tokens from Okta")
        
        tokens = response.json()
        id_token = tokens.get("id_token")
        
        # Verify ID token
        payload = await verify_okta_token(id_token)
        email = payload.get("email")
        
        # Check if admin exists
        admin = supabase.table("admins").select("*").eq("email", email).execute()
        if not admin.data:
            raise HTTPException(status_code=403, detail="Admin not registered")
        
        admin = admin.data[0]
        
        # Create JWT token
        access_token = create_access_token(
            data={"sub": admin["email"], "role": admin["role"], "admin_id": admin["id"]}
        )
        
        # Log SSO login
        ip_address = request.client.host
        await log_admin_action(
            admin_id=admin["id"],
            action_type="SSO_LOGIN",
            ip_address=ip_address,
            details={"provider": "Okta"}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "admin": {
                "email": admin["email"],
                "role": admin["role"]
            }
        }