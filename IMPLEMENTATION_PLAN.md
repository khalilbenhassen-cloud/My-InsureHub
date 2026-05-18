# Implementation Plan: PolicyLens "Digital Policy Cabinet"

We will pivot PolicyLens from a single-upload utility into a comprehensive, multi-policy filing cabinet. Based on your feedback, we will use the clean, cheerful **light theme** and implement a **Top Navigation Bar** (instead of a sidebar) for a simpler, more modern layout.

## User Review Required
> [!IMPORTANT]
> **Authentication & Storage:** The current app is a "demo" with no auth and no persistent storage. To support multiple policies and manual claims, we need a database. I propose using a **local SQLite database** since it requires no extra setup for you. We will also mock a "single user" session for now, so you don't have to log in every time. Do you approve of this approach?

## Open Questions
- **Vector Database (ChromaDB):** Should we persist ChromaDB to disk so that the AI remembers the policies after you restart the backend, or is it okay if the AI re-indexes the PDFs upon server start? I propose persisting it to disk.

---

## Proposed Changes

We will restructure both the Next.js frontend and the FastAPI backend.

### Backend (FastAPI)

We will introduce a SQLite database to persist policies, claims, and document metadata.

#### [NEW] `backend/database.py`
- Setup SQLAlchemy with a SQLite database (`policylens.db`).
- Define schema: `Policy` (company, summary, guarantees), `Document` (filename, type), `Claim` (date, desc, amount, status).

#### [MODIFY] `backend/main.py`
- Add new REST endpoints:
  - `GET /policies` and `POST /policies`
  - `GET /policies/{id}`
  - `GET /claims` and `POST /claims`
  - `POST /policies/{id}/documents` (to upload riders/ID cards)

#### [MODIFY] `backend/services/rag_store.py`
- Update the ChromaDB vector store to use `policy_id` in the document metadata. This ensures the Chat Assistant only retrieves context from documents belonging to the specific policy being viewed.

---

### Frontend (Next.js)

We will completely revamp the UI from dark mode to the cheerful light theme and implement a multi-page routing structure with a Top Navigation Bar.

#### [MODIFY] `frontend/tailwind.config.ts` & `frontend/app/globals.css`
- Strip out the deep dark mode colors.
- Introduce the new light theme palette: crisp whites, reassuring blues (`blue-600`), safety greens (`emerald-500`), and soft drop shadows.

#### [NEW] `frontend/components/TopNav.tsx`
- Implement a persistent top navigation bar: `[Logo]   Dashboard | Policies | Claims`

#### [NEW] `frontend/app/dashboard/page.tsx`
- The **Home / Dashboard** view.
- Fetches all policies and displays the "Policy Cards" grid.

#### [NEW] `frontend/app/policies/page.tsx`
- The **All Policies** view.
- A list of all active policies with an "Add New Policy" button.

#### [NEW] `frontend/app/policies/[id]/page.tsx`
- The **Policy Detail View** (The Filing Cabinet).
- Left column: Main Guarantees, Related Documents File Manager, Manual Claims Log.
- Right column: Sticky AI Chat Assistant, scoped to `policy_id`.

#### [NEW] `frontend/app/claims/page.tsx`
- The **Global Claims** view.
- A data table displaying all manual claims across every policy.

---

## Verification Plan

### Automated/Manual Testing
1. **Backend Tests:** Run Uvicorn. Test the new `/policies` and `/claims` endpoints using Swagger UI to ensure the SQLite database saves records correctly.
2. **AI Scoping Test:** Upload Policy A and Policy B. Ask the AI in Policy A's chat about a detail specific to Policy B. Verify that the AI *does not* know the answer, proving the RAG store is correctly scoped by `policy_id`.
3. **Frontend UI Check:** Verify the Light Theme is applied consistently. Ensure the Top Navigation correctly routes between Dashboard, Policies, and Claims without breaking layout.
