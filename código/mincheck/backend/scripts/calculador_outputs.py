import os
import subprocess
import tempfile

TIMEOUT_SEGUNDOS = 5  # tiempo máximo por caso antes de darlo por colgado

#Funciones por lenguaje para ejecutar el codigo
def _comando_python(ruta: str, tmp_dir: str) -> list[str]:
    return ["python3", ruta]

def _comando_c(ruta: str, tmp_dir: str) -> list[str]:
    binario = os.path.join(tmp_dir, "solucion")
    _compilar(["gcc", "-O2", "-o", binario, ruta])
    return [binario]

def _comando_cpp(ruta: str, tmp_dir: str) -> list[str]:
    binario = os.path.join(tmp_dir, "solucion")
    _compilar(["g++", "-O2", "-o", binario, ruta])
    return [binario]

def _comando_java(ruta: str, tmp_dir: str) -> list[str]:
    _compilar(["javac", "-d", tmp_dir, ruta])
    nombre_clase = os.path.splitext(os.path.basename(ruta))[0]
    return ["java", "-cp", tmp_dir, nombre_clase]

#Da error si falla
def _compilar(comando: list[str]) -> None:
    resultado = subprocess.run(comando, capture_output=True, text=True)
    if resultado.returncode != 0:
        raise RuntimeError(f"error compilando la solución:\n{resultado.stderr}")

#Diccionario de extensiones
_PREPARAR_POR_EXTENSION = {
    ".py": _comando_python,
    ".c": _comando_c,
    ".cpp": _comando_cpp,
    ".cc": _comando_cpp,
    ".java": _comando_java,
}
def _preparar_comando(ruta_solucion: str, tmp_dir: str) -> list[str]:
    extension = os.path.splitext(ruta_solucion)[1].lower()
    preparar = _PREPARAR_POR_EXTENSION.get(extension)
    if preparar is None:
        raise ValueError(f"lenguaje no soportado: {extension}")
    return preparar(ruta_solucion, tmp_dir)

#Ejecutar UN caso concreto
def _ejecutar_caso(comando: list[str], entrada: str) -> str | None:
    try:
        resultado = subprocess.run(
            comando, input=entrada, capture_output=True, text=True, timeout=TIMEOUT_SEGUNDOS
        )
    except subprocess.TimeoutExpired:
        return None
    if resultado.returncode != 0:
        return None
    return resultado.stdout.rstrip("\n")

#Funcion principal que hace todo (tiene en cuenta que los ejemplos ya estan calculados)
def calcular_outputs(casos: list[dict], ruta_solucion: str) -> list[dict]:
    with tempfile.TemporaryDirectory() as tmp_dir:
        comando = _preparar_comando(ruta_solucion, tmp_dir)
        for caso in casos:
            if caso.get("output_esperado"):
                continue
            caso["output_esperado"] = _ejecutar_caso(comando, caso["input"])
    return casos


