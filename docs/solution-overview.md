# Solution Overview: CLARION

## What We Built
**CLARION** is an operational cybersecurity decision-support platform engineered specifically for defense watch floors. It automatically ingests multi-source threat telemetry, standardizes heterogeneous formats into a canonical schema, clusters related alerts across a dynamic sliding window into cohesive security incidents, calculates transparent 5-factor risk priority scores, maps attacker tactics to the MITRE ATT&CK framework, and generates actionable, structured Bottom-Line-Up-Front (BLUF) briefings with IBM watsonx.ai.

## How It Works
CLARION executes an automated 5-stage analytical pipeline:

1. **Multi-Source Normalization:** Ingestion adapters normalize diverse sensor streams (SIEM, EDR, Suricata network flow, RF/satellite intercepts, and intelligence reports) into a unified Alert data contract with normalized timestamps, IP addresses, entity identifiers, and event types.
2. **Temporal Graph Correlation (Union-Find):** Alerts sharing common entities (target host, victim IP, compromised user credentials, or threat actor infrastructure) within an adjustable sliding time window (default: 30 minutes) are clustered into high-confidence Incident entities.
3. **Transparent 5-Factor Risk Scoring:** Rather than treating risk as an opaque number, CLARION calculates each incident score ($0–100$) using five explainable weighted factors:
   $$\text{Score} = w_{\text{sev}} \cdot S + w_{\text{asset}} \cdot A + w_{\text{corr}} \cdot C + w_{\text{conf}} \cdot F + w_{\text{impact}} \cdot I$$
4. **Kill-Chain MITRE ATT&CK Mapping:** Each alert's observed event type and behavior is mapped to standard MITRE Enterprise ATT&CK techniques (e.g., T1078 Valid Accounts, T1059 Scripting, T1003 Credential Dumping, T1071 C2 Beaconing) to illuminate kill-chain progression.
5. **AI Commander Dossier Generation:** IBM watsonx.ai (Granite 3.0) synthesizes correlated telemetry to produce executive BLUF dossiers with automated containment directives, while a grounded Intel Copilot provides conversational operations support.

## Architecture Flow
```text
[Raw Sensors: SIEM / EDR / Network / RF] 
             ↓
[CLARION Normalization Ingest Adapter] 
             ↓
[Sliding-Window Union-Find Graph Correlator]
             ↓
[5-Factor Explainable Scoring & MITRE ATT&CK Engine]
             ↓
[IBM watsonx.ai Granite 3.0 / Offline Deterministic AI]
             ↓
[14-Page Executive White Theme Console & Printable BLUF Reports]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Deterministic Fallback Engine** | Defence installations often run in air-gapped or restricted-network environments; CLARION operates 100% offline with zero external network dependencies when watsonx.ai is unavailable. |
| **Union-Find Disjoint-Set Clustering** | Provides near-$O(N)$ linear-time performance for correlating thousands of alerts across sliding temporal windows without database query bottlenecks. |
| **5-Factor Explainability Breakdown** | Commanders require auditable mathematical justification before executing high-impact actions (e.g., network severance or server shutdown). |
| **Executive White Theme with Dark Toggle** | High-contrast daytime command floor visibility with instantaneous dark mode switching for low-light SOC watch environments. |

## IBM Technologies Used

- **IBM watsonx.ai (`ibm/granite-3-8b-instruct`):** Leveraged via the watsonx Python SDK to synthesize correlated telemetry streams into authoritative, executive BLUF briefings and automated defense containment directives.
- **IBM Bob Integration Architecture:** Designed to seamlessly integrate with IBM Bob CLI and agentic execution workflows for one-click defensive containment runbooks.
