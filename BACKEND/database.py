from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALDBURL = "postgresql://postgres:drat30mo@localhost:5432/dmsdb"

engine = create_engine(SQLALDBURL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
