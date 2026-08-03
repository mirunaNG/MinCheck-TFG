import json
import subprocess

TIMEOUT_VISUALIZACION = 15
MEM_LIMIT = "1024m"
DOCKER_IMAGE = "pgbovine/opt-cpp-backend:v1"


def generar_trace(codigo: str, lenguaje: str) -> dict:
    """lenguaje debe ser 'c' o 'cpp'. Devuelve el JSON de OPT ya parseado."""
    comando = [
        "docker", "run", "-m", MEM_LIMIT, "--rm",
        "--user=netuser", "--net=none", "--cap-drop", "all",
        DOCKER_IMAGE,
        "python", "/tmp/opt-cpp-backend/run_cpp_backend.py",
        codigo, lenguaje,
    ]
    try:
        resultado = subprocess.run(
            comando, capture_output=True, text=True,
            timeout=TIMEOUT_VISUALIZACION,
        )
    except subprocess.TimeoutExpired:
        return {"code": codigo, "trace": [{
            "event": "uncaught_exception",
            "exception_msg": "Tiempo límite excedido generando la visualización.",
        }]}

    try:
        return json.loads(resultado.stdout)
    except (json.JSONDecodeError, ValueError):
        return {"code": codigo, "trace": [{
            "event": "uncaught_exception",
            "exception_msg": "No se pudo generar la visualización (error interno de OPT).",
        }]}
