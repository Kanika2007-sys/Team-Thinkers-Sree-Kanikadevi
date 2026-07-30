"""
Populates a fresh database with the same mock data the frontend (app.js)
originally shipped with, so switching the dashboard from client-side mocks
to this API is a drop-in replacement with identical starting content.
"""
from sqlalchemy.orm import Session
from app import models


def seed_if_empty(db: Session) -> None:
    if db.query(models.Complaint).first():
        return  # already seeded

    complaints = [
        dict(id="CMP-4102", citizen="Rajesh K.", phone="+91 9876543210", dept="Water", category="Pipe Leak",
             ward="18", priority="High", status="Pending", labels=["VIP Area", "Water Incident"],
             date="2026-07-30", trust=92, coords="12.9716, 77.5946",
             previous_reports=4, verified=True, street="14th Cross, Anna Nagar", nearby=3,
             ai={"confidence": 96, "detectedObject": "Water Pipe / Leakage", "detectedCategory": "Water - Pipe Leak",
                 "severity": 78, "fraud": 3, "duplicate": 8, "suggestedDept": "Water & Supply",
                 "suggestedOfficer": "S. Kumar", "eta": "3.5h"},
             evidence={"images": 3, "video": True, "voice": False},
             history=[{"stage": "Complaint Created", "time": "2026-07-30 08:12", "by": "Citizen App"},
                      {"stage": "AI Analysis Completed", "time": "2026-07-30 08:13", "by": "Nexus AI"},
                      {"stage": "Assigned to Water Dept", "time": "2026-07-30 08:20", "by": "System"},
                      {"stage": "Accepted by Officer", "time": "2026-07-30 09:02", "by": "S. Kumar"}],
             notes={"officer": "", "admin": "", "inspection": ""}),

        dict(id="CMP-4101", citizen="Aarti M.", phone="+91 8765432109", dept="Roads", category="Pothole",
             ward="12", priority="Medium", status="Assigned", labels=["Requires Inspection"],
             date="2026-07-29", trust=88, coords="12.9611, 77.5872",
             previous_reports=1, verified=True, street="MG Road, Ward 12", nearby=1,
             ai={"confidence": 91, "detectedObject": "Road Surface Damage", "detectedCategory": "Roads - Pothole",
                 "severity": 52, "fraud": 2, "duplicate": 4, "suggestedDept": "Roads & Infra",
                 "suggestedOfficer": "P. Sharma", "eta": "1.2d"},
             evidence={"images": 2, "video": False, "voice": False},
             history=[{"stage": "Complaint Created", "time": "2026-07-29 11:40", "by": "Citizen App"},
                      {"stage": "AI Analysis Completed", "time": "2026-07-29 11:41", "by": "Nexus AI"},
                      {"stage": "Assigned to Roads Dept", "time": "2026-07-29 12:05", "by": "System"}],
             notes={"officer": "", "admin": "", "inspection": ""}),

        dict(id="CMP-4100", citizen="Anil D.", phone="+91 7654321098", dept="Emergency", category="Flood Risk",
             ward="18", priority="Critical", status="Escalated", labels=["Emergency", "AI Flagged"],
             date="2026-07-29", trust=95, coords="12.9783, 77.5891",
             previous_reports=0, verified=True, street="Lakeside Ward 18", nearby=6,
             ai={"confidence": 98, "detectedObject": "Rising Water Level", "detectedCategory": "Emergency - Flood Risk",
                 "severity": 94, "fraud": 1, "duplicate": 12, "suggestedDept": "Emergency",
                 "suggestedOfficer": "R. Singh", "eta": "25m"},
             evidence={"images": 5, "video": True, "voice": True},
             history=[{"stage": "Complaint Created", "time": "2026-07-29 06:02", "by": "Citizen App"},
                      {"stage": "AI Analysis Completed", "time": "2026-07-29 06:03", "by": "Nexus AI"},
                      {"stage": "Auto-Escalated (High Severity)", "time": "2026-07-29 06:04", "by": "Nexus AI"},
                      {"stage": "Emergency Dispatch Assigned", "time": "2026-07-29 06:10", "by": "R. Singh"}],
             notes={"officer": "", "admin": "", "inspection": ""}),

        dict(id="CMP-4099", citizen="System AI", phone="N/A", dept="Sanitation", category="Garbage Dump",
             ward="04", priority="Low", status="Resolved", labels=["Auto-Detected"],
             date="2026-07-28", trust=100, coords="12.9345, 77.6101",
             previous_reports=0, verified=True, street="Dump Yard Rd, Ward 04", nearby=0,
             ai={"confidence": 99, "detectedObject": "Garbage Pile", "detectedCategory": "Sanitation - Garbage Dump",
                 "severity": 34, "fraud": 0, "duplicate": 0, "suggestedDept": "Sanitation",
                 "suggestedOfficer": "M. Patel", "eta": "4h"},
             evidence={"images": 1, "video": False, "voice": False},
             history=[{"stage": "Complaint Created (Auto-Detected)", "time": "2026-07-28 07:00", "by": "Nexus AI"},
                      {"stage": "Assigned to Sanitation Dept", "time": "2026-07-28 07:05", "by": "System"},
                      {"stage": "Completed", "time": "2026-07-28 15:20", "by": "M. Patel"},
                      {"stage": "Citizen Verified", "time": "2026-07-28 18:44", "by": "System"}],
             notes={"officer": "Issue verified and closed on site.", "admin": "", "inspection": ""}),

        dict(id="CMP-4098", citizen="Vijay P.", phone="+91 6543210987", dept="Electricity", category="Streetlight",
             ward="18", priority="Medium", status="Pending", labels=["Duplicate"],
             date="2026-07-28", trust=45, coords="12.9719, 77.5950",
             previous_reports=5, verified=False, street="4th Ave, Ward 18", nearby=2,
             ai={"confidence": 74, "detectedObject": "Streetlight Pole (Duplicate Match)",
                 "detectedCategory": "Electricity - Streetlight", "severity": 28, "fraud": 12, "duplicate": 82,
                 "suggestedDept": "Electricity", "suggestedOfficer": "Unassigned", "eta": "2d"},
             evidence={"images": 1, "video": False, "voice": False},
             history=[{"stage": "Complaint Created", "time": "2026-07-28 09:15", "by": "Citizen App"},
                      {"stage": "AI Analysis Completed", "time": "2026-07-28 09:16", "by": "Nexus AI"},
                      {"stage": "Flagged as Duplicate", "time": "2026-07-28 09:16", "by": "Nexus AI"}],
             notes={"officer": "", "admin": "", "inspection": ""}),

        dict(id="CMP-4097", citizen="Sneha R.", phone="+91 5432109876", dept="Roads", category="Traffic Signal",
             ward="02", priority="Critical", status="InProgress", labels=["VIP Area"],
             date="2026-07-27", trust=78, coords="12.9810, 77.5900",
             previous_reports=2, verified=True, street="Main Highway Ex 4, Ward 02", nearby=4,
             ai={"confidence": 93, "detectedObject": "Traffic Signal Malfunction", "detectedCategory": "Roads - Traffic Signal",
                 "severity": 71, "fraud": 2, "duplicate": 6, "suggestedDept": "Roads & Infra",
                 "suggestedOfficer": "P. Sharma", "eta": "45m"},
             evidence={"images": 2, "video": True, "voice": False},
             history=[{"stage": "Complaint Created", "time": "2026-07-27 16:20", "by": "Citizen App"},
                      {"stage": "AI Analysis Completed", "time": "2026-07-27 16:21", "by": "Nexus AI"},
                      {"stage": "Escalated (VIP Area)", "time": "2026-07-27 16:30", "by": "System"},
                      {"stage": "In Progress", "time": "2026-07-27 17:10", "by": "P. Sharma"}],
             notes={"officer": "", "admin": "", "inspection": ""}),
    ]
    for c in complaints:
        db.add(models.Complaint(**c))

    officers = [
        dict(id="OFC-4821", name="S. Kumar", dept="Water", pending=12, completed=42, rating=4.8,
             availability="Overloaded", route="Ward 18 -> Zone C", phone="+91 90482100"),
        dict(id="OFC-5390", name="P. Sharma", dept="Roads", pending=3, completed=89, rating=4.9,
             availability="Available", route="Patrol: Zone A", phone="+91 90539000"),
        dict(id="OFC-6104", name="R. Singh", dept="Emergency", pending=1, completed=156, rating=5.0,
             availability="On Route", route="Emergency Dispatch", phone="+91 90610400"),
        dict(id="OFC-7215", name="M. Patel", dept="Sanitation", pending=5, completed=34, rating=4.2,
             availability="Available", route="Ward 4 -> Dump Yard", phone="+91 90721500"),
    ]
    for o in officers:
        db.add(models.Officer(**o))

    departments = [
        dict(name="Sanitation", icon="trash-2", color="success"),
        dict(name="Roads", icon="cone", color="warning"),
        dict(name="Water", icon="droplet", color="info"),
        dict(name="Electricity", icon="zap", color="brand"),
        dict(name="Emergency", icon="siren", color="danger"),
    ]
    for d in departments:
        db.add(models.Department(**d))

    citizens = [
        dict(name="Aarti M.", phone="+91 8765432109", verified=True, blocked=False, complaints=14, rating=4.8, trust=92),
        dict(name="Vijay P.", phone="+91 6543210987", verified=False, blocked=True, complaints=89, rating=2.1, trust=14),
        dict(name="Rajesh K.", phone="+91 9876543210", verified=True, blocked=False, complaints=3, rating=4.9, trust=98),
    ]
    for c in citizens:
        db.add(models.Citizen(**c))

    notifications = [
        dict(id="NTF-1042", title="Scheduled Water Shutdown - Ward 18", description="", type="Water Shutdown",
             area="Ward 18", dept="Water", priority="High", recipients="Ward Residents", reach=8420,
             sent_at="2026-07-29 07:00"),
        dict(id="NTF-1041", title="Heavy Rain Advisory", description="", type="Weather Alert", area="All Zones",
             dept="General", priority="Medium", recipients="All Citizens", reach=124500, sent_at="2026-07-28 18:30"),
        dict(id="NTF-1040", title="Power Restoration Complete - Sector 9", description="", type="Power Shutdown",
             area="Sector 9", dept="Electricity", priority="Low", recipients="Ward Residents", reach=3120,
             sent_at="2026-07-27 21:15"),
    ]
    for n in notifications:
        db.add(models.NotificationLog(**n))

    emergencies = [
        dict(id="EMG-1", type="Fire", location="Industrial Area Zone B", severity=95, eta="4m", status="Units Dispatched"),
        dict(id="EMG-2", type="Flood", location="Lakeside Ward 2", severity=82, eta="12m", status="Monitoring"),
        dict(id="EMG-3", type="Accident", location="Main Highway Ex 4", severity=60, eta="2m", status="On Scene"),
        dict(id="EMG-4", type="Gas Leak", location="Sector 9 Res", severity=75, eta="7m", status="Evacuating"),
    ]
    for e in emergencies:
        db.add(models.Emergency(**e))

    audit_actions = [
        ("Admin Logged In", "log-in", "info"), ("Complaint Assigned", "user-check", "info"),
        ("Complaint Deleted", "trash-2", "danger"), ("Officer Changed", "user-cog", "warning"),
        ("Status Updated", "refresh-cw", "info"), ("Notification Sent", "send", "info"),
        ("Emergency Closed", "shield-check", "success"),
    ]
    actors = ["Admin User", "S. Kumar", "P. Sharma", "R. Singh", "M. Patel", "System AI"]
    targets = ["CMP-4102", "CMP-4101", "CMP-4100", "CMP-4099", "CMP-4098", "CMP-4097", "NTF-1042", "Ward 18"]
    entries = []
    hour, minute = 11, 58
    for i in range(32):
        action, icon, sev = audit_actions[i % len(audit_actions)]
        minute -= 7
        if minute < 0:
            minute += 60
            hour -= 1
        if hour < 0:
            hour = 23
        entries.append(dict(
            id=f"LOG-{9000 - i}", action=action, icon=icon, sev=sev,
            actor=actors[i % len(actors)], target=targets[i % len(targets)],
            time=f"2026-07-{30 - i // 10:02d} {hour:02d}:{minute:02d}",
            ip=f"10.0.{i % 8}.{(i * 7) % 255}",
        ))
    # `entries[0]` is the newest (LOG-9000); insert oldest-first so the DB's
    # autoincrement seq column (used to order "newest first" in the API)
    # ends up highest for the newest entry.
    for e in reversed(entries):
        db.add(models.AuditLog(**e))

    db.commit()
