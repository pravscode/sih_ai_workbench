from backend.sandbox.python_sandbox import run_python_code


def run_generated_tests(generated_code, generated_tests):
    """
    Run generated Python code together with its tests
    inside the sandbox.
    """

    test_program = f"""
{generated_code}

{generated_tests}
"""

    result = run_python_code(test_program)

    return result