# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from dotenv import load_dotenv

# -------------------------
# Load environment variables
# -------------------------
load_dotenv()
print("[database.py] Loaded .env variables")

# -------------------------
# Get database URL from .env
# -------------------------
SQLALDBURL = os.getenv("SQLALDBURL")
if SQLALDBURL is None:
    raise ValueError("[database.py] ERROR: SQLALDBURL is not set in .env")
else:
    print(f"[database.py] SQLALDBURL: {SQLALDBURL}")

# -------------------------
# Create SQLAlchemy engine
# -------------------------
engine = create_engine(SQLALDBURL, future=True)
print("[database.py] Engine created")

# -------------------------
# Create session factory
# -------------------------
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("[database.py] SessionLocal configured")

# -------------------------
# Base class for models
# -------------------------
Base = declarative_base()
print("[database.py] Base declarative class created")

# -------------------------
# FastAPI dependency to get DB session
# -------------------------
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
