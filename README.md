# My InsureHub (Formerly PolicyLens)

A full-stack, "Digital Filing Cabinet" web app where users can store, manage, and analyze multiple insurance contracts in a centralized platform.

### App Screenshots
| Dashboard | All Policies |
| :---: | :---: |
| ![Dashboard](assets/MyInsureHub%20-%20Dashboard.JPG) | ![Policies](assets/MyInsureHub%20-%20Policies.JPG) |

| AI Policy Assistant | Global Claims Tracker |
| :---: | :---: |
| ![Policy Assistant](assets/MyInsureHub%20-%20PolicyAssistant.JPG) | ![Claims](assets/MyInsureHub%20-%20Claims.JPG) |

## 🚀 Features

- **Multi-Policy Vault**: Upload and store multiple insurance policies (Auto, Home, Health, Life).
- **AI Extraction**: Automatically extracts the company name, policy type, main guarantees, and deductibles using the Groq LLaMA 3.1 model.
- **Supplemental Documents**: Attach related riders, ID cards, or endorsements directly to a policy's file.
- **Manual Claims Tracker**: A CRUD interface to log and track claims (amount, date, description, status) linked directly to specific policies.
- **Context-Aware AI Chat**: A persistent Chat Assistant scoped strictly by `policy_id`. It physically cannot confuse your Auto policy rules with your Home policy rules.
- **Modern UI**: A cheerful, professional "Dribbble-style" light theme built with Next.js, featuring a clean Sidebar and TopNav.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Lucide React
- **Backend**: FastAPI (Python 3.11) + SQLAlchemy
- **Database**: SQLite (`policylens.db`)
- **LLM**: Groq API (llama-3.1-8b-instant) — OpenAI-compatible
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2) — runs locally
- **Vector store**: ChromaDB (Persists to local disk `./chroma_db`)
- **PDF parsing**: pypdf

## ⚙️ Environment Variables

Backend needs a `.env` file:
```
GROQ_API_KEY=your_groq_key_here
```

Frontend needs a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📂 Project Structure

```
insurehub/
├── backend/
│   ├── main.py (FastAPI endpoints)
│   ├── database.py (SQLite config)
│   ├── models.py (SQLAlchemy Schema)
│   ├── schemas.py (Pydantic Models)
│   ├── .env
│   ├── requirements.txt
│   └── services/
│       ├── pdf_parser.py
│       ├── ai_analyzer.py
│       └── rag_store.py (ChromaDB persistence)
└── frontend/
    ├── app/ (Next.js App Router: /dashboard, /policies, /claims)
    ├── components/ (TopNav, Sidebar, UploadDropzone)
    └── .env.local
```

## 🚀 Setup Instructions

1. **Get a Groq API key**:
   - Sign up at [Groq](https://console.groq.com/)
   - Create an API key

2. **Configure backend**:
   - Add your Groq API key to `.env`: `GROQ_API_KEY=your_actual_key_here`

3. **Start the backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn main:app --reload --port 8000
   ```
   *(Note: This will automatically generate the `policylens.db` SQLite file).*

4. **Start the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open your browser**:
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs