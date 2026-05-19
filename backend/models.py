from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    policy_type = Column(String, index=True)
    summary = Column(Text)
    premium_amount = Column(Float, default=0.0)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="policy", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="policy", cascade="all, delete-orphan")
    guarantees = relationship("Guarantee", back_populates="policy", cascade="all, delete-orphan")

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
