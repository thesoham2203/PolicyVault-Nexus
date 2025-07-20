from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from register_org import router as register_router
from org_auth import router as org_router
from consent_requests import router as consent_router
from audit_router import router as audit_router
from audit_fetch import router as audit_fetch
from app.routers.auth import router as admin_auth_router
from approved_consents import router as approved_requests_router
# from pending_requests_view import router as pending_requests_router
from consents import router as pending_requests_router
app = FastAPI()

origins = [
    "http://localhost:5174",  # React dev URL
    "http://localhost:8000"
    # "https://your-frontend-url.com"  # Add deployed URL too
]
# CORS (adjust for frontend domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes

app.include_router(auth_router, prefix="/auth")
app.include_router(register_router, prefix="/register_org")
app.include_router(org_router, prefix="/org-auth")  
app.include_router(consent_router, prefix="/consent")
app.include_router(audit_router, prefix="/audit")
app.include_router(audit_fetch, prefix="/audit_log")
app.include_router(admin_auth_router, prefix="/api/auth")
app.include_router(pending_requests_router)
app.include_router(approved_requests_router)

@app.get("/")
def root():
    return {"msg": "PolicyVault backend running"}
