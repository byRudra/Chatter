import litellm
import pytest


@pytest.mark.parametrize("status", [429, 500, 502, 503])
def test_simulated_failure_on_first_key_falls_back_to_second(send, status):
    code, body = send("s-fo", "hello", simulate=f"key_1={status}")

    assert code == 200
    assert body["metadata"]["key_id"] == "key_2"
    assert body["metadata"]["fallback_attempts"] == 1
    assert body["metadata"]["resolution_source"] == "LIVE_INFERENCE"


def test_simulated_request_returns_a_real_answer(send):
    _, body = send("s-real", "Tell me something", simulate="key_1=429")

    assert body["reply"] == "Echo: Tell me something"


@pytest.mark.parametrize("header", ["*=429", "key_1=429,key_2=500", "*=503"])
def test_every_key_failing_returns_503(send, header):
    code, body = send("s-down", "hello", simulate=header)

    assert code == 503
    assert body == {"detail": "all providers unavailable"}


def test_all_keys_down_adds_nothing_to_history(client, send):
    send("s-hist", "first")

    code, _ = send("s-hist", "doomed", simulate="*=429")

    assert code == 503
    messages = client.get("/sessions/s-hist/messages").json()["messages"]
    assert [m["content"] for m in messages] == ["first", "Echo: first"]


def test_all_keys_down_on_new_session_creates_no_session(client, send):
    send("s-ghost", "hello", simulate="*=429")

    assert client.get("/sessions/s-ghost/messages").status_code == 404


def test_simulation_only_affects_that_request(send):
    send("s-1", "first", simulate="key_1=429")
    _, after = send("s-1", "second")

    # No cooldown carried over: key_1 is tried (and answers) again.
    assert after["metadata"]["key_id"] == "key_1"
    assert after["metadata"]["fallback_attempts"] == 0


def test_simulation_bypasses_cache_so_failover_is_visible(send):
    send("s-1", "cached question")

    _, body = send("s-2", "cached question", simulate="key_1=429")

    assert body["metadata"]["resolution_source"] == "LIVE_INFERENCE"
    assert body["metadata"]["key_id"] == "key_2"


def test_failover_walks_a_longer_pool_in_order(make_client):
    client = make_client(llm_api_keys=["k1", "k2", "k3"])

    body = client.post(
        "/chat",
        json={"session_id": "s", "message": "hi"},
        headers={"X-Simulate-Failure": "key_1=429,key_2=503"},
    ).json()

    assert body["metadata"]["key_id"] == "key_3"
    assert body["metadata"]["fallback_attempts"] == 2


def test_header_is_ignored_when_simulation_is_disabled(make_client):
    client = make_client(enable_failure_simulation=False)

    response = client.post(
        "/chat",
        json={"session_id": "s", "message": "hi"},
        headers={"X-Simulate-Failure": "*=429"},
    )

    assert response.status_code == 200
    assert response.json()["metadata"]["key_id"] == "key_1"


@pytest.mark.parametrize("header", ["key_1=404", "key_1", "garbage", "=429"])
def test_malformed_simulation_header_is_a_422(send, header):
    code, body = send("s", "hi", simulate=header)

    assert code == 422
    assert "X-Simulate-Failure" in body["detail"]


def _rate_limit() -> Exception:
    return litellm.RateLimitError(message="quota exceeded", llm_provider="groq", model="m")


def _server_error() -> Exception:
    return litellm.InternalServerError(message="upstream 500", llm_provider="groq", model="m")


def test_real_provider_rate_limit_fails_over(send, provider):
    provider.errors["key_1"] = _rate_limit()

    code, body = send("s", "hello")

    assert code == 200
    assert body["metadata"]["key_id"] == "key_2"
    assert body["metadata"]["fallback_attempts"] == 1


def test_real_provider_errors_on_every_key_return_503(send, provider):
    provider.errors.update(key_1=_rate_limit(), key_2=_server_error())

    code, body = send("s", "hello")

    assert code == 503
    assert body == {"detail": "all providers unavailable"}
