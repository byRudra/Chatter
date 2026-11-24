"""Test fixtures.

Requests go through the real FastAPI app, LiteLLM Router, response cache and fallback
chain. Only the final provider HTTP call is replaced: a LiteLLM callback (FakeProvider)
swaps in LiteLLM's own `mock_response` with a reply and usage derived from the actual
messages, so token counts grow with history the way a real provider's would.
"""

from collections.abc import Iterator
from typing import Any

import litellm
import pytest
from fastapi.testclient import TestClient
from litellm import ModelResponse
from litellm.integrations.custom_logger import CustomLogger

from app.config import Settings
from app.main import create_app

PROVIDER_LATENCY_SECONDS = 0.05


def count_tokens(messages: list[dict[str, str]]) -> int:
    # Rough but deterministic: words plus a small per-message overhead.
    return sum(len(m["content"].split()) + 4 for m in messages)


class FakeProvider(CustomLogger):
    """Stands in for the LLM provider. Records every attempt the Router makes."""

    def __init__(self) -> None:
        super().__init__()
        self.calls: list[dict[str, Any]] = []
        # key_id -> exception the "provider" raises for that key (a real error, not simulated)
        self.errors: dict[str, Exception] = {}

    async def async_pre_call_deployment_hook(
        self, kwargs: dict[str, Any], call_type: Any
    ) -> dict[str, Any]:
        key_id = (kwargs.get("model_info") or {}).get("id")
        messages = kwargs["messages"]
        self.calls.append({"key_id": key_id, "messages": messages})

        if key_id in self.errors:
            kwargs["mock_response"] = self.errors[key_id]
            return kwargs

        reply = f"Echo: {messages[-1]['content']}"
        prompt_tokens = count_tokens(messages)
        completion_tokens = len(reply.split())
        kwargs["mock_response"] = ModelResponse(
            model=kwargs.get("model"),
            choices=[
                {
                    "index": 0,
                    "finish_reason": "stop",
                    "message": {"role": "assistant", "content": reply},
                }
            ],
            usage={
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
            },
        )
        kwargs["mock_delay"] = PROVIDER_LATENCY_SECONDS
        return kwargs

    @property
    def last_messages(self) -> list[dict[str, str]]:
        return self.calls[-1]["messages"]


@pytest.fixture
def make_settings(tmp_path):
    def _make(**overrides: Any) -> Settings:
        values: dict[str, Any] = {
            "llm_api_keys": ["test-key-one", "test-key-two"],
            "llm_model": "groq/openai/gpt-oss-120b",
            "database_url": f"sqlite:///{tmp_path / 'app.db'}",
            "allowed_origins": ["http://localhost:3000"],
            "enable_failure_simulation": True,
            "default_system_prompt": "You are a test assistant.",
        }
        values.update(overrides)
        return Settings(_env_file=None, **values)

    return _make


@pytest.fixture
def provider() -> Iterator[FakeProvider]:
    fake = FakeProvider()
    yield fake
    if fake in litellm.callbacks:
        litellm.callbacks.remove(fake)


@pytest.fixture
def make_client(make_settings, provider):
    clients: list[TestClient] = []

    def _make(**overrides: Any) -> TestClient:
        client = TestClient(create_app(make_settings(**overrides)))
        client.__enter__()
        # Registered after the app's FailureInjector, so simulated failures fire first.
        if provider not in litellm.callbacks:
            litellm.callbacks.append(provider)
        clients.append(client)
        return client

    yield _make
    for client in clients:
        client.__exit__(None, None, None)


@pytest.fixture
def client(make_client) -> TestClient:
    return make_client()


@pytest.fixture
def send(client):
    """POST /chat helper returning (status, body)."""

    def _send(
        session_id: str,
        message: str,
        *,
        simulate: str | None = None,
        system_prompt: str | None = None,
    ) -> tuple[int, dict[str, Any]]:
        payload: dict[str, Any] = {"session_id": session_id, "message": message}
        if system_prompt is not None:
            payload["system_prompt"] = system_prompt
        headers = {"X-Simulate-Failure": simulate} if simulate else {}
        response = client.post("/chat", json=payload, headers=headers)
        return response.status_code, response.json()

    return _send
