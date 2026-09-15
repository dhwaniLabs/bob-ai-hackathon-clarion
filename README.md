# 🛡️ CLARION — Threat Intelligence Correlation & Alert Prioritisation Assistant

> **IBM Hackathon Challenge D2:** An intelligent, explainable cybersecurity operations platform that ingests multi-source sensor streams, correlates fragmented alerts into high-confidence incidents, filters false positives, maps attacker techniques to MITRE ATT&CK, and produces executive Bottom-Line-Up-Front (BLUF) briefings powered by IBM watsonx.ai.

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | clarion |
| **Track** | AI |
| **Team Lead** | Shrey Modi — 25dcs061@charusat.edu.in |
| **Members** | Dhwani Padaliya (25dcs065@charusat.edu.in), Selvy Modi (25dcs060@charusat.edu.in), Krishna Mulchandani (25dcs062@charusat.edu.in) |

---

## 🎯 Problem Statement

Defence analysts receive thousands of heterogeneous alerts every day from SIEM, EDR, network sensors, satellite feeds, and intelligence reports. These signals arrive in disparate formats, duplicate alerts scatter across systems, and high false-positive ratios obscure critical attacks. SOC teams struggle with severe alert fatigue and lack explainable, automated prioritization to protect vital infrastructure.

---

## 💡 Solution

CLARION provides an end-to-end operational platform that normalizes 6 heterogeneous telemetry formats into a unified schema, performs sliding-window Union-Find graph correlation to consolidate related alerts into unified incidents, and computes a transparent 5-factor risk score (0–100). Integrated with IBM watsonx.ai (Granite 3.0), CLARION generates executive BLUF dossiers and empowers watch commanders with an interactive, grounded AI Copilot.

---

## ✨ Key Features

- **Multi-Source Alert Normalization:** Ingests and standardizes SIEM, EDR, Network Sensors, SIGINT, ISR, and OSINT into a single structured schema.
- **Dynamic Graph Correlation:** Correlates scattered alerts into unified security incidents using temporal clustering and shared entity graphs.
- **Explainable 5-Factor Risk Scoring:** Mathematically decomposes threat priority into Severity, Asset Criticality, Correlation Strength, Confidence, and Impact.
- **Enterprise MITRE ATT&CK Matrix:** Interactive matrix visualizing attacker progression across tactics and techniques with linked telemetry evidence.
- **IBM watsonx.ai & Grounded AI Copilot:** Generates executive BLUF briefings, on-demand attack analyses, and commander intelligence reports with offline deterministic fallback.
- **Executive White / Dark Operations Console:** Modern, responsive 14-page command floor with 1-click theme toggling and real-time telemetry dashboards.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.11+, TypeScript, SQL |
| **Frameworks** | FastAPI, React 18, Tailwind CSS, Vite, SQLAlchemy |
| **IBM Technologies** | IBM watsonx.ai, IBM Granite 3.0 Instruct, IBM Bob |
| **Databases** | SQLite (zero-setup demo), PostgreSQL (production-ready) |
| **Other** | Docker, Docker Compose, Pytest, Recharts, Lucide Icons |

---

## 📁 Repository Structure

```text
├── src/                      # Complete operational source code
│   ├── backend/              # FastAPI application, correlation engine, and AI providers
│   ├── frontend/             # React 18 + Vite + Tailwind CSS executive console
│   ├── .env.example          # Environment variable template
│   └── README.md             # Codebase architecture documentation
├── docs/                     # Detailed technical documentation
│   ├── problem-statement.md  # Deep dive into Hackathon Problem Statement D2
│   ├── solution-overview.md  # Architectural and operational breakdown
│   ├── architecture.md       # Mermaid architecture diagram and data pipeline
│   └── setup-guide.md        # Step-by-step installation and local execution guide
├── demo/                     # Demo artifacts and verification proof
│   ├── demo-video-link.txt   # Video demonstration link
│   ├── live-demo-url.txt     # Deployment URL or local operational indicator
│   └── screenshots/          # Application screenshots
├── presentation/             # Presentation deck (slides.pptx)
├── submission.yaml           # Automated evaluator metadata contract
└── start_clarion.bat         # One-click Windows launcher
```

---

## ⚡ How to Run

```bash
# 1. Clone the repository
git clone https://github.com/drijesh-ppatel/bob-ai-hackathon-submission-template.git
cd bob-ai-hackathon-submission-template

# 2. Windows One-Click Quickstart
start_clarion.bat

# Manual Setup Alternative:
# Backend:
cd src/backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (in another terminal):
cd src/frontend
npm install
npm run dev
```

- **Operations Console:** http://localhost:3000
- **FastAPI Interactive API Docs:** http://127.0.0.1:8000/docs

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pptx](presentation/slides.pptx) |

---

## ⚠️ Known Limitations

- Real-time IBM watsonx.ai generation requires active IBM Cloud credentials; when absent, CLARION operates seamlessly in DEMO mode using its built-in deterministic analyst engine.
- Synthetic attack simulation injects realistic telemetry for Operation Nightfall but resets on database reinitialization.

---

## 🏅 What We're Most Proud Of

The mathematically explainable 5-factor risk scoring engine combined with live Union-Find temporal clustering that reduces alert noise by over 90% while surfacing genuine multi-stage APT attacks in real time, backed by 100% test coverage (11/11 pytest test cases passing).
