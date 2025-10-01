# resetdb.py
from sqlalchemy import create_engine, text
from database import Base, SQLALDBURL

# IMPORT MODELS so SQLAlchemy knows about them
from models import User, Document  # add all your models here

print(f"[DB] Connecting to database: {SQLALDBURL}")

engine = create_engine(SQLALDBURL, isolation_level="AUTOCOMMIT")

def list_tables():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname='public';")
        )
        return [row[0] for row in result]

print(f"[DB] Tables before drop: {list_tables()}")

print("[DB] Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("[DB] All tables dropped.")

print(f"[DB] Tables after drop: {list_tables()}")

print("[DB] Creating tables from models...")
Base.metadata.create_all(bind=engine)
print("[DB] Tables created successfully.")

print(f"[DB] Tables after create: {list_tables()}")
