import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_SERVICE_ROLE")
    
    # JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    
    # EmailJS
    emailjs_service_id: str = os.getenv("EMAILJS_SERVICE_ID")
    emailjs_template_id2: str = os.getenv("EMAILJS_TEMPLATE_ID2")
    emailjs_user_id: str = os.getenv("EMAILJS_USER_ID")
    emailjs_private_key: str = os.getenv("EMAILJS_PRIVATE_KEY")
    
    # Okta
    okta_client_id: str = os.getenv("OKTA_CLIENT_ID")
    okta_client_secret: str = os.getenv("OKTA_CLIENT_SECRET")
    okta_issuer: str = os.getenv("OKTA_ISSUER")
    
    # FingerprintJS
    fingerprintjs_api_key: str = os.getenv("FINGERPRINTJS_API_KEY")

    jwt_private_key: str = os.getenv("JWT_PRIVATE_KEY")
    jwt_public_key: str = os.getenv("JWT_PUBLIC_KEY")
    jwt_algorithm: str = "RS256"
    access_token_expire_minutes: int = 30
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    

    # IPInfo
    ipinfo_token: str = os.getenv("IPINFO_TOKEN")
    
    # Security
    otp_expiry_seconds: int = 300  # 5 minutes
    otp_rate_limit_seconds: int = 60  # 1 minute
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()