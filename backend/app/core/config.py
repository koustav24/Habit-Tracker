from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "HabitOS"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./habitos.db"
    SECRET_KEY: str = "CHANGE_THIS_TO_A_GOOD_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    GEMINI_API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
