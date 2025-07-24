#!/usr/bin/env python3
"""
Simple server startup script
"""
import sys
import os
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(current_dir))

# Change to backend directory
os.chdir(current_dir)
print(f"Working directory: {os.getcwd()}")

# Import and start the app
if __name__ == "__main__":
    try:
        from app.main import app
        import uvicorn
        
        print("🚀 Starting PolicyVault server...")
        print("🌐 Server: http://127.0.0.1:8000")
        print("📄 Frontend: http://127.0.0.1:8000/")
        
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure all required packages are installed")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)
