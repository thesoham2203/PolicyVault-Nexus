from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, validator
from fastapi.middleware.cors import CORSMiddleware
import smtplib
import random
import string
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CanaraBank Admin Invite API",
    description="API for generating and sending admin invite tokens",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class InviteRequest(BaseModel):
    email: EmailStr
    sender_name: Optional[str] = "CanaraBank Admin"
    
    @validator('email')
    def validate_email_domain(cls, v):
        if not v.endswith('@kkwagh.edu.in'):
            raise ValueError('Please enter a valid KKWagh email address')
        return v

class InviteResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    email: str
    expires_at: Optional[str] = None

# Email configuration (use environment variables in production)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = "587"
SMTP_USERNAME = "sihredact@gmail.com"
SMTP_PASSWORD = "pcbb dcim hoza siqc"

# In-memory storage for tokens (use database in production)
invite_tokens = {}

def generate_invite_token() -> str:
    """Generate a secure invite token similar to the frontend logic"""
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=13))
    timestamp_part = str(int(time.time()))[-6:]
    return f"CB-{random_part}-{timestamp_part}"

def create_email_content(token: str, recipient_email: str) -> tuple:
    """Create HTML and plain text email content"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #ea580c, #dc2626); color: white; padding: 30px; text-align: center; }}
            .logo {{ font-size: 28px; font-weight: bold; margin-bottom: 10px; }}
            .content {{ padding: 30px; }}
            .token-box {{ background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }}
            .token {{ font-family: monospace; font-size: 18px; font-weight: bold; color: #0c4a6e; word-break: break-all; }}
            .warning {{ background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
            .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🏛️ CanaraBank</div>
                <p>Administrator Invitation</p>
            </div>
            <div class="content">
                <h2>Welcome to CanaraBank Admin Portal!</h2>
                <p>You have been invited to join the CanaraBank Administrator Dashboard. Please use the following invite token to complete your registration:</p>
                
                <div class="token-box">
                    <p><strong>Your Invite Token:</strong></p>
                    <div class="token">{token}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important Security Information:</strong>
                    <ul>
                        <li>This token is valid for 24 hours only</li>
                        <li>Do not share this token with anyone</li>
                        <li>Use this token only on the official CanaraBank admin portal</li>
                        <li>If you did not request this invitation, please ignore this email</li>
                    </ul>
                </div>
                
                <p>To complete your registration:</p>
                <ol>
                    <li>Visit the CanaraBank Admin Portal</li>
                    <li>Click on "Join with Invite Token"</li>
                    <li>Enter the token provided above</li>
                    <li>Complete your profile setup</li>
                </ol>
                
                <div style="text-align: center;">
                    <a href="#" class="button">Access Admin Portal</a>
                </div>
                
                <p>If you have any questions or need assistance, please contact our IT support team.</p>
                
                <p>Best regards,<br>
                <strong>CanaraBank IT Security Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message from CanaraBank Administrator System.</p>
                <p>© 2025 CanaraBank. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    CanaraBank Administrator Invitation
    
    Welcome to CanaraBank Admin Portal!
    
    You have been invited to join the CanaraBank Administrator Dashboard.
    
    Your Invite Token: {token}
    
    IMPORTANT SECURITY INFORMATION:
    - This token is valid for 24 hours only
    - Do not share this token with anyone
    - Use this token only on the official CanaraBank admin portal
    - If you did not request this invitation, please ignore this email
    
    To complete your registration:
    1. Visit the CanaraBank Admin Portal
    2. Click on "Join with Invite Token"
    3. Enter the token provided above
    4. Complete your profile setup
    
    If you have any questions, please contact our IT support team.
    
    Best regards,
    CanaraBank IT Security Team
    
    This is an automated message from CanaraBank Administrator System.
    © 2025 CanaraBank. All rights reserved.
    """
    
    return html_content, text_content

async def send_email(recipient_email: str, token: str) -> bool:
    """Send invite token email"""
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "🏛️ CanaraBank Admin Invitation - Secure Token Inside"
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        
        # Create email content
        html_content, text_content = create_email_content(token, recipient_email)
        
        # Create MIMEText objects
        text_part = MIMEText(text_content, 'plain')
        html_part = MIMEText(html_content, 'html')
        
        # Attach parts
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Invite token sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
        return False

@app.post("/api/generate-invite-token", response_model=InviteResponse)
async def generate_and_send_invite_token(
    request: InviteRequest, 
    background_tasks: BackgroundTasks
):
    """
    Generate and send an invite token to the specified email address
    """
    try:
        # Generate token
        token = generate_invite_token()
        
        # Set expiration time (24 hours)
        expires_at = datetime.now() + timedelta(hours=24)
        
        # Store token (in production, use a database with proper indexing)
        invite_tokens[token] = {
            "email": request.email,
            "created_at": datetime.now(),
            "expires_at": expires_at,
            "used": False
        }
        
        # Send email in background
        background_tasks.add_task(send_email, request.email, token)
        
        logger.info(f"Generated invite token for {request.email}")
        
        return InviteResponse(
            success=True,
            message=f"Invite token generated and sent to {request.email}",
            token=token,  # In production, consider not returning the token in response
            email=request.email,
            expires_at=expires_at.isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error generating invite token: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/verify-token/{token}")
async def verify_invite_token(token: str):
    """
    Verify if an invite token is valid and not expired
    """
    if token not in invite_tokens:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    token_data = invite_tokens[token]
    
    if token_data["used"]:
        raise HTTPException(status_code=400, detail="Token has already been used")
    
    if datetime.now() > token_data["expires_at"]:
        raise HTTPException(status_code=400, detail="Token has expired")
    
    return {
        "valid": True,
        "email": token_data["email"],
        "expires_at": token_data["expires_at"].isoformat()
    }

@app.post("/api/use-token/{token}")
async def use_invite_token(token: str):
    """
    Mark an invite token as used
    """
    if token not in invite_tokens:
        raise HTTPException(status_code=404, detail="Invalid token")
    
    token_data = invite_tokens[token]
    
    if token_data["used"]:
        raise HTTPException(status_code=400, detail="Token has already been used")
    
    if datetime.now() > token_data["expires_at"]:
        raise HTTPException(status_code=400, detail="Token has expired")
    
    # Mark as used
    invite_tokens[token]["used"] = True
    invite_tokens[token]["used_at"] = datetime.now()
    
    return {
        "success": True,
        "message": "Token used successfully",
        "email": token_data["email"]
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)