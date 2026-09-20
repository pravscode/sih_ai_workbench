from backend.models.model_registry import get_model


def generate_tests(user_request, generated_code):
    """
    Generate simple, executable Python tests for generated code.
    """

    test_llm = get_model("reasoning")

    prompt = f"""
You are a Python test-generation assistant.

USER REQUEST:
{user_request}

GENERATED CODE:
{generated_code}

Generate simple tests for the generated code.

Rules:
1. Return ONLY Python code.
2. Use simple assert statements.
3. Test normal cases.
4. Test a reasonable edge case if appropriate.
5. Do NOT use unittest.
6. Do NOT assume behavior that the generated code does not implement.
7. Do NOT test exceptions unless the generated code explicitly handles them.
8. Do not use external libraries.
9. Do not use the internet.
10. Do not explain anything.
11. Do not use Markdown code fences.

The tests must directly call the functions defined in the generated code.

Return ONLY the assert statements.
"""

    response = test_llm.invoke(prompt)

    tests = response.content.strip()

    if tests.startswith("```"):
        tests = tests.replace("```python", "")
        tests = tests.replace("```", "")
        tests = tests.strip()

    return tests