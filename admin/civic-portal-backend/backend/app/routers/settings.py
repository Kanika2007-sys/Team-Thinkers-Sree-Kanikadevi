from fastapi import APIRouter
from app import schemas

router = APIRouter(prefix="/api/settings", tags=["settings"])

_ai_settings = schemas.AISettings()


@router.get("/ai", response_model=schemas.AISettings)
def get_ai_settings():
    return _ai_settings


@router.put("/ai", response_model=schemas.AISettings)
def update_ai_settings(payload: schemas.AISettings):
    global _ai_settings
    _ai_settings = payload
    return _ai_settings
