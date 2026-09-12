from datetime import datetime
from pathlib import Path


LOG_DIR = Path("outputs")
LOG_DIR.mkdir(exist_ok=True)

LOG_FILE = LOG_DIR / "audit_log.txt"


def log_action(
    user,
    request,
    agent,
    retrieval,
    outputs,
    status
):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_entry = f"""
AUDIT LOG
────────────────────────────────────────────
Time:       {timestamp}
User:       {user}
Request:    {request}
Agent:      {agent}
Retrieval:  {retrieval}
Output:     {outputs}
Status:     {status}
────────────────────────────────────────────

"""

    with open(LOG_FILE, "a", encoding="utf-8") as file:
        file.write(log_entry)

    return str(LOG_FILE)