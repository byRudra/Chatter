def test_health_reports_key_pool_and_cache(client):
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert {k: body[k] for k in ("status", "keys_configured", "cache_enabled")} == {
        "status": "ok",
        "keys_configured": 2,
        "cache_enabled": True,
    }
    assert body["failure_simulation"] is True


def test_health_reports_disabled_failure_simulation(make_client):
    client = make_client(enable_failure_simulation=False)

    assert client.get("/health").json()["failure_simulation"] is False


def test_health_counts_every_configured_key(make_client):
    client = make_client(llm_api_keys=["k1", "k2", "k3"])

    assert client.get("/health").json()["keys_configured"] == 3


def test_health_is_unavailable_without_keys(make_client):
    client = make_client(llm_api_keys=[])

    response = client.get("/health")

    assert response.status_code == 503
    assert "detail" in response.json()


def test_chat_without_keys_is_a_clean_503(make_client):
    client = make_client(llm_api_keys=[])

    response = client.post("/chat", json={"session_id": "s", "message": "hi"})

    assert response.status_code == 503
    assert response.json() == {"detail": "all providers unavailable"}
