#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(__file__))

# Set environment variables
os.environ['PYTHONPATH'] = os.path.dirname(__file__)

# Import the create_vault_file function
from app.main import create_vault_file

# Test data
test_data = {
    "name": "John Test",
    "email": "john.test@example.com",
    "phone": "+919876543210",
    "pan": "ABCDE1234F",
    "aadhaar": "123456789012",
    "account": "123456789"
}

print("Testing vault creation with proper encryption...")

# Create vault
result = create_vault_file(test_data, "test_encrypted")

print("Vault creation result:")
print(f"Status: {result['status']}")
print(f"Filename: {result['filename']}")
print(f"Password: {result['password']}")
print(f"Path: {result['path']}")

# Read and display the vault file
vault_path = result['path']
print(f"\nReading vault file: {vault_path}")

with open(vault_path, 'r') as f:
    content = f.read()
    
print(f"Vault content length: {len(content)} characters")
print(f"Content preview (first 100 chars): {content[:100]}")

# Check if it's base64 encoded binary data
try:
    import base64
    decoded = base64.b64decode(content)
    print(f"✅ Successfully decoded as base64, binary length: {len(decoded)} bytes")
    print(f"Binary preview (first 20 bytes): {decoded[:20].hex()}")
except Exception as e:
    print(f"❌ Not valid base64: {e}")
