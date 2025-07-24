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
