import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

router = APIRouter(prefix="/api/system", tags=["system"])

SERVICES = [
    {"name": "Database (SQLite)", "base_latency": 4},
    {"name": "FastAPI Main Server", "base_latency": 8},
    {"name": "AI Nexus Model Engine", "base_latency": 12},
    {"name": "High-Speed Storage Blob", "base_latency": 2},
    {"name": "Real-time WebSockets", "base_latency": 1},
    {"name": "Map Tile Provider", "base_latency": None},  # simulated offline
    {"name": "OAuth 2.0 Auth Server", "base_latency": 3},
]


@router.get("/monitor")
def system_monitor():
    """Live-ish metrics — jitters each call so the dashboard feels real-time."""
    out = []
    for s in SERVICES:
        if s["base_latency"] is None:
            out.append({"name": s["name"], "status": "Offline", "latency": "Timeout", "cpu": "-", "ram": "-", "storage": "-"})
            continue
        out.append({
            "name": s["name"],
            "status": "Online",
            "latency": f"{max(1, s['base_latency'] + random.randint(-1, 3))}ms",
            "cpu": f"{random.randint(1, 90)}%",
            "ram": f"{round(random.uniform(0.5, 16), 1)}GB",
            "storage": f"{random.randint(10, 90)}%",
        })
    return out


@router.get("/dashboard-summary")
def dashboard_summary(db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    critical = db.query(models.Complaint).filter(models.Complaint.priority == "Critical").count()
    emergencies = db.query(models.Emergency).filter(models.Emergency.status != "Resolved").count()
    return {
        "totalComplaints": complaints,
        "resolvedToday": resolved,
        "criticalNeeds": critical,
        "resolutionTimeHours": 4.2,
        "activeEmergencies": emergencies,
        "aiAlertsToday": 6,
        "slaCompliance": 94,
        "citizenSatisfaction": 4.6,
    }
