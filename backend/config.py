import os

from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy


load_dotenv()

db = SQLAlchemy()


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ashlibriggs@localhost/career_companion_db",
)


class Config:
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-me",
    )

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False

    ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
    ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")
    ADZUNA_COUNTRY = os.getenv("ADZUNA_COUNTRY", "us")
    ADZUNA_BASE_URL = os.getenv(
        "ADZUNA_BASE_URL",
        "https://api.adzuna.com/v1/api/jobs",
    )

    USAJOBS_API_KEY = os.getenv("USAJOBS_API_KEY")
    USAJOBS_USER_AGENT = os.getenv("USAJOBS_USER_AGENT")
    USAJOBS_BASE_URL = os.getenv(
        "USAJOBS_BASE_URL",
        "https://data.usajobs.gov/api/search",
    )