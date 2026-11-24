"""X-Simulate-Failure: make chosen keys fail for a single request.

Header format: comma-separated ``<key_id>=<status>`` pairs, ``*`` meaning every key.
    X-Simulate-Failure: key_1=429
    X-Simulate-Failure: key_1=429,key_2=500
    X-Simulate-Failure: *=429

The plan is held in a context variable for the duration of one request and enforced by a
LiteLLM callback that runs right before each deployment call. The injected exceptions are
the same ones LiteLLM raises for real provider errors, so the Router's fallback path is
exercised exactly as it would be in production.
"""

from collections.abc import Iterator
from contextlib import contextmanager
from contextvars import ContextVar
from typing import Any

import litellm
from litellm.integrations.custom_logger import CustomLogger

SIMULATED_STATUSES = frozenset({429, 500, 502, 503})
WILDCARD = "*"

FailurePlan = dict[str, int]

# Scoped to the current request's task, so concurrent requests never see each other's plan.
_active_plan: ContextVar[FailurePlan | None] = ContextVar("failure_plan", default=None)


class InvalidSimulationHeader(ValueError):
    pass


def parse_failure_header(raw: str) -> FailurePlan:
    plan: FailurePlan = {}
    for entry in raw.split(","):
        entry = entry.strip()
        if not entry:
            continue
        key_id, sep, status = (part.strip() for part in entry.partition("="))
        if not sep or not key_id or not status.isdigit():
            raise InvalidSimulationHeader(
                f"invalid X-Simulate-Failure entry {entry!r}, expected <key_id>=<status>"
            )
        if int(status) not in SIMULATED_STATUSES:
            allowed = ", ".join(str(s) for s in sorted(SIMULATED_STATUSES))
            raise InvalidSimulationHeader(
                f"unsupported status {status} in X-Simulate-Failure, use one of {allowed}"
            )
        plan[key_id] = int(status)
    return plan


@contextmanager
def simulated_failures(plan: FailurePlan) -> Iterator[None]:
    token = _active_plan.set(plan)
    try:
        yield
    finally:
        _active_plan.reset(token)


def simulated_status(key_id: str) -> int | None:
    plan = _active_plan.get() or {}
    return plan.get(key_id, plan.get(WILDCARD))


def simulated_error(status: int, model: str) -> Exception:
    provider = model.split("/", 1)[0] if "/" in model else "unknown"
    message = f"Simulated HTTP {status} via X-Simulate-Failure"
    match status:
        case 429:
            return litellm.RateLimitError(message=message, llm_provider=provider, model=model)
        case 502:
            return litellm.BadGatewayError(message=message, llm_provider=provider, model=model)
        case 503:
            return litellm.ServiceUnavailableError(
                message=message, llm_provider=provider, model=model
            )
        case _:
            return litellm.InternalServerError(message=message, llm_provider=provider, model=model)


class FailureInjector(CustomLogger):
    """Raises the planned provider error for a key just before LiteLLM calls it."""

    async def async_pre_call_deployment_hook(
        self, kwargs: dict[str, Any], call_type: Any
    ) -> dict[str, Any]:
        model_info = kwargs.get("model_info") or {}
        metadata = kwargs.get("metadata") or {}
        key_id = model_info.get("id") or metadata.get("model_group")
        status = simulated_status(key_id) if key_id else None
        if status is not None:
            raise simulated_error(status, str(kwargs.get("model", "")))
        return kwargs
