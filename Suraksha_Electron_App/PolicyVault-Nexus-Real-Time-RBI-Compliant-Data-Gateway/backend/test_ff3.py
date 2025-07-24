#!/usr/bin/env python3
import sys
import traceback

try:
    from app.ff3 import PolicyVaultFPE
    print("✅ Import successful")
    print("PolicyVaultFPE class available")
except Exception as e:
    print(f"❌ Import failed: {e}")
    traceback.print_exc()

try:    
    exec(open('app/ff3.py').read())
    print("✅ Direct execution successful")
    if 'PolicyVaultFPE' in locals():
        print("✅ PolicyVaultFPE found in locals")
    else:
        print("❌ PolicyVaultFPE not found in locals")
        print("Available symbols:", [x for x in locals() if not x.startswith('__')])
except Exception as e:
    print(f"❌ Direct execution failed: {e}")
    traceback.print_exc()
