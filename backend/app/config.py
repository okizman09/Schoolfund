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
    BMONI_ENABLED: bool = True
    BMONI_API_BASE_URL: str = "https://embedded-dev.bmoni.com"
    BMONI_API_KEY: str = "pk_a025cacbf33a_76fb864113f3540909de5b1da39cc146906e35b1c6d4d1e4"
    BMONI_WEBHOOK_SECRET: str = "b4b51077f69da69f249c19a3fe40e789be110aa93485a3415640c42f19a90675"
    
    # Authentication
    JWT_SECRET: str = "schoolfund_secure_jwt_secret_dev_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Demo & AI
    DEMO_MODE: bool = True
    AI_API_KEY: Optional[str] = None


    class Config:
        env_file = [".env", "../.env"]
        extra = "allow"

settings = Settings()
