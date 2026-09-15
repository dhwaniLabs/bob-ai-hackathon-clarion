from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.session import get_db
from app.models.indicator import Indicator
from app.schemas.all_schemas import IndicatorResponse

router = APIRouter()

@router.get("", response_model=List[IndicatorResponse])
def list_threat_intel(
    indicator_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List Threat Intelligence Indicators of Compromise (IOCs) with filtering."""
    query = db.query(Indicator)
    if indicator_type:
        query = query.filter(Indicator.indicator_type.ilike(indicator_type))
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Indicator.value.ilike(s),
                Indicator.threat_actor.ilike(s),
                Indicator.source.ilike(s),
                Indicator.tags.ilike(s)
            )
        )
    return query.order_by(Indicator.confidence.desc()).all()
