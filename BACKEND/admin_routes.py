# admin_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import User, Document
from database import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

# -------------------------
# Router & Security
# -------------------------
router = APIRouter(tags=["Admin"])
security = HTTPBearer()
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return payload

# -------------------------
# Get all users (including deleted)
# -------------------------
@router.get("/users", response_model=List[dict])
def get_users(db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    users = db.query(User).all()  # Include deleted users
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "deleted": u.deleted,  # include deleted status
        }
        for u in users
    ]

# -------------------------
# Promote user to admin
# -------------------------
@router.put("/users/{user_id}/promote")
def promote_user(user_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="User is already an admin")
    user.role = "admin"
    db.commit()
    return {"detail": f"User '{user.email}' promoted to admin"}

# -------------------------
# Demote admin to normal user
# -------------------------
@router.put("/users/{user_id}/demote")
def demote_user(user_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "admin":
        raise HTTPException(status_code=400, detail="User is not an admin")
    user.role = "user"
    db.commit()
    return {"detail": f"Admin '{user.email}' demoted to user"}

# -------------------------
# Soft delete a user (and their files)
# -------------------------
@router.put("/users/{user_id}/soft_delete")
def soft_delete_user(user_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found or already deleted")

    user.deleted = True
    db.query(Document).filter(Document.uploaded_by == user_id).update({"deleted": True})
    db.commit()
    return {"detail": f"User {user.email} and their files marked as deleted"}

# -------------------------
# Restore a soft-deleted user (and files)
# -------------------------
@router.put("/users/{user_id}/restore")
def restore_user(user_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id, User.deleted == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found or not deleted")

    user.deleted = False
    db.query(Document).filter(Document.uploaded_by == user_id).update({"deleted": False})
    db.commit()
    return {"detail": f"User {user.email} and their files restored"}

# -------------------------
# Permanent delete a user (and their files)
# -------------------------
@router.delete("/users/{user_id}/permanent")
def permanent_delete_user(user_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(Document).filter(Document.uploaded_by == user_id).delete()
    db.delete(user)
    db.commit()
    return {"detail": f"User {user.email} and all their files permanently deleted"}

# -------------------------
# Get all files (including deleted)
# -------------------------
@router.get("/files", response_model=List[dict])
def get_files(db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    files = db.query(Document).all()
    return [
        {
            "id": f.id,
            "filename": f.filename,
            "uploaded_by": f.uploaded_by,
            "size": f.size,
            "uploadedtime": f.uploadedtime,
            "deleted": f.deleted,  # include deleted status
        }
        for f in files
    ]

# -------------------------
# Soft delete a single file
# -------------------------
@router.put("/files/{file_id}/soft_delete")
def soft_delete_file(file_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    file = db.query(Document).filter(Document.id == file_id, Document.deleted == False).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found or already deleted")
    file.deleted = True
    db.commit()
    return {"detail": f"File {file.filename} marked as deleted"}

# -------------------------
# Restore a soft-deleted file
# -------------------------
@router.put("/files/{file_id}/restore")
def restore_file(file_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    file = db.query(Document).filter(Document.id == file_id, Document.deleted == True).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found or not deleted")
    file.deleted = False
    db.commit()
    return {"detail": f"File {file.filename} restored"}

# -------------------------
# Permanent delete a file
# -------------------------
@router.delete("/files/{file_id}/permanent")
def permanent_delete_file(file_id: int, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    file = db.query(Document).filter(Document.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    db.delete(file)
    db.commit()
    return {"detail": f"File {file.filename} permanently deleted"}
