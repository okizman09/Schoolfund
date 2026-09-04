import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App
    APP_NAME: str = "SchoolFund API"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Database
    DATABASE_PROVIDER: str = "sqlite"
    DATABASE_PATH: str = "./schoolfund.db"
    
    # BMONI Infrastructure
    # Official Docs: https://bkey.mintlify.app/
    BMONI_ENABLED: bool = False
    BMONI_API_BASE_URL: str = "https://embedded-dev.bmoni.com"
    BMONI_API_KEY: str = "pk_a025cacbf33a_76fb864113f3540909de5b1da39cc146906e35b1c6d4d1e4"
    BMONI_WEBHOOK_SECRET: Optional[str] = None
    
    # Authentication
    JWT_SECRET: str = "schoolfund_secure_jwt_secret_dev_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Demo & AI
    DEMO_MODE: bool = True
    AI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
