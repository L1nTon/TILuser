import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _default_sqlite_url() -> str:
    db_path = BASE_DIR / "local.db"
    return f"sqlite:///{db_path}"


class Settings:
    def __init__(self) -> None:
        self.app_name: str = os.getenv("APP_NAME", "Educational Center API")
        self.environment: str = os.getenv("ENV", "development")
        self.database_url: str = os.getenv("DATABASE_URL", _default_sqlite_url())
        self.jwt_secret: str = os.getenv("JWT_SECRET", "dev-secret")
        self.jwt_algorithm: str = "HS256"
        self.jwt_exp_minutes: int = int(os.getenv("JWT_EXP_MINUTES", "60"))
        self.admin_login: str = os.getenv("ADMIN_LOGIN", "admin")
        self.admin_password: str = os.getenv("ADMIN_PASSWORD", "admin123")
        self.telegram_bot_token: str | None = os.getenv("TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id: str | None = os.getenv("TELEGRAM_CHAT_ID")

        # CORS settings
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:5173")
        self.cors_origins: list[str] = [origin.strip() for origin in cors_origins.split(",")]

        # Rate limiting
        self.rate_limit_enabled: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
        self.redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")

        # Pagination
        self.default_page_size: int = int(os.getenv("DEFAULT_PAGE_SIZE", "20"))
        self.max_page_size: int = int(os.getenv("MAX_PAGE_SIZE", "100"))


@lru_cache
def get_settings() -> Settings:
    return Settings()

