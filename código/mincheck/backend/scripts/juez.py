import subprocess
import tempfile

from calculador_outputs import _preparar_comando, TIMEOUT_SEGUNDOS


def _normalizar(texto: str | None) -> str:
    return (texto or "").strip()


def _ejecutar_caso_alumno(comando: list[str], entrada: str) -> dict:
    try:
        resultado = subprocess.run(
            comando, input=entrada, capture_output=True, text=True, timeout=TIMEOUT_SEGUNDOS
        )
    except subprocess.TimeoutExpired:
        return {"estado": "timeout"}
    if resultado.returncode != 0:
        return {"estado": "error_ejecucion"}
    return {"estado": "ok", "output": resultado.stdout.rstrip("\n")}


#Ejecuta el código del alumno contra los casos en orden, cortando en el primer fallo
def juzgar_entrega(casos: list[dict], ruta_codigo: str) -> dict:
    with tempfile.TemporaryDirectory() as tmp_dir:
        try:
            comando = _preparar_comando(ruta_codigo, tmp_dir)
        except RuntimeError:
            return {"resultado": "incorrecto", "error_principal": "Error de compilación", "caso_fallido": None}

        for caso in casos:
            ejecucion = _ejecutar_caso_alumno(comando, caso["input"])

            if ejecucion["estado"] == "timeout":
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Tiempo límite excedido",
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": None},
                }
            if ejecucion["estado"] == "error_ejecucion":
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Error en tiempo de ejecución",
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": None},
                }
            if _normalizar(ejecucion["output"]) != _normalizar(caso["output_esperado"]):
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Salida incorrecta",
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": ejecucion["output"]},
                }

    return {"resultado": "correcto", "error_principal": None, "caso_fallido": None}
