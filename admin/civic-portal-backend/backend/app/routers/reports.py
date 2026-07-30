import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

router = APIRouter(prefix="/api/reports", tags=["reports"])

VALID_TYPES = {"daily", "weekly", "monthly", "department", "ward", "emergency", "officer"}


@router.get("/{report_type}/export.csv")
def export_report(
    report_type: str,
    start: str = Query(default="2026-07-01"),
    end: str = Query(default="2026-07-30"),
    db: Session = Depends(get_db),
):
    if report_type not in VALID_TYPES:
        report_type = "daily"

    complaints = db.query(models.Complaint).filter(
        models.Complaint.date >= start, models.Complaint.date <= end
    ).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["ID", "Date", "Department", "Category", "Ward", "Priority", "Status"])
    for c in complaints:
        writer.writerow([c.id, c.date, c.dept, c.category, c.ward, c.priority, c.status])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={report_type}-report.csv"},
    )
