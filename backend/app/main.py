import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.db import SessionStore
from app.errors import register_error_handlers
from app.gateway.service import Gateway
from app.routes import chat, health, sessions


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    logging.basicConfig(level=settings.log_level.upper())

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        store = SessionStore(settings.database_path)
        store.init_schema()
        app.state.settings = settings
        app.state.store = store
        app.state.gateway = Gateway(settings)
        yield

    app = FastAPI(title="Chatter API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_methods=["GET", "POST"],
        # X-Simulate-Failure is sent by the frontend's failure lab.
        allow_headers=["Content-Type", "X-Simulate-Failure"],
    )
    register_error_handlers(app)
    app.include_router(health.router)
    app.include_router(chat.router)
    app.include_router(sessions.router)
    return app


app = create_app()
