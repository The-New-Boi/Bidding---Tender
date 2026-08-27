import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = 'GeM Bid Compliance AI'
    DATABASE_URL: str = 'sqlite+aiosqlite:///./gem_compliance.db'
    GEMINI_API_KEY: str | None = os.getenv('GEMINI_API_KEY')
    CORS_ORIGINS: list[str] = ['http://localhost:3000', 'http://localhost:5173']
    UPLOAD_DIR: str = './uploads'

    class Config:
        env_file = ".env"

settings = Settings()
