import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.database.seed_data import seed_database
from app.api.router import api_router
from app.models import * # ensure models loaded for schema creation

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial operational baseline data if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    print(f"[{settings.APP_NAME}] Backend initialized successfully.")
    print(f"[{settings.APP_NAME}] Operational AI Mode: {settings.AI_MODE}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_SUBTITLE,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "subtitle": settings.APP_SUBTITLE,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "ai_mode": settings.AI_MODE,
        "documentation": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "HEALTHY",
        "service": settings.APP_NAME,
        "ai_mode": settings.AI_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
