from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = Field(default="sqlite:///./vitality.db")
    secret_key: str = Field(default="super-secret-key")
    access_token_expire_minutes: int = Field(default=30)
    frontend_origin: str = Field(default="http://localhost:5173")
    environment: str = Field(default="development")
    ai_api_key: str = Field(default="")

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
