from backend.models.model_registry import get_model


def generate_code(user_request):
    """
    Generate Python code using the model selected
    by the local model registry.
    """

    coding_llm = get_model("coding")

    prompt = f"""
You are the coding agent of a sovereign, offline AI workbench.

Generate Python code for the following user request:

{user_request}

Rules:
1. Return ONLY executable Python code.
2. Do not use Markdown code fences.
3. Do not explain the code.
4. Do not use the internet.
5. Do not use external APIs.
6. Keep the solution simple and executable.
"""

    response = coding_llm.invoke(prompt)

    code = response.content.strip()

    if code.startswith("```"):
        code = code.replace("```python", "")
        code = code.replace("```", "")
        code = code.strip()

    return code