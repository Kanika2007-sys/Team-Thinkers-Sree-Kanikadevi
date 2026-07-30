from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, utils
from app.ws_manager import manager

router = APIRouter(prefix="/api/officers", tags=["officers"])


@router.get("", response_model=List[schemas.OfficerOut])
def list_officers(db: Session = Depends(get_db)):
    return db.query(models.Officer).all()


@router.get("/{officer_id}", response_model=schemas.OfficerOut)
def get_officer(officer_id: str, db: Session = Depends(get_db)):
    o = db.get(models.Officer, officer_id)
    if not o:
        raise HTTPException(404, "Officer not found")
    return o


@router.post("", response_model=schemas.OfficerOut, status_code=201)
async def add_officer(payload: schemas.OfficerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Officer).filter(models.Officer.name == payload.name).first()
    if existing:
        raise HTTPException(409, "An officer with this name already exists")
    officer = models.Officer(
        id=utils.new_id("OFC"), name=payload.name, dept=payload.dept,
        pending=0, completed=0, rating=payload.rating, availability=payload.availability,
        route=payload.route, phone=payload.phone,
    )
    db.add(officer)
    utils.log_action(db, "Officer Changed", "Admin User", target=officer.name, sev="warning", icon="user-cog")
    db.commit()
    db.refresh(officer)
    await manager.broadcast("officer_added", {"id": officer.id, "name": officer.name})
    return officer


@router.patch("/{officer_id}", response_model=schemas.OfficerOut)
async def update_officer(officer_id: str, payload: schemas.OfficerUpdate, db: Session = Depends(get_db)):
    o = db.get(models.Officer, officer_id)
    if not o:
        raise HTTPException(404, "Officer not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(o, field, value)
    utils.log_action(db, "Officer Changed", "Admin User", target=o.name, sev="warning", icon="user-cog")
    db.commit()
    db.refresh(o)
    await manager.broadcast("officer_updated", {"id": o.id, "name": o.name})
    return o
