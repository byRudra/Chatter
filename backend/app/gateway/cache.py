import hashlib
import json

import litellm
from litellm.caching.caching import Cache
from litellm.caching.in_memory_cache import InMemoryCache

from app.config import Settings


def enable_response_cache(settings: Settings) -> Cache:
    """Turn on LiteLLM's built-in in-memory response cache.

    LiteLLM keys entries on the *router group* name by default (key_1, key_2, ...),
    which would make a reply produced by key_2 invisible to key_1. Every key serves
    the same model, so the key is just model + the full message list
    (system prompt + history + new message).
    """
    cache = Cache(type="local")
    cache.cache = InMemoryCache(
        max_size_in_memory=settings.cache_max_items,
        default_ttl=settings.cache_ttl_seconds,
    )

    def cache_key(*_: object, **kwargs: object) -> str:
        material = json.dumps(
            {"model": settings.llm_model, "messages": kwargs.get("messages")},
            sort_keys=True,
            ensure_ascii=False,
        )
        return hashlib.sha256(material.encode()).hexdigest()

    cache.get_cache_key = cache_key  # type: ignore[method-assign]
    litellm.cache = cache
    return cache
