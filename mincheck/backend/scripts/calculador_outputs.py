import os
import subprocess
import tempfile

TIMEOUT_SEGUNDOS = 5  # tiempo máximo por caso antes de darlo por colgado

_EXTENSIONES_CPP = {".cpp", ".cc"} #De momento solo permite c y c++

def _preparar_comando(ruta_solucion: str, tmp_dir: str) -> list[str]:
    # compila el código c++ y devuelve el comando para ejecutarlo
    extension = os.path.splitext(ruta_solucion)[1].lower()
    if extension not in _EXTENSIONES_CPP:
        raise ValueError(f"lenguaje no soportado: {extension}")
    binario = os.path.join(tmp_dir, "solucion")
    resultado = subprocess.run(
        ["g++", "-O2", "-o", binario, ruta_solucion], capture_output=True, text=True,
    )
    if resultado.returncode != 0:
        raise RuntimeError(f"error compilando la solución:\n{resultado.stderr}")
    return [binario]

#Ejecutar UN caso
def _ejecutar_caso(comando: list[str], entrada: str) -> str | None:
    try:
        resultado = subprocess.run(
            comando, input=entrada, capture_output=True, text=True,
            timeout=TIMEOUT_SEGUNDOS,
        )
    except subprocess.TimeoutExpired:
        return None
    if resultado.returncode != 0:
        return None
    return resultado.stdout.rstrip("\n")


#Funcion principal que hace todo (tiene en cuenta que los ejemplos ya estan calculado y que los casos_clve hay que calcularlos)
def calcular_outputs(casos: list[dict], ruta_solucion: str) -> list[dict]:
    with tempfile.TemporaryDirectory() as tmp_dir:
        #directorio temporal para compilar y ejecutar la solución
        comando = _preparar_comando(ruta_solucion, tmp_dir)
        for caso in casos:
            if caso.get("output_esperado"):
                continue
            #para cada caso se ejecuta el comando y se guarda la salida
            caso["output_esperado"] = _ejecutar_caso(comando, caso["input"])
    return casos


