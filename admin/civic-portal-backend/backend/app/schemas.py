"""
Pydantic v2 schemas — request bodies and response shapes for the API.
"""
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict


# ---------- Complaints ----------

class AIAnalysis(BaseModel):
    confidence: int = 90
    detectedObject: str = ""
    detectedCategory: str = ""
    severity: int = 50
    fraud: int = 5
    duplicate: int = 5
    suggestedDept: str = ""
    suggestedOfficer: str = "Unassigned"
    eta: str = "—"


class Evidence(BaseModel):
    images: int = 0
    video: bool = False
    voice: bool = False


class HistoryEntry(BaseModel):
    stage: str
    time: str
    by: str


class Notes(BaseModel):
    officer: str = ""
    admin: str = ""
    inspection: str = ""


class ComplaintCreate(BaseModel):
    citizen: str
    phone: str = ""
    dept: str
    category: str
    ward: str
    priority: Literal["Critical", "High", "Medium", "Low"] = "Medium"
    labels: List[str] = Field(default_factory=list)
    trust: int = 80
    coords: str = ""
    street: str = ""


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    dept: Optional[str] = None
    labels: Optional[List[str]] = None
    notes: Optional[Notes] = None


class ComplaintOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    citizen: str
    phone: str
    dept: str
    category: str
    ward: str
    priority: str
    status: str
    labels: List[str]
    date: str
    trust: int
    coords: str
    previous_reports: int
    verified: bool
    street: str
    nearby: int
    ai: dict
    evidence: dict
    history: list
    notes: dict


class BulkActionRequest(BaseModel):
    ids: List[str]
    action: Literal["assign", "resolve", "escalate", "delete", "merge"]


# ---------- Officers ----------

class OfficerCreate(BaseModel):
    name: str
    dept: str
    rating: float = 4.5
    availability: str = "Available"
    route: str = ""
    phone: str = ""


class OfficerUpdate(BaseModel):
    dept: Optional[str] = None
    pending: Optional[int] = None
    completed: Optional[int] = None
    rating: Optional[float] = None
    availability: Optional[str] = None
    route: Optional[str] = None


class OfficerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    dept: str
    pending: int
    completed: int
    rating: float
    availability: str
    route: str
    phone: str


# ---------- Departments ----------

class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    icon: str
    color: str
    open: int
    resolved: int
    avgTime: str
    officers: int


# ---------- Citizens ----------

class CitizenOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    phone: str
    verified: bool
    blocked: bool
    complaints: int
    rating: float
    trust: int


# ---------- Notifications ----------

class NotificationCreate(BaseModel):
    title: str
    description: str = ""
    type: str = "General Notice"
    area: str = "All Zones"
    dept: str = "General"
    priority: Literal["Low", "Medium", "High", "Critical"] = "Medium"
    recipients: Literal["All Citizens", "Ward Residents", "Department Staff", "Officers"] = "All Citizens"


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: str
    type: str
    area: str
    dept: str
    priority: str
    recipients: str
    reach: int
    sent_at: str


# ---------- Audit ----------

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    action: str
    actor: str
    target: str
    sev: str
    icon: str
    ip: str
    time: str


# ---------- Emergencies ----------

class EmergencyCreate(BaseModel):
    type: str
    location: str
    severity: int = 50
    eta: str = "—"


class EmergencyUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[int] = None
    eta: Optional[str] = None


class EmergencyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    type: str
    location: str
    severity: int
    eta: str
    status: str


# ---------- Settings ----------

class AISettings(BaseModel):
    duplicateThreshold: int = 95
    autoEscalationThreshold: int = 85
