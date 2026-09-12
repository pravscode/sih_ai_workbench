from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

from backend.rag.document_processor import process_pdf
from backend.rag import active_document
from backend.agent.agent import run_agent


app = FastAPI(
    title="Sovereign AI Workbench"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {
        "message": "Sovereign AI Workbench backend is running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    result = run_agent(request.message)

    return {
        "result": result
    }
UPLOAD_DIR = Path("data/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        return {
            "status": "error",
            "message": "Only PDF files are supported."
        }

    file_path = UPLOAD_DIR / file.filename

    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)
    active_document.active_document = file.filename

    processing_result = process_pdf(file_path)

    return {
        "status": "success",
        "filename": file.filename,
        "pages": processing_result["pages"],
        "chunks": processing_result["chunks"]
    }