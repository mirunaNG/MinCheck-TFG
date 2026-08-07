import tempfile

from hypothesis import find, settings, HealthCheck
from hypothesis.errors import NoSuchExample

from calculador_outputs import _preparar_comando, _ejecutar_caso, TIMEOUT_SEGUNDOS
from juez import _ejecutar_caso_alumno, _normalizar
from generador_inputs import _strategy_caso, _formatear_fichero

MAX_INTENTOS_CONTRAEJEMPLO = 200


def encontrar_contraejemplo_minimo(estructura: dict, ruta_codigo_alumno: str, ruta_codigo_referencia: str,
                                    tiempo_limite: float = TIMEOUT_SEGUNDOS,
                                    max_intentos: int = MAX_INTENTOS_CONTRAEJEMPLO) -> dict | None:
    campos = estructura["campos_por_caso"]
    tipo_lectura = estructura["tipo_lectura"]
    valor_centinela = estructura.get("valor_centinela")

    with tempfile.TemporaryDirectory() as tmp_alumno, tempfile.TemporaryDirectory() as tmp_referencia:
        comando_alumno = _preparar_comando(ruta_codigo_alumno, tmp_alumno)
        comando_referencia = _preparar_comando(ruta_codigo_referencia, tmp_referencia)

        def es_contraejemplo(valores: dict) -> bool:
            entrada = _formatear_fichero([valores], campos, tipo_lectura, valor_centinela)

            output_referencia = _ejecutar_caso(comando_referencia, entrada)
            if output_referencia is None:
                return False  # la propia referencia falla con este input: no sirve como contraejemplo

            ejecucion_alumno = _ejecutar_caso_alumno(comando_alumno, entrada, tiempo_limite)
            if ejecucion_alumno["estado"] != "ok":
                return True  # timeout/error/output excedido también es un fallo

            return _normalizar(ejecucion_alumno["output"]) != _normalizar(output_referencia)

        estrategia = _strategy_caso(campos, modo="normal")

        try:
            valores_minimos = find(
                estrategia,
                es_contraejemplo,
                settings=settings(
                    max_examples=max_intentos,
                    deadline=None,
                    database=None,
                    suppress_health_check=[HealthCheck.too_slow, HealthCheck.filter_too_much],
                ),
            )
        except NoSuchExample:
            return None  # no se encontró ningún contraejemplo dentro del presupuesto

    return {"input": _formatear_fichero([valores_minimos], campos, tipo_lectura, valor_centinela)}
