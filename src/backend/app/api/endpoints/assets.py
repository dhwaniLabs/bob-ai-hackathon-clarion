from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.asset import Asset
from app.models.alert import Alert
from app.schemas.all_schemas import AssetResponse

router = APIRouter()

@router.get("", response_model=List[AssetResponse])
def list_assets(db: Session = Depends(get_db)):
    """List monitored critical infrastructure assets with live threat scores and incident counts."""
    assets = db.query(Asset).order_by(Asset.current_risk.desc()).all()
    results = []
    for a in assets:
        inc_count = db.query(Alert.incident_id).filter(Alert.asset_id == a.id, Alert.incident_id.isnot(None)).distinct().count()
        results.append(AssetResponse(
            id=a.id,
            hostname=a.hostname,
            type=a.type,
            criticality=a.criticality,
            owner=a.owner,
            location=a.location,
            ip_address=a.ip_address,
            status=a.status,
            current_risk=a.current_risk,
            created_at=a.created_at,
            updated_at=a.updated_at,
            incident_count=inc_count
        ))
    return results

@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset_detail(asset_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed asset profile."""
    a = db.query(Asset).filter(Asset.id == asset_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Asset not found")
    inc_count = db.query(Alert.incident_id).filter(Alert.asset_id == a.id, Alert.incident_id.isnot(None)).distinct().count()
    return AssetResponse(
        id=a.id,
        hostname=a.hostname,
        type=a.type,
        criticality=a.criticality,
        owner=a.owner,
        location=a.location,
        ip_address=a.ip_address,
        status=a.status,
        current_risk=a.current_risk,
        created_at=a.created_at,
        updated_at=a.updated_at,
        incident_count=inc_count
    )
