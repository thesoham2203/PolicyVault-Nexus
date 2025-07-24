from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class EmailRequest(BaseModel):
    email: EmailStr
    recaptcha_token: Optional[str] = None

class AdminRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str
    terms_accepted: bool
    otp: Optional[str] = None
    device_fingerprint: Optional[str] = None

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str
    otp: Optional[str] = None
    device_fingerprint: Optional[str] = None
    invite_token: Optional[str] = None  # Required for non-super admins

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    admin_id: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    admin_id: Optional[str] = None

