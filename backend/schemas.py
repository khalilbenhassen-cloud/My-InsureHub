from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Guarantee
class GuaranteeBase(BaseModel):
    name: str
    details: str

class GuaranteeCreate(GuaranteeBase):
    pass

class Guarantee(GuaranteeBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True

# Document
class DocumentBase(BaseModel):
    filename: str
    doc_type: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    policy_id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Claim
class ClaimBase(BaseModel):
    description: str
    date_filed: datetime
    amount: float
    status: str

class ClaimCreate(ClaimBase):
    pass

class Claim(ClaimBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True

# Policy
class PolicyBase(BaseModel):
    company_name: str
    policy_type: str
    summary: str
    premium_amount: float = 0.0
    status: str = "Active"

class PolicyStatusUpdate(BaseModel):
    status: str

class PolicyCreate(PolicyBase):
    guarantees: List[GuaranteeCreate] = []

class Policy(PolicyBase):
    id: int
    created_at: datetime
    guarantees: List[Guarantee] = []
    documents: List[Document] = []
    claims: List[Claim] = []

    class Config:
        from_attributes = True

# Ticket Request
class TicketRequest(BaseModel):
    category: str
    subject: str
    message: str
    user_name: str
    user_email: str
