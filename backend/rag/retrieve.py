from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


# Load the same embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Connect to our existing ChromaDB
vector_store = Chroma(
    collection_name="company_knowledge",
    embedding_function=embeddings,
    persist_directory="data/vector_db"
)

# Ask a question
question = "What should employees do with confidential information?"
# Retrieve the most relevant chunks
results = vector_store.similarity_search(question, k=2)

print("\nRelevant information:\n")

for result in results:
    print(result.page_content)
    print("-" * 50)