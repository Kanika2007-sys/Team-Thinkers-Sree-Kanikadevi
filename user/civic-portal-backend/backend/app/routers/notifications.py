import random
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, utils
from app.ws_manager import manager

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

REACH_MAP = {
    "All Citizens": 124500,
    "Ward Residents": None,   # randomized below
    "Department Staff": None,
    "Officers": None,
}


@router.get("", response_model=List[schemas.NotificationOut])
def list_notifications(db: Session = Depends(get_db)):
    return db.query(models.NotificationLog).order_by(models.NotificationLog.sent_at.desc()).all()


@router.post("", response_model=schemas.NotificationOut, status_code=201)
async def send_notification(payload: schemas.NotificationCreate, db: Session = Depends(get_db)):
    if payload.recipients == "All Citizens":
        reach = 124500
    elif payload.recipients == "Ward Residents":
        reach = random.randint(3000, 10000)
    elif payload.recipients == "Department Staff":
        reach = random.randint(40, 100)
    else:  # Officers
        reach = db.query(models.Officer).count()

    notif = models.NotificationLog(
        id=utils.new_id("NTF"), title=payload.title, description=payload.description,
        type=payload.type, area=payload.area, dept=payload.dept, priority=payload.priority,
        recipients=payload.recipients, reach=reach, sent_at=utils.now_str(),
    )
    db.add(notif)
    utils.log_action(db, "Notification Sent", "Admin User", target=payload.title, sev="info", icon="send")
    db.commit()
    db.refresh(notif)
    await manager.broadcast("notification_sent", {"id": notif.id, "title": notif.title, "reach": notif.reach})
    return notif
