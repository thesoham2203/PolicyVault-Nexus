#!/usr/bin/env python3
"""
Test script for vault file creation and Supabase integration
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.vault_utils import create_vault_file, verify_vault_file

def test_vault_system():
    """Test the complete vault file system."""
    
    # Test data (similar to what would be encrypted)
    test_data = {
        "data": {
            "aadhaar": "encrypted_aadhaar_123",
            "pan": "encrypted_pan_456", 
            "account": "encrypted_account_789"
        },
        "metadata": {
            "timestamp": "2025-01-20T10:30:00Z",
            "version": "1.0"
        }
    }
    
    print("🔧 Testing vault file creation...")
    
    try:
        # Create vault file
        result = create_vault_file(test_data, "test_vault")
        
        if result["success"]:
            print(f"✅ Vault file created successfully!")
            print(f"📁 File: {result['filename']}")
            print(f"🔑 Password: {result['password']}")
            print(f"📊 Database ID: {result.get('db_id', 'N/A')}")
            
            # Test verification
            print("\n🔍 Testing vault file verification...")
            if verify_vault_file(result['filename'], result['password']):
                print("✅ Vault file verification passed!")
            else:
                print("❌ Vault file verification failed!")
                
        else:
            print(f"❌ Vault creation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting PolicyVault Test Suite...")
    test_vault_system()
    print("\n✨ Test completed!")
