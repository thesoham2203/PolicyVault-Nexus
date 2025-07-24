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
import argon2
from dotenv import load_dotenv
import supabase

# Load environment variables from .env file
import os
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# Supabase import with fallback
# try:
#     from supabase.client import create_client, Client
#     SUPABASE_AVAILABLE = True
# except ImportError:
#     SUPABASE_AVAILABLE = False
#     create_client = None
#     Client = None

supabase_client = supabase.create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

from crypto_utils import (
    process_secure_data, prepare_vault_data, get_crypto_status,
    encrypt_fpe, pseudonymize_contact, encrypt_with_session_key
)
from e2ee_utils import decrypt_e2ee_payload, get_e2ee_status
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
    print(password)
    # Generate AES key and IV for additional encryption layer
    aes_key = secrets.token_bytes(32)  # 256-bit key
    iv = secrets.token_bytes(12)  # 128-bit IV
    
    # Hash the password using bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    # password_hash = argon2.hash(password)
    # Base64 encode the AES key and IV for storage
    aes_key_b64 = base64.b64encode(aes_key).decode('utf-8')
    iv_b64 = base64.b64encode(iv).decode('utf-8')
    
    # Create vault directory if it doesn't exist
    # vault_dir = Path("vault_files")
    # vault_dir.mkdir(exist_ok=True)
    
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
    # vault_binary = iv + encrypted_data + auth_tag 

    # Encode as base64 for storage
    vault_content_base64 = base64.b64encode(vault_binary).decode('utf-8')

    
    # Write encrypted data to vault file
    vault_path = f"vault_files/{filename}"
    with open(vault_path, 'w') as f:
        f.write(vault_content_base64)
    
    # Store metadata in Supabase if available
    if supabase:
        try:
            # Upload encrypted data directly to Supabase Storage
            # upload_result = supabase_client.storage \
            # .from_('vault') \
            # .upload(vault_path, vault_binary)
            upload_result = supabase_client.storage \
                .from_('vault') \
                .upload(
                    vault_path, 
                    vault_content_base64.encode('utf-8'),  # Upload as bytes
                    {'content-type': 'text/plain'}
                )
        
            if not upload_result:
                raise Exception("Failed to upload to Supabase Storage")
            
            # Get public URL for the file
            file_url = supabase_client.storage \
                .from_('vault') \
                .get_public_url(vault_path)
            
            result2 = supabase_client.table('secure_password').insert({
                'password': password,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).execute()

            insert_id = result2.data[0]['id']

            # current_password = supabase_client.table("secure_password") \
            # .select("*") \
            # .order("updated_at", desc=True) \
            # .limit(1) \
            # .execute()
            
            result = supabase_client.table('secure_files').insert({
                'filename': filename,
                'password_hash': password_hash,
                'aes_key': aes_key_b64,
                'iv': iv_b64,
                "file_url": file_url,
                "pass_id": insert_id
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
        "insert_id": insert_id,
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
# try:
#     supabase_url = os.getenv("SUPABASE_URL")
#     supabase_key = os.getenv("SUPABASE_KEY")
    
#     if SUPABASE_AVAILABLE and supabase_url and supabase_key:
#         # Create Supabase client
#         supabase = create_client(supabase_url, supabase_key)
#         logger.info("✅ Supabase client initialized successfully")
#     else:
#         supabase = None
#         if not SUPABASE_AVAILABLE:
#             logger.warning("⚠️ Supabase library not available")
#         else:
#             logger.warning("⚠️ Supabase credentials not found in environment variables")
# except Exception as e:
#     supabase = None
#     logger.error(f"❌ Failed to initialize Supabase client: {e}")
#     logger.info("🔄 Continuing with local file storage only")

app = FastAPI(title="PolicyVault Nexus API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# here the input is taking

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

# @app.post("/vault/create")
# async def create_vault(data: dict):
#     """Create vault from approved data fields"""
#     try:
#         # Extract from request
#         consent_id = data.get("consent_id")
#         approved_fields = data.get("approved_fields", [])
        
#         # Fetch account data from database
#         account_data = create_client.table("accounts")\
#             .select("*")\
#             .eq("c_id", data.get("c_id"))\
#             .execute()
        
#         # Prepare vault data structure
#         vault_data = {
#             "consent_id": consent_id,
#             "shared_data": {},
#             "metadata": {
#                 "generated_at": datetime.now().isoformat(),
#                 "fields_shared": [f["name"] for f in approved_fields]
#             }
#         }
        
#         # Populate with actual values
#         for field in approved_fields:
#             field_name = field["name"].lower()
#             if account_data.data and field_name in account_data.data[0]:
#                 vault_data["shared_data"][field["name"]] = account_data.data[0][field_name]
#             else:
#                 vault_data["shared_data"][field["name"]] = field.get("manual_value", "NOT_PROVIDED")
        
#         # Create vault file
#         vault_result = create_vault_file(vault_data, f"consent_{consent_id}")
        
#         return vault_result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/vault/create")
# async def create_vault(data: dict):
#     """Create vault from approved data fields"""
#     try:
#         logger.info(f"Received vault creation request: {data.keys()}")
        
#         # Extract from request
#         consent_id = data.get("consent_id")
#         approved_fields = data.get("approved_fields", [])
#         customer_id = data.get("customer_id")
        
#         if not all([consent_id, approved_fields, customer_id]):
#             raise HTTPException(status_code=400, detail="Missing required fields")
        
#         # Fetch account data from database
#         account_response = supabase_client.table("accounts")\
#             .select("*")\
#             .eq("customer_id", customer_id)\
#             .execute()
        
#         if not account_response.data:
#             raise HTTPException(status_code=404, detail="Account not found")
        
#         account_data = account_response.data[0]
        
#         # Prepare vault data structure
#         vault_data = {
#             "consent_id": consent_id,
#             "shared_data": {},
#             "metadata": {
#                 "generated_at": datetime.now().isoformat(),
#                 "fields_shared": [field["name"] for field in approved_fields],
#                 "customer_id": customer_id,
#                 "approved_by": data.get("approved_by", "system")
#             }
#         }
        
#         # Populate with actual values
#         field_mapping = {
#             "account balance": "balance",
#             "credit score": "credit_score",
#             "account details": "account_details",
#             "loan details": "loan_details",
#             "repayment history": "repayment_history",
#             "transaction history": "transaction_history",
#             "salary inflow": "salary_inflow",
#             "insurance info": "insurance_info",
#             "nominee details": "nominee_details",
#             "aadhar number": "aadhaar_number",
#             "pan number": "pan_number",
#             "dob": "dob"
#         }
        
#         for field in approved_fields:
#             field_name = field["name"].lower()
#             db_field = field_mapping.get(field_name)
            
#             if db_field and db_field in account_data:
#                 vault_data["shared_data"][field["name"]] = account_data[db_field]
#             else:
#                 vault_data["shared_data"][field["name"]] = field.get("manual_value", "NOT_PROVIDED")
        
#         # Create vault file
#         vault_result = create_vault_file(vault_data, f"consent_{consent_id}")
        
#         return vault_result
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Vault creation failed: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Vault creation failed: {str(e)}")



@app.post("/vault/create")
async def create_vault(data: dict):
    """Create vault from approved data fields"""
    try:
        logger.info(f"Received vault creation request: {data.keys()}")
        
        # Extract from request
        consent_id = data.get("consent_id")
        approved_fields = data.get("approved_fields", {})  # Changed to dict as default
        customer_id = data.get("customer_id")
        
        if not all([consent_id, approved_fields, customer_id]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Fetch account data from database
        account_response = supabase_client.table("accounts")\
            .select("*")\
            .eq("customer_id", customer_id)\
            .execute()
        
        if not account_response.data:
            raise HTTPException(status_code=404, detail="Account not found")
        
        account_data = account_response.data[0]
        
        # Prepare vault data structure
        vault_data = {
            "consent_id": consent_id,
            "shared_data": {},
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "fields_shared": list(approved_fields.keys()),  # Get field names from dict keys
                "customer_id": customer_id,
                "approved_by": data.get("approved_by", "system")
            }
        }
        
        # Field mapping
        field_mapping = {
            "account balance": "balance",
            "credit score": "credit_score",
            "account details": "account_details",
            "loan details": "loan_details",
            "repayment history": "repayment_history",
            "transaction history": "transaction_history",
            "salary inflow": "salary_inflow",
            "insurance info": "insurance_info",
            "nominee details": "nominee_details",
            "aadhar number": "aadhaar_number",
            "pan number": "pan_number",
            "dob": "dob"
        }
        
        # Populate with actual values
        for field_name, field_value in approved_fields.items():  # Iterate dict items
            db_field = field_mapping.get(field_name.lower())
            
            if db_field and db_field in account_data:
                vault_data["shared_data"][field_name] = account_data[db_field]
            else:
                vault_data["shared_data"][field_name] = field_value or "NOT_PROVIDED"
        
        # Create vault file
        vault_result = create_vault_file(vault_data, f"consent_{consent_id}")
        
        return vault_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vault creation failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Vault creation failed: {str(e)}")

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

# @app.post("/upload")
# async def upload_file(file_data: FileUploadRequest):
#     """Enhanced file upload with encryption"""
#     try:
#         logger.info(f"Processing file upload: {file_data.filename}")
        
#         # Process file content with encryption
#         processed_content = process_secure_data(
#             data={"file_content": file_data.content, "original_filename": file_data.filename},
#             fiu_scope=["File", "Personal", "Content"]
#         )
        
#         # Prepare vault data
#         vault_data = prepare_vault_data(processed_content)
        
#         # Create vault file
#         vault_result = create_vault_file(vault_data, "uploaded_file")
        
#         return {
#             "status": "success",
#             "message": "File uploaded and encrypted successfully",
#             "vault_file": vault_result["filename"],
#             "original_filename": file_data.filename
#         }
        
#     except Exception as e:
#         logger.error(f"❌ File upload failed: {e}")
#         raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# @app.get("/vault/list")
# async def list_vault_files():
#     """List all available vault files with enhanced metadata"""
#     try:
#         files = []
        
#         # Try to get files from database first
#         if supabase:
#             try:
#                 db_result = supabase_client.table('secure_files').select('filename, created_at').order('created_at', desc=True).execute()
#                 for file_record in db_result.data:
#                     files.append({
#                         "filename": file_record['filename'],
#                         "created_at": file_record['created_at'],  # ISO format from database
#                         "source": "database",
#                         "verified": True
#                     })
#                 logger.info(f"✅ Loaded {len(files)} files from database")
#             except Exception as e:
#                 logger.warning(f"⚠️ Database query failed, falling back to filesystem: {e}")
        
#         # Also check filesystem for any additional files
#         vault_dir = Path("vault_files")
#         if vault_dir.exists():
#             db_filenames = {f["filename"] for f in files}
#             for file_path in vault_dir.glob("*.vault"):
#                 if file_path.name not in db_filenames:
#                     # Convert Unix timestamp to ISO format
#                     creation_time = datetime.fromtimestamp(file_path.stat().st_mtime)
#                     files.append({
#                         "filename": file_path.name,
#                         "created_at": creation_time.isoformat(),
#                         "size": file_path.stat().st_size,
#                         "source": "filesystem",
#                         "verified": False  # Not in database
#                     })
        
#         # Sort by creation date (newest first)
#         files.sort(key=lambda x: x["created_at"], reverse=True)
        
#         return {"files": files}
        
#     except Exception as e:
#         logger.error(f"❌ Error listing vault files: {e}")
#         return {"files": []}

# @app.get("/vault/{filename}")
# async def download_vault_file(filename: str):
#     """Download a vault file"""
#     try:
#         vault_dir = Path("vault_files")
#         file_path = vault_dir / filename
        
#         if not file_path.exists():
#             raise HTTPException(status_code=404, detail="Vault file not found")
            
#         return FileResponse(
#             path=str(file_path),
#             filename=filename,
#             media_type="application/octet-stream"
#         )
        
#     except Exception as e:
#         logger.error(f"❌ Error downloading vault file: {e}")
#         raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@app.get("/vault/list")
async def list_vault_files():
    """List all available vault files with enhanced metadata"""
    try:
        files = []
        
        # Try to get files from database first
        if supabase:
            try:
                db_result = supabase_client.table('secure_files').select('filename, created_at').order('created_at', desc=True).execute()
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
        if not supabase_client:
            raise HTTPException(status_code=503, detail="Database service unavailable")
        
        # Query the database for the file
        result = supabase_client.table('secure_files').select('password_hash, aes_key, iv').eq('filename', request.filename).execute()
        
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
        if not supabase_client:
            # Fallback to filesystem listing
            return await list_vault_files()
        
        result = supabase_client.table('secure_files').select('filename, created_at').order('created_at', desc=True).execute()
        
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
    uvicorn.run(app, host="0.0.0.0", port=3000)
