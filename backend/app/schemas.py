from typing import Annotated, Any, Literal

from pydantic import BaseModel, StringConstraints, field_validator

MAX_MESSAGE_CHARS = 4000
MAX_SESSION_ID_CHARS = 128
MAX_SYSTEM_PROMPT_CHARS = 8000

ResolutionSource = Literal["LIVE_INFERENCE", "LLM_CACHE"]


class ChatRequest(BaseModel):
    # strip_whitespace runs before the length checks, so "   " counts as empty.
    session_id: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_SESSION_ID_CHARS)
    ]
    message: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_MESSAGE_CHARS)
    ]
    system_prompt: Annotated[
        str | None, StringConstraints(strip_whitespace=True, max_length=MAX_SYSTEM_PROMPT_CHARS)
    ] = None

    @field_validator("system_prompt")
    @classmethod
    def _blank_prompt_is_unset(cls, value: str | None) -> str | None:
        return value or None


class ChatMetadata(BaseModel):
    resolution_source: ResolutionSource
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    key_id: str | None
    fallback_attempts: int


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    metadata: ChatMetadata


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    metadata: dict[str, Any] | None = None


class HistoryResponse(BaseModel):
    session_id: str
    messages: list[HistoryMessage]


class HealthResponse(BaseModel):
    status: Literal["ok"]
    keys_configured: int
    cache_enabled: bool
    failure_simulation: bool
    model: str
