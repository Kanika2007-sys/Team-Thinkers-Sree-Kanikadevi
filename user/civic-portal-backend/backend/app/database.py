"""
Database configuration for the Civic Authority Portal backend.
Uses SQLite (file-based) via SQLAlchemy 2.0 — zero external DB server required,
so `uvicorn app.main:app` works out of the box on any machine.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./civic.db"

# check_same_thread=False is required for SQLite when used with FastAPI's
# threaded request handling (each request may run in a different thread).
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
