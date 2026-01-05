"""Application configuration using Pydantic Settings.

All configuration is loaded from environment variables.
Use .env file for local development (copy from .env.example).
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dali"
    DATABASE_ECHO: bool = False

    # JWT
    JWT_SECRET_KEY: str = "dev-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Alibaba Cloud
    ALIBABA_ACCESS_KEY_ID: str = ""
    ALIBABA_ACCESS_KEY_SECRET: str = ""
    ALIBABA_OSS_BUCKET: str = ""
    ALIBABA_OSS_ENDPOINT: str = ""
    ALIBABA_VISION_ENDPOINT: str = ""

    # AI Provider
    AI_PROVIDER: str = "tongyi"  # "tongyi" or "openai"
    TONGYI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # WeChat
    WECHAT_APP_ID: str = ""
    WECHAT_APP_SECRET: str = ""

    # SMS
    SMS_ACCESS_KEY_ID: str = ""
    SMS_ACCESS_KEY_SECRET: str = ""
    SMS_SIGN_NAME: str = ""
    SMS_TEMPLATE_CODE: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:19006"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance.

    Returns:
        Settings: Application settings singleton
    """
    return Settings()


# Global settings instance
settings = get_settings()
