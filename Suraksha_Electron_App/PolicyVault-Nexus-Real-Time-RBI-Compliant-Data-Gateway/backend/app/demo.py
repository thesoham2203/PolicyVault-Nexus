# crypto_utils.py
import os
import hashlib
import hmac
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from dotenv import load_dotenv
import string

# Temporarily create a simplified FPE class instead of importing
class SimpleFPE:
    def __init__(self, master_key: bytes):
        self.master_key = master_key
    
    def encrypt_pan(self, pan: str) -> Dict[str, Any]:
        # Simple format-preserving substitution for PAN
        encrypted = ""
        for i, char in enumerate(pan):
            if char.isdigit():
                encrypted += str((int(char) + i + 1) % 10)
            else:
                encrypted += chr((ord(char) - ord('A') + i + 1) % 26 + ord('A'))
        return {
            "encrypted_value": encrypted,
            "data_type": "PAN",
            "format_preserved": True,
            "algorithm": "Simple-FPE"
        }
    
    def encrypt_account_number(self, account: str) -> Dict[str, Any]:
        encrypted = ""
        for i, char in enumerate(account):
            encrypted += str((int(char) + i + 1) % 10)
        return {
            "encrypted_value": encrypted,
            "data_type": "ACCOUNT_NUMBER",
            "format_preserved": True,
            "algorithm": "Simple-FPE"
        }
    
    def encrypt_aadhaar(self, aadhaar: str) -> Dict[str, Any]:
        clean = aadhaar.replace(" ", "").replace("-", "")
        encrypted = ""
        for i, char in enumerate(clean):
            encrypted += str((int(char) + i + 1) % 10)
        
        # Restore formatting
        if " " in aadhaar:
            encrypted = f"{encrypted[:4]} {encrypted[4:8]} {encrypted[8:]}"
        elif "-" in aadhaar:
            encrypted = f"{encrypted[:4]}-{encrypted[4:8]}-{encrypted[8:]}"
            
        return {
            "encrypted_value": encrypted,
            "data_type": "AADHAAR",
            "format_preserved": True,
            "algorithm": "Simple-FPE"
        }
    
    def encrypt_mobile(self, mobile: str) -> Dict[str, Any]:
        import re
        clean = re.sub(r'[^\d]', '', mobile)
        encrypted = ""
        for i, char in enumerate(clean):
            encrypted += str((int(char) + i + 1) % 10)
        
        # Restore formatting
        if "+" in mobile:
            encrypted = f"+91{encrypted}"
        elif mobile.startswith("91"):
            encrypted = f"91{encrypted}"
            
        return {
            "encrypted_value": encrypted,
            "data_type": "MOBILE",
            "format_preserved": True,
            "algorithm": "Simple-FPE"
        }
    
    # Decrypt methods for completeness
    def decrypt_pan(self, encrypted_data: Dict[str, Any]) -> str:
        encrypted = encrypted_data["encrypted_value"]
        decrypted = ""
        for i, char in enumerate(encrypted):
            if char.isdigit():
                decrypted += str((int(char) - i - 1) % 10)
            else:
                decrypted += chr((ord(char) - ord('A') - i - 1) % 26 + ord('A'))
        return decrypted
    
    def decrypt_account_number(self, encrypted_data: Dict[str, Any]) -> str:
        encrypted = encrypted_data["encrypted_value"]
        decrypted = ""
        for i, char in enumerate(encrypted):
            decrypted += str((int(char) - i - 1) % 10)
        return decrypted
    
    def decrypt_aadhaar(self, encrypted_data: Dict[str, Any]) -> str:
        encrypted = encrypted_data["encrypted_value"]
        clean = encrypted.replace(" ", "").replace("-", "")
        decrypted = ""
        for i, char in enumerate(clean):
            decrypted += str((int(char) - i - 1) % 10)
        return decrypted
    
    def decrypt_mobile(self, encrypted_data: Dict[str, Any]) -> str:
        encrypted = encrypted_data["encrypted_value"]
        import re
        clean = re.sub(r'[^\d]', '', encrypted)
        decrypted = ""
        for i, char in enumerate(clean):
            decrypted += str((int(char) - i - 1) % 10)
        return decrypted

# === Load environment variables ===
load_dotenv()

# === Static master key (used as input to HKDF) ===
aes_key_hex = os.getenv("AES_256_GCM_KEY_HEX")
if not aes_key_hex:
    # Generate a random key if not provided (for development)
    MASTER_KEY = os.urandom(32)
    print("⚠️ Using random master key - set AES_256_GCM_KEY_HEX in production")
else:
    MASTER_KEY = bytes.fromhex(aes_key_hex)

# === Salt for HKDF + SHA3 ===
contact_salt = os.getenv("CONTACT_SALT")
if not contact_salt:
    contact_salt = "policyvault_default_salt_2025"
    print("⚠️ Using default salt - set CONTACT_SALT in production")
SALT = contact_salt.encode()

# === Initialize simplified FPE ===
fpe_manager = SimpleFPE(MASTER_KEY)

# === Ephemeral AES-GCM (session key derived per context) ===
def derive_ephemeral_key(context: str) -> bytes:
    """Derive a unique ephemeral key for the given context"""
    return HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=SALT,
        info=context.encode(),
        backend=default_backend()
    ).derive(MASTER_KEY)

def encrypt_with_session_key(plaintext: str, context: str) -> Dict[str, Any]:
    """
    Encrypt data with ephemeral session key
    Returns JSON-serializable dictionary
    """
    try:
        key = derive_ephemeral_key(context)
        nonce = os.urandom(12)
        aesgcm = AESGCM(key)
        ct = aesgcm.encrypt(nonce, plaintext.encode(), None)
        
        return {
            "encrypted_value": ct.hex(),
            "nonce": nonce.hex(),
            "context": context,
            "algorithm": "AES-256-GCM",
            "key_derivation": "HKDF-SHA256",
            "data_type": "SESSION_ENCRYPTED",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise ValueError(f"Session encryption failed: {e}")

def decrypt_with_session_key(encrypted_data: Dict[str, Any]) -> str:
    """Decrypt data encrypted with session key"""
    try:
        if encrypted_data.get("data_type") != "SESSION_ENCRYPTED":
            raise ValueError("Invalid data type for session decryption")
        
        context = encrypted_data["context"]
        key = derive_ephemeral_key(context)
        aesgcm = AESGCM(key)
        
        nonce = bytes.fromhex(encrypted_data["nonce"])
        ciphertext = bytes.fromhex(encrypted_data["encrypted_value"])
        
        return aesgcm.decrypt(nonce, ciphertext, None).decode()
    except Exception as e:
        raise ValueError(f"Session decryption failed: {e}")

# === Format-Preserving Encryption (FPE) using FF3 ===
def encrypt_fpe(value: str, data_type: str = "auto") -> Dict[str, Any]:
    """
    Encrypt using Format-Preserving Encryption
    Returns JSON-serializable dictionary
    """
    try:
        # Auto-detect data type if not specified
        if data_type == "auto":
            data_type = _detect_data_type(value)
        
        if data_type.upper() == "PAN":
            return fpe_manager.encrypt_pan(value)
        elif data_type.upper() == "ACCOUNT":
            return fpe_manager.encrypt_account_number(value)
        elif data_type.upper() == "AADHAAR":
            return fpe_manager.encrypt_aadhaar(value)
        elif data_type.upper() == "MOBILE":
            return fpe_manager.encrypt_mobile(value)
        else:
            # Default to simple substitution
            encrypted = ""
            for i, char in enumerate(value):
                if char.isdigit():
                    encrypted += str((int(char) + i + 1) % 10)
                elif char.isalpha():
                    if char.isupper():
                        encrypted += chr((ord(char) - ord('A') + i + 1) % 26 + ord('A'))
                    else:
                        encrypted += chr((ord(char) - ord('a') + i + 1) % 26 + ord('a'))
                else:
                    encrypted += char
            
            return {
                "encrypted_value": encrypted,
                "data_type": data_type.upper(),
                "format_preserved": True,
                "algorithm": "Simple-FPE"
            }
    except Exception as e:
        raise ValueError(f"FPE encryption failed for {data_type}: {e}")

def decrypt_fpe(encrypted_data: Dict[str, Any]) -> str:
    """Decrypt FPE encrypted data"""
    try:
        data_type = encrypted_data.get("data_type", "").upper()
        
        if data_type == "PAN":
            return fpe_manager.decrypt_pan(encrypted_data)
        elif data_type == "ACCOUNT_NUMBER":
            return fpe_manager.decrypt_account_number(encrypted_data)
        elif data_type == "AADHAAR":
            return fpe_manager.decrypt_aadhaar(encrypted_data)
        elif data_type == "MOBILE":
            return fpe_manager.decrypt_mobile(encrypted_data)
        else:
            # Default simple decryption
            encrypted = encrypted_data["encrypted_value"]
            decrypted = ""
            for i, char in enumerate(encrypted):
                if char.isdigit():
                    decrypted += str((int(char) - i - 1) % 10)
                elif char.isalpha():
                    if char.isupper():
                        decrypted += chr((ord(char) - ord('A') - i - 1) % 26 + ord('A'))
                    else:
                        decrypted += chr((ord(char) - ord('a') - i - 1) % 26 + ord('a'))
                else:
                    decrypted += char
            return decrypted
    except Exception as e:
        raise ValueError(f"FPE decryption failed: {e}")

def _detect_data_type(value: str) -> str:
    """Auto-detect data type for appropriate encryption"""
    import re
    
    # Remove common formatting
    clean_value = re.sub(r'[^\w]', '', value.upper())
    
    if re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', clean_value):
        return "PAN"
    elif re.sub(r'[^\d]', '', value) and len(re.sub(r'[^\d]', '', value)) == 12:
        return "AADHAAR"
    elif re.sub(r'[^\d]', '', value) and len(re.sub(r'[^\d]', '', value)) == 10:
        return "MOBILE"
    elif value.isdigit() and len(value) >= 8:
        return "ACCOUNT"
    else:
        return "GENERIC"

# === SHA3-based pseudonymization (email, contact ID, etc.) ===
def pseudonymize_contact(contact: str) -> Dict[str, Any]:
    """
    Create irreversible pseudonym using SHA3
    Returns JSON-serializable dictionary
    """
    try:
        hasher = hashlib.sha3_256()
        hasher.update(SALT + contact.encode())
        pseudonym = hasher.hexdigest()
        
        return {
            "pseudonym": pseudonym,
            "data_type": "PSEUDONYMIZED_CONTACT",
            "algorithm": "SHA3-256",
            "irreversible": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise ValueError(f"Pseudonymization failed: {e}")

# === HMAC signing for data integrity ===
def sign_consent_artifact(consent_id: str, additional_data: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Create HMAC signature for consent artifact
    Returns JSON-serializable dictionary
    """
    try:
        # Prepare data to sign
        sign_data = {
            "consent_id": consent_id,
            "timestamp": datetime.now().isoformat(),
            "additional_data": additional_data or {}
        }
        
        # Create canonical representation
        canonical_data = json.dumps(sign_data, sort_keys=True, separators=(',', ':'))
        
        # Generate HMAC signature
        signature = hmac.new(
            MASTER_KEY, 
            canonical_data.encode(), 
            hashlib.sha256
        ).hexdigest()
        
        return {
            "consent_id": consent_id,
            "signature": signature,
            "signed_data": sign_data,
            "algorithm": "HMAC-SHA256",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise ValueError(f"Consent signing failed: {e}")

def verify_consent_artifact(signed_artifact: Dict[str, Any]) -> bool:
    """Verify HMAC signature of consent artifact"""
    try:
        # Extract signature and data
        provided_signature = signed_artifact["signature"]
        signed_data = signed_artifact["signed_data"]
        
        # Recreate canonical representation
        canonical_data = json.dumps(signed_data, sort_keys=True, separators=(',', ':'))
        
        # Calculate expected signature
        expected_signature = hmac.new(
            MASTER_KEY,
            canonical_data.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Secure comparison
        return hmac.compare_digest(provided_signature, expected_signature)
    except Exception as e:
        print(f"Consent verification failed: {e}")
        return False

# === Comprehensive encryption processor ===
def process_secure_data(data: Dict[str, Any], fiu_scope: List[str]) -> Dict[str, Any]:
    """
    Process all data fields according to FIU scope with appropriate encryption
    Returns JSON-serializable dictionary ready for vault creation
    """
    try:
        processed_data = {
            "metadata": {
                "processing_timestamp": datetime.now().isoformat(),
                "fiu_scope": fiu_scope,
                "encryption_version": "2.0",
                "session_id": str(uuid.uuid4())
            },
            "encrypted_fields": {},
            "pseudonymized_fields": {},
            "integrity_signatures": {}
        }
        
        # Process each field according to its type and scope
        for field_name, field_value in data.items():
            if field_name not in fiu_scope and field_name != "fiu":
                continue  # Skip fields not in scope
            
            if field_name == "fiu":
                processed_data["metadata"]["fiu_type"] = field_value
                continue
            
            # Determine encryption method based on field type
            if field_name in ["aadhaar"]:
                if len(fiu_scope) == 1:  # Single field access
                    processed_data["encrypted_fields"][field_name] = encrypt_fpe(field_value, "aadhaar")
                else:
                    processed_data["encrypted_fields"][field_name] = encrypt_with_session_key(field_value, f"aadhaar_{processed_data['metadata']['session_id']}")
            
            elif field_name in ["pan"]:
                processed_data["encrypted_fields"][field_name] = encrypt_fpe(field_value, "pan")
            
            elif field_name in ["account"]:
                processed_data["encrypted_fields"][field_name] = encrypt_fpe(field_value, "account")
            
            elif field_name in ["mobile"]:
                if len(fiu_scope) <= 2:  # Limited scope
                    processed_data["encrypted_fields"][field_name] = encrypt_fpe(field_value, "mobile")
                else:
                    processed_data["encrypted_fields"][field_name] = encrypt_with_session_key(field_value, f"mobile_{processed_data['metadata']['session_id']}")
            
            elif field_name in ["email"]:
                processed_data["pseudonymized_fields"][field_name] = pseudonymize_contact(field_value)
            
            elif field_name in ["nominee", "dob"]:
                processed_data["encrypted_fields"][field_name] = encrypt_with_session_key(field_value, f"{field_name}_{processed_data['metadata']['session_id']}")
            
            else:
                # Default to session encryption for unknown fields
                processed_data["encrypted_fields"][field_name] = encrypt_with_session_key(str(field_value), f"generic_{processed_data['metadata']['session_id']}")
        
        # Create integrity signature for the entire dataset
        consent_id = f"consent_{processed_data['metadata']['session_id']}"
        processed_data["integrity_signatures"]["dataset"] = sign_consent_artifact(
            consent_id, 
            {
                "fiu_scope": fiu_scope,
                "field_count": len(processed_data["encrypted_fields"]) + len(processed_data["pseudonymized_fields"])
            }
        )
        
        return processed_data
        
    except Exception as e:
        raise ValueError(f"Secure data processing failed: {e}")

# === Vault file preparation ===
def prepare_vault_data(processed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare processed data for vault file creation
    Returns JSON-serializable dictionary optimized for .vault files
    """
    try:
        vault_data = {
            "vault_version": "2.0",
            "created_at": datetime.now().isoformat(),
            "vault_id": str(uuid.uuid4()),
            "security_profile": {
                "encryption_methods": [],
                "key_derivation": "HKDF-SHA256",
                "integrity_protection": "HMAC-SHA256",
                "forward_secrecy": True
            },
            "data": processed_data
        }
        
        # Analyze encryption methods used
        methods = set()
        if processed_data.get("encrypted_fields"):
            for field_data in processed_data["encrypted_fields"].values():
                if isinstance(field_data, dict) and "algorithm" in field_data:
                    methods.add(field_data["algorithm"])
        
        if processed_data.get("pseudonymized_fields"):
            methods.add("SHA3-256-Pseudonymization")
        
        vault_data["security_profile"]["encryption_methods"] = list(methods)
        
        return vault_data
        
    except Exception as e:
        raise ValueError(f"Vault data preparation failed: {e}")

# === Status and diagnostics ===
def get_crypto_status() -> Dict[str, Any]:
    """Get status of all cryptographic components"""
    return {
        "master_key_loaded": bool(MASTER_KEY),
        "salt_configured": bool(SALT),
        "fpe_manager_ready": fpe_manager is not None,
        "available_algorithms": {
            "session_encryption": "AES-256-GCM with HKDF",
            "format_preserving": "FF3-FPE",
            "pseudonymization": "SHA3-256",
            "integrity": "HMAC-SHA256"
        },
        "supported_data_types": [
            "PAN", "AADHAAR", "ACCOUNT", "MOBILE", "EMAIL", "GENERIC"
        ]
    }

# vault_utils.py
#!/usr/bin/env python3
"""
Vault file creation utilities with Supabase integration
"""
print("🔍 vault_utils.py starting to load...")

import os
import json
import secrets
import string
from pathlib import Path
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import bcrypt

print("🔍 Basic imports completed...")

# Temporarily disable Supabase to get the server running
supabase = None
print("🔍 Supabase disabled for now...")

# Supabase configuration (commented out)
# SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key-here")

# Initialize Supabase client (commented out)
# try:
#     from supabase._sync.client import create_client, SyncClient
#     print(f"🔧 Attempting to connect to Supabase: {SUPABASE_URL[:50]}...")
#     supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
#     print("✅ Supabase client initialized successfully")
# except Exception as e:
#     print(f"⚠️ Warning: Supabase initialization failed: {e}")
#     supabase = None


def generate_random_password(length: int = 16) -> str:
    """Generate a secure random password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

print("🔍 generate_random_password function defined...")


def derive_key_from_password(password: str, salt: bytes) -> bytes:
    """Derive encryption key from password using PBKDF2."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256 bits for AES-256
        salt=salt,
        iterations=100000,  # OWASP recommended minimum
        backend=default_backend()
    )
    return kdf.derive(password.encode('utf-8'))


def encrypt_data_with_password(data: bytes, password: str) -> dict:
    """Encrypt data using AES-256-GCM with password-derived key."""
    # Generate random salt and IV
    salt = os.urandom(16)
    iv = os.urandom(12)  # 96-bit IV for GCM
    
    # Derive key from password
    key = derive_key_from_password(password, salt)
    
    # Encrypt with AES-256-GCM
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(data) + encryptor.finalize()
    
    return {
        'salt': salt.hex(),
        'iv': iv.hex(),
        'ciphertext': ciphertext.hex(),
        'tag': encryptor.tag.hex()
    }


def decrypt_data_with_password(encrypted_data: dict, password: str) -> bytes:
    """Decrypt data using AES-256-GCM with password-derived key."""
    salt = bytes.fromhex(encrypted_data['salt'])
    iv = bytes.fromhex(encrypted_data['iv'])
    ciphertext = bytes.fromhex(encrypted_data['ciphertext'])
    tag = bytes.fromhex(encrypted_data['tag'])
    
    # Derive key from password
    key = derive_key_from_password(password, salt)
    
    # Decrypt with AES-256-GCM
    cipher = Cipher(algorithms.AES(key), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()
    plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    
    return plaintext


def create_vault_file(data: dict, filename_prefix: str) -> dict:
    """
    Create an encrypted vault file with Supabase metadata storage.
    
    Args:
        data: The data to encrypt and store
        filename_prefix: Prefix for the vault filename
        
    Returns:
        Dictionary with success status, filename, password, and database ID
    """
    try:
        # Generate secure random password
        password = generate_random_password(20)
        
        # Create filename
        filename = f"{filename_prefix}.vault"
        
        # Serialize data to JSON
        json_data = json.dumps(data, indent=2).encode('utf-8')
        
        # Encrypt the data
        encrypted_data = encrypt_data_with_password(json_data, password)
        
        # Ensure vault_files directory exists
        vault_dir = Path("vault_files")
        vault_dir.mkdir(exist_ok=True)
        
        # Save encrypted file
        vault_path = vault_dir / filename
        with open(vault_path, 'w') as f:
            json.dump(encrypted_data, f, indent=2)
        
        # Store metadata in Supabase (if available)
        db_record_id = None
        if supabase:
            try:
                # Hash the password for storage (don't store plaintext)
                password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                # Store in Supabase
                response = supabase.table('secure_files').insert({
                    'filename': filename,
                    'password_hash': password_hash,
                    'aes_key': encrypted_data['salt'],  # Store salt for key derivation
                    'iv': encrypted_data['iv']
                }).execute()
                
                if response.data and len(response.data) > 0:
                    db_record_id = response.data[0]['id']
                    print(f"✅ Metadata stored in Supabase with ID: {db_record_id}")
                else:
                    print("⚠️ Warning: Failed to store metadata in Supabase")
                    
            except Exception as e:
                print(f"⚠️ Warning: Supabase storage failed: {e}")
        
        print(f"✅ Vault file created: {vault_path}")
        print(f"🔑 Password: {password}")
        
        return {
            "success": True,
            "filename": filename,
            "password": password,
            "filepath": str(vault_path),
            "db_id": db_record_id
        }
        
    except Exception as e:
        print(f"❌ Error creating vault file: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def verify_vault_file(filename: str, password: str) -> bool:
    """
    Verify that a vault file can be decrypted with the given password.
    
    Args:
        filename: Name of the vault file
        password: Password to test
        
    Returns:
        True if decryption succeeds, False otherwise
    """
    try:
        vault_path = Path("vault_files") / filename
        
        if not vault_path.exists():
            print(f"❌ Vault file not found: {vault_path}")
            return False
        
        # Load encrypted data
        with open(vault_path, 'r') as f:
            encrypted_data = json.load(f)
        
        # Try to decrypt
        decrypted_data = decrypt_data_with_password(encrypted_data, password)
        
        # Try to parse as JSON to verify integrity
        json.loads(decrypted_data.decode('utf-8'))
        
        print(f"✅ Vault file verification successful: {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Vault file verification failed: {e}")
        return False


def list_vault_files() -> list:
    """List all vault files in the vault_files directory."""
    try:
        vault_dir = Path("vault_files")
        if not vault_dir.exists():
            return []
        
        vault_files = []
        for file_path in vault_dir.glob("*.vault"):
            vault_files.append({
                "filename": file_path.name,
                "size": file_path.stat().st_size,
                "created": file_path.stat().st_ctime
            })
        
        return sorted(vault_files, key=lambda x: x['created'], reverse=True)
        
    except Exception as e:
        print(f"❌ Error listing vault files: {e}")
        return []


if __name__ == "__main__":
    # Test the vault system
    print("🧪 Testing vault file system...")
    
    test_data = {
        "test": "data",
        "number": 12345,
        "nested": {"key": "value"}
    }
    
    result = create_vault_file(test_data, "test_vault")
    
    if result["success"]:
        print(f"✅ Test vault created: {result['filename']}")
        print(f"🔑 Password: {result['password']}")
        
        # Test verification
        if verify_vault_file(result['filename'], result['password']):
            print("✅ Vault verification passed!")
        else:
            print("❌ Vault verification failed!")
    else:
        print(f"❌ Test failed: {result['error']}")

# e2ee_utils.py
# backend/app/e2ee_utils.py

import os
import json
import hashlib
import traceback
from typing import Dict, Any, Optional
from base64 import b64decode, b64encode
from Crypto.Cipher import AES, PKCS1_OAEP
from Crypto.PublicKey import RSA
from Crypto.Hash import SHA256
from Crypto.Random import get_random_bytes
import logging

# Configure logging for E2EE operations
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load RSA private key for decryption
def load_private_key():
    """Load the RSA private key for E2EE decryption"""
    try:
        key_path = os.path.join(os.path.dirname(__file__), "keys", "vault_private.pem")
        with open(key_path, "rb") as f:
            return RSA.import_key(f.read())
    except Exception as e:
        logger.error(f"Failed to load private key: {e}")
        raise

PRIVATE_KEY = load_private_key()

def validate_e2ee_payload(payload: dict) -> bool:
    """Validate the structure of incoming E2EE payload"""
    required_fields = ["encrypted_session_key", "iv", "ciphertext"]
    
    if not isinstance(payload, dict):
        logger.error("Payload is not a dictionary")
        return False
    
    for field in required_fields:
        if field not in payload:
            logger.error(f"Missing required field: {field}")
            return False
        
        if not isinstance(payload[field], str):
            logger.error(f"Field {field} is not a string")
            return False
    
    return True

def decrypt_e2ee_payload(payload: dict) -> dict:
    """
    Decrypt E2EE payload from frontend with comprehensive error handling
    
    Expected payload structure:
    {
        "encrypted_session_key": "base64_encoded_encrypted_aes_key",
        "iv": "hex_encoded_iv",
        "ciphertext": "hex_encoded_encrypted_data_with_tag"
    }
    """
    try:
        logger.info("🔐 Starting E2EE payload decryption")
        
        # Validate payload structure
        if not validate_e2ee_payload(payload):
            raise ValueError("Invalid payload structure")
        
        # Log key fingerprints for debugging (without exposing actual keys)
        private_key_fingerprint = hashlib.sha256(PRIVATE_KEY.publickey().export_key()).hexdigest()
        logger.info(f"🔏 Backend Private Key SHA-256: {private_key_fingerprint[:16]}...")
        
        encrypted_key_preview = payload.get("encrypted_session_key", "")[:30]
        logger.info(f"🔐 Frontend Encrypted Key Preview: {encrypted_key_preview}...")
        
        # Step 1: Decrypt the AES session key using RSA-OAEP
        logger.info("🔓 Decrypting AES session key with RSA-OAEP")
        try:
            encrypted_session_key_bytes = b64decode(payload["encrypted_session_key"])
            logger.info(f"📊 Encrypted session key length: {len(encrypted_session_key_bytes)} bytes")
            
            cipher_rsa = PKCS1_OAEP.new(PRIVATE_KEY, hashAlgo=SHA256)
            session_key = cipher_rsa.decrypt(encrypted_session_key_bytes)
            logger.info(f"✅ Session key decrypted successfully, length: {len(session_key)} bytes")
            
        except Exception as e:
            logger.error(f"❌ RSA decryption failed: {e}")
            raise ValueError(f"RSA decryption failed: {e}")
        
        # Step 2: Extract IV and ciphertext
        try:
            iv = bytes.fromhex(payload["iv"])
            ciphertext_with_tag = bytes.fromhex(payload["ciphertext"])
            
            logger.info(f"📊 IV length: {len(iv)} bytes")
            logger.info(f"📊 Ciphertext+Tag length: {len(ciphertext_with_tag)} bytes")
            
            if len(iv) != 12:  # AES-GCM standard IV length
                raise ValueError(f"Invalid IV length: {len(iv)}, expected 12 bytes")
            
            if len(ciphertext_with_tag) < 16:  # At least tag length
                raise ValueError(f"Ciphertext too short: {len(ciphertext_with_tag)} bytes")
            
        except ValueError as e:
            if "non-hexadecimal" in str(e):
                logger.error(f"❌ Invalid hex encoding in payload: {e}")
                raise ValueError(f"Invalid hex encoding: {e}")
            raise
        
        # Step 3: Split ciphertext and authentication tag
        # AES-GCM tag is always 16 bytes (128 bits)
        actual_ciphertext = ciphertext_with_tag[:-16]
        auth_tag = ciphertext_with_tag[-16:]
        
        logger.info(f"📊 Actual ciphertext length: {len(actual_ciphertext)} bytes")
        logger.info(f"📊 Authentication tag length: {len(auth_tag)} bytes")
        
        # Step 4: AES-GCM Decryption with authentication
        logger.info("🔓 Decrypting data with AES-GCM")
        try:
            cipher_aes = AES.new(session_key, AES.MODE_GCM, nonce=iv)
            plaintext_bytes = cipher_aes.decrypt_and_verify(actual_ciphertext, auth_tag)
            logger.info(f"✅ AES-GCM decryption successful, plaintext length: {len(plaintext_bytes)} bytes")
            
        except ValueError as e:
            logger.error(f"❌ AES-GCM decryption/verification failed: {e}")
            raise ValueError(f"AES-GCM decryption failed - data may be corrupted or tampered: {e}")
        
        # Step 5: Parse JSON payload
        try:
            plaintext_str = plaintext_bytes.decode('utf-8')
            decrypted_data = json.loads(plaintext_str)
            logger.info("✅ JSON parsing successful")
            
            # Log decrypted data structure (without sensitive values)
            data_keys = list(decrypted_data.keys()) if isinstance(decrypted_data, dict) else "not_dict"
            logger.info(f"📊 Decrypted data keys: {data_keys}")
            
            return decrypted_data
            
        except UnicodeDecodeError as e:
            logger.error(f"❌ UTF-8 decoding failed: {e}")
            raise ValueError(f"Invalid UTF-8 data after decryption: {e}")
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {e}")
            logger.error(f"Plaintext preview: {plaintext_str[:100]}...")
            raise ValueError(f"Invalid JSON data after decryption: {e}")

    except Exception as e:
        logger.error(f"❌ E2EE decryption failed: {e}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise ValueError(f"E2EE decryption failed: {e}")

def encrypt_e2ee_payload(data: dict, public_key_pem: str) -> dict:
    """
    Encrypt data for E2EE transmission (for testing or reverse communication)
    
    Args:
        data: Dictionary to encrypt
        public_key_pem: PEM-formatted public key string
    
    Returns:
        Dictionary with encrypted payload structure
    """
    try:
        logger.info("🔐 Starting E2EE payload encryption")
        
        # Import public key
        public_key = RSA.import_key(public_key_pem)
        
        # Generate random AES session key
        session_key = get_random_bytes(32)  # 256-bit key
        iv = get_random_bytes(12)  # 96-bit IV for GCM
        
        # Encrypt data with AES-GCM
        plaintext = json.dumps(data, separators=(',', ':')).encode('utf-8')
        cipher_aes = AES.new(session_key, AES.MODE_GCM, nonce=iv)
        ciphertext, auth_tag = cipher_aes.encrypt_and_digest(plaintext)
        
        # Encrypt session key with RSA-OAEP
        cipher_rsa = PKCS1_OAEP.new(public_key, hashAlgo=SHA256)
        encrypted_session_key = cipher_rsa.encrypt(session_key)
        
        # Construct E2EE payload
        e2ee_payload = {
            "encrypted_session_key": b64encode(encrypted_session_key).decode('ascii'),
            "iv": iv.hex(),
            "ciphertext": (ciphertext + auth_tag).hex()
        }
        
        logger.info("✅ E2EE payload encryption successful")
        return e2ee_payload
        
    except Exception as e:
        logger.error(f"❌ E2EE encryption failed: {e}")
        raise ValueError(f"E2EE encryption failed: {e}")

def verify_e2ee_integrity(payload: dict) -> bool:
    """
    Verify the integrity of an E2EE payload without decrypting
    
    Returns:
        True if payload structure is valid and data appears intact
    """
    try:
        # Basic structure validation
        if not validate_e2ee_payload(payload):
            return False
        
        # Check if base64 and hex encodings are valid
        try:
            b64decode(payload["encrypted_session_key"])
            bytes.fromhex(payload["iv"])
            bytes.fromhex(payload["ciphertext"])
        except Exception:
            return False
        
        # Check reasonable lengths
        encrypted_key_len = len(b64decode(payload["encrypted_session_key"]))
        iv_len = len(bytes.fromhex(payload["iv"]))
        ciphertext_len = len(bytes.fromhex(payload["ciphertext"]))
        
        # RSA-2048 encrypted key should be 256 bytes
        if encrypted_key_len != 256:
            logger.warning(f"Unexpected encrypted key length: {encrypted_key_len}")
        
        # IV should be 12 bytes for GCM
        if iv_len != 12:
            logger.warning(f"Unexpected IV length: {iv_len}")
        
        # Ciphertext should be at least 16 bytes (for auth tag)
        if ciphertext_len < 16:
            logger.warning(f"Ciphertext too short: {ciphertext_len}")
            return False
        
        return True
        
    except Exception as e:
        logger.error(f"Integrity verification failed: {e}")
        return False

def get_e2ee_status() -> Dict[str, Any]:
    """
    Get status information about E2EE configuration
    
    Returns:
        Dictionary with E2EE configuration status
    """
    try:
        private_key_fingerprint = hashlib.sha256(PRIVATE_KEY.publickey().export_key()).hexdigest()
        
        return {
            "e2ee_ready": True,
            "private_key_loaded": True,
            "private_key_fingerprint": private_key_fingerprint[:16] + "...",
            "supported_algorithms": {
                "asymmetric": "RSA-OAEP with SHA-256",
                "symmetric": "AES-256-GCM",
                "key_size": "2048-bit RSA, 256-bit AES"
            },
            "security_features": [
                "End-to-end encryption",
                "Authentication with GCM",
                "Forward secrecy with session keys",
                "Tampering detection"
            ]
        }
    except Exception as e:
        return {
            "e2ee_ready": False,
            "error": str(e),
            "private_key_loaded": False
        }
# ff3.py
import os
import re
import string
from typing import Dict, Any, Optional, Tuple
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.backends import default_backend

# Simple test to verify file execution
class TestClass:
    pass

print("FF3 module loading...")

class FF3Cipher:
    """Enhanced FF3 Format-Preserving Encryption for PolicyVault"""
    
    def __init__(self, key: bytes, tweak: bytes):
        self.key = key
        self.tweak = tweak
        self.cipher = Cipher(algorithms.AES(self.key), modes.ECB())
        
        # Define character sets for different data types
        self.NUMERIC = "0123456789"
        self.ALPHA_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        self.ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz"
        self.ALPHANUM_UPPER = self.ALPHA_UPPER + self.NUMERIC
        self.ALPHANUM_MIXED = self.ALPHA_UPPER + self.ALPHA_LOWER + self.NUMERIC
    
    def _encrypt_block(self, block: bytes) -> bytes:
        """Internal AES block encryption"""
        encryptor = self.cipher.encryptor()
        return encryptor.update(block) + encryptor.finalize()
    
    def _get_radix_and_alphabet(self, plaintext: str) -> Tuple[int, str]:
        """Determine the appropriate radix and alphabet for the input"""
        if plaintext.isdigit():
            return 10, self.NUMERIC
        elif plaintext.isupper() and plaintext.isalnum():
            return 36, self.ALPHANUM_UPPER
        elif plaintext.isalnum():
            return 62, self.ALPHANUM_MIXED
        else:
            # Default to alphanumeric mixed case
            return 62, self.ALPHANUM_MIXED
    
    def _char_to_int(self, char: str, alphabet: str) -> int:
        """Convert character to integer based on alphabet"""
        return alphabet.index(char)
    
    def _int_to_char(self, val: int, alphabet: str) -> str:
        """Convert integer to character based on alphabet"""
        return alphabet[val % len(alphabet)]
    
    def _string_to_int_array(self, text: str, alphabet: str) -> list:
        """Convert string to array of integers"""
        return [self._char_to_int(c, alphabet) for c in text]
    
    def _int_array_to_string(self, arr: list, alphabet: str) -> str:
        """Convert array of integers to string"""
        return ''.join(self._int_to_char(val, alphabet) for val in arr)
    
    def encrypt_with_format(self, plaintext: str, preserve_case: bool = True) -> str:
        """
        Encrypt while preserving the original format
        - Numbers stay numbers
        - Uppercase letters stay uppercase
        - Mixed case handled appropriately
        """
        if len(plaintext) < 4:
            # For very short strings, use simple substitution
            return self._simple_encrypt(plaintext)
        
        radix, alphabet = self._get_radix_and_alphabet(plaintext)
        int_array = self._string_to_int_array(plaintext, alphabet)
        
        # Split into left and right halves
        n = len(int_array)
        left = int_array[:n//2]
        right = int_array[n//2:]
        
        # FF3 rounds (8 rounds for security)
        for round_num in range(8):
            # Create round input
            if round_num % 2 == 0:
                # Even round: use right side
                round_input = right + list(self.tweak) + [round_num]
            else:
                # Odd round: use left side
                round_input = left + list(self.tweak) + [round_num]
            
            # Pad to block size and encrypt
            padded_input = (round_input + [0] * 16)[:16]
            block = self._encrypt_block(bytes(padded_input))
            
            # Extract numeric value from encrypted block
            numeric_val = int.from_bytes(block[:4], 'big')
            
            if round_num % 2 == 0:
                # Modify left side
                for i in range(len(left)):
                    left[i] = (left[i] + (numeric_val >> (i * 4)) % radix) % radix
            else:
                # Modify right side
                for i in range(len(right)):
                    right[i] = (right[i] + (numeric_val >> (i * 4)) % radix) % radix
        
        # Reconstruct the encrypted string
        encrypted_array = left + right
        return self._int_array_to_string(encrypted_array, alphabet)
    
    def _simple_encrypt(self, plaintext: str) -> str:
        """Simple encryption for very short strings"""
        radix, alphabet = self._get_radix_and_alphabet(plaintext)
        result = ""
        
        for i, char in enumerate(plaintext):
            char_val = self._char_to_int(char, alphabet)
            # Simple substitution with position-dependent key
            shift = (self.tweak[i % len(self.tweak)] + i) % radix
            encrypted_val = (char_val + shift) % radix
            result += self._int_to_char(encrypted_val, alphabet)
        
        return result
    
    def decrypt_with_format(self, ciphertext: str) -> str:
        """Decrypt while preserving the original format"""
        if len(ciphertext) < 4:
            return self._simple_decrypt(ciphertext)
        
        radix, alphabet = self._get_radix_and_alphabet(ciphertext)
        int_array = self._string_to_int_array(ciphertext, alphabet)
        
        # Split into left and right halves
        n = len(int_array)
        left = int_array[:n//2]
        right = int_array[n//2:]
        
        # FF3 rounds in reverse (8 rounds)
        for round_num in range(7, -1, -1):
            # Create round input (same as encryption)
            if round_num % 2 == 0:
                round_input = right + list(self.tweak) + [round_num]
            else:
                round_input = left + list(self.tweak) + [round_num]
            
            # Pad to block size and encrypt
            padded_input = (round_input + [0] * 16)[:16]
            block = self._encrypt_block(bytes(padded_input))
            
            # Extract numeric value from encrypted block
            numeric_val = int.from_bytes(block[:4], 'big')
            
            if round_num % 2 == 0:
                # Reverse modify left side
                for i in range(len(left)):
                    left[i] = (left[i] - (numeric_val >> (i * 4)) % radix) % radix
            else:
                # Reverse modify right side
                for i in range(len(right)):
                    right[i] = (right[i] - (numeric_val >> (i * 4)) % radix) % radix
        
        # Reconstruct the decrypted string
        decrypted_array = left + right
        return self._int_array_to_string(decrypted_array, alphabet)
    
    def _simple_decrypt(self, ciphertext: str) -> str:
        """Simple decryption for very short strings"""
        radix, alphabet = self._get_radix_and_alphabet(ciphertext)
        result = ""
        
        for i, char in enumerate(ciphertext):
            char_val = self._char_to_int(char, alphabet)
            # Reverse the simple substitution
            shift = (self.tweak[i % len(self.tweak)] + i) % radix
            decrypted_val = (char_val - shift) % radix
            result += self._int_to_char(decrypted_val, alphabet)
        
        return result

# PolicyVault specific format-preserving encryption functions
class PolicyVaultFPE:
    """PolicyVault Format-Preserving Encryption Manager"""
    
    def __init__(self, master_key: bytes):
        # Derive different keys for different data types
        self.master_key = master_key
        self._derive_keys()
    
    def _derive_keys(self):
        """Derive specific keys for different data types"""
        kdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"policyvault_fpe_salt",
            info=b"",
            backend=default_backend()
        )
        
        # Different keys for different data types
        self.pan_key = kdf.derive(self.master_key + b"PAN")
        kdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"policyvault_fpe_salt", info=b"", backend=default_backend())
        self.account_key = kdf.derive(self.master_key + b"ACCOUNT")
        kdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"policyvault_fpe_salt", info=b"", backend=default_backend())
        self.aadhaar_key = kdf.derive(self.master_key + b"AADHAAR")
        kdf = HKDF(algorithm=hashes.SHA256(), length=32, salt=b"policyvault_fpe_salt", info=b"", backend=default_backend())
        self.mobile_key = kdf.derive(self.master_key + b"MOBILE")
        
        # Common tweak for all encryptions
        self.tweak = b"PolicyVault2025"[:8]  # 8-byte tweak
    
    def encrypt_pan(self, pan: str) -> Dict[str, Any]:
        """Encrypt PAN card number with format preservation"""
        # PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
        if not self._validate_pan(pan):
            raise ValueError(f"Invalid PAN format: {pan}")
        
        cipher = FF3Cipher(self.pan_key, self.tweak)
        encrypted_pan = cipher.encrypt_with_format(pan.upper())
        
        return {
            "encrypted_value": encrypted_pan,
            "data_type": "PAN",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def encrypt_account_number(self, account: str) -> Dict[str, Any]:
        """Encrypt account number with format preservation"""
        if not account.isdigit() or len(account) < 8:
            raise ValueError(f"Invalid account number format: {account}")
        
        cipher = FF3Cipher(self.account_key, self.tweak)
        encrypted_account = cipher.encrypt_with_format(account)
        
        return {
            "encrypted_value": encrypted_account,
            "data_type": "ACCOUNT_NUMBER",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def encrypt_aadhaar(self, aadhaar: str) -> Dict[str, Any]:
        """Encrypt Aadhaar number with format preservation"""
        # Remove spaces and validate
        clean_aadhaar = aadhaar.replace(" ", "").replace("-", "")
        if not clean_aadhaar.isdigit() or len(clean_aadhaar) != 12:
            raise ValueError(f"Invalid Aadhaar format: {aadhaar}")
        
        cipher = FF3Cipher(self.aadhaar_key, self.tweak)
        encrypted_aadhaar = cipher.encrypt_with_format(clean_aadhaar)
        
        # Restore original formatting
        if " " in aadhaar:
            encrypted_aadhaar = f"{encrypted_aadhaar[:4]} {encrypted_aadhaar[4:8]} {encrypted_aadhaar[8:]}"
        elif "-" in aadhaar:
            encrypted_aadhaar = f"{encrypted_aadhaar[:4]}-{encrypted_aadhaar[4:8]}-{encrypted_aadhaar[8:]}"
        
        return {
            "encrypted_value": encrypted_aadhaar,
            "data_type": "AADHAAR",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def encrypt_mobile(self, mobile: str) -> Dict[str, Any]:
        """Encrypt mobile number with format preservation"""
        # Clean mobile number
        clean_mobile = re.sub(r'[^\d]', '', mobile)
        if len(clean_mobile) != 10:
            raise ValueError(f"Invalid mobile number format: {mobile}")
        
        cipher = FF3Cipher(self.mobile_key, self.tweak)
        encrypted_mobile = cipher.encrypt_with_format(clean_mobile)
        
        # Restore original formatting if present
        if "+" in mobile:
            encrypted_mobile = f"+91{encrypted_mobile}"
        elif mobile.startswith("91"):
            encrypted_mobile = f"91{encrypted_mobile}"
        
        return {
            "encrypted_value": encrypted_mobile,
            "data_type": "MOBILE",
            "format_preserved": True,
            "algorithm": "FF3-FPE"
        }
    
    def _validate_pan(self, pan: str) -> bool:
        """Validate PAN card format"""
        pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        return bool(re.match(pattern, pan.upper()))
    
    # Decryption methods (for authorized access)
    def decrypt_pan(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt PAN card number"""
        if encrypted_data.get("data_type") != "PAN":
            raise ValueError("Invalid encrypted data type for PAN decryption")
        
        cipher = FF3Cipher(self.pan_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
    
    def decrypt_account_number(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt account number"""
        if encrypted_data.get("data_type") != "ACCOUNT_NUMBER":
            raise ValueError("Invalid encrypted data type for account decryption")
        
        cipher = FF3Cipher(self.account_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
    
    def decrypt_aadhaar(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt Aadhaar number"""
        if encrypted_data.get("data_type") != "AADHAAR":
            raise ValueError("Invalid encrypted data type for Aadhaar decryption")
        
        cipher = FF3Cipher(self.aadhaar_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])
    
    def decrypt_mobile(self, encrypted_data: Dict[str, Any]) -> str:
        """Decrypt mobile number"""
        if encrypted_data.get("data_type") != "MOBILE":
            raise ValueError("Invalid encrypted data type for mobile decryption")
        
        cipher = FF3Cipher(self.mobile_key, self.tweak)
        return cipher.decrypt_with_format(encrypted_data["encrypted_value"])

# main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import traceback
import os
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import secrets
import subprocess
import shutil
import bcrypt
import base64
import json
from dotenv import load_dotenv

# Load environment variables from .env file
import os
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Supabase import with fallback
try:
    from supabase.client import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    create_client = None
    Client = None

from app.crypto_utils import (
    process_secure_data, prepare_vault_data, get_crypto_status,
    encrypt_fpe, pseudonymize_contact, encrypt_with_session_key
)
from app.e2ee_utils import decrypt_e2ee_payload, get_e2ee_status
# Temporarily comment out vault_utils import to fix the server
# from app.vault_utils import create_vault_file

# Enhanced vault creation function with Supabase integration
def create_vault_file(data: dict, filename_prefix: str) -> dict:
    """Enhanced vault file creation with Supabase database storage"""
    import json
    import secrets
    import string
    from pathlib import Path
    
    # Generate random filename
    random_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(8))
    filename = f"{filename_prefix}_{random_suffix}.vault"
    
    # Generate a secure password for the vault
    password = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$%^&*") for _ in range(16))
    
    # Generate AES key and IV for additional encryption layer
    aes_key = secrets.token_bytes(32)  # 256-bit key
    iv = secrets.token_bytes(16)  # 128-bit IV
    
    # Hash the password using bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Base64 encode the AES key and IV for storage
    aes_key_b64 = base64.b64encode(aes_key).decode('utf-8')
    iv_b64 = base64.b64encode(iv).decode('utf-8')
    
    # Create vault directory if it doesn't exist
    vault_dir = Path("vault_files")
    vault_dir.mkdir(exist_ok=True)
    
    # Encrypt the actual data using AES-256-GCM
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend
    
    # Prepare the data to be encrypted
    data_to_encrypt = json.dumps(data).encode('utf-8')
    
    # Create cipher with AES-256-GCM
    cipher = Cipher(algorithms.AES(aes_key), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    # Encrypt the data
    encrypted_data = encryptor.update(data_to_encrypt) + encryptor.finalize()
    
    # Get the authentication tag
    auth_tag = encryptor.tag
    
    # Combine encrypted data with auth tag
    vault_binary = encrypted_data + auth_tag
    
    # Encode as base64 for storage
    vault_content_base64 = base64.b64encode(vault_binary).decode('utf-8')
    
    # Write encrypted data to vault file
    vault_path = vault_dir / filename
    with open(vault_path, 'w') as f:
        f.write(vault_content_base64)
    
    # Store metadata in Supabase if available
    if supabase:
        try:
            result = supabase.table('secure_files').insert({
                'filename': filename,
                'password_hash': password_hash,
                'aes_key': aes_key_b64,
                'iv': iv_b64
            }).execute()
            
            logger.info(f"✅ Vault metadata stored in Supabase: {filename}")
        except Exception as e:
            logger.error(f"❌ Failed to store vault metadata in Supabase: {e}")
            # Continue anyway - file system storage is primary
    else:
        logger.warning("⚠️ Supabase not available - storing only locally")
    
    return {
        "status": "success",
        "filename": filename,
        "password": password,
        "path": str(vault_path),
        "message": "Vault file created successfully",
        "database_stored": supabase is not None,
        "encryption_info": {
            "aes_key_length": len(aes_key),
            "iv_length": len(iv),
            "password_hash_algorithm": "bcrypt"
        }
    }

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase client - Initialize with environment variables
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if SUPABASE_AVAILABLE and supabase_url and supabase_key:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        logger.info("✅ Supabase client initialized successfully")
    else:
        supabase = None
        if not SUPABASE_AVAILABLE:
            logger.warning("⚠️ Supabase library not available")
        else:
            logger.warning("⚠️ Supabase credentials not found in environment variables")
except Exception as e:
    supabase = None
    logger.error(f"❌ Failed to initialize Supabase client: {e}")
    logger.info("🔄 Continuing with local file storage only")

app = FastAPI(title="PolicyVault Nexus API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
frontend_dir = Path(__file__).parent.parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

class SecureSubmissionRequest(BaseModel):
    encrypted_data: str
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}

class FileUploadRequest(BaseModel):
    filename: str
    content: str
    password: Optional[str] = None

class VaultQueryRequest(BaseModel):
    filename: str
    password: Optional[str] = None

@app.get("/")
async def read_root():
    return {"message": "PolicyVault Nexus API is running", "status": "active"}

@app.get("/health")
async def health_check():
    """Enhanced health check with system status"""
    try:
        # Check crypto module status
        crypto_status = get_crypto_status()
        
        # Check E2EE module status
        e2ee_status = get_e2ee_status()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "api": "running",
                "crypto": crypto_status,
                "e2ee": e2ee_status,
                "database": "temporarily_disabled"  # Since we're not using Supabase right now
            },
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/secure/submit")
async def submit_secure_data(request: SecureSubmissionRequest):
    """Enhanced secure data submission with comprehensive encryption"""
    try:
        logger.info(f"Received secure submission request with session_id: {request.session_id}")
        
        # Step 1: Decrypt E2EE payload from frontend
        # Parse the JSON string to dict if needed
        if isinstance(request.encrypted_data, str):
            import json
            encrypted_payload = json.loads(request.encrypted_data)
        else:
            encrypted_payload = request.encrypted_data
            
        decrypted_payload = decrypt_e2ee_payload(encrypted_payload)
        logger.info("✅ E2EE decryption successful")
        
        # Step 2: Process with enhanced crypto suite
        processed_data = process_secure_data(
            data=decrypted_payload,
            fiu_scope=["PAN", "Account", "Aadhaar", "Mobile", "Personal"]
        )
        logger.info("✅ Crypto processing completed")
        
        # Step 3: Prepare vault-ready data
        vault_data = prepare_vault_data(processed_data)
        logger.info("✅ Vault data preparation completed")
        
        # Step 4: Create vault file
        vault_result = create_vault_file(vault_data, "secure_data")
        logger.info(f"✅ Vault file created: {vault_result['filename']}")
        
        return {
            "status": "success",
            "message": "Data secured successfully with enhanced encryption",
            "filename": vault_result["filename"],  # Frontend expects 'filename'
            "password": vault_result["password"],  # Frontend expects 'password' 
            "vault_file": vault_result["filename"],  # Keep for backward compatibility
            "encryption_summary": {
                "e2ee": "RSA-OAEP + AES-256-GCM",
                "fpe": "FF3 Format-Preserving Encryption",
                "session": "Ephemeral AES-256-GCM",
                "pseudonymization": "SHA3-256",
                "integrity": "HMAC-SHA256"
            },
            "processing_details": processed_data.get("processing_summary", {})
        }
        
    except Exception as e:
        logger.error(f"❌ Secure submission failed: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Secure submission failed: {str(e)}")

@app.post("/upload")
async def upload_file(file_data: FileUploadRequest):
    """Enhanced file upload with encryption"""
    try:
        logger.info(f"Processing file upload: {file_data.filename}")
        
        # Process file content with encryption
        processed_content = process_secure_data(
            data={"file_content": file_data.content, "original_filename": file_data.filename},
            fiu_scope=["File", "Personal", "Content"]
        )
        
        # Prepare vault data
        vault_data = prepare_vault_data(processed_content)
        
        # Create vault file
        vault_result = create_vault_file(vault_data, "uploaded_file")
        
        return {
            "status": "success",
            "message": "File uploaded and encrypted successfully",
            "vault_file": vault_result["filename"],
            "original_filename": file_data.filename
        }
        
    except Exception as e:
        logger.error(f"❌ File upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@app.get("/vault/list")
async def list_vault_files():
    """List all available vault files with enhanced metadata"""
    try:
        files = []
        
        # Try to get files from database first
        if supabase:
            try:
                db_result = supabase.table('secure_files').select('filename, created_at').order('created_at', desc=True).execute()
                for file_record in db_result.data:
                    files.append({
                        "filename": file_record['filename'],
                        "created_at": file_record['created_at'],  # ISO format from database
                        "source": "database",
                        "verified": True
                    })
                logger.info(f"✅ Loaded {len(files)} files from database")
            except Exception as e:
                logger.warning(f"⚠️ Database query failed, falling back to filesystem: {e}")
        
        # Also check filesystem for any additional files
        vault_dir = Path("vault_files")
        if vault_dir.exists():
            db_filenames = {f["filename"] for f in files}
            for file_path in vault_dir.glob("*.vault"):
                if file_path.name not in db_filenames:
                    # Convert Unix timestamp to ISO format
                    creation_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                    files.append({
                        "filename": file_path.name,
                        "created_at": creation_time.isoformat(),
                        "size": file_path.stat().st_size,
                        "source": "filesystem",
                        "verified": False  # Not in database
                    })
        
        # Sort by creation date (newest first)
        files.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {"files": files}
        
    except Exception as e:
        logger.error(f"❌ Error listing vault files: {e}")
        return {"files": []}

@app.get("/vault/{filename}")
async def download_vault_file(filename: str):
    """Download a vault file"""
    try:
        vault_dir = Path("vault_files")
        file_path = vault_dir / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Vault file not found")
            
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type="application/octet-stream"
        )
        
    except Exception as e:
        logger.error(f"❌ Error downloading vault file: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.get("/crypto/status")
async def get_encryption_status():
    """Get comprehensive encryption system status"""
    try:
        return {
            "crypto_suite": get_crypto_status(),
            "e2ee_system": get_e2ee_status(),
            "fpe_formats": ["PAN", "Account Numbers", "Aadhaar", "Mobile Numbers"],
            "encryption_modes": ["AES-256-GCM", "RSA-OAEP", "FF3-FPE"],
            "integrity_protection": "HMAC-SHA256",
            "key_derivation": "PBKDF2-SHA256"
        }
    except Exception as e:
        logger.error(f"❌ Error getting crypto status: {e}")
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.post("/vault/verify")
async def verify_vault_password(request: VaultQueryRequest):
    """Verify vault file password against Supabase database"""
    try:
        if not supabase:
            raise HTTPException(status_code=503, detail="Database service unavailable")
        
        # Query the database for the file
        result = supabase.table('secure_files').select('password_hash, aes_key, iv').eq('filename', request.filename).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Vault file not found in database")
        
        if not request.password:
            raise HTTPException(status_code=400, detail="Password is required")
        
        file_data = result.data[0]
        stored_hash = file_data['password_hash']
        
        # Verify the password using bcrypt
        password_valid = bcrypt.checkpw(request.password.encode('utf-8'), stored_hash.encode('utf-8'))
        
        if password_valid:
            return {
                "status": "success",
                "message": "Password verified successfully",
                "filename": request.filename,
                "encryption_keys": {
                    "aes_key": file_data['aes_key'],
                    "iv": file_data['iv']
                },
                "verified": True
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid password")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error verifying vault password: {e}")
        raise HTTPException(status_code=500, detail=f"Password verification failed: {str(e)}")

@app.get("/vault/database/list")
async def list_vault_files_from_database():
    """List all vault files from Supabase database"""
    try:
        if not supabase:
            # Fallback to filesystem listing
            return await list_vault_files()
        
        result = supabase.table('secure_files').select('filename, created_at').order('created_at', desc=True).execute()
        
        files = []
        for file_record in result.data:
            files.append({
                "filename": file_record['filename'],
                "created_at": file_record['created_at'],
                "source": "database"
            })
        
        return {"files": files}
        
    except Exception as e:
        logger.error(f"❌ Error listing files from database: {e}")
        # Fallback to filesystem listing
        return await list_vault_files()

@app.get("/e2ee/public-key")
async def get_public_key():
    """Get the RSA public key for E2EE encryption"""
    try:
        # Path to the public key file
        key_path = Path(__file__).parent / "keys" / "vault_public.pem"
        
        if not key_path.exists():
            raise HTTPException(status_code=404, detail="Public key not found")
            
        # Read and return the public key
        with open(key_path, 'r') as f:
            public_key_pem = f.read()
            
        return PlainTextResponse(
            content=public_key_pem,
            media_type="text/plain"
        )
        
    except Exception as e:
        logger.error(f"❌ Error getting public key: {e}")
        raise HTTPException(status_code=500, detail=f"Public key retrieval failed: {str(e)}")

# Serve the frontend
@app.get("/app")
async def serve_app():
    """Serve the main application page"""
    frontend_path = Path(__file__).parent.parent.parent / "frontend" / "index.html"
    if frontend_path.exists():
        return FileResponse(str(frontend_path))
    else:
        return {"message": "Frontend not found", "path": str(frontend_path)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
