# Setup & Verification Guide: CLARION

> **This file is read by the automated evaluation pipeline. Follow these instructions to run and test CLARION locally.**

## Prerequisites

Ensure the following tools are installed:

- Python 3.11+ (Tested on Python 3.11 and 3.14)
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose
- (Optional) IBM Cloud account with watsonx.ai credentials (CLARION automatically falls back to its deterministic grounded engine if omitted)

## Environment Variables

Copy `src/.env.example` to `src/.env` (optional, defaults run out of the box with zero setup):

```bash
cp src/.env.example src/.env
```

| Variable | Description | Required | Default |
|---|---|---|---|
| `DATABASE_URL` | SQLite / PostgreSQL connection URI | No | `sqlite:///./clarion.db` |
| `WATSONX_API_KEY` | IBM watsonx.ai API key | No | None (Falls back to offline Demo AI) |
| `WATSONX_PROJECT_ID` | IBM watsonx.ai Project ID | No | None |
| `WATSONX_URL` | watsonx endpoint URL | No | `https://us-south.ml.cloud.ibm.com` |
| `WATSONX_MODEL_ID` | Model identifier | No | `ibm/granite-3-8b-instruct` |
| `CORRELATION_WINDOW_MINUTES` | Dynamic sliding window | No | `30` |

---

## Installation & Running

### Option 1: One-Click Windows Launcher (Fastest)

From the repository root, double-click or execute:

```cmd
start_clarion.bat
```

This launches both the FastAPI backend and Vite frontend in separate terminal windows.

---

### Option 2: Manual Terminal Startup

#### 1. Backend Setup & Run
```bash
cd src/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

#### 2. Frontend Setup & Run
Open a new terminal window:
```bash
cd src/frontend
npm install
npm run dev
```
- Access the Operations Console at: [http://localhost:3000](http://localhost:3000)

---

### Option 3: Docker Compose
```bash
docker compose up --build
```

---

## Running Automated Tests

Run the complete backend test suite:
```bash
cd src/backend
python -m pytest tests/
```
**Expected Output:**
```text
collected 11 items
tests/test_api_endpoints.py ........                                     [ 72%]
tests/test_pipeline.py ...                                               [100%]
======================= 11 passed in ~2.5s =======================
```

Run frontend build check:
```bash
cd src/frontend
npm run build
```
**Expected Output:**
```text
✓ 2310 modules transformed.
✓ built in ~8s
0 errors
```

---

## Troubleshooting

| Error / Symptom | Possible Cause | Resolution |
|---|---|---|
| `Port 8000 already in use` | Another uvicorn process is running | Terminate old process: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess` |
| `Port 3000 already in use` | Another Vite server is running | Vite will offer port 3001 or kill existing node process on port 3000 |
| `watsonx credentials missing` | No `.env` credentials provided | System automatically switches to `AI_MODE=DEMO` (Grounded local engine active) |
