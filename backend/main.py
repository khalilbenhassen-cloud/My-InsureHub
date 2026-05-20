import os
from dotenv import load_dotenv
load_dotenv()
import uuid
import smtplib
import requests

def send_email_via_gas(to_email: str, subject: str, html_content: str = None, text_content: str = None):
    gas_url = "https://script.google.com/macros/s/AKfycbwr0Ga3XCiGpR1P9UGx19e4U6Ck3aHHSyEk38BoLhIx1g-G2dLysmny6mI7nOQjP3dQ/exec"
    payload = {
        "token": "insurehub-secret-token-123",
        "to": to_email,
        "subject": subject,
        "htmlBody": html_content if html_content else (text_content.replace('\n', '<br>') if text_content else "")
    }
    try:
        response = requests.post(gas_url, json=payload, timeout=15)
        print("GAS response:", response.text)
    except Exception as e:
        print(f"Failed to send email via GAS: {e}")

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
from auth import get_current_user, verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from datetime import timedelta, datetime
from services.pdf_parser import extract_text
from services.ai_analyzer import analyze_policy
from services.rag_store import build_vector_store, chat_with_policy, add_to_vector_store, get_vector_store
from dotenv import dotenv_values

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from pydantic import BaseModel

# Initialize Firebase Admin
try:
    firebase_key_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "my-insurehub-4f9bf-firebase-adminsdk-fbsvc-0920235dc4.json")
    cred = credentials.Certificate(firebase_key_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Failed to initialize Firebase Admin: {e}")

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
        
    try:
        birth_date_obj = datetime.strptime(user.birth_date, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date_obj.year - ((today.month, today.day) < (birth_date_obj.month, birth_date_obj.day))
        if age < 18:
            raise HTTPException(status_code=400, detail="You must be at least 18 years old to create an account.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(email=user.email, full_name=user.full_name, hashed_password=hashed_password, birth_date=user.birth_date)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send Welcome Email
    support_email = os.getenv("SUPPORT_EMAIL")
    support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
    if support_email and support_password:
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = support_email
            msg['To'] = db_user.email
            msg['Subject'] = "Welcome to My InsureHub! ☂️ Your digital policy vault is ready."

            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fcfcfc; padding: 30px; border-radius: 12px; border: 1px solid #eee;">
                  <img src="https://my-insurehub.vercel.app/logo.png" alt="InsureHub Logo" style="height: 40px; margin-bottom: 20px;">
                  <h2 style="color: #0b2545; margin-top: 0;">Welcome to My InsureHub!</h2>
                  <p>Hello <b>{db_user.full_name}</b>,</p>
                  <p>We are absolutely thrilled to have you onboard.</p>
                  <p>You've just taken the first step toward managing your insurance without the headache. Your secure digital cabinet is now set up and ready to go.</p>
                  <p><b>Here is what you can do right now to get started:</b></p>
                  <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 10px;"><b>Upload a Policy:</b> Drag and drop any Auto, Home, Health, or Life insurance PDF into your dashboard.</li>
                    <li style="margin-bottom: 10px;"><b>Meet your AI Assistant:</b> Once your policy is uploaded, click on it to chat directly with your contract. Ask questions like <i>"What is my deductible?"</i> and get instant answers.</li>
                    <li style="margin-bottom: 10px;"><b>Complete your Risk Profile:</b> Head to the 'Profile' tab to unlock Smart Alerts that will detect gaps in your coverage.</li>
                  </ul>
                  <br>
                  <a href="https://my-insurehub.vercel.app/login" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log in to your Dashboard</a>
                  <br><br>
                  <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.9em; color: #666;">
                    If you ever have any questions or need help, just reply directly to this email or submit a ticket in the Support tab.
                  </p>
                  <p style="font-size: 0.9em; color: #666;">Stay protected,<br><b>The My InsureHub Team</b></p>
                </div>
              </body>
            </html>
            """
            
            part = MIMEText(html_body, 'html')
            msg.attach(part)
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(support_email, support_password)
            server.sendmail(support_email, db_user.email, msg.as_string())
            server.quit()
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            
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

class FirebaseTokenRequest(BaseModel):
    token: str

@app.post("/auth/firebase")
def firebase_login(request: FirebaseTokenRequest, db: Session = Depends(get_db)):
    try:
        decoded_token = firebase_auth.verify_id_token(request.token)
        email = decoded_token.get("email")
        name = decoded_token.get("name", email.split("@")[0] if email else "User")
        
        if not email:
            raise HTTPException(status_code=400, detail="Token did not contain an email")
            
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Do NOT create user yet! Send back status asking for birth_date
            return {
                "status": "needs_birthdate",
                "email": email,
                "name": name,
                "token": request.token
            }
            hashed_password = get_password_hash(str(uuid.uuid4()))
            user = models.User(email=email, full_name=name, hashed_password=hashed_password)
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Send Welcome Email
            support_email = os.getenv("SUPPORT_EMAIL")
            support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
            if support_email and support_password:
                try:
                    msg = MIMEMultipart('alternative')
                    msg['From'] = support_email
                    msg['To'] = user.email
                    msg['Subject'] = "Welcome to My InsureHub! ☂️ Your digital policy vault is ready."

                    html_body = f"""
                    <html>
                      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #fcfcfc; padding: 30px; border-radius: 12px; border: 1px solid #eee;">
                          <img src="https://my-insurehub.vercel.app/logo.png" alt="InsureHub Logo" style="height: 40px; margin-bottom: 20px;">
                          <h2 style="color: #0b2545; margin-top: 0;">Welcome to My InsureHub!</h2>
                          <p>Hello <b>{user.full_name}</b>,</p>
                          <p>We are absolutely thrilled to have you onboard.</p>
                          <p>You've just taken the first step toward managing your insurance without the headache. Your secure digital cabinet is now set up and ready to go.</p>
                          <p><b>Here is what you can do right now to get started:</b></p>
                          <ul style="padding-left: 20px;">
                            <li style="margin-bottom: 10px;"><b>Upload a Policy:</b> Drag and drop any Auto, Home, Health, or Life insurance PDF into your dashboard.</li>
                            <li style="margin-bottom: 10px;"><b>Meet your AI Assistant:</b> Once your policy is uploaded, click on it to chat directly with your contract. Ask questions like <i>"What is my deductible?"</i> and get instant answers.</li>
                            <li style="margin-bottom: 10px;"><b>Complete your Risk Profile:</b> Head to the 'Profile' tab to unlock Smart Alerts that will detect gaps in your coverage.</li>
                          </ul>
                          <br>
                          <a href="https://my-insurehub.vercel.app/login" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log in to your Dashboard</a>
                          <br><br>
                          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.9em; color: #666;">
                            If you ever have any questions or need help, just reply directly to this email or submit a ticket in the Support tab.
                          </p>
                          <p style="font-size: 0.9em; color: #666;">Stay protected,<br><b>The My InsureHub Team</b></p>
                        </div>
                      </body>
                    </html>
                    """
                    
                    part = MIMEText(html_body, 'html')
                    send_email_via_gas(user.email, msg['Subject'], html_content=html_body)
                except Exception as e:
                    print(f"Failed to send welcome email: {e}")
            
            
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "status": "success"}
        
    except Exception as e:
        print(f"Firebase verification error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {e}")

class FirebaseRegisterRequest(BaseModel):
    token: str
    birth_date: str

@app.post("/auth/firebase/register", response_model=schemas.Token)
def firebase_register(request: FirebaseRegisterRequest, db: Session = Depends(get_db)):
    # 1. Age Verification
    try:
        birth_date_obj = datetime.strptime(request.birth_date, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date_obj.year - ((today.month, today.day) < (birth_date_obj.month, birth_date_obj.day))
        if age < 18:
            raise HTTPException(status_code=400, detail="You must be at least 18 years old to create an account.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format.")

    # 2. Token Verification
    try:
        decoded_token = firebase_auth.verify_id_token(request.token)
        email = decoded_token.get("email")
        name = decoded_token.get("name", email.split("@")[0] if email else "User")
        
        if not email:
            raise HTTPException(status_code=400, detail="Token did not contain an email")
            
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if user:
            # User already exists
            access_token = create_access_token(data={"sub": user.email})
            return {"access_token": access_token, "token_type": "bearer"}
            
        # 3. Create the user now
        hashed_password = get_password_hash(str(uuid.uuid4()))
        user = models.User(email=email, full_name=name, hashed_password=hashed_password, birth_date=request.birth_date)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # 4. Send Welcome Email
        support_email = os.getenv("SUPPORT_EMAIL")
        support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
        if support_email and support_password:
            try:
                msg = MIMEMultipart('alternative')
                msg['From'] = support_email
                msg['To'] = user.email
                msg['Subject'] = "Welcome to My InsureHub! ☂️ Your digital policy vault is ready."

                html_body = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #fcfcfc; padding: 30px; border-radius: 12px; border: 1px solid #eee;">
                      <img src="https://my-insurehub.vercel.app/logo.png" alt="InsureHub Logo" style="height: 40px; margin-bottom: 20px;">
                      <h2 style="color: #0b2545; margin-top: 0;">Welcome to My InsureHub!</h2>
                      <p>Hello <b>{user.full_name}</b>,</p>
                      <p>We are absolutely thrilled to have you onboard.</p>
                      <p>You've just taken the first step toward managing your insurance without the headache. Your secure digital cabinet is now set up and ready to go.</p>
                      <p><b>Here is what you can do right now to get started:</b></p>
                      <ul style="padding-left: 20px;">
                        <li style="margin-bottom: 10px;"><b>Upload a Policy:</b> Drag and drop any Auto, Home, Health, or Life insurance PDF into your dashboard.</li>
                        <li style="margin-bottom: 10px;"><b>Meet your AI Assistant:</b> Once your policy is uploaded, click on it to chat directly with your contract. Ask questions like <i>"What is my deductible?"</i> and get instant answers.</li>
                        <li style="margin-bottom: 10px;"><b>Complete your Risk Profile:</b> Head to the 'Profile' tab to unlock Smart Alerts that will detect gaps in your coverage.</li>
                      </ul>
                      <br>
                      <a href="https://my-insurehub.vercel.app/login" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Log in to your Dashboard</a>
                      <br><br>
                      <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.9em; color: #666;">
                        If you ever have any questions or need help, just reply directly to this email or submit a ticket in the Support tab.
                      </p>
                      <p style="font-size: 0.9em; color: #666;">Stay protected,<br><b>The My InsureHub Team</b></p>
                    </div>
                  </body>
                </html>
                """
                
                part = MIMEText(html_body, 'html')
                send_email_via_gas(user.email, msg['Subject'], html_content=html_body)
            except Exception as e:
                print(f"Failed to send welcome email: {e}")
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except Exception as e:
        print(f"Firebase verification error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {e}")

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.UserResponse)
def update_users_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.email is not None:
        current_user.email = user_update.email
    db.commit()
    db.refresh(current_user)
    return current_user

class CompleteProfileRequest(schemas.BaseModel):
    birth_date: str

@app.post("/users/complete-profile", response_model=schemas.UserResponse)
def complete_profile(request: CompleteProfileRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        birth_date_obj = datetime.strptime(request.birth_date, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date_obj.year - ((today.month, today.day) < (birth_date_obj.month, birth_date_obj.day))
        if age < 18:
            raise HTTPException(status_code=400, detail="You must be at least 18 years old to use My InsureHub.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        
    current_user.birth_date = request.birth_date
    db.commit()
    db.refresh(current_user)
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
            "company_domain": p.company_domain,
            "policy_number": p.policy_number,
            "vehicle_marque": p.vehicle_marque,
            "vehicle_matricule": p.vehicle_matricule,
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
            send_email_via_gas(user.email, msg['Subject'], text_content=body)
        except Exception as e:
            print(f"Failed to send email reply: {e}")
            # We don't raise here, we still want to save the response
            
    ticket.admin_response = reply.message
    ticket.status = "Resolved"
    
    notification = models.Notification(
        user_id=ticket.user_id,
        title="Support Ticket Resolved",
        message=f"An admin has replied to your ticket '{ticket.subject}'.",
        link="/support"
    )
    db.add(notification)
    
    db.commit()
    db.refresh(ticket)
    return ticket

@app.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user_email = current_user.email
    full_name = current_user.full_name

    db.delete(current_user)
    db.commit()

    # Send account deletion email
    support_email = os.getenv("SUPPORT_EMAIL")
    support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
    if support_email and support_password:
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = support_email
            msg['To'] = user_email
            msg['Subject'] = "We're sorry to see you go! - Account Deleted"

            html_body = f"""
            <html>
              <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fcfcfc; padding: 30px; border-radius: 12px; border: 1px solid #eee;">
                  <img src="https://my-insurehub.vercel.app/logo.png" alt="InsureHub Logo" style="height: 40px; margin-bottom: 20px;">
                  <h2 style="color: #0b2545; margin-top: 0;">Account Successfully Deleted</h2>
                  <p>Hello <b>{full_name}</b>,</p>
                  <p>This email is to confirm that your My InsureHub account, along with all your uploaded policies and data, has been permanently deleted as per your request.</p>
                  <p>We're sad to see you go! If you ever need to effortlessly manage your insurance policies again, you are always welcome to come back.</p>
                  <p>Wishing you the best,</p>
                  <p><b>The My InsureHub Team</b></p>
                </div>
              </body>
            </html>
            """
            send_email_via_gas(user_email, msg['Subject'], html_content=html_body)
        except Exception as e:
            print(f"Failed to send account deletion email: {e}")

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
        company_name=analysis.get("company_name", "Unknown Company"),
        company_domain=analysis.get("company_domain", None),
        policy_number=analysis.get("policy_number", None),
        vehicle_marque=analysis.get("vehicle_marque", None),
        vehicle_matricule=analysis.get("vehicle_matricule", None),
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
    build_vector_store(text, db_policy.id, file.filename)

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
        add_to_vector_store(text, policy_id, file.filename)

    return db_doc

@app.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_doc = db.query(models.Document).join(models.Policy).filter(models.Document.id == document_id, models.Policy.user_id == current_user.id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    db.delete(db_doc)
    db.commit()
    return {"message": "Document deleted successfully"}

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

@app.get("/tickets", response_model=List[schemas.TicketResponse])
def get_user_tickets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Ticket).filter(models.Ticket.user_id == current_user.id).order_by(models.Ticket.created_at.desc()).all()

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
        
        send_email_via_gas(support_email, msg['Subject'], text_content=body)
        
        return {"message": "Ticket submitted successfully"}
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.post("/auth/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Return generic message to prevent email enumeration
        return {"message": "If that email is registered, a reset link has been sent."}

    # Generate a reset token valid for 15 minutes
    reset_token = create_access_token(
        data={"sub": user.email, "type": "reset"},
        expires_delta=timedelta(minutes=15)
    )

    support_email = os.getenv("SUPPORT_EMAIL")
    support_password = os.getenv("SUPPORT_EMAIL_PASSWORD")
    
    if not support_email or not support_password:
        raise HTTPException(status_code=500, detail="Email service is not configured.")

    try:
        msg = MIMEMultipart()
        msg['From'] = support_email
        msg['To'] = user.email
        msg['Subject'] = "My InsureHub - Password Reset"
        
        reset_link = f"{request.frontend_url}/reset-password?token={reset_token}"
        
        body = f"""Hello {user.full_name},

We received a request to reset your password for My InsureHub.
If you didn't make this request, you can safely ignore this email.

Click the link below to reset your password:
{reset_link}

This link will expire in 15 minutes.

Best regards,
My InsureHub Support Team
"""
        send_email_via_gas(user.email, msg['Subject'], text_content=body)
        
        return {"message": "If that email is registered, a reset link has been sent."}
    except Exception as e:
        print(f"Failed to send reset email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reset email")

@app.post("/auth/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired reset token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "reset":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise credentials_exception
        
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_user_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Notification).filter(models.Notification.user_id == current_user.id).order_by(models.Notification.created_at.desc()).all()

@app.put("/notifications/{notification_id}/read", response_model=schemas.NotificationResponse)
def read_notification(notification_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    notification = db.query(models.Notification).filter(models.Notification.id == notification_id, models.Notification.user_id == current_user.id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@app.put("/notifications/read-all")
def read_all_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db.query(models.Notification).filter(models.Notification.user_id == current_user.id, models.Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
