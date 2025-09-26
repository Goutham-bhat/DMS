from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import User  # import the actual model

# -------------------------
# Password hashing setup
# -------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    hashed = pwd_context.hash(password)
    print(f"[hash_password] Hashed password: {hashed}")  # DEBUG
    return hashed

def verify_password(plain_password: str, hashed_password: str) -> bool:
    result = pwd_context.verify(plain_password, hashed_password)
    print(f"[verify_password] Password match: {result}")  # DEBUG
    return result

# -------------------------
# Pydantic Schemas
# -------------------------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "user"   # ✅ allow "user" or "admin"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# -------------------------
# CRUD Functions
# -------------------------
def create_user(db: Session, user: UserCreate):
    """Create a new user with hashed password"""
    print(f"[create_user] Attempting to create user: {user.email}")  # DEBUG
    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role=user.role  # ✅ store role properly
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"[create_user] User created with ID: {db_user.id}, Role: {db_user.role}")  # DEBUG
    return db_user

def get_user_by_email(db: Session, email: str):
    """Get a user by email"""
    print(f"[get_user_by_email] Searching for user: {email}")  # DEBUG
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"[get_user_by_email] Found user: {user.email}, ID: {user.id}, Role: {user.role}")  # DEBUG
    else:
        print("[get_user_by_email] User not found")  # DEBUG
    return user

def verify_user(db: Session, email: str, password: str):
    """Verify user credentials for login"""
    print(f"[verify_user] Verifying user: {email}")  # DEBUG
    db_user = get_user_by_email(db, email)
    if not db_user:
        print("[verify_user] User does not exist")  # DEBUG
        return None
    if not verify_password(password, db_user.hashed_password):
        print("[verify_user] Password incorrect")  # DEBUG
        return None
    print(f"[verify_user] User verified successfully, Role: {db_user.role}")  # DEBUG
    return db_user
