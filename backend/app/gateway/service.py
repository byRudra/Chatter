import asyncio
import logging
from dataclasses import dataclass
from typing import Any, Literal

import litellm

from app.config import Settings
from app.gateway.cache import enable_response_cache
from app.gateway.router import build_router, key_ids
from app.gateway.simulation import FailureInjector, FailurePlan, simulated_failures

logger = logging.getLogger("chatter.gateway")

# LiteLLM logs a full traceback for every failed attempt, even ones the fallback
# chain recovers from. We log our own one-line summary instead.
for noisy in ("LiteLLM", "LiteLLM Router", "LiteLLM Proxy"):
    logging.getLogger(noisy).setLevel(logging.CRITICAL)
litellm.suppress_debug_info = True


class ProvidersUnavailable(Exception):
    """Every key in the pool failed for this request."""


@dataclass(frozen=True)
class Completion:
    reply: str
    resolution_source: Literal["LIVE_INFERENCE", "LLM_CACHE"]
    key_id: str | None
    fallback_attempts: int
    input_tokens: int
    output_tokens: int


class Gateway:
    def __init__(self, settings: Settings) -> None:
        self.model = settings.llm_model
        self.key_ids = key_ids(len(settings.llm_api_keys))
        self.cache = enable_response_cache(settings)
        if not any(isinstance(cb, FailureInjector) for cb in litellm.callbacks):
            litellm.callbacks.append(FailureInjector())
        self.router = build_router(settings) if self.key_ids else None

    @property
    def keys_configured(self) -> int:
        return len(self.key_ids)

    @property
    def cache_enabled(self) -> bool:
        return litellm.cache is self.cache

    async def complete(
        self, messages: list[dict[str, str]], failure_plan: FailurePlan | None = None
    ) -> Completion:
        if self.router is None:
            raise ProvidersUnavailable("no api keys configured")

        with simulated_failures(failure_plan or {}):
            try:
                response: Any = await self.router.acompletion(
                    model=self.key_ids[0], messages=messages, caching=True
                )
            except Exception as exc:
                logger.warning("All %d keys failed: %s", len(self.key_ids), _summary(exc))
                raise ProvidersUnavailable(str(exc)) from exc

        # LiteLLM writes the cache entry from a background task; yield once so it lands
        # before the response goes out and an immediate repeat can hit it.
        await asyncio.sleep(0)

        reply = (response.choices[0].message.content or "").strip()
        if not reply:
            raise ProvidersUnavailable("provider returned an empty reply")

        hidden = getattr(response, "_hidden_params", None) or {}
        usage = getattr(response, "usage", None)
        input_tokens = int(getattr(usage, "prompt_tokens", 0) or 0)
        output_tokens = int(getattr(usage, "completion_tokens", 0) or 0)

        if hidden.get("cache_hit"):
            return Completion(reply, "LLM_CACHE", None, 0, input_tokens, output_tokens)

        key_id = str(hidden.get("model_id"))
        # The fallback chain always starts at key_1 and walks the pool in order,
        # so every key before the one that answered failed during this request.
        attempts = self.key_ids.index(key_id) if key_id in self.key_ids else 0
        if attempts:
            logger.info("Answered by %s after %d failed key(s)", key_id, attempts)
        return Completion(reply, "LIVE_INFERENCE", key_id, attempts, input_tokens, output_tokens)


def _summary(exc: Exception) -> str:
    status = getattr(exc, "status_code", None)
    return f"{type(exc).__name__}" + (f" ({status})" if status else "")
