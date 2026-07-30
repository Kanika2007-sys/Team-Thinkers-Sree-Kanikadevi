from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, utils
from app.ws_manager import manager

router = APIRouter(prefix="/api/citizens", tags=["citizens"])


@router.get("", response_model=List[schemas.CitizenOut])
def list_citizens(db: Session = Depends(get_db)):
    return db.query(models.Citizen).all()


@router.patch("/{name}/block", response_model=schemas.CitizenOut)
async def toggle_block(name: str, db: Session = Depends(get_db)):
    citizen = db.get(models.Citizen, name)
    if not citizen:
        raise HTTPException(404, "Citizen not found")
    citizen.blocked = not citizen.blocked
    utils.log_action(db, "Status Updated", "Admin User", target=name, sev="warning" if citizen.blocked else "success", icon="user-cog")
    db.commit()
    db.refresh(citizen)
    await manager.broadcast("citizen_updated", {"name": citizen.name, "blocked": citizen.blocked})
    return citizen
