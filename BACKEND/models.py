from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from database import Base

# -------------------------
# Timezone setup
# -------------------------
IST = timezone(timedelta(hours=5, minutes=30))

# -------------------------
# USER Table
# -------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    creationtime = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))

    # Role: 'admin' or 'user'
    role = Column(String, default="user", nullable=False)

    # Soft delete flag
    deleted = Column(Boolean, default=False)

    # Relationship to documents
    documents = relationship("Document", back_populates="owner")

print("[models.py] User model loaded")

# -------------------------
# DOCUMENTS Table
# -------------------------
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    size = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    version = Column(Integer, default=1)
    uploadedtime = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))

    # IPFS fields
    cid = Column(String, nullable=False)
    sha256 = Column(String, nullable=False)

    uploaded_by = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="documents")

    # Soft delete flag
    deleted = Column(Boolean, default=False)

print("[models.py] Document model loaded")
