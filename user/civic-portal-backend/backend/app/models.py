"""
SQLAlchemy ORM models. Field names intentionally mirror the frontend's
AppState shapes (app.js) so the JSON returned by this API can be dropped
straight into the existing dashboard with minimal mapping.
"""
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String, primary_key=True)          # e.g. CMP-4102
    citizen: Mapped[str] = mapped_column(String)
    phone: Mapped[str] = mapped_column(String)
    dept: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    ward: Mapped[str] = mapped_column(String)
    priority: Mapped[str] = mapped_column(String)                       # Critical/High/Medium/Low
    status: Mapped[str] = mapped_column(String)                         # Pending/Assigned/InProgress/Escalated/Resolved
    labels: Mapped[list] = mapped_column(JSON, default=list)
    date: Mapped[str] = mapped_column(String)
    trust: Mapped[int] = mapped_column(Integer, default=80)
    coords: Mapped[str] = mapped_column(String, default="")

    # Rich detail payload (citizen info extras, AI analysis, evidence, history)
    previous_reports: Mapped[int] = mapped_column(Integer, default=0)
    verified: Mapped[bool] = mapped_column(Boolean, default=True)
    street: Mapped[str] = mapped_column(String, default="")
    nearby: Mapped[int] = mapped_column(Integer, default=0)
    ai: Mapped[dict] = mapped_column(JSON, default=dict)
    evidence: Mapped[dict] = mapped_column(JSON, default=dict)
    history: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[dict] = mapped_column(JSON, default=dict)             # {officer, admin, inspection}

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def title(self) -> str:
        return (self.notes or {}).get("title") or self.category

    @property
    def description(self) -> str:
        return (self.notes or {}).get("description") or ""


class Officer(Base):
    __tablename__ = "officers"

    id: Mapped[str] = mapped_column(String, primary_key=True)           # e.g. OFC-4821
    name: Mapped[str] = mapped_column(String, unique=True)
    dept: Mapped[str] = mapped_column(String)
    pending: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    availability: Mapped[str] = mapped_column(String, default="Available")  # Available/Overloaded/On Route
    route: Mapped[str] = mapped_column(String, default="")
    phone: Mapped[str] = mapped_column(String, default="")


class Department(Base):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String, primary_key=True)
    icon: Mapped[str] = mapped_column(String, default="building-2")
    color: Mapped[str] = mapped_column(String, default="brand")


class Citizen(Base):
    __tablename__ = "citizens"

    name: Mapped[str] = mapped_column(String, primary_key=True)
    phone: Mapped[str] = mapped_column(String, default="")
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    complaints: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    trust: Mapped[int] = mapped_column(Integer, default=80)


class NotificationLog(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, default="")
    type: Mapped[str] = mapped_column(String)
    area: Mapped[str] = mapped_column(String)
    dept: Mapped[str] = mapped_column(String, default="General")
    priority: Mapped[str] = mapped_column(String)
    recipients: Mapped[str] = mapped_column(String)
    reach: Mapped[int] = mapped_column(Integer, default=0)
    sent_at: Mapped[str] = mapped_column(String)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    seq: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id: Mapped[str] = mapped_column(String, unique=True)
    action: Mapped[str] = mapped_column(String)
    actor: Mapped[str] = mapped_column(String)
    target: Mapped[str] = mapped_column(String, default="")
    sev: Mapped[str] = mapped_column(String, default="info")            # info/success/warning/danger
    icon: Mapped[str] = mapped_column(String, default="activity")
    ip: Mapped[str] = mapped_column(String, default="127.0.0.1")
    time: Mapped[str] = mapped_column(String)


class Emergency(Base):
    __tablename__ = "emergencies"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    type: Mapped[str] = mapped_column(String)                           # Fire/Flood/Accident/Gas Leak...
    location: Mapped[str] = mapped_column(String)
    severity: Mapped[int] = mapped_column(Integer, default=50)
    eta: Mapped[str] = mapped_column(String, default="—")
    status: Mapped[str] = mapped_column(String, default="Monitoring")
