from rag_service import answer_question


question = "What should employees do with confidential information?"

answer = answer_question(question)

print("\nAnswer:\n")
print(answer)