from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import os

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Add it to backend/.env.")


# Base class for all database models
class Base(DeclarativeBase):
    pass


# Create database connection
if DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg2://", "postgres://")):
    if "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL:
        engine = create_engine(DATABASE_URL)
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"sslmode": "require"}
        )
else:
    engine = create_engine(DATABASE_URL)


# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)