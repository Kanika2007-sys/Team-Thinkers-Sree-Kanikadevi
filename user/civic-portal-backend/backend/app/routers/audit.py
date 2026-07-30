from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])


@router.get("", response_model=List[schemas.AuditLogOut])
def list_audit_logs(
    search: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    q = db.query(models.AuditLog)
    if action and action != "All":
        q = q.filter(models.AuditLog.action == action)
    results = q.order_by(models.AuditLog.seq.desc()).limit(limit).all()
    if search:
        s = search.lower()
        results = [l for l in results if s in f"{l.actor} {l.action} {l.target} {l.ip}".lower()]
    return results
