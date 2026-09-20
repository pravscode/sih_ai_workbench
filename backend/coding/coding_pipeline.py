from backend.coding.coding_agent import generate_code
from backend.testing.test_generator import generate_tests
from backend.testing.test_runner import run_generated_tests


def run_coding_pipeline(user_request):
    """
    Complete local coding workflow:

    1. Generate code
    2. Generate tests
    3. Run code + tests in sandbox
    4. Return the result
    """

    print("Starting coding pipeline...")

    # Step 1: Generate code
    print("Generating code...")
    generated_code = generate_code(user_request)

    print("Generated code:")
    print(generated_code)

    # Step 2: Generate tests
    print("Generating tests...")
    generated_tests = generate_tests(
        user_request,
        generated_code
    )

    print("Generated tests:")
    print(generated_tests)

    # Step 3: Run tests in sandbox
    print("Running tests in sandbox...")
    test_result = run_generated_tests(
        generated_code,
        generated_tests
    )

    print("Test result:", test_result["status"])

    return {
        "code": generated_code,
        "tests": generated_tests,
        "test_result": test_result,
        "status": test_result["status"]
    }