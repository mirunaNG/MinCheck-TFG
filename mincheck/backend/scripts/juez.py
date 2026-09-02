import subprocess
import tempfile


from calculador_outputs import _preparar_comando, TIMEOUT_SEGUNDOS

OUTPUT_LIMITE_BYTES = 10 * 1024 * 1024 


def _normalizar(texto: str | None) -> str:
    #eliminar espacios en blanco 
    return (texto or "").strip()


def _ejecutar_caso_alumno(comando: list[str], entrada: str, tiempo_limite: float) -> dict:
    # ejecuta el código del alumno con la entrada dada en la cabecera y devuelve el estado y el output
    try:
        resultado = subprocess.run(
            comando, input=entrada, capture_output=True, text=True,
            timeout=tiempo_limite,
        )
    except subprocess.TimeoutExpired:
        return {"estado": "timeout"}

    if len(resultado.stdout.encode()) > OUTPUT_LIMITE_BYTES:
        return {"estado": "output_excedido"}
    if resultado.returncode != 0:
        return {"estado": "error_ejecucion", "detalle": resultado.stderr.strip()}
    return {"estado": "ok", "output": resultado.stdout.rstrip("\n")}


#Ejecuta el código del alumno contra los casos en orden, cortando en el primer fallo
def juzgar_entrega(casos: list[dict], ruta_codigo: str, tiempo_limite: float = TIMEOUT_SEGUNDOS) -> dict:
    with tempfile.TemporaryDirectory() as tmp_dir:
        try:
            comando = _preparar_comando(ruta_codigo, tmp_dir)
        except RuntimeError as e:
            return {"resultado": "incorrecto", "error_principal": "Error de compilación", "detalle_error": str(e), "caso_fallido": None}

        for caso in casos:
            #ejecuta cada caso
            ejecucion = _ejecutar_caso_alumno(comando, caso["input"], tiempo_limite)
            #cada fallo posible en funcino de lo que devuelva la ejecucion:
            if ejecucion["estado"] == "timeout":
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Tiempo límite excedido",
                    "detalle_error": None,
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": None},
                }
            if ejecucion["estado"] == "output_excedido":
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Límite de salida excedido",
                    "detalle_error": None,
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": None},
                }
            if ejecucion["estado"] == "error_ejecucion":
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Error en tiempo de ejecución",
                    "detalle_error": ejecucion["detalle"],
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": None},
                }
            if _normalizar(ejecucion["output"]) != _normalizar(caso["output_esperado"]):
                return {
                    "resultado": "incorrecto",
                    "error_principal": "Salida incorrecta",
                    "detalle_error": None,
                    "caso_fallido": {"input": caso["input"], "output_esperado": caso["output_esperado"], "output_obtenido": ejecucion["output"]},
                }

            #si no entra en ninguno, es que es correcto y sigue con el siguiente
    #si sale del bucle y llega hasta aqui, ha pasado todos los casos ok, asi que es correcto
    return {"resultado": "correcto", "error_principal": None, "detalle_error": None, "caso_fallido": None}
