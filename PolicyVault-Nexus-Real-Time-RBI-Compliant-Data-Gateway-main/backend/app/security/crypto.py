import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from passlib.context import CryptContext
import os
from app.config import settings

# Password hashing with Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# AES-256 encryption for TOTP secrets
def get_fernet_key(salt: bytes = None) -> tuple[bytes, bytes]:
    if salt is None:
        salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.jwt_secret_key.encode()))
    return key, salt

def encrypt_data(data: str) -> tuple[str, str]:
    salt = os.urandom(16)
    if not all(c in '0123456789abcdefABCDEF' for c in salt.hex()):
        raise ValueError("Generated salt contains non-hex characters")
    key, _ = get_fernet_key(salt)
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    return encrypted_data.decode(), salt.hex()

def decrypt_data(encrypted_data: str, salt_hex: str) -> str:
    try:
        salt = bytes.fromhex(salt_hex)
        key, _ = get_fernet_key(salt)
        f = Fernet(key)
        decrypted_data = f.decrypt(encrypted_data.encode())
        return decrypted_data.decode()
    except ValueError as e:
        raise ValueError(f"Invalid hex string for salt: {salt_hex}") from e
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}") from e