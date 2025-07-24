# 🔐 PolicyVault Nexus

**Real-Time RBI-Compliant Data Gateway for Secure and Responsible Data Sharing in Fintech Environments**

---

## 🔍 Overview

PolicyVault Nexus is a comprehensive zero-persistence data gateway designed for secure financial data sharing in compliance with RBI Account Aggregator (AA) framework, India's DPDP Act, and GDPR regulations. The platform employs advanced cryptographic techniques including FF3-1 tokenization, AES-GCM field-level encryption, and hybrid RSA+AES end-to-end encryption to ensure maximum data protection while enabling seamless fintech operations.

### Key Value Propositions

- **Zero Data Persistence**: No sensitive data stored on servers
- **Real-Time Processing**: Instant data tokenization and encryption
- **Regulatory Compliance**: RBI-AA, DPDP, and GDPR compliant
- **Multi-Layer Security**: FF3-1 + AES-GCM + E2EE hybrid encryption
- **Consent Management**: Granular user consent with audit trails
- **Policy-Based Access**: Open Policy Agent (OPA) integration
- **Comprehensive Auditing**: ELK stack for complete audit logging

---

## 🗂️ Project Structure

```
PolicyVault-Nexus/
├── backend/                          # FastAPI REST API Server
│   ├── app/
│   │   ├── config.py                 # Environment configuration
│   │   ├── main.py                   # FastAPI application entry
│   │   ├── routers/                  # API route handlers
│   │   │   ├── auth.py               # Admin authentication
│   │   │   └── demo.py               # Demo endpoints
│   │   ├── security/                 # Security modules
│   │   │   ├── crypto.py             # Encryption utilities
│   │   │   └── jwt.py                # JWT token management
│   │   ├── ml/                       # Machine learning
│   │   └── utils/                    # Utility functions
│   ├── auth.py                       # User authentication
│   ├── consent_requests.py           # Consent management
│   ├── audit_router.py               # Audit logging
│   ├── supabase_client.py            # Database client
│   └── requirements.txt              # Python dependencies
├── frontend/                         # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/                    # Application pages
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── user-dashboard/       # User interface
│   │   │   ├── fiu-dashboard/        # FIU (Financial Information User)
│   │   │   └── admin-dashboard/      # Admin interface
│   │   └── App.tsx                   # Main application
│   ├── package.json                  # Node.js dependencies
│   └── vite.config.ts                # Vite build configuration
└── Suraksha_Electron_App/            # Desktop Vault Management
    ├── new/                          # Electron application
    │   ├── main.js                   # Electron main process
    │   ├── preload.js                # Secure IPC bridge
    │   └── renderer/                 # Desktop UI
    └── setup.bat/setup.sh             # Installation scripts
```

---

## 🛠️ Setup & Installation

### Prerequisites

- **Python 3.10+** for backend services
- **Node.js 18+** for frontend and Electron app
- **Git** (optional) for repository management

### Quick Start

#### 1. Clone Repository

```bash
git clone <repository-url>
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway-main
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment (.env file already exists)
# Edit .env with your actual credentials if needed
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### 4. Electron App Setup

```bash
cd ../Suraksha_Electron_App/new
npm install
```

### Environment Configuration

Create `.env` files in respective directories:

**Backend (.env)**

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key

# Encryption Keys
AES_256_GCM_KEY_HEX=your_aes_key
JWT_SECRET_KEY=your_jwt_secret

# External Services
OKTA_CLIENT_ID=your_okta_client_id
FINGERPRINTJS_API_KEY=your_fingerprint_api_key
REDIS_URL=redis://localhost:6379
```

---

## 🚀 Usage Instructions

### Starting the System

#### Option 1: Complete System Startup

````bash
# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Electron App
cd ../Suraksha_Electron_App/new
npm start
```#### Option 2: Automated Setup (Windows/Linux)

```bash
# Windows
setup.bat && start_all.bat

# Linux/Mac
./setup.sh && ./start_all.sh
````

### System Verification

After starting all components, verify they're working:

```bash
# 1. Backend API (should return {"msg": "PolicyVault backend running"})
curl http://localhost:8000/

# 2. Frontend (should load React app)
# Open browser: http://localhost:5174

# 3. API Documentation (should show FastAPI docs)
# Open browser: http://localhost:8000/docs

# 4. Electron App (should open desktop application window)
# Should launch automatically with npm start
```

---

````

### API Endpoints

#### Authentication

```bash
# User Login with OTP
POST /auth/send-otp
POST /auth/verify-otp

# Organization Registration
POST /register_org/register
````

#### Consent Management

```bash
# Request Consent
POST /consent/request

# Approve/Deny Consent
POST /consent/approve
POST /consent/deny
```

#### Data Operations

```bash
# Secure Data Submission (E2EE)
POST /api/secure-submit

# Vault File Generation
POST /api/generate-vault
```

### Frontend Interfaces

1. **Landing Page** (`/`) - Public information and login
2. **User Dashboard** (`/user`) - Data consent management
3. **FIU Dashboard** (`/fiu-dashboard`) - Financial institution interface
4. **Admin Dashboard** (`/admin`) - System administration

### Troubleshooting

#### Backend Issues

```bash
# If backend fails to start, ensure correct path:
cd backend  # Should contain main.py directly

# If module import errors occur:
export PYTHONPATH=$(pwd)  # Linux/Mac
set PYTHONPATH=%cd%       # Windows

# If Supabase connection fails:
# Check .env file has correct SUPABASE_URL and SUPABASE_SERVICE_ROLE
```

#### Frontend Issues

```bash
# If frontend fails to start:
cd frontend
npm install  # Reinstall dependencies
npm run dev  # Start development server on port 5174
```

#### Electron Issues

```bash
# If Electron app won't start:
cd ../Suraksha_Electron_App/new  # Correct path from project root
npm install  # Ensure dependencies are installed
npm start
```

---## 🔐 Security & Compliance Features

### Encryption Standards

- **FF3-1 Format-Preserving Encryption**: NIST-approved tokenization for PAN, Aadhaar, account numbers
- **AES-256-GCM**: Military-grade symmetric encryption for sensitive fields
- **RSA-OAEP 2048-bit**: Asymmetric encryption for key exchange
- **Hybrid E2EE**: RSA + AES combination for optimal security and performance

### Authentication & Authorization

- **Multi-Factor Authentication**: OTP + Device fingerprinting
- **JWT with RS256**: Cryptographically signed tokens
- **Device Binding**: FingerprintJS-based device recognition
- **IP Whitelisting**: Geographic and network-based access control
- **Session Management**: Secure cookie-based sessions

### Compliance Controls

- **Consent Artifacts**: Digitally signed consent records
- **Audit Logging**: Comprehensive ELK stack integration
- **Data Minimization**: Field-level access control
- **Right to Erasure**: GDPR-compliant data deletion
- **Breach Detection**: ML-based anomaly detection

### Zero-Persistence Architecture

- **In-Memory Processing**: No sensitive data persists on disk
- **Vault Files**: Encrypted temporary storage with automatic expiry
- **Stateless Design**: No server-side session storage
- **Secure Deletion**: Cryptographic key destruction

---

## 🧱 Technologies Used

### Backend Stack

- **FastAPI** - High-performance Python web framework
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Redis** - In-memory caching and session storage
- **PyOTP** - Time-based OTP generation
- **cryptography** - Advanced cryptographic operations
- **jose** - JWT token handling
- **argon2-cffi** - Password hashing

### Frontend Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tooling
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Desktop Application

- **Electron** - Cross-platform desktop runtime
- **Node.js** - JavaScript runtime
- **Supabase-js** - Database client

### Security & DevOps

- **Open Policy Agent (OPA)** - Policy-based access control
- **ELK Stack** - Elasticsearch, Logstash, Kibana for logging
- **FingerprintJS** - Device identification
- **Okta** - Identity provider integration

### Compliance & Standards

- **RBI Account Aggregator Framework**
- **India DPDP Act 2023**
- **GDPR (EU)**
- **NIST Cryptographic Standards**
- **ISO 27001/27002**

---

## 🙌 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow existing code style and patterns
4. Add comprehensive tests for new features
5. Update documentation as needed
6. Submit pull request with detailed description

### Code Standards

- **Python**: Follow PEP 8, use type hints
- **TypeScript**: Strict mode enabled, ESLint configuration
- **Security**: All user inputs must be validated and sanitized
- **Testing**: Minimum 80% code coverage required

### Security Considerations

- Never commit secrets or API keys
- Use environment variables for configuration
- Implement proper error handling without information leakage
- Follow OWASP security guidelines

### TODO Items

- [ ] Kubernetes deployment manifests
- [ ] Docker containerization
- [ ] CI/CD pipeline setup
- [ ] Comprehensive unit test suite
- [ ] Load testing and performance optimization
- [ ] Advanced threat detection models
- [ ] Multi-tenant architecture support

---

## 📄 License

This project is proprietary software developed for secure financial data operations. All rights reserved.

**Important**: This software contains cryptographic implementations and is subject to export control regulations. Ensure compliance with local laws before distribution.

---

## 📞 Support & Contact

For technical support, security issues, or commercial inquiries:

- **Technical Documentation**: Available in `/docs` directory
- **Security Reports**: Please report vulnerabilities responsibly
- **Commercial Licensing**: Contact for enterprise deployment options

**Disclaimer**: This software is provided for evaluation purposes. Production deployment requires proper security assessment and compliance verification.

---

## 🌟 Acknowledgments

- RBI Account Aggregator Framework for regulatory guidance
- NIST for cryptographic standards and recommendations
- Open source community for foundational technologies
- Security researchers for responsible disclosure practices

---

_Built with ❤️ for secure and compliant fintech operations_
