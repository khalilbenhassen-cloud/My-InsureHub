from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    birth_date = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    policies = relationship("Policy", back_populates="user", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String, index=True)
    company_domain = Column(String, nullable=True)
    policy_number = Column(String, nullable=True)
    vehicle_marque = Column(String, nullable=True)
    vehicle_matricule = Column(String, nullable=True)
    policy_type = Column(String, index=True)
    summary = Column(Text)
    premium_amount = Column(Float, default=0.0)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="policy", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="policy", cascade="all, delete-orphan")
    guarantees = relationship("Guarantee", back_populates="policy", cascade="all, delete-orphan")
    user = relationship("User", back_populates="policies")

class Guarantee(Base):
    __tablename__ = "guarantees"
    
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"))
    name = Column(String)
    details = Column(String)
    
    policy = relationship("Policy", back_populates="guarantees")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"))
    filename = Column(String)
    doc_type = Column(String) # e.g., 'Base Contract', 'Endorsement', 'ID Card'
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("Policy", back_populates="documents")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"))
    description = Column(String)
    date_filed = Column(DateTime)
    amount = Column(Float)
    status = Column(String) # e.g., 'Pending', 'Resolved', 'Denied'

    policy = relationship("Policy", back_populates="claims")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category = Column(String)
    subject = Column(String)
    message = Column(Text)
    admin_response = Column(Text, nullable=True)
    status = Column(String, default="Open") # Open, Resolved
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tickets")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
