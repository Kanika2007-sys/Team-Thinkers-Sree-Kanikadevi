"""
Minimal WebSocket broadcast manager. Every mutating REST endpoint (complaint
created/updated, notification sent, emergency changed, etc.) calls
`manager.broadcast(...)` so any connected dashboard client gets the update
pushed instantly, in addition to a background heartbeat with live system
metrics — this is what gives the app its "real-time" behaviour.
"""
import json
import asyncio
from typing import Any
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self.active.append(ws)

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            if ws in self.active:
                self.active.remove(ws)

    async def broadcast(self, event: str, payload: Any) -> None:
        message = json.dumps({"event": event, "data": payload}, default=str)
        stale: list[WebSocket] = []
        async with self._lock:
            targets = list(self.active)
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                stale.append(ws)
        if stale:
            async with self._lock:
                for ws in stale:
                    if ws in self.active:
                        self.active.remove(ws)


manager = ConnectionManager()
