"""
Civic Authority Portal — FastAPI backend.

Run with:
    uvicorn app.main:app --reload --port 8000

Dashboard UI:          http://localhost:8000/
Interactive API docs:  http://localhost:8000/docs
WebSocket (real-time):  ws://localhost:8000/ws
"""
import asyncio
import random
import contextlib
from pathlib import Path
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base, SessionLocal
from app.seed_data import seed_if_empty
from app.ws_manager import manager
from app.routers import (
    complaints, officers, departments, citizens,
    notifications, audit, emergencies, analytics, system, reports, settings,
)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

LIVE_FEED_EVENTS = [
    {"text": "Citizen verified resolution", "icon": "check-circle"},
    {"text": "Officer accepted new assignment", "icon": "user-check"},
    {"text": "Road complaint escalated to High Priority", "icon": "arrow-up-right"},
    {"text": "New complaint received via Citizen App", "icon": "file-text"},
    {"text": "AI flagged a possible duplicate report", "icon": "copy"},
]


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables + seed mock data if the DB is empty
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()

    # Background task: periodic heartbeat so connected dashboards feel "live"
    # even with no user interaction (system metrics tick + a simulated feed item).
    task = asyncio.create_task(_heartbeat())
    yield
    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


async def _heartbeat():
    while True:
        await asyncio.sleep(8)
        if not manager.active:
            continue
        event = random.choice(LIVE_FEED_EVENTS)
        await manager.broadcast("live_feed", {
            "time": __import__("datetime").datetime.utcnow().strftime("%H:%M:%S"),
            "text": event["text"], "icon": event["icon"],
        })


app = FastAPI(
    title="Civic Authority Portal API",
    description="Backend for the Civic One Authority Portal dashboard.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: wide open for local/dev use — the dashboard is often opened straight
# from the filesystem (file://) or a static server on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (complaints.router, officers.router, departments.router, citizens.router,
          notifications.router, audit.router, emergencies.router, analytics.router,
          system.router, reports.router, settings.router):
    app.include_router(r)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            # We don't require the client to send anything; just keep the
            # connection open and drain any pings/messages it does send.
            await ws.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(ws)
    except Exception:
        await manager.disconnect(ws)


# Serve the actual dashboard (index.html / app.js / chart.umd.min.js) at "/".
# Registered LAST so it never shadows the /api/*, /docs, /ws routes above —
# Starlette matches routes in registration order, and this mount only catches
# whatever wasn't already handled by something more specific.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="dashboard")
