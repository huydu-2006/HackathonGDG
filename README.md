# NavisAI — Cộng sự AI điều phối thông minh, bứt phá nghiên cứu

> **GDGoC Hackathon Vietnam 2026** — Team: team nào đó

NavisAI is an **Agentic AI** system that acts as an intelligent Project Manager for academic research teams. Unlike passive chatbots, NavisAI autonomously plans, decomposes goals, assigns tasks by skill, tracks progress, and evaluates deliverables.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **SMART Goal Generation** | AI decomposes your research objective into Specific, Measurable, Achievable, Relevant, Time-bound goals |
| 📋 **WBS Generation** | Auto-creates a weekly Work Breakdown Structure tailored to your team's skills |
| 👥 **Skill-based Assignment** | Tasks are assigned to the most suitable team member based on their skills |
| 📊 **Progress Dashboard** | Real-time overview of project status, task completion, and team workload |
| 🤖 **AI Evaluation** | Gemini 2.5 Pro reviews student submissions and gives constructive feedback |
| 📚 **RAG Document Search** | Retrieves relevant research papers and resources for each task phase |
| 🧠 **Long-term Memory** | Vector database (Pinecone) stores full project context across sessions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (Next.js 14)           │
│   Dashboard │ Project Detail │ Task Management   │
└────────────────────┬────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────┐
│               Backend (FastAPI)                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  API Routes  │  │   NavisAI Agent        │   │
│  │  /projects   │  │  (LangChain + Gemini)  │   │
│  │  /tasks      │  │  - SMART goal gen      │   │
│  │  /search     │  │  - WBS generation      │   │
│  └──────────────┘  │  - Task evaluation     │   │
│                    │  - Document search     │   │
│                    └────────────────────────┘   │
└─────────────────┬────────────────────────────────┘
                  │
     ┌────────────┴───────────┐
     │                        │
┌────▼────┐            ┌──────▼──────┐
│ Gemini  │            │  Pinecone   │
│  API    │            │ Vector DB   │
└─────────┘            └─────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, Uvicorn
- **AI**: Google Gemini 2.5 Flash/Pro via LangChain
- **Vector DB**: Pinecone (RAG for document retrieval)
- **Auth/Realtime**: Firebase (planned)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (optional — falls back to mock responses)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure environment (optional — works without API key)
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
uvicorn main:app --reload
# API docs available at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
HackathonGDG/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   ├── models/
│   │   └── schemas.py          # Pydantic data models
│   ├── api/
│   │   ├── projects.py         # Project CRUD + WBS generation endpoints
│   │   ├── tasks.py            # Task management + AI evaluation endpoints
│   │   └── search.py           # RAG document search endpoint
│   ├── agents/
│   │   └── navis_agent.py      # LangChain + Gemini agent with mock fallbacks
│   ├── services/
│   │   └── project_service.py  # Business logic + in-memory storage
│   └── tests/
│       └── test_api.py         # Integration tests (pytest + httpx)
└── frontend/
    ├── app/
    │   ├── page.tsx             # Dashboard
    │   ├── projects/
    │   │   ├── new/page.tsx     # Create project form
    │   │   └── [id]/page.tsx    # Project detail + task management
    │   ├── components/          # Reusable UI components
    │   └── lib/
    │       └── api.ts           # Typed API client
    └── package.json
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/` | List all projects |
| `POST` | `/api/projects/` | Create a new project |
| `GET` | `/api/projects/{id}` | Get project details |
| `POST` | `/api/projects/{id}/generate-wbs` | Generate SMART goals + WBS with AI |
| `GET` | `/api/projects/{id}/stats` | Get project progress statistics |
| `PUT` | `/api/projects/{id}/tasks/{task_id}` | Update task status/assignee |
| `POST` | `/api/projects/{id}/tasks/{task_id}/submit` | Submit task work |
| `POST` | `/api/projects/{id}/tasks/{task_id}/evaluate` | AI evaluation of submission |
| `POST` | `/api/search/documents` | RAG-powered document search |

Interactive API docs: http://localhost:8000/docs

---

## 👥 Team

| # | Name | Role |
|---|------|------|
| 1 | Nguyễn Đăng Dương | — |
| 2 | Đỗ Huy Du | — |
| 3 | Hoàng Bình Phương | — |
| 4 | Lê Đình Vĩnh | — |

---

## 📚 References

1. Google DeepMind. (2026). *Gemini API Documentation & Generative AI on Vertex AI.*
2. LangChain Inc. (2026). *Building Agentic Workflows with LangChain.*
3. Pinecone Systems. (2026). *Vector Databases and Retrieval-Augmented Generation (RAG) architecture.*
4. Project Management Institute (PMI). *Work Breakdown Structure (WBS) and S.M.A.R.T Standards.*
5. Andrew Ng (DeepLearning.AI). *The Future of AI: Agentic Workflows.*