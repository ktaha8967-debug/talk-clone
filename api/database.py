from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from api.config import DATABASE_URL
import os

# Use SQLite for local development if PostgreSQL not available
if "sqlite" in DATABASE_URL or not os.getenv("USE_POSTGRES"):
    DATABASE_URL = "sqlite:///./voicestudio.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
