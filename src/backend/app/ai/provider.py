from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.schemas.all_schemas import BLUFResponse

class AIProvider(ABC):
    @abstractmethod
    def generate_bluf(self, incident: Any, alerts: List[Any], assets: List[Any]) -> BLUFResponse:
        """Generate structured military Bottom Line Up Front (BLUF) briefing."""
        pass

    @abstractmethod
    def answer_assistant_query(self, prompt: str, context: Dict[str, Any]) -> str:
        """Generate grounded cybersecurity analyst responses using live database context."""
        pass

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return provider status and configuration details."""
        pass
