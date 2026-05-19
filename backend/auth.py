import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from dotenv import dotenv_values

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-insurehub")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account has been suspended")
        
    env_config = dotenv_values(".env")
    
    admin_creds_str = env_config.get("ADMIN_CREDENTIALS", "") or os.getenv("ADMIN_CREDENTIALS", "")
    admin_creds_emails = [pair.split(":")[0].strip() for pair in admin_creds_str.split(",") if ":" in pair]
    
    should_be_admin = user.email in admin_creds_emails
    
    # Only auto-promote if they are in the .env files, or auto-demote if they are completely removed from them
    if user.is_admin != should_be_admin:
        # We check if they were maybe promoted manually.
        # If should_be_admin is True, always ensure they are an admin
        # If should_be_admin is False but they are an admin in DB, we'll demote them 
        # (This enforces .env as the absolute source of truth)
        user.is_admin = should_be_admin
        db.commit()
        db.refresh(user)
        
    return user
