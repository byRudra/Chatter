from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

SQLITE_PREFIX = "sqlite:///"


class Settings(BaseSettings):
    """All configuration comes from environment variables (or a .env file for local runs)."""

    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    llm_api_keys: Annotated[list[str], NoDecode] = Field(default_factory=list)
    llm_model: str = "groq/llama-3.3-70b-versatile"
    llm_timeout_seconds: float = 30.0
    database_url: str = "sqlite:///./data/app.db"
    allowed_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )
    enable_failure_simulation: bool = False
    default_system_prompt: str = "You are a helpful, concise assistant."
    log_level: str = "info"

    @field_validator("llm_api_keys", "allowed_origins", mode="before")
    @classmethod
    def _split_csv(cls, value: object) -> object:
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    @field_validator("database_url")
    @classmethod
    def _require_sqlite(cls, value: str) -> str:
        if not value.startswith(SQLITE_PREFIX):
            raise ValueError(f"DATABASE_URL must start with {SQLITE_PREFIX}")
        return value

    @property
    def database_path(self) -> str:
        # sqlite:////data/app.db -> /data/app.db, sqlite:///./data/app.db -> ./data/app.db
        return self.database_url.removeprefix(SQLITE_PREFIX)


@lru_cache
def get_settings() -> Settings:
    return Settings()
