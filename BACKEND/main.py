from fastapi import FastAPI
from database import engine, Base
import models

app = FastAPI()

#Creating Tables for the first time if they don't exist
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Hello World"}
