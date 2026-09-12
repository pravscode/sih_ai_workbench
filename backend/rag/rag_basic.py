from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma


# 1. Load our company document
loader = PyPDFLoader("data/documents/Employee-Handbook.pdf")
documents = loader.load()

print("Document loaded!")
print(documents[0].page_content)


# 2. Split the document into smaller chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50
)

chunks = text_splitter.split_documents(documents)

print(f"\nNumber of chunks: {len(chunks)}")


# 3. Create embeddings locally
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

print("Embedding model loaded!")


# 4. Store embeddings in ChromaDB
vector_store = Chroma(
    collection_name="company_knowledge",
    embedding_function=embeddings,
    persist_directory="data/vector_db"
)

vector_store.add_documents(chunks)

print("Documents stored in ChromaDB!")