# upload_service.py
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from models import Document
from ipfs_service import add_file_to_ipfs  
import hashlib
import os

IST = timezone(timedelta(hours=5, minutes=30))

# SHA256 Hashing

def compute_sha(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()

def upload_document(db: Session, user_id: int, file_path: str, filename: str):
    """
    Uploads a file to IPFS and records it in the database with metadata:
    filename, filetype, size, version, uploaded time, user, CID, SHA256.
    """
    # Compute SHA256
    sha = compute_sha(file_path)

    # Add file to IPFS
    cid = add_file_to_ipfs(file_path)

    # Extract filetype from filename extension
    filetype = os.path.splitext(filename)[1][1:].lower() or "unknown"

    # Get file size in bytes
    size = os.path.getsize(file_path)

    # Versioning: increment if same filename exists for this user
    existing_docs = db.query(Document).filter(
        Document.filename == filename,
        Document.uploaded_by == user_id
    ).all()
    version = len(existing_docs) + 1

    # Create Document record
    doc = Document(
        filename=filename,
        filetype=filetype,
        size=size,
        version=version,
        uploadedtime=datetime.now(IST),
        uploaded_by=user_id,
        cid=cid,
        sha256=sha
    )

    # Save to DB
    db.add(doc)
    db.commit()
    db.refresh(doc)

    print(f"[Upload] Document uploaded: {filename}, Type: {filetype}, "
          f"Size: {size} bytes, Version: {version}, CID: {cid}, SHA256: {sha}")

    return doc
