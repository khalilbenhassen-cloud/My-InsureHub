import os
from dotenv import load_dotenv
load_dotenv()
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
import models
import schemas
from auth import get_current_user, verify_password, get_password_hash, create_access_token
from services.pdf_parser import extract_text
from services.ai_analyzer import analyze_policy
from services.rag_store import build_vector_store, chat_with_policy, add_to_vector_store, get_vector_store
from dotenv import dotenv_values

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PolicyLens Vault API", description="Digital Policy Cabinet")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(schemas.BaseModel):
    policy_id: int
    question: str
    language: str

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, full_name=user.full_name, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Check for Env-Level Master Admin Credentials First
    env_config = dotenv_values(".env")
    admin_creds_str = env_config.get("ADMIN_CREDENTIALS", "") or os.getenv("ADMIN_CREDENTIALS", "")
    
    is_env_admin = False
    if admin_creds_str:
        pairs = admin_creds_str.split(",")
        for pair in pairs:
            if ":" in pair:
                e, p = pair.split(":", 1)
                if e.strip() == form_data.username and p.strip() == form_data.password:
                    is_env_admin = True
                    break
                    
    if is_env_admin:
        # If they use the secret env credentials, make sure they exist in the DB so the app doesn't crash
        user = db.query(models.User).filter(models.User.email == form_data.username).first()
        if not user:
            user = models.User(
                email=form_data.username,
                full_name="System Admin",
                hashed_password=get_password_hash(form_data.password),
                is_admin=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.is_admin:
            user.is_admin = True
            db.commit()
            
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}

    # 2. Normal Database User Login Flow
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return current_user

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    total_users = db.query(models.User).filter(models.User.is_admin == False).count()
    total_policies = db.query(models.Policy).count()
    total_claims = db.query(models.Claim).count()
    
    # Breakdown by policy type
    from sqlalchemy import func
    policy_types = db.query(models.Policy.policy_type, func.count(models.Policy.id)).group_by(models.Policy.policy_type).all()
    
    return {
        "total_users": total_users,
        "total_policies": total_policies,
        "total_claims": total_claims,
        "policy_distribution": [{"type": pt[0], "count": pt[1]} for pt in policy_types]
    }

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    users = db.query(models.User).all()
    # Let's attach policy and claim counts for the frontend list
    result = []
    for u in users:
        policy_count = db.query(models.Policy).filter(models.Policy.user_id == u.id).count()
        claim_count = db.query(models.Claim).join(models.Policy).filter(models.Policy.user_id == u.id).count()
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "policy_count": policy_count,
            "claim_count": claim_count
        })
    return result

@app.delete("/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(user_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_delete.is_admin and user_to_delete.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account from here")
        
    db.delete(user_to_delete)
    db.commit()
    return None

@app.post("/admin/users/{user_id}/toggle-suspend", response_model=schemas.UserResponse)
def toggle_user_suspend(user_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    user_to_toggle = db.query(models.User).filter(models.User.id == user_id).first()
    if not user_to_toggle:
        raise HTTPException(status_code=404, detail="User not found")
    if user_to_toggle.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own admin account")
        
    user_to_toggle.is_active = not user_to_toggle.is_active
    db.commit()
    db.refresh(user_to_toggle)
    return user_to_toggle

@app.get("/admin/users/{user_id}/cabinet")
def get_user_cabinet(user_id: int, db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    policies = db.query(models.Policy).filter(models.Policy.user_id == user_id).all()
    
    # Format policies nicely
    result = []
    for p in policies:
        guarantees = db.query(models.Guarantee).filter(models.Guarantee.policy_id == p.id).all()
        result.append({
            "id": p.id,
            "company_name": p.company_name,
            "policy_type": p.policy_type,
            "premium_amount": p.premium_amount,
            "status": p.status,
            "guarantees": [{"name": g.name, "details": g.details} for g in guarantees]
        })
        
    user_claims = db.query(models.Claim).join(models.Policy).filter(models.Policy.user_id == user_id).all()
    claims_result = []
    for c in user_claims:
        claims_result.append({
            "id": c.id,
            "description": c.description,
            "amount": c.amount,
            "status": c.status,
            "date_filed": c.date_filed,
            "policy_id": c.policy_id
        })
        
    return {
        "user_email": user.email,
        "full_name": user.full_name,
        "policies": result,
        "claims": claims_result
    }

@app.get("/admin/tickets", response_model=List[schemas.TicketResponse])
def get_all_tickets(db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    return db.query(models.Ticket).order_by(models.Ticket.status.desc(), models.Ticket.created_at.desc()).all()

@app.put("/admin/tickets/{ticket_id}/reply", response_model=schemas.TicketResponse)
def reply_ticket(ticket_id: int, reply: schemas.TicketReply, db: Session = Depends(get_db), admin_user: models.User = Depends(get_admin_user)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    user = db.query(models.User).filter(models.User.id == ticket.user_id).first()
    
    # Send email
    support_email = os.getenv("SUPPORT_EMAIL")
    support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
    
    if support_email and support_password and user:
        try:
            msg = MIMEMultipart()
            msg['From'] = support_email
            msg['To'] = user.email
            msg['Subject'] = f"Re: {ticket.subject} (Support Ticket #{ticket.id})"
            
            body = f"""Hello {user.full_name},

Regarding your recent support ticket: "{ticket.subject}"

{reply.message}

Best regards,
My InsureHub Support Team
"""
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(support_email, support_password)
            server.sendmail(support_email, user.email, msg.as_string())
            server.quit()
        except Exception as e:
            print(f"Failed to send email reply: {e}")
            # We don't raise here, we still want to save the response
            
    ticket.admin_response = reply.message
    ticket.status = "Resolved"
    db.commit()
    db.refresh(ticket)
    return ticket

@app.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.delete(current_user)
    db.commit()
    return None

@app.get("/policies", response_model=List[schemas.Policy])
def get_policies(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Policy).filter(models.Policy.user_id == current_user.id).all()

@app.get("/policies/{policy_id}", response_model=schemas.Policy)
def get_policy(policy_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id, models.Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@app.delete("/policies/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id, models.Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted successfully"}

@app.patch("/policies/{policy_id}/status", response_model=schemas.Policy)
def update_policy_status(policy_id: int, status_update: schemas.PolicyStatusUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id, models.Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy.status = status_update.status
    db.commit()
    db.refresh(policy)
    return policy

@app.post("/upload")
async def upload_base_policy(
    file: UploadFile = File(...),
    language: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    file_content = await file.read()
    if len(file_content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds 20MB limit")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    text = extract_text(file_content)
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # Analyze with Groq
    analysis = analyze_policy(text, language)

    # Save to Database
    db_policy = models.Policy(
        user_id=current_user.id,
        company_name=analysis.get("policy_type", "Unknown Policy").capitalize() + " Insurance", 
        policy_type=analysis.get("policy_type", "unknown"),
        summary=analysis.get("summary", ""),
        premium_amount=float(analysis.get("premium_amount", 0.0))
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)

    # Add guarantees
    for cov in analysis.get("coverages", []):
        db_guarantee = models.Guarantee(
            policy_id=db_policy.id,
            name=cov.get("item", "Coverage"),
            details=str(cov.get("amount", ""))
        )
        db.add(db_guarantee)
    
    # Save Base Document record
    db_doc = models.Document(
        policy_id=db_policy.id,
        filename=file.filename,
        doc_type="Base Contract"
    )
    db.add(db_doc)
    db.commit()

    # Build Vector Store for this policy
    build_vector_store(text, db_policy.id)

    return {"policy_id": db_policy.id, "analysis": analysis}

@app.post("/policies/{policy_id}/documents", response_model=schemas.Document)
async def upload_related_document(
    policy_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id, models.Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    file_content = await file.read()
    text = extract_text(file_content)
    
    db_doc = models.Document(
        policy_id=policy_id,
        filename=file.filename,
        doc_type="Supplemental"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    if text.strip():
        add_to_vector_store(text, policy_id)

    return db_doc

@app.get("/claims", response_model=List[schemas.Claim])
def get_all_claims(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Claim).join(models.Policy).filter(models.Policy.user_id == current_user.id).all()

@app.post("/policies/{policy_id}/claims", response_model=schemas.Claim)
def create_claim(policy_id: int, claim: schemas.ClaimCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id, models.Policy.user_id == current_user.id).first()
    if not policy:
         raise HTTPException(status_code=404, detail="Policy not found")
    db_claim = models.Claim(**claim.model_dump(), policy_id=policy_id)
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

@app.put("/claims/{claim_id}", response_model=schemas.Claim)
def update_claim(claim_id: int, claim_update: schemas.ClaimCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_claim = db.query(models.Claim).join(models.Policy).filter(models.Claim.id == claim_id, models.Policy.user_id == current_user.id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    db_claim.description = claim_update.description
    db_claim.amount = claim_update.amount
    db_claim.status = claim_update.status
    db_claim.date_filed = claim_update.date_filed
    
    db.commit()
    db.refresh(db_claim)
    return db_claim

@app.delete("/claims/{claim_id}")
def delete_claim(claim_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_claim = db.query(models.Claim).join(models.Policy).filter(models.Claim.id == claim_id, models.Policy.user_id == current_user.id).first()
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    db.delete(db_claim)
    db.commit()
    return {"message": "Claim deleted successfully"}


@app.post("/chat")
async def chat_with_policy_endpoint(request: ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    policy = db.query(models.Policy).filter(models.Policy.id == request.policy_id, models.Policy.user_id == current_user.id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    vectorstore = get_vector_store(request.policy_id)
    if not vectorstore:
        raise HTTPException(status_code=404, detail="Vector store not found for this policy")

    answer = chat_with_policy(vectorstore, request.question, request.language)
    return {"answer": answer}

@app.post("/api/support/ticket")
def submit_ticket_legacy(request: schemas.TicketRequest, db: Session = Depends(get_db)):
    # This was the old unauthenticated endpoint, now deprecated
    return {"message": "Ticket received. We will contact you soon."}

@app.post("/tickets", response_model=schemas.TicketResponse)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_ticket = models.Ticket(
        user_id=current_user.id,
        category=ticket.category,
        subject=ticket.subject,
        message=ticket.message,
        status="Open"
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

@app.post("/support/ticket")
def submit_support_ticket(ticket: schemas.TicketRequest):
    support_email = os.getenv("SUPPORT_EMAIL")
    support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
    
    if not support_email or not support_password:
        raise HTTPException(status_code=500, detail="Support email not configured on the server")
        
    try:
        msg = MIMEMultipart()
        msg['From'] = support_email
        msg['To'] = support_email # Send to ourselves
        msg['Subject'] = f"New Support Ticket: {ticket.subject}"
        
        body = f"""
New support ticket submitted via My InsureHub.

User Details:
-------------
Name: {ticket.user_name}
Email: {ticket.user_email}

Ticket Details:
---------------
Category: {ticket.category}
Subject: {ticket.subject}

Message:
{ticket.message}
"""
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(support_email, support_password)
        text = msg.as_string()
        server.sendmail(support_email, support_email, text)
        server.quit()
        
        return {"message": "Ticket submitted successfully"}
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)