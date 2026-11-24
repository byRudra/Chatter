from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.db import SessionStore
from app.deps import get_store
from app.schemas import HistoryMessage, HistoryResponse

router = APIRouter(tags=["sessions"])


@router.get(
    "/sessions/{session_id}/messages",
    response_model=HistoryResponse,
    response_model_exclude_none=True,
)
def get_session_messages(
    session_id: str, store: Annotated[SessionStore, Depends(get_store)]
) -> HistoryResponse:
    if not store.session_exists(session_id):
        raise HTTPException(status_code=404, detail="session not found")
    messages = [
        HistoryMessage(role=m.role, content=m.content, metadata=m.metadata)
        for m in store.get_history(session_id)
    ]
    return HistoryResponse(session_id=session_id, messages=messages)
