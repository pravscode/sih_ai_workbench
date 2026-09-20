from pathlib import Path
from io import BytesIO

from pypdf import PdfReader
import pymupdf
import pytesseract
from PIL import Image

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL
)


def extract_text_from_page(page, page_number):
    """
    Try normal PDF text extraction first.
    If little/no text is found, use OCR.
    """

    text = page.get_text("text")

    # Normal text-based PDF
    if text and len(text.strip()) >= 20:
        print(f"Page {page_number}: text extraction used")
        return text.strip()

    # Scanned/image-based PDF
    print(f"Page {page_number}: OCR used")

    pix = page.get_pixmap(
        matrix=pymupdf.Matrix(2, 2)
    )

    image_bytes = pix.tobytes("png")

    image = Image.open(
        BytesIO(image_bytes)
    )

    ocr_text = pytesseract.image_to_string(
        image
    )

    return ocr_text.strip()


def process_pdf(file_path):
    file_path = Path(file_path)

    # Connect to the existing Chroma knowledge base
    vector_store = Chroma(
        collection_name="company_knowledge",
        embedding_function=embeddings,
        persist_directory="data/vector_db"
    )

    # Open PDF
    pdf_document = pymupdf.open(str(file_path))

    documents = []

    for page_number, page in enumerate(pdf_document, start=1):

        text = extract_text_from_page(
            page,
            page_number
        )

        if text:
            documents.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": file_path.name,
                        "page": page_number
                    }
                )
            )

    pdf_document.close()

    if not documents:
        raise ValueError(
            "No text could be extracted from this PDF, even using OCR."
        )

    # Split extracted text into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )

    chunks = splitter.split_documents(documents)

    # Add to existing Chroma knowledge base
    vector_store.add_documents(chunks)

    print("INDEXED DOCUMENT:", file_path.name)
    print("NUMBER OF PAGES:", len(documents))
    print("NUMBER OF CHUNKS:", len(chunks))

    return {
        "filename": file_path.name,
        "pages": len(documents),
        "chunks": len(chunks)
    }