from backend.rag.rag_service import answer_question
from backend.tools.document_generator import generate_word, generate_pdf
from backend.security.audit_logger import log_action
from langchain_ollama import ChatOllama
from backend.rag import active_document


# Local LLM
llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)


def run_agent(user_request):

    print("Agent received request:", user_request)

    # Check for document-generation requests first
    document_keywords = [
        "create a report",
        "generate a report",
        "make a report",
        "create a document",
        "generate a document",
        "make a document",
        "create pdf",
        "generate pdf",
        "create word",
        "generate word"
    ]

    request_lower = user_request.lower()

    if any(keyword in request_lower for keyword in document_keywords):
        decision = "DOCUMENT"

    elif active_document.active_document:
        # If a PDF is uploaded, normal questions should use RAG
        decision = "RAG"

    else:
        # No document uploaded → general question
        decision = "DIRECT"

    print("Agent decision:", decision)

    # 1. Document question → RAG
    if decision == "RAG":
        content = answer_question(user_request)
        log_action(
            user="employee_01",
            request=user_request,
            agent="RAG",
            retrieval="ChromaDB",
            outputs="None",
            status="SUCCESS"
        )
        return content

    # 2. General question → Direct LLM
    if decision == "DIRECT":
        response = llm.invoke(user_request)
        return response.content

    # 3. Document generation request
    if decision == "DOCUMENT":

        # Retrieve information from the documents
        content = answer_question(user_request)

        # Generate Word document
        word_file = generate_word(
            "Generated Report",
            content
        )

        # Generate PDF document
        pdf_file = generate_pdf(
            "Generated Report",
            content
        )

        # Record the action in the audit log
        log_action(
            user="employee_01",
            request=user_request,
            agent="DOCUMENT",
            retrieval="RAG",
            outputs=f"{word_file}, {pdf_file}",
            status="SUCCESS"
        )

        return {
            "answer": content,
            "word_file": word_file,
            "pdf_file": pdf_file
        }

    return "I could not determine what action is required."