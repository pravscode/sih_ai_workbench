from backend.rag.rag_service import answer_question, summarize_document
from backend.tools.document_generator import generate_word, generate_pdf
from backend.security.audit_logger import log_action
from backend.evidence.evidence_extractor import extract_evidence
from backend.reasoning.sop_reasoner import reason_against_sop
from backend.approval.approval_note import generate_approval_note
from backend.coding.coding_pipeline import run_coding_pipeline
from backend.security.no_egress_monitor import check_no_egress

from langchain_ollama import ChatOllama
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from backend.rag import active_document


# =========================================================
# LOCAL LLM
# =========================================================

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)


# =========================================================
# EMBEDDINGS
# =========================================================

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


# =========================================================
# GET UPLOADED DOCUMENT TEXT
# =========================================================

def get_uploaded_document_text(filename):
    """
    Retrieve text belonging only to the currently uploaded document.
    """

    vector_store = Chroma(
        collection_name="company_knowledge",
        embedding_function=embeddings,
        persist_directory="data/vector_db"
    )

    data = vector_store.get(
        where={"source": filename},
        include=["documents", "metadatas"]
    )

    documents = data.get("documents", [])

    if not documents:
        return ""

    return "\n\n".join(documents)


# =========================================================
# MAIN AGENT
# =========================================================

def run_agent(user_request):

    sovereignty = check_no_egress()

    print("SOVEREIGNTY STATUS:", sovereignty["status"])

    print("Agent received request:", user_request)

    request_lower = user_request.lower()


    # =====================================================
    # INTENT KEYWORDS
    # =====================================================

    inspection_keywords = [
        "inspection review",
        "inspect the document",
        "analyze the inspection",
        "analyse the inspection",
        "inspection report",
        "inspection finding",
        "inspection findings",
        "review the inspection",
        "review this report",
        "approval note",
        "generate approval note",
        "create approval note",
        "approve this report"
    ]


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


    coding_keywords = [
        "write code",
        "write python",
        "generate code",
        "generate python",
        "create code",
        "create a python",
        "python code",
        "coding",
        "program",
        "function",
        "script",
        "debug code",
        "fix this code",
        "run this code",
        "calculate using python"
    ]


    rag_keywords = [
        "what is",
        "what are",
        "what does",
        "what do",
        "why is",
        "why are",
        "why does",
        "why do",
        "how is",
        "how are",
        "how does",
        "how do",
        "explain",
        "define",
        "describe",
        "tell me about",
        "according to",
        "which is",
        "which are"
    ]


    # =====================================================
    # INTENT ROUTING
    #
    # IMPORTANT:
    # RAG is checked only AFTER inspection/document/coding.
    # Therefore RAG cannot overwrite another decision.
    # =====================================================

    decision = "DIRECT"


    # -----------------------------------------------------
    # 1. INSPECTION
    # -----------------------------------------------------

    if (
        active_document.active_document
        and any(
            keyword in request_lower
            for keyword in inspection_keywords
        )
    ):
        decision = "INSPECTION"


    # -----------------------------------------------------
    # 2. DOCUMENT GENERATION
    # -----------------------------------------------------

    elif any(
        keyword in request_lower
        for keyword in document_keywords
    ):
        decision = "DOCUMENT"


    # -----------------------------------------------------
    # 3. CODING
    # -----------------------------------------------------

    elif any(
        keyword in request_lower
        for keyword in coding_keywords
    ):
        decision = "CODING"


    # -----------------------------------------------------
    # 4. RAG / KNOWLEDGE BASE
    # -----------------------------------------------------

    elif any(
        keyword in request_lower
        for keyword in rag_keywords
    ):
        decision = "RAG"


    # -----------------------------------------------------
    # 5. DIRECT
    # -----------------------------------------------------

    else:
        decision = "DIRECT"


    print("Agent decision:", decision)


    # =====================================================
    # CODING ROUTE
    # =====================================================

    if decision == "CODING":

        print("Routing request to local coding pipeline...")

        try:

            result = run_coding_pipeline(user_request)

            log_action(
                user="employee_01",
                request=user_request,
                agent="CODING",
                retrieval="None",
                outputs="Generated code + tests + sandbox result",
                status=result["status"],
                sovereignty_status=sovereignty["status"],
                external_connections=sovereignty["external_calls_detected"]
            )

            if result["status"] == "PASS":
                answer = "Code generated and tested successfully."
            else:
                answer = "Code was generated, but the tests failed."

            return {
                "answer": answer,
                "code": result["code"],
                "tests": result["tests"],
                "test_result": result["test_result"],
                "status": result["status"],
                "sovereignty": sovereignty
            }

        except Exception as e:

            print("Coding pipeline error:", e)

            log_action(
                user="employee_01",
                request=user_request,
                agent="CODING",
                retrieval="None",
                outputs="None",
                status="ERROR",
                sovereignty_status=sovereignty["status"],
                external_connections=sovereignty["external_calls_detected"]
            )

            return {
                "answer": f"Coding agent failed: {str(e)}",
                "status": "ERROR",
                "sovereignty": sovereignty
            }


    # =====================================================
    # INSPECTION PIPELINE
    # =====================================================

    if decision == "INSPECTION":

        filename = active_document.active_document

        print(
            "Inspection document:",
            filename
        )


        # -------------------------------------------------
        # Step 1: Retrieve current uploaded document text
        # -------------------------------------------------

        document_text = get_uploaded_document_text(
            filename
        )

        if not document_text:

            return {
                "answer": (
                    "No text could be retrieved "
                    "from the uploaded document."
                ),
                "status": "ERROR",
                "sovereignty": sovereignty
            }

        print(
            "Document text retrieved."
        )


        # -------------------------------------------------
        # Step 2: Structured evidence extraction
        # -------------------------------------------------

        print(
            "Extracting structured evidence..."
        )

        evidence = extract_evidence(
            document_text
        )

        if "error" in evidence:

            return {
                "answer": (
                    "Evidence extraction failed: "
                    f"{evidence.get('error')}"
                ),
                "details": evidence,
                "status": "ERROR",
                "sovereignty": sovereignty
            }

        print(
            "Structured evidence extracted."
        )


        # -------------------------------------------------
        # Step 3: Compare evidence against SOP/manual
        # -------------------------------------------------

        print(
            "Running SOP reasoning..."
        )

        reasoning = reason_against_sop(
            evidence
        )

        print(
            "SOP reasoning completed."
        )


        # -------------------------------------------------
        # Step 4: Generate approval note
        # -------------------------------------------------

        print(
            "Generating approval note..."
        )

        approval_file = generate_approval_note(
            reasoning
        )

        print(
            "Approval note generated:",
            approval_file
        )


        # -------------------------------------------------
        # Step 5: Audit logging
        # -------------------------------------------------

        log_action(
            user="employee_01",
            request=user_request,
            agent="INSPECTION",
            retrieval="ChromaDB",
            outputs=approval_file,
            status="SUCCESS",
            sovereignty_status=sovereignty["status"],
            external_connections=sovereignty["external_calls_detected"]
        )


        # -------------------------------------------------
        # Step 6: Return result to frontend
        # -------------------------------------------------

        return {
            "answer": reasoning.get(
                "reasoning",
                "Inspection reasoning completed."
            ),

            "evidence": evidence,

            "reasoning": reasoning,

            "approval_note": approval_file,

            "status": "SUCCESS",

            "sovereignty": sovereignty
        }


    # =====================================================
    # RAG ROUTE
    # =====================================================

    if decision == "RAG":

        print("Routing request to local knowledge base...")

        document_reference_phrases = [
            "this document",
            "the document",
            "uploaded document",
            "this pdf",
            "the pdf",
            "uploaded pdf",
            "this report",
            "the report",
            "uploaded report"
        ]

        refers_to_uploaded_document = any(
            phrase in request_lower
            for phrase in document_reference_phrases
        )

        if refers_to_uploaded_document:
            rag_filename = active_document.active_document
        else:
            rag_filename = None

        content = answer_question(
            user_request,
            rag_filename
        )

        log_action(
            user="employee_01",
            request=user_request,
            agent="RAG",
            retrieval="ChromaDB",
            outputs="None",
            status="SUCCESS",
            sovereignty_status=sovereignty["status"],
            external_connections=sovereignty["external_calls_detected"]
        )

        return  {
            "answer": content,
            "status": "SUCCESS",
            "sovereignty": sovereignty
        }


    # =====================================================
    # DIRECT LOCAL LLM
    # =====================================================

    if decision == "DIRECT":

        response = llm.invoke(
            user_request
        )

        return response.content


    # =====================================================
    # DOCUMENT GENERATION
    # =====================================================

    if decision == "DOCUMENT":

        content = summarize_document(
            active_document.active_document
        )

        word_file = generate_word(
            "Generated Report",
            content
        )

        pdf_file = generate_pdf(
            "Generated Report",
            content
        )

        log_action(
            user="employee_01",
            request=user_request,
            agent="DOCUMENT",
            retrieval="RAG",
            outputs=(
                f"{word_file}, {pdf_file}"
            ),
            status="SUCCESS",
            sovereignty_status=sovereignty["status"],
            external_connections=sovereignty["external_calls_detected"]
        )

        return {
            "answer": content,
            "word_file": word_file,
            "pdf_file": pdf_file,
            "status": "SUCCESS",
            "sovereignty": sovereignty
        }


    # =====================================================
    # FALLBACK
    # =====================================================

    return (
        "I could not determine what action is required."
    )