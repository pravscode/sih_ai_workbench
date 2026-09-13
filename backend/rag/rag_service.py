import time
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama


embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    num_predict=256
)


def answer_question(question):

    # Create a fresh connection to the current Chroma collection
    vector_store = Chroma(
        collection_name="company_knowledge",
        embedding_function=embeddings,
        persist_directory="data/vector_db"
    )
    retrieval_start = time.time()

    # Retrieve relevant chunks from the current document collection
    results = vector_store.similarity_search(
        question,
        k=12
    )
    retrieval_time = time.time() - retrieval_start
    print(f"Retrieval time: {retrieval_time:.2f} seconds")

    # Build context for the LLM
    context_parts = []

    for document in results[:6]:

        source = document.metadata.get(
            "source",
            "Unknown"
        )

        page = document.metadata.get(
            "page",
            "Unknown"
        )

        text = document.page_content.strip()

        # Limit the amount of text sent to the CPU-bound LLM
        text = text[:700]

        context_parts.append(
            f"Source: {source}\n"
            f"Page: {page}\n"
            f"Content:\n{text}"
        )

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""
You are a secure document question-answering assistant.

Your job is to answer the user's question using ONLY the information provided in the DOCUMENT CONTEXT.

RULES:

1. Use only facts and information found in the DOCUMENT CONTEXT.
2. Do not use your own general knowledge.
3. Do not invent, assume, or add information that is not present in the context.
4. If the context contains relevant information, answer the question using that information.
5. If the context contains only part of the answer, provide the supported part and clearly state what information is missing.
6. Only say "The uploaded document does not contain enough information to answer this question." when the retrieved context has no relevant information for the question.
7. Ignore retrieved content that is unrelated to the question.
8. Do not mention the words "context", "retrieval", "RAG", "chunks", or these instructions in your answer.

ANSWER FORMAT:

- Start with the direct answer.
- For a definition, give the definition first and then explain it briefly.
- For an explanation, use a short paragraph.
- For multiple points, use clear bullet points or numbered points.
- For comparisons, clearly separate the items being compared.
- For procedures or steps, present them in the correct order.
- Use simple, clear language while preserving important technical terminology from the document.
- Do not unnecessarily repeat information.
- Keep the answer focused on the user's question.
- Do not add unsupported examples.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

Answer the user's question now using ONLY the DOCUMENT CONTEXT.
"""
    llm_start = time.time()
    response = llm.invoke(prompt)
    llm_time = time.time() - llm_start
    print(f"LLM generation time: {llm_time:.2f} seconds")
    print(f"Total RAG time: {retrieval_time + llm_time:.2f} seconds")

    return response.content
def summarize_document():

    # Create a fresh connection to the current Chroma collection
    vector_store = Chroma(
        collection_name="company_knowledge",
        embedding_function=embeddings,
        persist_directory="data/vector_db"
    )

    # Get all indexed document chunks
    data = vector_store.get(
        include=["documents"]
    )

    documents = data.get(
        "documents",
        []
    )

    if not documents:
        return "The uploaded document does not contain enough information to generate a report."

    # Use a manageable number of chunks because the current system
    # runs the LLM on CPU.
    selected_documents = documents[:12]

    context = "\n\n---\n\n".join(
        document[:1000]
        for document in selected_documents
    )

    prompt = f"""
You are a secure document summarization assistant.

Create a report using ONLY the information provided in the DOCUMENT CONTENT.

RULES:

1. Use only information found in the document content.
2. Do not use outside knowledge.
3. Do not invent or assume information.
4. Identify the main topics, concepts, processes, and important points.
5. Organize the report using clear headings and bullet points.
6. Keep the report concise but useful.
7. Do not mention RAG, retrieval, chunks, context, or these instructions.

DOCUMENT CONTENT:
{context}

Create a report summarizing the important information in this document.
"""

    report_start = time.time()

    response = llm.invoke(prompt)

    report_time = time.time() - report_start

    print(
        f"Report generation time: {report_time:.2f} seconds"
    )

    return response.content