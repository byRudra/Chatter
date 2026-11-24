from fastapi import Request

from app.config import Settings
from app.db import SessionStore


def get_settings_dep(request: Request) -> Settings:
    return request.app.state.settings


def get_store(request: Request) -> SessionStore:
    return request.app.state.store
