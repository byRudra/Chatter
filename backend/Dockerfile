# syntax=docker/dockerfile:1.7

# ---- Build stage: resolve and install dependencies into an isolated venv ----
FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.11.9 /uv /usr/local/bin/uv

RUN python -m venv /opt/venv
COPY requirements.txt /tmp/requirements.txt
RUN uv pip install --python /opt/venv/bin/python --no-cache -r /tmp/requirements.txt

# ---- Runtime stage: just Python, the venv and the app code ----
FROM python:3.12-slim AS runtime

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # Use LiteLLM's bundled model price map instead of fetching it at startup.
    LITELLM_LOCAL_MODEL_COST_MAP=True \
    DATABASE_URL=sqlite:////data/app.db

RUN useradd --create-home --uid 10001 app \
    && mkdir -p /data \
    && chown app:app /data

COPY --from=builder /opt/venv /opt/venv
WORKDIR /app
COPY app ./app

USER app
VOLUME ["/data"]
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.getenv(\"PORT\", \"8000\")}/health', timeout=4)"

# PORT is injected by most hosts; defaults to 8000 locally.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
