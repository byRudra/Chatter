QUESTION = "What is the capital of France?"


def test_same_first_message_in_new_session_is_served_from_cache(send):
    _, live = send("s-live", QUESTION)
    _, cached = send("s-cached", QUESTION)

    assert live["metadata"]["resolution_source"] == "LIVE_INFERENCE"
    assert cached["metadata"]["resolution_source"] == "LLM_CACHE"
    assert cached["reply"] == live["reply"]


def test_cache_hit_reports_stored_usage_null_key_and_no_attempts(send):
    _, live = send("s-live", QUESTION)
    _, cached = send("s-cached", QUESTION)

    meta = cached["metadata"]
    assert meta["key_id"] is None
    assert meta["fallback_attempts"] == 0
    assert meta["input_tokens"] == live["metadata"]["input_tokens"]
    assert meta["output_tokens"] == live["metadata"]["output_tokens"]
    assert meta["model"] == live["metadata"]["model"]


def test_cache_hit_is_faster_than_live_call(send):
    _, live = send("s-live", QUESTION)
    _, cached = send("s-cached", QUESTION)

    assert cached["metadata"]["latency_ms"] < live["metadata"]["latency_ms"]


def test_different_message_never_comes_from_cache(send):
    send("s-1", QUESTION)
    _, other = send("s-2", "What is the capital of Spain?")

    assert other["metadata"]["resolution_source"] == "LIVE_INFERENCE"
    assert other["reply"] == "Echo: What is the capital of Spain?"


def test_same_message_with_different_history_is_not_cached(send):
    send("s-1", QUESTION)
    send("s-2", "Hello!")
    _, follow_up = send("s-2", QUESTION)

    # The cache key covers the whole message list, not just the latest message.
    assert follow_up["metadata"]["resolution_source"] == "LIVE_INFERENCE"


def test_different_system_prompt_is_not_cached(send):
    send("s-1", QUESTION)
    _, pirate = send("s-2", QUESTION, system_prompt="Answer like a pirate.")

    assert pirate["metadata"]["resolution_source"] == "LIVE_INFERENCE"


def test_cache_hit_is_still_recorded_in_session_history(client, send):
    send("s-1", QUESTION)
    send("s-2", QUESTION)

    messages = client.get("/sessions/s-2/messages").json()["messages"]

    assert messages[1]["metadata"]["resolution_source"] == "LLM_CACHE"


def test_reply_cached_after_failover_is_reused(send):
    _, failover = send("s-1", QUESTION, simulate="key_1=429")
    _, cached = send("s-2", QUESTION)

    assert failover["metadata"]["key_id"] == "key_2"
    assert cached["metadata"]["resolution_source"] == "LLM_CACHE"
    assert cached["reply"] == failover["reply"]
