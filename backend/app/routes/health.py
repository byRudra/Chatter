from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings
from app.db import SessionStore
from app.deps import get_settings_dep, get_store
from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(
    store: Annotated[SessionStore, Depends(get_store)],
    settings: Annotated[Settings, Depends(get_settings_dep)],
) -> HealthResponse:
    if not store.ping():
        raise HTTPException(status_code=503, detail="database unavailable")
    if not settings.llm_api_keys:
        raise HTTPException(status_code=503, detail="no api keys configured")
    return HealthResponse(
        status="ok", keys_configured=len(settings.llm_api_keys), cache_enabled=False
    )
