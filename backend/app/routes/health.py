from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings
from app.db import SessionStore
from app.deps import get_gateway, get_settings_dep, get_store
from app.gateway.service import Gateway
from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(
    store: Annotated[SessionStore, Depends(get_store)],
    gateway: Annotated[Gateway, Depends(get_gateway)],
    settings: Annotated[Settings, Depends(get_settings_dep)],
) -> HealthResponse:
    if not store.ping():
        raise HTTPException(status_code=503, detail="database unavailable")
    if not gateway.keys_configured:
        raise HTTPException(status_code=503, detail="no api keys configured")
    return HealthResponse(
        status="ok",
        keys_configured=gateway.keys_configured,
        cache_enabled=gateway.cache_enabled,
        # Extra field so the UI can tell whether X-Simulate-Failure will be honoured.
        failure_simulation=settings.enable_failure_simulation,
    )
