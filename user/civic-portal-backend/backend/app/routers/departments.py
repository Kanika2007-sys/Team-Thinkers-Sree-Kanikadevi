from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=List[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(models.Department).all()
    out = []
    for d in depts:
        complaints = db.query(models.Complaint).filter(models.Complaint.dept == d.name).all()
        open_count = len([c for c in complaints if c.status != "Resolved"])
        resolved_count = len([c for c in complaints if c.status == "Resolved"])
        officer_count = db.query(models.Officer).filter(models.Officer.dept == d.name).count()
        out.append(schemas.DepartmentOut(
            name=d.name, icon=d.icon, color=d.color,
            open=open_count, resolved=resolved_count,
            avgTime="—" if not complaints else "1-3d",
            officers=officer_count,
        ))
    return out
