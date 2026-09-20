from pathlib import Path

from backend.rag.document_processor import process_pdf


DOCUMENTS_DIR = Path("data/documents")


def index_knowledge_base():
    pdf_files = list(DOCUMENTS_DIR.glob("*.pdf"))

    if not pdf_files:
        print("No PDF documents found in the knowledge base.")
        return

    print(f"Found {len(pdf_files)} PDF document(s).")

    for pdf_file in pdf_files:
        print(f"\nIndexing: {pdf_file.name}")

        result = process_pdf(pdf_file)

        print(
            f"Completed: {result['filename']} | "
            f"Pages: {result['pages']} | "
            f"Chunks: {result['chunks']}"
        )

    print("\nKnowledge base indexing completed.")


if __name__ == "__main__":
    index_knowledge_base()