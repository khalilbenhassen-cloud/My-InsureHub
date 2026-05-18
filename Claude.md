# PolicyLens — AI Insurance Policy Explainer

## Project Goal
Build a full-stack web app where users upload an insurance PDF and get:
- A plain-language summary
- Coverages with amounts
- Exclusions and risk warnings
- Suggested questions for their insurer
- A bilingual chat interface (English / French)

## Tech Stack
- Frontend: Next.js 14 (App Router) + TailwindCSS + shadcn/ui
- Backend: FastAPI (Python 3.11)
- LLM: Groq API (llama-3.1-8b-instant) — OpenAI-compatible
- Embeddings: sentence-transformers (all-MiniLM-L6-v2) — runs locally, no API needed
- Vector store: ChromaDB
- PDF parsing: pypdf

## Environment Variables
Backend needs a `.env` file:
GROQ_API_KEY=your_groq_key_here

## Important Constraints
- PDF limit: 20MB
- No authentication needed (demo app)
- API key stays server-side only, never sent to frontend
- Dark mode design: near-black background (#0f0f0f), blue accent (#3b82f6), amber/red for warnings
- Bilingual: user picks English or French, AI responds in chosen language

## Project Structure to Build
policylens/
├── backend/
│   ├── main.py
│   ├── .env
│   ├── requirements.txt
│   └── services/
│       ├── pdf_parser.py
│       ├── ai_analyzer.py
│       └── rag_store.py
└── frontend/
    ├── (Next.js app)
    └── .env.local

## Commands
- Backend: cd backend && uvicorn main:app --reload --port 8000
- Frontend: cd frontend && npm run dev