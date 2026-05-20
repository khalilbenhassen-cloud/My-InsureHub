# My InsureHub

A full-stack, "Digital Filing Cabinet" web app where users can store, manage, and analyze multiple insurance contracts in a centralized platform, complete with a dedicated SaaS Administrative Portal.

### App Screenshots
| Dashboard | All Policies |
| :---: | :---: |
| ![Dashboard](assets/MyInsureHub%20-%20Dashboard.JPG) | ![Policies](assets/MyInsureHub%20-%20Policies.JPG) |

| AI Policy Assistant | Global Claims Tracker |
| :---: | :---: |
| ![Policy Assistant](assets/MyInsureHub%20-%20PolicyAssistant.JPG) | ![Claims](assets/MyInsureHub%20-%20Claims.JPG) |

| Support & Assistance | |
| :---: | :---: |
| ![Support](assets/MyInsureHub%20-%20Assistance.JPG) | |

## 🌟 Features

- **Google & Native Authentication**: Secure sign-in using Firebase and traditional credentials with full password recovery workflows.
- **Bilingual Interface**: Seamlessly switch between English and French with real-time translations across the entire application.
- **Multi-Policy Vault**: Upload and store multiple insurance policies (Auto, Home, Health, Life).
- **AI Extraction**: Automatically extracts the company name, policy type, main guarantees, and deductibles using the Groq LLaMA 3.1 model.
- **Supplemental Documents**: Attach related riders, ID cards, or endorsements directly to a policy's file.
- **In-App & Email Notifications**: Real-time alerts directly in the navigation bar and via email whenever an admin replies to a ticket.
- **Manual Claims Tracker**: A CRUD interface to log and track claims (amount, date, description, status) linked directly to specific policies.
- **Context-Aware AI Chat**: A persistent Chat Assistant scoped strictly by `policy_id`. It physically cannot confuse your Auto policy rules with your Home policy rules.
- **Modern UI**: A cheerful, professional "Dribbble-style" light theme built with Next.js, featuring a clean Sidebar and TopNav.

## 🏢 NEW: SaaS Admin Portal

InsureHub now features a completely separate, secure Admin Dashboard located at `/admin/dashboard` allowing platform managers to monitor the entire user base.

- **KPI Analytics**: Track total active users, global policy counts, and submitted claims.
- **User Directory**: View all registered users, their policy/claim counts, and instantly **Suspend** bad actors with a single click.
- **360° User Inspection**: Click into any user's profile to view their complete private cabinet (all of their uploaded policies and filed claims).
- **Two-Way Helpdesk**: Users can submit Support Tickets. Admins can view these tickets in the portal and use the interactive Reply feature to send a beautifully formatted response directly to the user's real email inbox.
- **Zero-Touch Auto-Provisioning**: Admins are managed exclusively through backend `.env` variables to prevent security risks.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + Lucide React
- **Backend**: FastAPI (Python 3.11) + SQLAlchemy
- **Database**: SQLite (`policylens.db`)
- **LLM**: Groq API (llama-3.1-8b-instant) — OpenAI-compatible
- **Embeddings**: sentence-transformers (all-MiniLM-L6-v2) — runs locally
- **Vector store**: ChromaDB (Persists to local disk `./chroma_db`)
- **Email Dispatch**: Native Python SMTP module

## ⚙️ Environment Variables

Backend needs a `.env` file:
```env
GROQ_API_KEY=your_groq_key_here
SUPPORT_EMAIL=your_business_email@gmail.com
SUPPORT_EMAIL_PASSWORD=your_app_specific_password

# To create an Admin, add their email and a temporary password here. 
# They can log in immediately at /admin/login without registering first.
ADMIN_CREDENTIALS=master@insurehub.com:supersecret123,partner@insurehub.com:welcome2026
```

Frontend needs a `.env.local` file:
```env
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
│   ├── auth.py (JWT Authentication & Admin Security)
│   ├── .env
│   ├── requirements.txt
│   └── services/
│       ├── pdf_parser.py
│       ├── ai_analyzer.py
│       └── rag_store.py (ChromaDB persistence)
└── frontend/
    ├── app/ 
    │   ├── (user_app)/ (Next.js App Router: /dashboard, /policies, /claims)
    │   └── (admin_app)/ (Secure routes: /admin/login, /admin/dashboard, /admin/tickets)
    ├── components/ (TopNav, Sidebar, UploadDropzone)
    ├── context/ (AuthContext.tsx)
    └── .env.local
```

## 🚀 Setup Instructions

1. **Get a Groq API key**:
   - Sign up at [Groq](https://console.groq.com/)
   - Create an API key

2. **Configure backend**:
   - Add your Groq API key to `.env`
   - Configure the `ADMIN_CREDENTIALS` and `SUPPORT_EMAIL` to fully unlock the admin portal.

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
   - User App: http://localhost:3000
   - Admin Portal: http://localhost:3000/admin/login
   - Backend API docs: http://localhost:8000/docs