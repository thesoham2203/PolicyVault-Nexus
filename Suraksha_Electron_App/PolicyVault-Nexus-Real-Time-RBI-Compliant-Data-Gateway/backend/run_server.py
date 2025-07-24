#!/usr/bin/env python3
"""
Direct runner for the PolicyVault backend
"""
import sys
import os

# Change to the backend directory so relative paths work
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
sys.path.append(backend_dir)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
