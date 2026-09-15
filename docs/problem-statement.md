# Problem Statement: Threat Intelligence Correlation & Alert Prioritisation
> **IBM Hackathon Challenge Track D2**

## Background
In contemporary defense networks and mission-critical enterprise environments, Security Operations Centers (SOCs) and tactical watch floors ingest thousands of discrete telemetry signals around the clock. These incoming streams span Security Information and Event Management (SIEM) engines, Endpoint Detection and Response (EDR) sensors, network intrusion detection systems, satellite/SIGINT downlinks, and external cyber threat intelligence advisories.

## The Problem
Defence analysts on operational watch floors face critical challenges that cripple incident response:
1. **Extreme Alert Volume & Alert Fatigue:** Operations floors receive between 3,000 to 10,000+ alerts daily, causing cognitive overload.
2. **Heterogeneous, Non-Standard Data Formats:** Ingested signals arrive in conflicting formats (CEF syslog lines, raw JSON process trees, Suricata EVE records, RF intercepts, and free-text intelligence reports).
3. **Scattered Multi-Sensor Corroboration:** Multi-stage attacks (such as credential harvesting followed by lateral movement and C2 beaconing) are fragmented across disparate sensor feeds, hiding the broader attack pattern.
4. **Distorted False-Positive Ratios:** Over 60% of triggered alerts represent benign administrative activity, scanning sweeps, or benign software updates, consuming scarce analyst hours.
5. **Lack of Explainable Prioritization:** Existing alert tools provide arbitrary severity tags ("High", "Critical") without mathematically transparent justification grounded in asset value and attack progress.

## Who is Affected
- **Tactical Watch Commanders:** Who must make rapid go/no-go decisions regarding network isolation, operational continuity, and containment protocols.
- **Tier 1 & Tier 2 SOC Analysts:** Who manually pivot between 8+ disconnected consoles, triage individual alerts, and draft Bottom-Line-Up-Front (BLUF) briefings under strict time constraints.
- **Critical Asset Owners:** Administrators of Domain Controllers, SCADA gateways, and tactical communication relays whose assets are exposed during detection lag.

## Why It Matters
When an Advanced Persistent Threat (APT) actor compromises a command infrastructure or SCADA gateway, every minute of dwell time enables unauthorized persistence, credential dumping, and mission disruption. When analysts spend 70% of their operational shift triaging benign noise, Mean Time to Detect (MTTD) and Mean Time to Remediate (MTTR) stretch from minutes to hours or days, directly endangering operational security.

## Why Existing Solutions Fall Short
- **Legacy SIEM Rule Thresholds:** Static correlation rules trigger duplicate alerts for every atomic event rather than clustering them into a single coherent incident.
- **Black-Box AI Models:** Complex neural network alert scorers provide unverified scores without explainability chains, preventing commanders from trusting automated recommendations.
- **Disconnected Threat Intel Feeds:** Indicators of Compromise (IoCs) sit in external databases rather than dynamically matching active internal sensor sequences in real time.
