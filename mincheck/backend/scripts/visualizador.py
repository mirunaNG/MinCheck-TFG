import json
import subprocess

TIMEOUT_VISUALIZACION = 15
MEM_LIMIT = "1024m"
DOCKER_IMAGE = "pgbovine/opt-cpp-backend:v1"

#Para que esta parte funcione hay que tener Docker abierto

def generar_trace(codigo: str, lenguaje: str, entrada: str = "") -> dict:
    # el lenguaje debe ser c/c++. Devuelve el JSON de OPT ya parseado
    
    #construye el comando para lanzar el contenedor de docker con la imagen de OPT
    comando = [
        "docker", "run", "-i", "-m", MEM_LIMIT, "--rm",
        "--user=netuser", "--net=none", "--cap-drop", "all",
        DOCKER_IMAGE,
        "python", "/tmp/opt-cpp-backend/run_cpp_backend.py",
        codigo, lenguaje,
    ]
    try:
        # ejecuta el contenedor
        resultado = subprocess.run(
            comando, input=entrada, capture_output=True, text=True,
            timeout=TIMEOUT_VISUALIZACION,
        )
        #si se supera el timeout, se devuelve un errir
    except subprocess.TimeoutExpired:
        return {"code": codigo, "trace": [{
            "event": "uncaught_exception",
            "exception_msg": "Tiempo límite excedido generando la visualización.",
        }]}

    try:
        #el stdout contiene el JSON de las trazas de ejecucion, y se parsea
        return json.loads(resultado.stdout)
    #si no es un JSON válido devuelve error
    except (json.JSONDecodeError, ValueError):
        return {"code": codigo, "trace": [{
            "event": "uncaught_exception",
            "exception_msg": "No se pudo generar la visualización (error interno de OPT).",
        }]}
