import os

# =========================================================
# FORCE LOCAL / OFFLINE MODEL OPERATION
# =========================================================

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"


# =========================================================
# IMPORTS
# =========================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from fastapi.responses import FileResponse
from typing import Optional

from backend.security.audit_logger import log_action

from backend.rag.document_processor import process_pdf
from backend.rag import active_document
from backend.agent.agent import run_agent

from backend.database import SessionLocal
from backend.security.models import User

import bcrypt


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Sovereign AI Workbench"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODELS
# =========================================================

class ChatRequest(BaseModel):
    message: str
    active_document: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Sovereign AI Workbench backend is running"
    }


# =========================================================
# CHAT
# =========================================================

@app.post("/chat")
def chat(request: ChatRequest):

    # Keep backend active-document state synchronized
    # with the frontend.
    if request.active_document:
        active_document.active_document = request.active_document

        print(
            "Chat active document:",
            active_document.active_document
        )

    result = run_agent(request.message)

    return {
        "result": result
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(request: LoginRequest):

    db = SessionLocal()

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    db.close()

    if not user:
        return {
            "status": "error",
            "message": "Invalid email or password"
        }

    password_matches = bcrypt.checkpw(
        request.password.encode(),
        user.hashed_password.encode()
    )

    if not password_matches:
        return {
            "status": "error",
            "message": "Invalid email or password"
        }

    return {
        "status": "success",
        "email": user.email
    }


# =========================================================
# DOCUMENT STORAGE
# =========================================================

UPLOAD_DIR = Path("data/documents")

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# PDF UPLOAD
# =========================================================

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...)
):

    if not file.filename:
        return {
            "status": "error",
            "message": "No filename provided."
        }

    if not file.filename.lower().endswith(".pdf"):
        return {
            "status": "error",
            "message": "Only PDF files are supported."
        }

    file_path = UPLOAD_DIR / file.filename

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    print(
        "Uploaded document:",
        file.filename
    )

    try:

        processing_result = process_pdf(
            file_path
        )

    except Exception as e:

        print(
            "Document processing error:",
            e
        )

        return {
            "status": "error",
            "message": (
                f"Document processing failed: {str(e)}"
            )
        }

    # Set active document AFTER successful processing.
    active_document.active_document = file.filename

    print(
        "Active document set to:",
        active_document.active_document
    )

    log_action(
        user="employee_01",
        request=f"Uploaded document: {file.filename}",
        agent="DOCUMENT_PROCESSOR",
        retrieval="None",
        outputs=file.filename,
        status="SUCCESS"
    )

    return {
        "status": "success",
        "filename": file.filename,
        "active_document": active_document.active_document,
        "pages": processing_result["pages"],
        "chunks": processing_result["chunks"]
    }


# =========================================================
# DOWNLOAD GENERATED FILE
# =========================================================

@app.get("/download/{filename}")
def download_file(filename: str):

    file_path = Path("outputs") / filename

    if not file_path.exists():
        return {
            "status": "error",
            "message": "File not found"
        }

    return FileResponse(
        path=file_path,
        filename=filename
    )