# PolicyVault - Complete Setup Instructions

## 🚀 Project Overview

**PolicyVault** is a secure document management system with advanced encryption features:
- **Backend**: FastAPI REST API with FF3 format-preserving encryption and E2EE
- **Frontend**: Web interface for document creation and management  
- **Electron App**: Desktop application for secure vault file decryption
- **Database**: Supabase integration for metadata and password storage

---

## 📋 Prerequisites

### Required Software
1. **Python 3.10 or later** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 18 or later** - [Download Node.js](https://nodejs.org/)
3. **Git** (optional) - [Download Git](https://git-scm.com/)

### System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: 500MB free space

---

## 🔧 Installation Steps

### Step 1: Extract Project Files
```bash
# Extract the project zip file to your desired location
# Example: C:\Projects\PolicyVault\ or /home/user/PolicyVault/
```

### Step 2: Backend Setup (REST API)

#### Navigate to Backend Directory
```bash
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
```

#### Create Python Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux  
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Install Additional Required Packages
```bash
pip install supabase==1.0.3
pip install uvicorn[standard]
pip install cryptography
```

#### Setup Environment Variables
Create a `.env` file in the backend directory:
```env
# .env file content
AES_256_GCM_KEY_HEX=adc3a230627f6ae9bc2fee551e87c90ef36c94a85870143a95143e95ea19e9dc
CONTACT_SALT=hEuHBktn_q1r6-4q0Pq9Sw==

# Supabase Configuration
SUPABASE_URL=https://pqkkmddkvcvyfnyctyct.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM
```

### Step 3: Electron App Setup

#### Navigate to Electron Directory
```bash
cd ../../../new
# or from project root: cd new
```

#### Install Node.js Dependencies
```bash
npm install
```

#### Setup Electron Environment
Create a `.env` file in the electron directory:
```env
SUPABASE_URL=https://pqkkmddkvcvyfnyctyct.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM
NODE_ENV=production
```

---

## 🚀 Running the Application

### Method 1: Complete System Startup

#### Terminal 1 - Start Backend Server
```bash
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Set Python path and start server
set PYTHONPATH=%cd%  # Windows
# export PYTHONPATH=$(pwd)  # macOS/Linux

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 - Start Electron App
```bash
cd new
npm start
```

### Method 2: Individual Component Testing

#### Backend Only (REST API)
```bash
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
venv\Scripts\activate
set PYTHONPATH=%cd%
python -m uvicorn app.main:app --reload
```

#### Frontend Only (Web Interface)
```bash
# Backend must be running first
# Open browser: http://localhost:8000/app
```

#### Electron App Only
```bash
cd new
npm start
```

---

## 🔗 Application URLs

- **REST API Documentation**: http://localhost:8000/docs
- **Web Interface**: http://localhost:8000/app  
- **API Health Check**: http://localhost:8000/health
- **Vault File Listing**: http://localhost:8000/vault/list

---

## 🧪 Testing the System

### Test 1: Backend Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy", "version": "1.0.0"}
```

### Test 2: Create Encrypted Document
1. Open http://localhost:8000/app
2. Fill in the form with test data
3. Click "Create Secure Document"
4. Download the generated vault file

### Test 3: Decrypt with Electron App
1. Start Electron app (`npm start` in new/ directory)
2. Click "Select Vault File" 
3. Choose a downloaded vault file
4. Enter the password from the web interface
5. Click "Decrypt and Display"

---

## 📂 Project Structure

```
PolicyVault/
├── PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py          # FastAPI application
│   │   │   ├── crypto_utils.py  # Encryption utilities
│   │   │   ├── e2ee_utils.py    # End-to-end encryption
│   │   │   └── ff3.py           # Format-preserving encryption
│   │   ├── vault_files/         # Generated encrypted files
│   │   ├── requirements.txt     # Python dependencies
│   │   └── .env                 # Environment variables
│   └── frontend/
│       ├── index.html           # Web interface
│       └── app.js               # Frontend JavaScript
└── new/
    ├── main.js                  # Electron main process
    ├── preload_minimal.js       # Electron preload script
    ├── renderer/                # Electron UI files
    ├── package.json             # Node.js dependencies
    └── .env                     # Electron environment
```

---

## 🔐 Security Features

### Encryption Methods
- **FF3 Format-Preserving Encryption**: Preserves format of PAN, Aadhaar, phone numbers
- **End-to-End Encryption (E2EE)**: RSA-OAEP + AES-256-GCM from frontend to backend
- **Vault Encryption**: AES-256-GCM with random keys and bcrypt password hashing
- **Database Security**: Encrypted metadata storage in Supabase

### Key Features
- ✅ **RBI Compliant**: Meets regulatory encryption standards
- ✅ **Format Preservation**: Financial data maintains original format
- ✅ **Password Protection**: bcrypt hashing with secure random passwords
- ✅ **Database Integration**: Cloud metadata storage with local fallback
- ✅ **Cross-Platform**: Works on Windows, macOS, and Linux

---

## 🛠 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check Python version
python --version
# Should be 3.10 or later

# Reinstall dependencies
pip install -r requirements.txt
pip install supabase==1.0.3
```

#### Module Import Errors
```bash
# Set Python path correctly
set PYTHONPATH=%cd%  # Windows
export PYTHONPATH=$(pwd)  # macOS/Linux

# Run from correct directory
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
```

#### Electron App Won't Start
```bash
# Check Node.js version
node --version
# Should be 18 or later

# Reinstall node modules
rm -rf node_modules package-lock.json
npm install
```

#### Supabase Connection Issues
- Check `.env` file exists and has correct credentials
- Verify network connection
- System works with local storage if Supabase unavailable

### Log Locations
- **Backend Logs**: Console output from uvicorn command
- **Electron Logs**: Console output from npm start command
- **Browser Logs**: F12 Developer Tools → Console

---

## 🔄 Development Mode

For development and debugging:

#### Backend Development
```bash
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
set PYTHONPATH=%cd%
python -m uvicorn app.main:app --reload --log-level debug
```

#### Electron Development
```bash
cd new
# Edit package.json to set NODE_ENV=development
npm start
```

---

## 📦 Building for Production

### Build Electron App
```bash
cd new
npm run build-win  # Windows
npm run build      # Cross-platform
```

### Deploy Backend
```bash
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
# Set production environment variables
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 📞 Support

For technical support or issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure all environment files are properly configured
4. Check console logs for specific error messages

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**🎉 Setup Complete! Your PolicyVault system is ready for secure document management.**
