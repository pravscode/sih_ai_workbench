from backend.rag.rag_service import answer_question
from backend.tools.document_generator import generate_word, generate_pdf
from backend.security.audit_logger import log_action
from langchain_ollama import ChatOllama


# Local LLM
llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)


def run_agent(user_request):

    print("Agent received request:", user_request)

    # Ask the LLM to decide what the user wants
    decision_prompt = f"""
Classify the user's request into exactly one category:

RAG
DIRECT
DOCUMENT

RAG = the user is asking about information from the uploaded
company documents.

DIRECT = the user is asking a general question that does not
require the uploaded documents.

DOCUMENT = the user wants a report, document, or downloadable
Word/PDF file based on information from the uploaded documents.

User request:
{user_request}

Return ONLY one word:
RAG, DIRECT, or DOCUMENT
"""

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
    else:
        decision = llm.invoke(decision_prompt).content.strip().upper()

    print("Agent decision:", decision)

    # 1. Document question → RAG
    if decision == "RAG":
        return answer_question(user_request)

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