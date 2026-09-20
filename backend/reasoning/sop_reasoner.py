import json

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama


EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL
)

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)


def reason_against_sop(evidence):
    """
    Compare structured inspection evidence against
    relevant SOP/manual information stored in ChromaDB.
    """

    vector_store = Chroma(
        collection_name="company_knowledge",
        embedding_function=embeddings,
        persist_directory="data/vector_db"
    )

    # Keep the search query small.
    evidence_text = json.dumps(
        evidence,
        separators=(",", ":")
    )

    query = (
        "Find SOP or maintenance requirements relevant to "
        "these inspection findings: "
        + evidence_text
    )

    # Retrieve fewer, more relevant chunks.
    results = vector_store.similarity_search(
        query,
        k=3
    )

    if not results:
        return {
            "inspection_evidence": evidence,
            "sop_evidence": [],
            "finding_summary": "No inspection finding could be assessed.",
            "sop_match": "NO_DIRECT_MATCH",
            "reasoning": "No relevant SOP or maintenance information was found.",
            "recommended_action": None,
            "support_status": "NOT_SUPPORTED",
            "evidence_citations": []
        }

    sop_evidence = []

    for document in results:

        content = document.page_content.strip()

        # Prevent unnecessarily large chunks from reaching the LLM.
        content = content[:1200]

        sop_evidence.append({
            "source": document.metadata.get(
                "source",
                "Unknown"
            ),
            "page": document.metadata.get(
                "page",
                "Unknown"
            ),
            "content": content
        })

    sop_context = "\n\n".join(
        f"Source: {item['source']}\n"
        f"Page: {item['page']}\n"
        f"{item['content']}"
        for item in sop_evidence
    )

    prompt = f"""
Compare the inspection evidence with the supplied SOP text.

Use ONLY the supplied information.
Do not use outside knowledge.
Do not invent requirements or actions.

INSPECTION:
{evidence_text}

SOP:
{sop_context}

Return ONLY JSON.

{{
  "finding_summary": "",
  "sop_match": "DIRECT_MATCH",
  "reasoning": "",
  "recommended_action": null,
  "support_status": "SUPPORTED",
  "evidence_citations": []
}}

Allowed sop_match values:
DIRECT_MATCH
PARTIAL_MATCH
NO_DIRECT_MATCH

Allowed support_status values:
SUPPORTED
PARTIALLY_SUPPORTED
NOT_SUPPORTED

Rules:
- Summarize the actual inspection evidence.
- State whether the supplied SOP directly addresses it.
- recommended_action must be null unless the SOP explicitly gives that action.
- evidence_citations must contain source and page.
- Keep reasoning to 2-3 sentences.
"""

    response = llm.invoke(prompt)

    content = response.content.strip()

    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    try:
        reasoning = json.loads(content)

    except json.JSONDecodeError:

        reasoning = {
            "finding_summary": "",
            "sop_match": "NO_DIRECT_MATCH",
            "reasoning": content,
            "recommended_action": None,
            "support_status": "NOT_SUPPORTED",
            "evidence_citations": []
        }

    reasoning["inspection_evidence"] = evidence
    reasoning["sop_evidence"] = sop_evidence

    return reasoning