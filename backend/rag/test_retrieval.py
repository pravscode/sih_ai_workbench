from backend.rag.rag_service import vector_store


question = "what are the concepts of unit-5"

results = vector_store.similarity_search(
    question,
    k=5
)

print("\n" + "=" * 60)
print("QUESTION:")
print(question)

print("\nRETRIEVED DOCUMENTS:")
print("=" * 60)

for i, document in enumerate(results, start=1):
    print(f"\n--- RESULT {i} ---")

    print("SOURCE:", document.metadata.get("source"))
    print("PAGE:", document.metadata.get("page"))

    print("\nTEXT:")
    print(document.page_content[:1000])

print("\n" + "=" * 60)