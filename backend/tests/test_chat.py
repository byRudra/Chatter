from tests.conftest import count_tokens


def test_chat_response_matches_contract(send):
    status, body = send("s-7f3a", "What is the capital of France?")

    assert status == 200
    assert body["session_id"] == "s-7f3a"
    assert body["reply"] == "Echo: What is the capital of France?"
    meta = body["metadata"]
    assert meta["resolution_source"] == "LIVE_INFERENCE"
    assert meta["model"] == "groq/llama-3.3-70b-versatile"
    assert isinstance(meta["latency_ms"], int) and meta["latency_ms"] >= 0
    assert isinstance(meta["input_tokens"], int) and meta["input_tokens"] > 0
    assert isinstance(meta["output_tokens"], int) and meta["output_tokens"] > 0
    assert meta["key_id"] == "key_1"
    assert meta["fallback_attempts"] == 0


def test_api_keys_never_appear_in_responses(client, send):
    _, body = send("s-secret", "hello")
    history = client.get("/sessions/s-secret/messages").text

    for secret in ("test-key-one", "test-key-two"):
        assert secret not in str(body)
        assert secret not in history


def test_bot_receives_full_history_on_each_turn(send, provider):
    send("s-mem", "My name is Ada.")
    send("s-mem", "What is my name?")

    assert provider.last_messages == [
        {"role": "system", "content": "You are a test assistant."},
        {"role": "user", "content": "My name is Ada."},
        {"role": "assistant", "content": "Echo: My name is Ada."},
        {"role": "user", "content": "What is my name?"},
    ]


def test_sessions_are_isolated(send, provider):
    send("s-a", "I like tea.")
    send("s-b", "I like coffee.")
    send("s-a", "What do I like?")

    contents = [m["content"] for m in provider.last_messages]
    assert "I like tea." in contents
    assert "I like coffee." not in contents


def test_tokens_are_per_request_not_cumulative(send, provider):
    _, first = send("s-tok", "one two three")
    first_prompt = provider.last_messages
    _, second = send("s-tok", "four five six")
    second_prompt = provider.last_messages

    # Each request reports exactly what was sent/received for that request only.
    assert first["metadata"]["input_tokens"] == count_tokens(first_prompt)
    assert second["metadata"]["input_tokens"] == count_tokens(second_prompt)
    assert second["metadata"]["output_tokens"] == len(second["reply"].split())


def test_equal_length_first_messages_report_same_input_tokens(send):
    _, a = send("s-eq-1", "alpha beta gamma")
    _, b = send("s-eq-2", "delta epsilon zeta")

    assert a["metadata"]["input_tokens"] == b["metadata"]["input_tokens"]


def test_history_is_returned_oldest_first_without_system_prompt(client, send):
    send("s-hist", "first", system_prompt="Answer like a pirate.")
    send("s-hist", "second")

    body = client.get("/sessions/s-hist/messages").json()

    assert body["session_id"] == "s-hist"
    assert [(m["role"], m["content"]) for m in body["messages"]] == [
        ("user", "first"),
        ("assistant", "Echo: first"),
        ("user", "second"),
        ("assistant", "Echo: second"),
    ]
    assert all("metadata" not in m for m in body["messages"] if m["role"] == "user")
    assistant_meta = body["messages"][1]["metadata"]
    assert assistant_meta["resolution_source"] == "LIVE_INFERENCE"
    assert {"input_tokens", "output_tokens"} <= assistant_meta.keys()


def test_unknown_session_history_is_404(client):
    response = client.get("/sessions/never-seen/messages")

    assert response.status_code == 404
    assert response.json() == {"detail": "session not found"}


def test_system_prompt_overrides_default_and_sticks_for_the_session(send, provider):
    send("s-sys", "hi", system_prompt="Answer like a pirate.")
    assert provider.last_messages[0] == {"role": "system", "content": "Answer like a pirate."}

    send("s-sys", "and again")
    assert provider.last_messages[0] == {"role": "system", "content": "Answer like a pirate."}

    send("s-other", "hi")
    assert provider.last_messages[0] == {"role": "system", "content": "You are a test assistant."}


def test_history_survives_an_app_restart(make_client):
    first = make_client()
    first.post("/chat", json={"session_id": "s-persist", "message": "remember me"})
    first.__exit__(None, None, None)

    second = make_client()
    messages = second.get("/sessions/s-persist/messages").json()["messages"]

    assert [m["content"] for m in messages] == ["remember me", "Echo: remember me"]
