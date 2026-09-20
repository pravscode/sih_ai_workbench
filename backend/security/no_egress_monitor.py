import ipaddress
from datetime import datetime

import psutil


MONITORED_PROCESSES = {
    "python.exe",
    "ollama.exe",
}


def is_local_or_private(address):
    """Return True for local/private network addresses."""

    try:
        ip = ipaddress.ip_address(address)

        return (
            ip.is_loopback
            or ip.is_private
            or ip.is_link_local
        )

    except ValueError:
        return False


def get_monitored_processes():
    """Find running NivaraAI-related processes."""

    processes = []

    for process in psutil.process_iter(["pid", "name"]):
        try:
            name = process.info["name"]

            if name and name.lower() in MONITORED_PROCESSES:
                processes.append({
                    "pid": process.info["pid"],
                    "name": name,
                })

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return processes


def check_network_connections():
    """
    Check external TCP connections belonging only to
    NivaraAI-related processes.
    """

    monitored_processes = get_monitored_processes()

    monitored_pids = {
        process["pid"]
        for process in monitored_processes
    }

    external_connections = []

    for connection in psutil.net_connections(kind="tcp"):

        if connection.pid not in monitored_pids:
            continue

        if connection.status != psutil.CONN_ESTABLISHED:
            continue

        if not connection.raddr:
            continue

        remote_ip = connection.raddr.ip
        remote_port = connection.raddr.port

        if not is_local_or_private(remote_ip):

            process_name = "Unknown"

            try:
                process_name = psutil.Process(
                    connection.pid
                ).name()
            except (
                psutil.NoSuchProcess,
                psutil.AccessDenied
            ):
                pass

            external_connections.append({
                "pid": connection.pid,
                "process": process_name,
                "remote_ip": remote_ip,
                "remote_port": remote_port,
            })

    return monitored_processes, external_connections


def check_no_egress():
    """Perform the NivaraAI sovereignty check."""

    checked_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    monitored_processes, external_connections = (
        check_network_connections()
    )

    if external_connections:
        status = "EGRESS_DETECTED"
        message = (
            "External connections detected from "
            "a monitored NivaraAI process."
        )
    else:
        status = "SECURE"
        message = (
            "No external connections detected "
            "from monitored NivaraAI processes."
        )

    return {
        "status": status,
        "external_calls_detected": bool(
            external_connections
        ),
        "monitored_processes": monitored_processes,
        "external_connections": external_connections,
        "processing_mode": "LOCAL",
        "checked_at": checked_at,
        "message": message,
    }


if __name__ == "__main__":

    result = check_no_egress()

    print("=== SOVEREIGNTY MONITOR ===")

    print(f"Status: {result['status']}")

    print(
        "External connections detected:",
        result["external_calls_detected"]
    )

    print(
        "Processing mode:",
        result["processing_mode"]
    )

    print(
        "Checked at:",
        result["checked_at"]
    )

    print(
        "Monitored processes:",
        result["monitored_processes"]
    )

    print(result["message"])

    if result["external_connections"]:

        print("\nExternal connections:")

        for connection in result[
            "external_connections"
        ]:
            print(
                f"  PID {connection['pid']} | "
                f"{connection['process']} | "
                f"{connection['remote_ip']}:"
                f"{connection['remote_port']}"
            )