# CLARION Source Code

This directory contains the complete source code for **CLARION**, an AI-powered Threat Intelligence Correlation and Alert Prioritisation platform.

## Directory Structure

```text
src/
├── backend/                  # FastAPI 0.110.0 + SQLAlchemy + SQLite/PostgreSQL
│   ├── app/
│   │   ├── ai/               # IBM watsonx.ai client + high-fidelity deterministic Demo AI
│   │   ├── api/endpoints/    # REST endpoints (alerts, incidents, mitre, reports, analytics)
│   │   ├── core/             # Global configurations and scoring weight definitions
│   │   ├── database/         # Database engine, session maker, seed data
│   │   ├── models/           # SQLAlchemy ORM models (Alert, Incident, Asset, Mitre, Report)
│   │   ├── schemas/          # Pydantic v2 schemas and validation contracts
│   │   └── services/         # Normalization, Union-Find correlation, 5-factor scoring
│   ├── tests/                # Pytest automated test suite (11/11 passing)
│   ├── Dockerfile            # Container build for backend
│   ├── main.py               # Application entrypoint and startup lifecycle
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/       # UI widgets, Risk Score Gauge, Timeline, MITRE Matrix
│   │   ├── context/          # ThemeContext (White/Light default with 1-click Dark toggle)
│   │   ├── layouts/          # Topbar and Sidebar navigation
│   │   ├── pages/            # 14 complete operational views (Dashboard, Incidents, MITRE, etc.)
│   │   └── services/         # Axios API client bindings
│   ├── Dockerfile            # Container build for frontend
│   └── package.json          # Node dependencies and build scripts
│
└── .env.example              # Environment variables template
```

## Quick Start
- **Backend:** `cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`
- **Frontend:** `cd frontend && npm run dev`
- Or run `..\start_clarion.bat` from the repository root.
