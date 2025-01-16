from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # MongoDB configuration
    MONGO_URI: str = "mongodb+srv://jmdoss7:CGSsGl2yV1qUofKR@cluster0.nzjgq.mongodb.net/dentalApp?retryWrites=true&w=majority&appName=Cluster0"
    MONGO_DB_NAME: str = "dentalApp"
    
    # API configuration
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # CORS configuration
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    CORS_ALLOW_CREDENTIALS: bool = True
    
    # JWT configuration
    JWT_SECRET_KEY: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings() 