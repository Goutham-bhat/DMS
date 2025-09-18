from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from database import Base 

IST = timezone(timedelta(hours=5, minutes=30))
# USER Table
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))  

    documents = relationship("Document", back_populates="owner") 


# DOCUMENTS Table
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    version = Column(Integer, default=1)
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))
    minio_key = Column(String, nullable=False)

    uploaded_by = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="documents")
