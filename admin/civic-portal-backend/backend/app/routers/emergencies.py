from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, utils
from app.ws_manager import manager

router = APIRouter(prefix="/api/emergencies", tags=["emergencies"])


@router.get("", response_model=List[schemas.EmergencyOut])
def list_emergencies(db: Session = Depends(get_db)):
    return db.query(models.Emergency).all()


@router.post("", response_model=schemas.EmergencyOut, status_code=201)
async def create_emergency(payload: schemas.EmergencyCreate, db: Session = Depends(get_db)):
    e = models.Emergency(id=utils.new_id("EMG"), type=payload.type, location=payload.location,
                          severity=payload.severity, eta=payload.eta, status="Monitoring")
    db.add(e)
    utils.log_action(db, "Notification Sent", "Admin User", target=f"Emergency: {payload.type}", sev="danger", icon="siren")
    db.commit()
    db.refresh(e)
    await manager.broadcast("emergency_created", {"id": e.id, "type": e.type, "location": e.location})
    return e


@router.patch("/{emergency_id}", response_model=schemas.EmergencyOut)
async def update_emergency(emergency_id: str, payload: schemas.EmergencyUpdate, db: Session = Depends(get_db)):
    e = db.get(models.Emergency, emergency_id)
    if not e:
        raise HTTPException(404, "Emergency not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(e, field, value)
    if payload.status == "Resolved" or payload.status == "Closed":
        utils.log_action(db, "Emergency Closed", "Admin User", target=e.type, sev="success", icon="shield-check")
    db.commit()
    db.refresh(e)
    await manager.broadcast("emergency_updated", {"id": e.id, "status": e.status})
    return e
