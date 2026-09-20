import subprocess
import sys
import tempfile
from pathlib import Path


def run_python_code(code, timeout=5):
    """
    Execute generated Python code in a temporary subprocess.

    Returns:
        {
            "status": "PASS" or "FAIL",
            "stdout": "...",
            "stderr": "...",
            "return_code": number
        }
    """

    temp_file = None

    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as f:
            f.write(code)
            temp_file = Path(f.name)

        result = subprocess.run(
            [sys.executable, str(temp_file)],
            capture_output=True,
            text=True,
            timeout=timeout
        )

        if result.returncode == 0:
            status = "PASS"
        else:
            status = "FAIL"

        return {
            "status": status,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.returncode
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "FAIL",
            "stdout": "",
            "stderr": "Execution timed out.",
            "return_code": -1
        }

    except Exception as e:
        return {
            "status": "FAIL",
            "stdout": "",
            "stderr": str(e),
            "return_code": -1
        }

    finally:
        if temp_file and temp_file.exists():
            temp_file.unlink()