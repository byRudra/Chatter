from litellm import Router

from app.config import Settings


def key_ids(count: int) -> list[str]:
    """Public ids for the key pool, in LLM_API_KEYS order. The keys themselves never leave here."""
    return [f"key_{i}" for i in range(1, count + 1)]


def build_router(settings: Settings) -> Router:
    """One LiteLLM deployment group per API key, all serving the same model.

    Naming each group after its key id lets us tell exactly which key answered
    (via the response's model_id) without ever exposing the key.
    """
    ids = key_ids(len(settings.llm_api_keys))
    model_list = [
        {
            "model_name": key_id,
            "litellm_params": {
                "model": settings.llm_model,
                "api_key": api_key,
                "timeout": settings.llm_timeout_seconds,
                "max_retries": 0,
            },
            "model_info": {"id": key_id},
        }
        for key_id, api_key in zip(ids, settings.llm_api_keys, strict=True)
    ]
    return Router(
        model_list=model_list,
        # key_1 -> key_2 -> ... -> key_N, always in pool order, so fallback_attempts is
        # simply the answering key's position in the chain.
        fallbacks=[{ids[0]: ids[1:]}] if len(ids) > 1 else [],
        # Fail over immediately instead of retrying a key that just returned 429/5xx.
        num_retries=0,
        # No cooldowns: a key that failed (or was made to fail by the simulation hook)
        # is still tried first on the next request, which keeps behaviour per-request.
        disable_cooldowns=True,
    )
