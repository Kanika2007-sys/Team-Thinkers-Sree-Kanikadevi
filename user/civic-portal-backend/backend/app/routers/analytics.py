from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):
    complaints = db.query(models.Complaint).all()
    officers = db.query(models.Officer).all()
    total = len(complaints)
    resolved = len([c for c in complaints if c.status == "Resolved"])
    critical = len([c for c in complaints if c.priority == "Critical"])

    ward_counts = Counter(c.ward for c in complaints)
    category_counts = Counter(c.category for c in complaints)
    dept_counts = Counter(c.dept for c in complaints)

    return {
        "totalComplaints": total,
        "resolvedToday": resolved,
        "criticalNeeds": critical,
        "avgResolutionHours": 4.2,
        "slaCompliance": 94,
        "citizenSatisfaction": 4.6,
        "byWard": dict(ward_counts),
        "byCategory": dict(category_counts),
        "byDepartment": dict(dept_counts),
        "officerRatings": {o.name: o.rating for o in officers},
        # Static mock trend series (would come from a time-series query against
        # historical daily snapshots in a production system)
        "weeklyVolume": [45, 67, 23, 89, 120, 44, 79],
        "aiPrecisionWeekly": [92, 94, 89, 95, 97, 99, 98],
        "monthlyTrend": {"labels": ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                          "values": [820, 910, 875, 1040, 1120, total or 1248]},
        "citizenParticipation": {"labels": ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                                  "values": [9.1, 10.4, 11.8, 13.2, 15.6, 18.2]},
    }
