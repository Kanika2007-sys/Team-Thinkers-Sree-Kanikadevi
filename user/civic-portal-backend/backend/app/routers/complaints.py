import csv
import io
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, utils
from app.ws_manager import manager

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

PRIORITY_RANK = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}


def complaint_public_payload(c: models.Complaint) -> dict:
    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "citizen": c.citizen,
        "phone": c.phone,
        "dept": c.dept,
        "category": c.category,
        "ward": c.ward,
        "priority": c.priority,
        "status": c.status,
        "labels": c.labels or [],
        "date": c.date,
        "street": c.street,
        "coords": c.coords,
    }


def complaint_admin_payload(c: models.Complaint) -> dict:
    payload = complaint_public_payload(c)
    payload.update({
        "trust": c.trust,
        "previous_reports": c.previous_reports,
        "verified": c.verified,
        "nearby": c.nearby,
        "ai": c.ai or {},
        "evidence": c.evidence or {},
        "history": c.history or [],
        "notes": c.notes or {},
    })
    return payload


@router.get("", response_model=List[schemas.ComplaintOut])
def list_complaints(
    dept: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|oldest|priority|trust)$"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Complaint)
    if dept and dept != "All":
        q = q.filter(models.Complaint.dept == dept)
    if priority and priority != "All":
        q = q.filter(models.Complaint.priority == priority)
    if status and status != "All":
        q = q.filter(models.Complaint.status == status)
    if ward and ward != "All":
        q = q.filter(models.Complaint.ward == ward)
    results = q.all()

    if search:
        s = search.lower()
        results = [c for c in results if s in f"{c.id} {c.citizen} {c.category} {c.ward}".lower()]

    if sort == "newest":
        results.sort(key=lambda c: c.date, reverse=True)
    elif sort == "oldest":
        results.sort(key=lambda c: c.date)
    elif sort == "priority":
        results.sort(key=lambda c: PRIORITY_RANK.get(c.priority, 0), reverse=True)
    elif sort == "trust":
        results.sort(key=lambda c: c.trust)

    return [complaint_admin_payload(c) for c in results]


@router.get("/public", response_model=List[schemas.ComplaintPublicOut])
def list_public_complaints(
    dept: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|oldest|priority)$"),
    db: Session = Depends(get_db),
):
    q = db.query(models.Complaint)
    if dept and dept != "All":
        q = q.filter(models.Complaint.dept == dept)
    if priority and priority != "All":
        q = q.filter(models.Complaint.priority == priority)
    if status and status != "All":
        q = q.filter(models.Complaint.status == status)
    if ward and ward != "All":
        q = q.filter(models.Complaint.ward == ward)
    results = q.all()

    if search:
        s = search.lower()
        results = [c for c in results if s in f"{c.id} {c.title} {c.category} {c.ward} {c.dept}".lower()]

    if sort == "newest":
        results.sort(key=lambda c: c.date, reverse=True)
    elif sort == "oldest":
        results.sort(key=lambda c: c.date)
    elif sort == "priority":
        results.sort(key=lambda c: PRIORITY_RANK.get(c.priority, 0), reverse=True)

    return [complaint_public_payload(c) for c in results]


@router.get("/export.csv")
def export_complaints_csv(
    dept: Optional[str] = None, priority: Optional[str] = None, status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Complaint)
    if dept and dept != "All":
        q = q.filter(models.Complaint.dept == dept)
    if priority and priority != "All":
        q = q.filter(models.Complaint.priority == priority)
    if status and status != "All":
        q = q.filter(models.Complaint.status == status)
    rows = q.all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["ID", "Date", "Citizen", "Phone", "Department", "Category", "Ward", "Priority", "Status", "Trust", "Labels"])
    for c in rows:
        writer.writerow([c.id, c.date, c.citizen, c.phone, c.dept, c.category, c.ward, c.priority, c.status, c.trust, "|".join(c.labels or [])])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=complaints-export.csv"},
    )


@router.get("/{complaint_id}", response_model=schemas.ComplaintOut)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Complaint, complaint_id)
    if not c:
        raise HTTPException(404, "Complaint not found")
    return complaint_admin_payload(c)


@router.get("/public/{complaint_id}", response_model=schemas.ComplaintPublicOut)
def get_public_complaint(complaint_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Complaint, complaint_id)
    if not c:
        raise HTTPException(404, "Complaint not found")
    return complaint_public_payload(c)


@router.post("", response_model=schemas.ComplaintOut, status_code=201)
async def create_complaint(payload: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    new_id = utils.new_id("CMP")
    title = payload.title or payload.category or payload.dept
    category = payload.category or payload.title or payload.dept
    complaint = models.Complaint(
        id=new_id, citizen=payload.citizen, phone=payload.phone, dept=payload.dept,
        category=category, ward=payload.ward, priority=payload.priority,
        status="Pending", labels=payload.labels, date=utils.now_str()[:10], trust=payload.trust,
        coords=payload.coords, street=payload.street or f"Ward {payload.ward} Main Road",
        notes={"officer": "", "admin": "", "inspection": "", "title": title, "description": payload.description},
        ai={"confidence": payload.trust, "detectedObject": payload.category,
            "detectedCategory": f"{payload.dept} - {payload.category}",
            "severity": PRIORITY_RANK.get(payload.priority, 2) * 20, "fraud": 100 - payload.trust,
            "duplicate": 5, "suggestedDept": payload.dept, "suggestedOfficer": "Unassigned", "eta": "—"},
        evidence={"images": 0, "video": False, "voice": False},
        history=[{"stage": "Complaint Created", "time": utils.now_str(), "by": "Citizen App"}],
    )
    db.add(complaint)
    utils.log_action(db, "Complaint Created", "Citizen App", target=new_id, sev="info", icon="file-text")
    db.commit()
    db.refresh(complaint)
    await manager.broadcast("complaint_created", {"id": complaint.id, "citizen": complaint.citizen, "dept": complaint.dept})
    return complaint_admin_payload(complaint)


@router.post("/public", response_model=schemas.ComplaintPublicOut, status_code=201)
async def create_public_complaint(payload: schemas.ComplaintCreate, db: Session = Depends(get_db)):
    complaint = await create_complaint(payload, db)
    return complaint_public_payload(db.get(models.Complaint, complaint["id"])) if isinstance(complaint, dict) else complaint_public_payload(db.get(models.Complaint, complaint.id))


@router.patch("/{complaint_id}", response_model=schemas.ComplaintOut)
async def update_complaint(complaint_id: str, payload: schemas.ComplaintUpdate, db: Session = Depends(get_db)):
    c = db.get(models.Complaint, complaint_id)
    if not c:
        raise HTTPException(404, "Complaint not found")

    if payload.status is not None:
        c.status = payload.status
        c.history = [*(c.history or []), {"stage": f"Status changed to {payload.status}", "time": utils.now_str(), "by": "Admin User"}]
    if payload.priority is not None:
        c.priority = payload.priority
    if payload.dept is not None:
        c.dept = payload.dept
    if payload.labels is not None:
        c.labels = payload.labels
    if payload.notes is not None:
        c.notes = payload.notes.model_dump()

    utils.log_action(db, "Status Updated", "Admin User", target=complaint_id, sev="info", icon="refresh-cw")
    db.commit()
    db.refresh(c)
    await manager.broadcast("complaint_updated", {"id": c.id, "status": c.status, "priority": c.priority})
    return c


@router.delete("/{complaint_id}", status_code=204)
async def delete_complaint(complaint_id: str, db: Session = Depends(get_db)):
    c = db.get(models.Complaint, complaint_id)
    if not c:
        raise HTTPException(404, "Complaint not found")
    db.delete(c)
    utils.log_action(db, "Complaint Deleted", "Admin User", target=complaint_id, sev="danger", icon="trash-2")
    db.commit()
    await manager.broadcast("complaint_deleted", {"id": complaint_id})
    return None


@router.post("/bulk", response_model=dict)
async def bulk_action(payload: schemas.BulkActionRequest, db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).filter(models.Complaint.id.in_(payload.ids)).all()
    if not complaints:
        raise HTTPException(404, "No matching complaints found")

    if payload.action == "resolve":
        for c in complaints:
            c.status = "Resolved"
        utils.log_action(db, "Status Updated", "Admin User", target=f"{len(complaints)} complaints -> Resolved", sev="success", icon="check-circle")
    elif payload.action == "assign":
        for c in complaints:
            c.status = "Assigned"
        utils.log_action(db, "Complaint Assigned", "Admin User", target=f"{len(complaints)} complaints", sev="info", icon="user-check")
    elif payload.action == "escalate":
        for c in complaints:
            c.status = "Escalated"
            c.priority = "Critical"
        utils.log_action(db, "Status Updated", "Admin User", target=f"{len(complaints)} complaints -> Escalated", sev="danger", icon="arrow-up-right")
    elif payload.action == "delete":
        for c in complaints:
            db.delete(c)
        utils.log_action(db, "Complaint Deleted", "Admin User", target=f"{len(complaints)} complaints", sev="danger", icon="trash-2")
    elif payload.action == "merge":
        utils.log_action(db, "Status Updated", "Admin User", target=f"{len(complaints)} complaints merged", sev="info", icon="merge")

    db.commit()
    await manager.broadcast("complaints_bulk_action", {"action": payload.action, "ids": payload.ids})
    return {"action": payload.action, "affected": len(complaints)}
