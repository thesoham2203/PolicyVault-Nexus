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
