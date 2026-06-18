from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Enterprise ERP System"
    # Removing the hardcoded string. Pydantic will now mandate this comes from .env or system env vars.
    DATABASE_URL: str 

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()