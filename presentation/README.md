# CLARION Slide Deck

This directory contains the official pitch and technical architecture slide deck for **CLARION**, submitted for **IBM Hackathon Challenge Track D2: Threat Intelligence Correlation & Alert Prioritisation**.

---

## Slide Deck Files

- 📄 **[slides.pdf](slides.pdf)** *(Preferred — universally viewable in browser and on GitHub)*
- 📊 **[slides.pptx](slides.pptx)** *(PowerPoint source format)*

---

## Deck Outline

1. **Title & Mission:** CLARION — AI-Powered Threat Intelligence Correlation & Prioritisation Assistant.
2. **Problem Analysis (Track D2):** The 5 critical failure modes of modern defense watch floors (alert volume overload, heterogeneous telemetry formats, scattered attack patterns, false-positive ratio, cognitive latency).
3. **The Solution:** End-to-end multi-INT ingestion, dynamic sliding-window Union-Find graph clustering, explainable 5-factor risk scoring, and automated BLUF commander briefings.
4. **Technical Architecture:** Decoupled FastAPI backend, React 18 executive operations floor, SQLAlchemy persistence, and IBM watsonx.ai integration with deterministic offline fallback.
5. **MITRE ATT&CK Matrix & Cyber Kill-Chain:** Tactical behavior mapping linking telemetry evidence directly to enterprise attacker techniques.
6. **IBM Technology Integration:** How IBM watsonx.ai (Granite 3.0) synthesizes correlated signals into executive BLUF briefings and operational defense directives.
7. **Operational Impact & Validation:** Demonstrating a 90%+ reduction in alert noise, sub-second correlation velocity, and 100% test coverage.
8. **Team & Engineering Highlights:** Roles, architecture decisions, and defense readiness roadmap.
