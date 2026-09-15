import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    
    APP_NAME: str = "CLARION"
    APP_SUBTITLE: str = "AI-Powered Threat Intelligence Correlation & Prioritisation Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sentinel_fusion.db")
    
    # IBM watsonx Configuration
    WATSONX_API_KEY: Optional[str] = os.getenv("WATSONX_API_KEY", None)
    WATSONX_PROJECT_ID: Optional[str] = os.getenv("WATSONX_PROJECT_ID", None)
    WATSONX_URL: str = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    WATSONX_MODEL_ID: str = os.getenv("WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct")
    
    # Fallback / Demo AI mode
    AI_MODE: str = "WATSONX" if (os.getenv("WATSONX_API_KEY") and os.getenv("WATSONX_PROJECT_ID")) else "DEMO"
    
    # Correlation & Risk Scoring Defaults
    CORRELATION_WINDOW_MINUTES: int = int(os.getenv("CORRELATION_WINDOW_MINUTES", "30"))
    WEIGHT_SEVERITY: float = 25.0
    WEIGHT_ASSET_CRITICALITY: float = 25.0
    WEIGHT_CORRELATION_STRENGTH: float = 20.0
    WEIGHT_CONFIDENCE: float = 20.0
    WEIGHT_OBSERVED_IMPACT: float = 10.0
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()

