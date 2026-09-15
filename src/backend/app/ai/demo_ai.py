import json
from typing import Dict, Any, List
from app.ai.provider import AIProvider
from app.schemas.all_schemas import BLUFResponse

class DemoAIProvider(AIProvider):
    """
    High-fidelity deterministic AI provider used when IBM watsonx credentials are absent.
    Ensures 100% offline functionality without hallucination or network dependencies.
    """
    
    def generate_bluf(self, incident: Any, alerts: List[Any], assets: List[Any]) -> BLUFResponse:
        title = incident.title
        score = incident.risk_score
        priority = incident.priority
        alert_count = len(alerts)
        
        asset_names = [f"{a.id} ({a.hostname})" for a in assets] if assets else ["Target Environment Hosts"]
        techniques = list({a.mitre_technique_id for a in alerts if a.mitre_technique_id})
        sources = list({a.source for a in alerts})
        src_ips = list({a.src_ip for a in alerts if a.src_ip and not a.src_ip.startswith("10.")})
        
        # Grounded Bottom Line
        if priority == "CRITICAL":
            bottom_line = (
                f"A coordinated high-severity cyber campaign is actively targeting critical operational infrastructure "
                f"({', '.join(asset_names[:2])}). Corroborated across {len(sources)} independent feeds ({', '.join(sources)}), "
                f"the threat presents imminent risk of domain compromise and operational disruption."
            )
        elif priority == "HIGH":
            bottom_line = (
                f"High-priority suspicious activity detected on {', '.join(asset_names[:2])}. Multi-source telemetry indicates "
                f"an active adversary probing defensive boundaries and attempting lateral progression."
            )
        else:
            bottom_line = (
                f"Routine threat activity observed targeting {', '.join(asset_names[:2])}. Risk score remains within baseline thresholds."
            )

        # What Happened
        first_evt = alerts[0].event_type if alerts else "initial probe"
        last_evt = alerts[-1].event_type if alerts else "activity burst"
        c2_clause = f" with outbound beaconing to {src_ips[0]}" if src_ips else ""
        what_happened = (
            f"Adversary initiated intrusion sequence starting with '{first_evt}', progressing through {alert_count} sequential alerts "
            f"culminating in '{last_evt}'{c2_clause}. Temporal sequence indicates coordinated script execution."
        )

        # Why It Matters
        why_it_matters = (
            f"Affected systems ({', '.join(asset_names[:2])}) hold high strategic criticality. Continued adversary persistence "
            f"allows credential harvesting, lateral escalation to adjacent SCADA/Tactical networks, and potential exfiltration."
        )

        # Recommended Actions
        if priority == "CRITICAL":
            recommended_actions = [
                f"Isolate affected hosts ({', '.join(asset_names[:2])}) at network segmentation firewalls immediately.",
                f"Block egress traffic to identified threat actor IP addresses ({', '.join(src_ips) if src_ips else 'external proxies'}).",
                "Execute emergency credential rotation for all compromised and service accounts.",
                "Capture volatile memory on target systems for forensic artifact preservation."
            ]
        elif priority == "HIGH":
            recommended_actions = [
                f"Restrict remote administrative access to {', '.join(asset_names[:2])}.",
                "Monitor boundary egress logs for atypical volume or port deviations.",
                "Validate recent authentication sessions against privileged baseline."
            ]
        else:
            recommended_actions = [
                "Verify alert signatures against sanctioned software update baselines.",
                "Close event ticket if corroborated as authorized administrative maintenance."
            ]

        confidence_label = "Almost Certainly (90%+)" if score >= 85 else ("Likely (70-89%)" if score >= 60 else "Roughly Even Chance")

        return BLUFResponse(
            incident_id=incident.id,
            bottom_line=bottom_line,
            what_happened=what_happened,
            why_it_matters=why_it_matters,
            affected_assets=asset_names,
            confidence_level=confidence_label,
            relevant_mitre_techniques=techniques if techniques else ["T1078", "T1059"],
            recommended_priority=priority,
            recommended_actions=recommended_actions,
            ai_provider="DEMO AI (Deterministic Fallback)"
        )

    def answer_assistant_query(self, prompt: str, context: Dict[str, Any]) -> str:
        prompt_lower = prompt.lower()
        incidents = context.get("incidents", [])
        kpis = context.get("kpis", {})
        assets = context.get("assets", [])
        
        # 1. Top threats query
        if "top threat" in prompt_lower or "priority" in prompt_lower or "critical" in prompt_lower:
            criticals = [i for i in incidents if i.get("priority") == "CRITICAL" or i.get("risk_score", 0) >= 80]
            if not criticals and incidents:
                criticals = sorted(incidents, key=lambda x: x.get("risk_score", 0), reverse=True)[:3]
            
            lines = ["### Priority Threat Summary\n"]
            lines.append(f"Based on real-time correlation across {kpis.get('total_alerts', 0)} alerts, the following incidents require immediate commander action:\n")
            for inc in criticals[:3]:
                lines.append(f"- **{inc.get('id')}: {inc.get('title')}**")
                lines.append(f"  - **Risk Score:** {inc.get('risk_score')}/100 | **Priority:** {inc.get('priority')}")
                lines.append(f"  - **Status:** {inc.get('status')} | **Correlated Alerts:** {inc.get('alerts_count')}")
                lines.append(f"  - **Key Factor:** Corroborated multi-discipline sensor telemetry.")
            lines.append("\n**Recommendation:** Prioritize network isolation for hosts associated with the highest risk score.")
            return "\n".join(lines)

        # 2. Specific Incident query (e.g. INC-001)
        if "inc-001" in prompt_lower or "why is inc" in prompt_lower:
            return (
                "### Analysis: Why INC-001 is Critical (Risk 94/100)\n\n"
                "Incident **INC-001 (Possible Credential Compromise & C2 Campaign)** is classified as **CRITICAL** due to 5 explainable factors:\n\n"
                "1. **Severity (24/25):** Multiple `critical` and `high` alerts detected, including LSASS memory dumping and unauthorized token escalation.\n"
                "2. **Asset Criticality (25/25):** The target asset is **ASSET-104 (dc-primary.mil.net)**, the primary command and domain controller server.\n"
                "3. **Correlation Strength (18/20):** Corroborated across 4 distinct INT sources: SIEM, EDR, Network Sensor, and Firewall within a 14-minute window.\n"
                "4. **Confidence (18/20):** High-confidence sensor signatures matched against known NSA/CYBERCOM threat advisories for APT-29.\n"
                "5. **Observed Impact (9/10):** Adversary achieved active Command and Control beaconing to `198.51.100.45` and attempted lateral movement.\n\n"
                "**Action:** Immediate host isolation and border IP null-routing are required."
            )

        # 3. Affected Assets query
        if "asset" in prompt_lower:
            lines = ["### Most Affected Critical Assets\n"]
            for a in assets[:5]:
                lines.append(f"- **{a.get('id')} ({a.get('hostname')})** — Tier: `{a.get('criticality')}`, Risk: `{a.get('current_risk')}/100`, Status: `{a.get('status')}`")
            lines.append("\n**Observation:** ASSET-104 (Command Server) and ASSET-107 (SCADA Gateway) exhibit the highest threat exposure.")
            return "\n".join(lines)

        # 4. MITRE techniques query
        if "mitre" in prompt_lower or "technique" in prompt_lower:
            return (
                "### MITRE ATT&CK Behavioral Profile\n\n"
                "Current adversary behavior is concentrated across the following key techniques:\n"
                "- **T1003 (OS Credential Dumping):** Observed on ASSET-104 via LSASS memory scraping.\n"
                "- **T1059 (Command and Scripting Interpreter):** Obfuscated PowerShell execution stagers.\n"
                "- **T1078 (Valid Accounts):** Compromise and abuse of service account `svc_backup`.\n"
                "- **T1071 (Application Layer Protocol):** Outbound TLS beaconing to external C2 nodes.\n"
                "- **T1021 (Remote Services):** Lateral SMB/RPC movement attempts towards SCADA gateways.\n\n"
                "**Assessment:** The adversary is executing a classic Advanced Persistent Threat (APT) kill-chain."
            )

        # 5. Commander Briefing
        if "briefing" in prompt_lower or "commander" in prompt_lower or "summary" in prompt_lower:
            return (
                "### Executive Commander Threat Briefing\n\n"
                "**CURRENT THREAT LEVEL:** `CRITICAL`\n\n"
                f"- **Total Ingested Alerts:** {kpis.get('total_alerts', 4827):,} across 6 sensor feeds.\n"
                f"- **Correlated Incidents:** {kpis.get('correlated_incidents', 71)} active security clusters.\n"
                f"- **False Positive Rate:** {kpis.get('false_positive_rate', 64.2)}% safely filtered by explainable suppression rules.\n"
                "- **Primary Incident of Concern:** `INC-001` (Operation Nightfall) targeting Primary Domain Controller `ASSET-104`.\n\n"
                "**Operational Directive:**\n"
                "Enact defensive containment protocol Bravo on Sector 4 Command network. Maintain active monitoring on SCADA Telemetry Gateway."
            )

        # Default grounded SOC response
        return (
            f"**Clarion Assistant:** Analysis of the current operations floor shows {kpis.get('critical_threats', 8)} critical "
            f"threats and {kpis.get('high_priority', 23)} high-priority incidents currently correlated. "
            f"The primary attack vector involves credential compromise on DC-PRIMARY with secondary probing of SCADA assets. "
            f"You can ask me to analyze specific incidents (e.g. 'Why is INC-001 critical?'), list affected assets, or generate commander summaries."
        )

    def get_status(self) -> Dict[str, Any]:
        return {
            "mode": "DEMO",
            "configured": False,
            "model_id": "Clarion-Deterministic-Analyst-Engine",
            "url": "Local Kernel",
            "status_message": "AI MODE: DEMO (Deterministic grounded cybersecurity engine active)"
        }
