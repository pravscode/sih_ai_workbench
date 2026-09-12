from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama

# 1. Load the same local embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 2. Connect to our existing ChromaDB
vector_store = Chroma(
    collection_name="company_knowledge",
    embedding_function=embeddings,
    persist_directory="data/vector_db"
)

# 3. Local Ollama LLM
llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0
)

# 4. Ask a question
question = "What should employees do with confidential information?"

# 5. Retrieve relevant information from the PDF
results = vector_store.similarity_search(question, k=3)

# 6. Combine retrieved information
context = "\n\n".join(
    document.page_content for document in results
)

# 7. Give retrieved information to the local LLM
prompt = f"""
You are an assistant answering questions about the company handbook.

Use ONLY the information provided below.

Company handbook information:
{context}

Question:
{question}

Answer clearly and concisely.
"""

# 8. Generate answer locally
response = llm.invoke(prompt)

print("\nAnswer:\n")
print(response.content)