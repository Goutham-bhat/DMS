# drop_and_recreate_db.py

from database import engine, Base

# 🔥 WARNING: This will DELETE all existing data
print("[DB] Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("[DB] All tables dropped.")

print("[DB] Creating tables from models...")
Base.metadata.create_all(bind=engine)
print("[DB] Tables created successfully.")
