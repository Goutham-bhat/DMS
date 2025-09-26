# main.py

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import crud_schemas
import jwt
import os
import shutil
from datetime import datetime, timedelta

from ipfs_service import init_ipfs, start_ipfs_daemon
from upload import upload_document
from file_routes import router as file_router
from admin_routes import router as admin_router

# -------------------------
# Initialize & start IPFS
# -------------------------
init_ipfs()
start_ipfs_daemon()

# -------------------------
# FastAPI app instance
# -------------------------
app = FastAPI(title="PERSPECTIV-DMS")

# -------------------------
# CORS setup (allow React frontend)
# -------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# -------------------------
# Create database tables
# -------------------------
Base.metadata.create_all(bind=engine)

# -------------------------
# JWT Config
# -------------------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# -------------------------
# Root endpoint
# -------------------------
@app.get("/")
def root():
    return {"message": "Hello World"}


# -------------------------
# Register endpoint
# -------------------------
@app.post("/register")
def register_user(user: crud_schemas.UserCreate, db: Session = Depends(get_db)):
    if getattr(user, "role", "user") not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")

    if crud_schemas.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="User already exists")

    crud_schemas.create_user(db, user)
    return {"status": 200, "message": "User successfully registered"}


# -------------------------
# Login endpoint
# -------------------------
@app.post("/login")
def login_user(user: crud_schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud_schemas.verify_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    payload = {
        "user_id": db_user.id,
        "email": db_user.email,
        "role": db_user.role,
    }
    token = create_access_token(payload)

    return {
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name,
            "role": db_user.role,
        },
        "token": token,
    }


# -------------------------
# Upload endpoint
# -------------------------
UPLOAD_TEMP_DIR = r"C:\Users\gouth\Desktop\DMS\temp_uploads"
os.makedirs(UPLOAD_TEMP_DIR, exist_ok=True)


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]
    temp_path = os.path.join(UPLOAD_TEMP_DIR, file.filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        doc = upload_document(db, user_id, temp_path, file.filename)
        response = {
            "filename": doc.filename,
            "version": doc.version,
            "sha256": doc.sha256,
            "cid": doc.cid,
        }
    except Exception as e:
        response = {"filename": file.filename, "error": str(e)}

    os.remove(temp_path)
    return JSONResponse(content=response)


# -------------------------
# Mount routers (after CORS middleware)
# -------------------------
app.include_router(file_router, prefix="/files", tags=["Files"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
