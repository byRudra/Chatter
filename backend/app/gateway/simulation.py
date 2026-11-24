"""X-Simulate-Failure: make chosen keys fail for a single request.

Header format: comma-separated ``<key_id>=<status>`` pairs, ``*`` meaning every key.
    X-Simulate-Failure: key_1=429
    X-Simulate-Failure: key_1=429,key_2=500
    X-Simulate-Failure: *=429
"""

SIMULATED_STATUSES = frozenset({429, 500, 502, 503})
WILDCARD = "*"

FailurePlan = dict[str, int]


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
