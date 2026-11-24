import pytest

VALID = {"session_id": "s-valid", "message": "hello"}


@pytest.mark.parametrize(
    "payload",
    [
        pytest.param({"session_id": "s-1"}, id="missing-message"),
        pytest.param({"message": "hi"}, id="missing-session-id"),
        pytest.param({"session_id": "s-1", "message": ""}, id="empty-message"),
        pytest.param({"session_id": "s-1", "message": "   \n\t "}, id="whitespace-message"),
        pytest.param({"session_id": "", "message": "hi"}, id="empty-session-id"),
        pytest.param({"session_id": "   ", "message": "hi"}, id="whitespace-session-id"),
        pytest.param({"session_id": "s" * 129, "message": "hi"}, id="session-id-too-long"),
        pytest.param({"session_id": "s-1", "message": "a" * 4001}, id="message-too-long"),
        pytest.param({"session_id": 42, "message": "hi"}, id="session-id-not-string"),
        pytest.param({"session_id": "s-1", "message": ["hi"]}, id="message-not-string"),
    ],
)
def test_invalid_payloads_return_422(client, payload):
    response = client.post("/chat", json=payload)

    assert response.status_code == 422
    assert "detail" in response.json()


def test_malformed_json_returns_422(client):
    response = client.post(
        "/chat",
        content='{"session_id": "s-1", "message": ',
        headers={"content-type": "application/json"},
    )

    assert response.status_code == 422
    assert "detail" in response.json()


def test_message_length_is_measured_after_trimming(send):
    status, body = send("s-trim", "   " + "a" * 4000 + "   ")

    assert status == 200
    assert body["reply"]


def test_session_id_at_max_length_is_accepted(send):
    status, _ = send("s" * 128, "hello")

    assert status == 200


def test_rejected_request_is_not_added_to_history(client, send):
    send("s-keep", "first message")

    client.post("/chat", json={"session_id": "s-keep", "message": "   "})
    client.post("/chat", json={"session_id": "s-new", "message": ""})

    assert len(client.get("/sessions/s-keep/messages").json()["messages"]) == 2
    assert client.get("/sessions/s-new/messages").status_code == 404


def test_errors_never_leak_html_or_tracebacks(client):
    for response in (
        client.post("/chat", content="not json", headers={"content-type": "application/json"}),
        client.post("/chat", json={"session_id": "s", "message": "a" * 5000}),
        client.get("/sessions/unknown/messages"),
        client.get("/does-not-exist"),
    ):
        assert response.headers["content-type"].startswith("application/json")
        assert "Traceback" not in response.text
        assert "detail" in response.json()


def test_oversized_message_is_not_echoed_back(client):
    response = client.post("/chat", json={"session_id": "s", "message": "x" * 5000})

    assert response.status_code == 422
    assert len(response.text) < 1000
