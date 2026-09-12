from pathlib import Path

from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL
)

vector_store = Chroma(
    collection_name="company_knowledge",
    embedding_function=embeddings,
    persist_directory="data/vector_db"
)


def process_pdf(file_path):
    global vector_store

    file_path = Path(file_path)

    # Remove the previous document from the vector database
    vector_store.delete_collection()

    # Create a fresh collection for the newly uploaded document
    vector_store = Chroma(
        collection_name="company_knowledge",
        embedding_function=embeddings,
        persist_directory="data/vector_db"
    )

    reader = PdfReader(str(file_path))

    documents = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text and text.strip():
            documents.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": file_path.name,
                        "page": page_number
                    }
                )
            )

    if not documents:
        raise ValueError(
            "No text could be extracted from this PDF."
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )

    chunks = splitter.split_documents(documents)

    vector_store.add_documents(chunks)

    return {
        "filename": file_path.name,
        "pages": len(documents),
        "chunks": len(chunks)
    }