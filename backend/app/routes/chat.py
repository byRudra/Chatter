import time
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.config import Settings
from app.db import SessionStore, utc_now
from app.deps import get_gateway, get_settings_dep, get_store
from app.gateway.service import Gateway, ProvidersUnavailable
from app.gateway.simulation import FailurePlan, InvalidSimulationHeader, parse_failure_header
from app.schemas import ChatMetadata, ChatRequest, ChatResponse

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    store: Annotated[SessionStore, Depends(get_store)],
    gateway: Annotated[Gateway, Depends(get_gateway)],
    settings: Annotated[Settings, Depends(get_settings_dep)],
    x_simulate_failure: Annotated[str | None, Header()] = None,
) -> ChatResponse:
    started = time.perf_counter()
    received_at = utc_now()

    failure_plan: FailurePlan = {}
    if x_simulate_failure and settings.enable_failure_simulation:
        try:
            failure_plan = parse_failure_header(x_simulate_failure)
        except InvalidSimulationHeader as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    stored_prompt = await run_in_threadpool(store.get_system_prompt, body.session_id)
    system_prompt = body.system_prompt or stored_prompt or settings.default_system_prompt
    history = await run_in_threadpool(store.get_history, body.session_id)
    messages = [
        {"role": "system", "content": system_prompt},
        *({"role": m.role, "content": m.content} for m in history),
        {"role": "user", "content": body.message},
    ]

    try:
        completion = await gateway.complete(messages, failure_plan)
    except ProvidersUnavailable as exc:
        # Nothing has been written yet, so the failed turn never reaches the history.
        raise HTTPException(status_code=503, detail="all providers unavailable") from exc

    metadata = ChatMetadata(
        resolution_source=completion.resolution_source,
        model=gateway.model,
        latency_ms=round((time.perf_counter() - started) * 1000),
        input_tokens=completion.input_tokens,
        output_tokens=completion.output_tokens,
        key_id=completion.key_id,
        fallback_attempts=completion.fallback_attempts,
    )
    await run_in_threadpool(
        store.save_turn,
        session_id=body.session_id,
        user_content=body.message,
        assistant_content=completion.reply,
        metadata=metadata.model_dump(),
        system_prompt=body.system_prompt,
        user_created_at=received_at,
    )
    return ChatResponse(session_id=body.session_id, reply=completion.reply, metadata=metadata)
