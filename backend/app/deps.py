from fastapi import Request

from app.config import Settings
from app.db import SessionStore
from app.gateway.service import Gateway


def get_settings_dep(request: Request) -> Settings:
    return request.app.state.settings


def get_store(request: Request) -> SessionStore:
    return request.app.state.store


def get_gateway(request: Request) -> Gateway:
    return request.app.state.gateway
