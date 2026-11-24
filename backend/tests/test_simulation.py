import litellm
import pytest

from app.gateway.simulation import (
    InvalidSimulationHeader,
    parse_failure_header,
    simulated_error,
    simulated_failures,
    simulated_status,
)


@pytest.mark.parametrize(
    ("header", "expected"),
    [
        ("key_1=429", {"key_1": 429}),
        ("key_1=429,key_2=500", {"key_1": 429, "key_2": 500}),
        (" key_1 = 502 , key_2=503 ", {"key_1": 502, "key_2": 503}),
        ("*=429", {"*": 429}),
        ("", {}),
        ("key_1=429,", {"key_1": 429}),
    ],
)
def test_parses_valid_headers(header, expected):
    assert parse_failure_header(header) == expected


@pytest.mark.parametrize("header", ["key_1", "key_1=", "=429", "key_1=abc", "key_1=404"])
def test_rejects_invalid_headers(header):
    with pytest.raises(InvalidSimulationHeader):
        parse_failure_header(header)


def test_wildcard_applies_to_every_key_and_specific_entries_win():
    with simulated_failures({"*": 429, "key_2": 500}):
        assert simulated_status("key_1") == 429
        assert simulated_status("key_2") == 500


def test_plan_is_cleared_after_the_request():
    with simulated_failures({"key_1": 429}):
        assert simulated_status("key_1") == 429
    assert simulated_status("key_1") is None


@pytest.mark.parametrize(
    ("status", "error_type"),
    [
        (429, litellm.RateLimitError),
        (500, litellm.InternalServerError),
        (502, litellm.BadGatewayError),
        (503, litellm.ServiceUnavailableError),
    ],
)
def test_simulated_errors_are_litellm_provider_errors(status, error_type):
    error = simulated_error(status, "groq/openai/gpt-oss-120b")

    assert isinstance(error, error_type)
    assert error.status_code == status
