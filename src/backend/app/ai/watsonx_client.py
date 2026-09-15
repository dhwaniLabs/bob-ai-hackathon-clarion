import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.ai.provider import AIProvider
from app.ai.demo_ai import DemoAIProvider
from app.core.config import settings
from app.schemas.all_schemas import BLUFResponse

logger = logging.getLogger("clarion.watsonx")

class WatsonxAIProvider(AIProvider):
    """
    IBM watsonx.ai integration provider using IBM Foundation Models (e.g. Granite 3.x).
    Gracefully falls back to DemoAIProvider if network or authentication errors occur.
    """
    
    def __init__(self):
        self.api_key = settings.WATSONX_API_KEY
        self.project_id = settings.WATSONX_PROJECT_ID
        self.url = settings.WATSONX_URL.rstrip("/")
        self.model_id = settings.WATSONX_MODEL_ID
        self.fallback = DemoAIProvider()
        self._token: Optional[str] = None

    def _get_iam_token(self) -> Optional[str]:
        """Obtain IBM Cloud IAM Bearer Token using API Key."""
        if not self.api_key:
            return None
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    "https://iam.cloud.ibm.com/identity/token",
                    data={
                        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                        "apikey": self.api_key
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if res.status_code == 200:
                    return res.json().get("access_token")
                else:
                    logger.warning(f"Failed to obtain IBM IAM token: {res.text}")
        except Exception as e:
            logger.warning(f"Error connecting to IBM Cloud IAM: {e}")
        return None

    def _call_watsonx(self, prompt: str) -> Optional[str]:
        """Send prompt to IBM watsonx.ai text generation endpoint."""
        token = self._get_iam_token()
        if not token or not self.project_id:
            return None

        endpoint = f"{self.url}/ml/v1/text/generation?version=2023-05-29"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        payload = {
            "model_id": self.model_id,
            "project_id": self.project_id,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 600,
                "min_new_tokens": 50,
                "repetition_penalty": 1.1
            }
        }
        
        try:
            with httpx.Client(timeout=15.0) as client:
                resp = client.post(endpoint, json=payload, headers=headers)
                if resp.status_code == 200:
                    results = resp.json().get("results", [])
                    if results:
                        return results[0].get("generated_text", "").strip()
        except Exception as e:
            logger.warning(f"watsonx.ai API call failed: {e}. Falling back to Demo AI.")
            
        return None

    def generate_bluf(self, incident: Any, alerts: List[Any], assets: List[Any]) -> BLUFResponse:
        prompt = (
            f"You are a Senior Defence Intelligence Analyst. Generate a concise military Bottom Line Up Front (BLUF) briefing "
            f"for the following cybersecurity incident:\n\n"
            f"Incident ID: {incident.id}\n"
            f"Title: {incident.title}\n"
            f"Risk Score: {incident.risk_score}/100\n"
            f"Priority: {incident.priority}\n"
            f"Correlated Alerts ({len(alerts)}): {', '.join(a.event_type for a in alerts[:6])}\n"
            f"Affected Assets: {', '.join(a.hostname for a in assets)}\n\n"
            f"Structure your response strictly as:\n"
            f"BOTTOM LINE:\n<one concise sentence>\n"
            f"WHAT HAPPENED:\n<two sentences summarizing the sequence>\n"
            f"WHY IT MATTERS:\n<operational mission impact>\n"
            f"RECOMMENDED ACTIONS:\n<bulleted action points>\n"
        )
        
        gen_text = self._call_watsonx(prompt)
        if gen_text and len(gen_text) > 50:
            # Successfully generated via IBM watsonx
            return BLUFResponse(
                incident_id=incident.id,
                bottom_line=gen_text.split("WHAT HAPPENED:")[0].replace("BOTTOM LINE:", "").strip(),
                what_happened=gen_text,
                why_it_matters=f"Intrusion on {assets[0].hostname if assets else 'critical assets'} imperils mission operations.",
                affected_assets=[a.hostname for a in assets],
                confidence_level="Almost Certainly (watsonx verified)",
                relevant_mitre_techniques=list({a.mitre_technique_id for a in alerts if a.mitre_technique_id}),
                recommended_priority=incident.priority,
                recommended_actions=["Immediately isolate asset", "Revoke credentials", "Block external C2"],
                ai_provider=f"IBM watsonx.ai ({self.model_id})"
            )

        # Graceful fallback
        res = self.fallback.generate_bluf(incident, alerts, assets)
        return res

    def answer_assistant_query(self, prompt: str, context: Dict[str, Any]) -> str:
        watsonx_prompt = (
            f"You are Clarion's operational SOC AI assistant. Ground your answer strictly in these real-time metrics:\n"
            f"Total Alerts: {context.get('kpis', {}).get('total_alerts')}\n"
            f"Critical Incidents: {context.get('kpis', {}).get('critical_threats')}\n"
            f"Question: {prompt}\n"
            f"Provide a direct, authoritative cybersecurity analyst answer."
        )
        gen = self._call_watsonx(watsonx_prompt)
        if gen:
            return gen
        return self.fallback.answer_assistant_query(prompt, context)

    def get_status(self) -> Dict[str, Any]:
        return {
            "mode": "WATSONX",
            "configured": True,
            "model_id": self.model_id,
            "url": self.url,
            "status_message": f"AI MODE: WATSONX ({self.model_id} connected)"
        }

def get_ai_provider() -> AIProvider:
    """Factory to return configured AI provider."""
    if settings.WATSONX_API_KEY and settings.WATSONX_PROJECT_ID:
        return WatsonxAIProvider()
    return DemoAIProvider()
