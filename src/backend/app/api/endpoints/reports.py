from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.report import Report
from app.schemas.all_schemas import ReportResponse, ReportCreateRequest
from app.services.report_service import generate_report

router = APIRouter()

@router.get("", response_model=List[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    """List all generated operational and commander reports."""
    return db.query(Report).order_by(Report.created_at.desc()).all()

@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Retrieve specific report contents."""
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
    return rep

@router.post("/generate", response_model=ReportResponse)
def create_report(req: ReportCreateRequest, db: Session = Depends(get_db)):
    """Generate a new operational report (BLUF, Incident Dossier, Daily Threat Summary, etc.)."""
    rep = generate_report(
        db=db,
        report_type=req.report_type,
        title=req.title,
        incident_id=req.incident_id,
        notes=req.notes
    )
    return rep

@router.get("/{report_id}/download")
def download_report_html(report_id: str, db: Session = Depends(get_db)):
    """Return raw standalone HTML formatted for browser print-to-PDF."""
    rep = db.query(Report).filter(Report.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")
        
    full_html = f"""<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8"/>
        <title>{rep.title} - Clarion</title>
        <style>
            body {{ background: #ffffff; margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
            @media print {{ body {{ padding: 0; }} }}
        </style>
    </head>
    <body>
        {rep.content_html}
    </body>
    </html>"""
    return Response(content=full_html, media_type="text/html")
