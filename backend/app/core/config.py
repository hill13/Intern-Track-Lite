from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Pydantic reads these names from the .env file automatically
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Tells Pydantic where to find the .env file
    model_config = SettingsConfigDict(env_file=".env")


# Single instance imported everywhere — avoids re-reading .env on every use
settings = Settings()
