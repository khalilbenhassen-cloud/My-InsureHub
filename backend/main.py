import os
import uuid
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
import models
import schemas
from services.pdf_parser import extract_text
from services.ai_analyzer import analyze_policy
from services.rag_store import build_vector_store, chat_with_policy, add_to_vector_store, get_vector_store
from dotenv import load_dotenv

load_dotenv()

# Initialize DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PolicyLens Vault API", description="Digital Policy Cabinet")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(schemas.BaseModel):
    policy_id: int
    question: str
    language: str

@app.get("/policies", response_model=List[schemas.Policy])
def get_policies(db: Session = Depends(get_db)):
    return db.query(models.Policy).all()

@app.get("/policies/{policy_id}", response_model=schemas.Policy)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@app.delete("/policies/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted successfully"}

@app.post("/upload")
async def upload_base_policy(
    file: UploadFile = File(...),
    language: str = Form(...),
    db: Session = Depends(get_db)
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
        company_name=analysis.get("policy_type", "Unknown Policy").capitalize() + " Insurance", 
        policy_type=analysis.get("policy_type", "unknown"),
        summary=analysis.get("summary", "")
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
    db: Session = Depends(get_db)
):
    policy = db.query(models.Policy).filter(models.Policy.id == policy_id).first()
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
def get_all_claims(db: Session = Depends(get_db)):
    return db.query(models.Claim).all()

@app.post("/policies/{policy_id}/claims", response_model=schemas.Claim)
def create_claim(policy_id: int, claim: schemas.ClaimCreate, db: Session = Depends(get_db)):
    db_claim = models.Claim(**claim.model_dump(), policy_id=policy_id)
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

@app.post("/chat")
async def chat_with_policy_endpoint(request: ChatRequest):
    vectorstore = get_vector_store(request.policy_id)
    if not vectorstore:
        raise HTTPException(status_code=404, detail="Vector store not found for this policy")

    answer = chat_with_policy(vectorstore, request.question, request.language)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)