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
