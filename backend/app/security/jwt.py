import os
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from jose.exceptions import JWTError
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from app.config import settings
from fastapi import HTTPException

# Generate RSA key pair if not exists
def generate_rsa_keys():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return private_pem, public_pem

# Load or generate keys
private_key_path = "private_key.pem"
public_key_path = "public_key.pem"

# if not settings.jwt_private_key or not settings.jwt_public_key:
#     private_pem, public_pem = generate_rsa_keys()
#     settings.jwt_private_key = private_pem.decode()
#     settings.jwt_public_key = public_pem.decode()

if not os.path.exists(private_key_path) or not os.path.exists(public_key_path):
    private_pem, public_pem = generate_rsa_keys()
    with open(private_key_path, "wb") as f:
        f.write(private_pem)
    with open(public_key_path, "wb") as f:
        f.write(public_pem)
else:
    with open(private_key_path, "rb") as f:
        private_pem = f.read()
    with open(public_key_path, "rb") as f:
        public_pem = f.read()

# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
#     to_encode = data.copy()
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, private_pem, algorithm=settings.jwt_algorithm)
#     return encoded_jwt

# def verify_token(token: str):
#     try:
#         payload = jwt.decode(token, public_pem, algorithms=[settings.jwt_algorithm])
#         return payload
#     except JWTError:
#         return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    to_encode.update({"exp": expire})
    
    # Ensure private_pem is properly loaded
    private_key = private_pem
    if isinstance(private_key, bytes):
        private_key = private_key.decode()
    
    encoded_jwt = jwt.encode(
        to_encode, 
        private_key, 
        algorithm="RS256"  # Explicitly use RS256
    )
    return encoded_jwt

def verify_token(token: str):
    try:
        # Ensure public_pem is properly loaded
        public_key = public_pem
        if isinstance(public_key, bytes):
            public_key = public_key.decode()
            
        payload = jwt.decode(
            token, 
            public_key, 
            algorithms=["RS256"]  # Explicitly use RS256
        )
        return payload
    except JWTError:
        return None

def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt

def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )