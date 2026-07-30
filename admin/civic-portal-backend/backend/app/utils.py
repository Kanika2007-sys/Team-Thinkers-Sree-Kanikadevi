import random
from datetime import datetime
from sqlalchemy.orm import Session
from app import models


def now_str() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M")


def new_id(prefix: str) -> str:
    return f"{prefix}-{random.randint(1000, 9999)}"


def log_action(db: Session, action: str, actor: str, target: str = "", sev: str = "info", icon: str = "activity") -> models.AuditLog:
    """Creates and persists an audit log row. Caller is responsible for db.commit()."""
    entry = models.AuditLog(
        id=new_id("LOG"), action=action, actor=actor, target=target,
        sev=sev, icon=icon, ip="127.0.0.1", time=now_str(),
    )
    db.add(entry)
    return entry
