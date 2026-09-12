from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from backend.rag import active_document

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vector_store = Chroma(
    collection_name="company_knowledge",
    embedding_function=embeddings,
    persist_directory="data/vector_db"
)

llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)


def answer_question(question):
    results = vector_store.similarity_search(
     question,
     k=8,
     filter={
        "source": active_document.active_document
    }
)

    context_parts = []

    for document in results:
        source = document.metadata.get("source", "Unknown")
        page = document.metadata.get("page", "Unknown")

        context_parts.append(
            f"Source: {source}\n"
            f"Page: {page}\n"
            f"Content:\n{document.page_content}"
        )

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""
You are a document question-answering assistant.

IMPORTANT RULES:
1. Answer ONLY using the information in the DOCUMENT CONTEXT below.
2. Do NOT use your general knowledge.
3. Do NOT guess or make up information.
4. If the document context does not contain enough information to answer
   the question, say:
   "The uploaded document does not contain enough information to answer this question."
5. When answering, summarize and combine relevant information from the
   provided document context.
6. Ignore any information that is unrelated to the user's question.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

Answer based ONLY on the document context.
"""

    response = llm.invoke(prompt)

    return response.content