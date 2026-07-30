# Civic Authority Portal — FastAPI Backend

A complete, tested backend for the Civic One Authority Portal dashboard. SQLite-backed
(zero external DB setup), CORS-enabled, and pushes live updates over WebSocket so the
dashboard can feel real-time.

## 1. Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Run

```bash
uvicorn app.main:app --reload --port 8000
```

- API base: `http://localhost:8000/api`
- Interactive docs (Swagger UI): `http://localhost:8000/docs`
- Alternate docs (ReDoc): `http://localhost:8000/redoc`
- WebSocket (real-time feed): `ws://localhost:8000/ws`

On first run it creates `civic.db` (SQLite) next to `app/` and seeds it with the same
mock data the frontend originally shipped with. Delete `civic.db` any time to reset.

## 3. What's "real-time" about it

- Every mutating endpoint (create/update/delete a complaint, send a notification,
  bulk-assign/resolve/escalate, add an officer, open/close an emergency) broadcasts
  a JSON event to every connected `/ws` client the instant it happens.
- A background heartbeat pushes a simulated `live_feed` event every ~8 seconds so
  a connected dashboard keeps moving even with no admin interaction.
- `/api/system/monitor` returns slightly jittered metrics on every call, so a
  polling "System Monitor" panel looks alive too.

WebSocket messages look like:
```json
{"event": "complaint_created", "data": {"id": "CMP-8210", "citizen": "Rajesh K.", "dept": "Water"}}
```

Events emitted: `complaint_created`, `complaint_updated`, `complaint_deleted`,
`complaints_bulk_action`, `officer_added`, `officer_updated`, `citizen_updated`,
`notification_sent`, `emergency_created`, `emergency_updated`, `live_feed`.

## 4. API reference (high-level)

| Resource | Endpoints |
|---|---|
| Complaints | `GET /api/complaints` (filters: `dept`, `priority`, `status`, `ward`, `search`, `sort`), `GET/PATCH/DELETE /api/complaints/{id}`, `POST /api/complaints`, `POST /api/complaints/bulk`, `GET /api/complaints/export.csv` |
| Officers | `GET /api/officers`, `GET/PATCH /api/officers/{id}`, `POST /api/officers` |
| Departments | `GET /api/departments` (open/resolved counts computed live from complaints) |
| Citizens | `GET /api/citizens`, `PATCH /api/citizens/{name}/block` |
| Notifications | `GET /api/notifications`, `POST /api/notifications` |
| Audit Logs | `GET /api/audit-logs` (filters: `search`, `action`, `limit`) |
| Emergencies | `GET /api/emergencies`, `POST /api/emergencies`, `PATCH /api/emergencies/{id}` |
| Analytics | `GET /api/analytics/summary` |
| System | `GET /api/system/monitor`, `GET /api/system/dashboard-summary` |
| Reports | `GET /api/reports/{type}/export.csv?start=YYYY-MM-DD&end=YYYY-MM-DD` (`type` ∈ daily/weekly/monthly/department/ward/emergency/officer) |
| Settings | `GET/PUT /api/settings/ai` |
| Health | `GET /api/health` |

Full request/response schemas are in the auto-generated docs at `/docs`.

## 5. Connecting the existing frontend

The current `app.js` (from the earlier step) runs entirely on client-side mock data
and doesn't call this API yet. To wire them together, the dashboard's render
functions would swap their reads from `AppState.*` arrays to `fetch('/api/...')`
calls, and open a `new WebSocket('ws://localhost:8000/ws')` on load to receive
push updates. I can do that wiring next if you'd like — just ask.

## 6. Project layout

```
backend/
  requirements.txt
  README.md
  app/
    main.py          # FastAPI app, CORS, routers, WebSocket endpoint, startup seeding, heartbeat
    database.py       # SQLite engine/session
    models.py          # SQLAlchemy ORM models
    schemas.py          # Pydantic request/response models
    seed_data.py         # Initial mock data (same as the frontend's original mocks)
    utils.py              # ID generation + audit log helper
    ws_manager.py           # WebSocket connection manager / broadcaster
    routers/
      complaints.py, officers.py, departments.py, citizens.py,
      notifications.py, audit.py, emergencies.py, analytics.py,
      system.py, reports.py, settings.py
```

## 7. Tested

Verified end-to-end in this environment: server starts cleanly, every endpoint
listed above returns correct status codes (200/201/204/404) with real seeded data,
CSV exports produce valid data, a WebSocket client receives broadcasts within
milliseconds of a REST action, the periodic heartbeat fires correctly, and the
server shuts down cleanly with no errors in the logs.
