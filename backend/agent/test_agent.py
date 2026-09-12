from backend.agent.agent import run_agent


request = "Create a report about what employees should do with confidential information."

result = run_agent(request)

print("\nFinal Result:\n")
print(result)