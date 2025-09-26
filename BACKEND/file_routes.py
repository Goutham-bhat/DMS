from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse as FastAPIFileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from models import Document
from database import get_db
from ipfs_service import remove_file_from_ipfs, get_file_from_ipfs, add_file_to_ipfs
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt, os, mimetypes, hashlib, tempfile, shutil
from datetime import datetime

# JWT setup
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

router = APIRouter(tags=["Files"])

# -------------------------
# Pydantic schemas
# -------------------------
class FileResponse(BaseModel):
    id: int
    filename: str
    version: int
    sha256: str
    cid: str
    uploadedtime: str
    description: Optional[str] = None
    size: Optional[int] = None
    filetype: Optional[str] = None

class FileRenameRequest(BaseModel):
    new_filename: str

class FileDescriptionRequest(BaseModel):
    description: Optional[str] = None

# -------------------------
# Utility: compute SHA256
# -------------------------
def compute_sha256(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(block)
    return sha256_hash.hexdigest()

# -------------------------
# List files
# -------------------------
@router.get("/", response_model=List[FileResponse])
def list_files(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    query = db.query(Document).filter(Document.uploaded_by == user_id)
    if search:
        query = query.filter(Document.filename.ilike(f"%{search}%"))
    docs = query.order_by(Document.uploadedtime.desc()).all()

    response = []
    for doc in docs:
        response.append(FileResponse(
            id=doc.id,
            filename=doc.filename,
            version=doc.version,
            sha256=doc.sha256,
            cid=doc.cid,
            uploadedtime=doc.uploadedtime.isoformat(),
            description=doc.description,
            size=doc.size,
            filetype=doc.filetype
        ))
    return response

# -------------------------
# Rename file
# -------------------------
@router.put("/{file_id}", response_model=FileResponse)
def rename_file(
    file_id: int,
    payload: FileRenameRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    doc = db.query(Document).filter(Document.id == file_id, Document.uploaded_by == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")

    doc.version += 1
    doc.filename = payload.new_filename
    doc.uploadedtime = datetime.utcnow()
    db.commit()
    db.refresh(doc)

    return FileResponse(
        id=doc.id,
        filename=doc.filename,
        version=doc.version,
        sha256=doc.sha256,
        cid=doc.cid,
        uploadedtime=doc.uploadedtime.isoformat(),
        description=doc.description,
        size=doc.size,
        filetype=doc.filetype
    )

# -------------------------
# Update description
# -------------------------
@router.put("/description/{file_id}", response_model=FileResponse)
def update_description(
    file_id: int,
    payload: FileDescriptionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    doc = db.query(Document).filter(Document.id == file_id, Document.uploaded_by == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")

    doc.description = payload.description
    db.commit()
    db.refresh(doc)

    return FileResponse(
        id=doc.id,
        filename=doc.filename,
        version=doc.version,
        sha256=doc.sha256,
        cid=doc.cid,
        uploadedtime=doc.uploadedtime.isoformat(),
        description=doc.description,
        size=doc.size,
        filetype=doc.filetype
    )

# -------------------------
# Delete file
# -------------------------
@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    doc = db.query(Document).filter(Document.id == file_id, Document.uploaded_by == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")

    if doc.cid:
        try:
            remove_file_from_ipfs(doc.cid)
        except:
            pass

    db.delete(doc)
    db.commit()
    return {"detail": f"File '{doc.filename}' deleted successfully"}

# -------------------------
# Download file
# -------------------------
@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    doc = db.query(Document).filter(Document.id == file_id, Document.uploaded_by == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")

    local_path = get_file_from_ipfs(doc.cid, doc.filename)
    sha = compute_sha256(local_path)
    if sha != doc.sha256:
        os.remove(local_path)
        raise HTTPException(status_code=500, detail="File integrity verification failed (SHA mismatch)")

    mime_type = doc.filetype or mimetypes.guess_type(doc.filename)[0] or "application/octet-stream"
    return FastAPIFileResponse(
        path=local_path,
        filename=doc.filename,
        media_type=mime_type,
        headers={"Content-Disposition": f"attachment; filename={doc.filename}"}
    )

# -------------------------
# Preview file
# -------------------------
@router.get("/preview/{file_id}")
def preview_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("user_id")
    doc = db.query(Document).filter(Document.id == file_id, Document.uploaded_by == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")

    local_path = get_file_from_ipfs(doc.cid, doc.filename)

    # ✅ Use stored filetype if available, fallback to guessing
    mime_type = doc.filetype or mimetypes.guess_type(doc.filename)[0] or "application/octet-stream"

    return FastAPIFileResponse(
        path=local_path,
        filename=doc.filename,
        media_type=mime_type,
        headers={"Content-Disposition": "inline"}
    )

# -------------------------
# Edit file (replace contents)
# -------------------------
@router.put("/upload/{file_id}", response_model=FileResponse)
def edit_file(
    file_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    doc = db.query(Document).filter(Document.id == file_id, Document.uploaded_by == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found or not owned by user")

    temp_dir = tempfile.mkdtemp(prefix="ipfs_edit_")
    temp_path = os.path.join(temp_dir, file.filename)
    with open(temp_path, "wb") as f:
        f.write(file.file.read())

    new_sha = compute_sha256(temp_path)
    new_cid = add_file_to_ipfs(temp_path)

    if doc.cid:
        try:
            remove_file_from_ipfs(doc.cid)
        except:
            pass

    doc.version += 1
    doc.cid = new_cid
    doc.sha256 = new_sha
    doc.filename = file.filename
    doc.uploadedtime = datetime.utcnow()

    # Update size and filetype on content change
    doc.size = os.path.getsize(temp_path)
    doc.filetype = mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    db.commit()
    db.refresh(doc)

    shutil.rmtree(temp_dir, ignore_errors=True)

    return FileResponse(
        id=doc.id,
        filename=doc.filename,
        version=doc.version,
        sha256=doc.sha256,
        cid=doc.cid,
        uploadedtime=doc.uploadedtime.isoformat(),
        description=doc.description,
        size=doc.size,
        filetype=doc.filetype
    )
