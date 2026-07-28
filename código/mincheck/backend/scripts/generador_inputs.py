import string
from hypothesis import given, settings, strategies as st

#Como min/max/longitudes pueden venir a null, hay que definir un rango por defecto para no generar valores sin sentido
RANGO_ENTERO_DEFECTO = (-1000, 1000)
RANGO_REAL_DEFECTO = (-1000.0, 1000.0)
RANGO_LONGITUD_DEFECTO = (0, 10)      # para vectores/cadenas sin longitud explícita
ALFABETO_CADENA = string.ascii_lowercase

RANGO_LONGITUD_DEFECTO = (0, 10)      # para vectores/cadenas sin longitud explícita
LIMITE_HYPOTHESIS_LISTA = 200       # hlimite bajo porque salta el health check
ALFABETO_CADENA = string.ascii_lowercase

LIMITE_PEQUENO_ENTERO = 20      # valores en [-20, 20] se consideran "pequeños"
LIMITE_PEQUENO_REAL = 20.0

GRUPOS_POR_FICHERO_MIN = 1   # nº mínimo de repeticiones de campos_por_caso en un fichero
GRUPOS_POR_FICHERO_MAX = 7  # nº máximo


#Estrategia -> traduce el campo a una estrategia de Hypothesis para generar valores válidos
def _strategy_escalar(campo: dict):
    tipo = campo["tipo"]
    minimo = campo.get("minimo")
    maximo = campo.get("maximo")
    salto = campo.get("salto")
    #.map() en salto porque hypothesis no tiene parametro de incremento

    if tipo == "entero":
        lo = int(minimo) if minimo is not None else RANGO_ENTERO_DEFECTO[0]
        hi = int(maximo) if maximo is not None else RANGO_ENTERO_DEFECTO[1]
        if salto:
            pasos = (hi - lo) // int(salto)
            return st.integers(min_value=0, max_value=pasos).map(lambda n: lo + n * int(salto))

        lo_pequeno = max(lo, -LIMITE_PEQUENO_ENTERO)
        hi_pequeno = min(hi, LIMITE_PEQUENO_ENTERO)
        rango_completo = st.integers(min_value=lo, max_value=hi)
        if lo_pequeno <= hi_pequeno and (lo_pequeno, hi_pequeno) != (lo, hi):
            pequenos = st.integers(min_value=lo_pequeno, max_value=hi_pequeno)
            return st.one_of(pequenos, rango_completo)
        return rango_completo

    if tipo == "real":
        lo = float(minimo) if minimo is not None else RANGO_REAL_DEFECTO[0]
        hi = float(maximo) if maximo is not None else RANGO_REAL_DEFECTO[1]
        if salto:
            pasos = int((hi - lo) / salto)
            return st.integers(min_value=0, max_value=pasos).map(lambda n: round(lo + n * salto, 6))

        lo_pequeno = max(lo, -LIMITE_PEQUENO_REAL)
        hi_pequeno = min(hi, LIMITE_PEQUENO_REAL)
        rango_completo = st.floats(min_value=lo, max_value=hi, allow_nan=False, allow_infinity=False)
        if lo_pequeno <= hi_pequeno and (lo_pequeno, hi_pequeno) != (lo, hi):
            pequenos = st.floats(min_value=lo_pequeno, max_value=hi_pequeno, allow_nan=False, allow_infinity=False)
            return st.one_of(pequenos, rango_completo)
        return rango_completo

    if tipo == "booleano":
        return st.booleans()

    if tipo == "caracter":
        return st.text(alphabet=ALFABETO_CADENA, min_size=1, max_size=1)

    if tipo == "cadena":
        lm = campo.get("longitud_minima") if campo.get("longitud_minima") is not None else RANGO_LONGITUD_DEFECTO[0]
        lM = campo.get("longitud_maxima") if campo.get("longitud_maxima") is not None else RANGO_LONGITUD_DEFECTO[1]
        return st.text(alphabet=ALFABETO_CADENA, min_size=lm, max_size=lM)

    raise ValueError(f"tipo escalar desconocido: {tipo}")

_TIPO_BASE_VECTOR = {
    "vector_entero": "entero",
    "vector_real": "real",
    "vector_cadena": "cadena",
}

#estrategia para un campo vector -> se aplica la del escalar a cada uno de sus elemetnos
def _strategy_elemento_vector(campo: dict):
    tipo_base = _TIPO_BASE_VECTOR[campo["tipo"]]
    return _strategy_escalar({**campo, "tipo": tipo_base})

#st.composite permite dependencias (unas estrategias que dependan de otras) 
@st.composite
#devuelve una estrategia que produce un diccionario con los valores para un CASO COMPLETO
def _strategy_caso(draw, campos_por_caso: list[dict]):
    referenciados = {c["longitud_referencia"] for c in campos_por_caso if c.get("longitud_referencia")}
    valores = {}
    for campo in campos_por_caso:
        nombre = campo["nombre"]
        tipo = campo["tipo"]

        if tipo in _TIPO_BASE_VECTOR:
            ref = campo.get("longitud_referencia")
            if ref:
                n = int(valores[ref])
            else:
                lm = campo.get("longitud_minima") if campo.get("longitud_minima") is not None else RANGO_LONGITUD_DEFECTO[0]
                lM = campo.get("longitud_maxima") if campo.get("longitud_maxima") is not None else RANGO_LONGITUD_DEFECTO[1]
                lM = min(lM, LIMITE_HYPOTHESIS_LISTA)
                n = draw(st.integers(min_value=lm, max_value=lM))
            elemento = _strategy_elemento_vector(campo)
            valores[nombre] = draw(st.lists(elemento, min_size=n, max_size=n))
        else:
            campo_efectivo = campo
            if nombre in referenciados and campo.get("maximo") is not None:
                campo_efectivo = {**campo, "maximo": min(campo["maximo"], LIMITE_HYPOTHESIS_LISTA)}
            valores[nombre] = draw(_strategy_escalar(campo_efectivo))

    return valores


#se hacen varios casos por fichero, no solo 1. LO DEFINE EL PROFESOR, CUANTOS CASOS QUIERE
@st.composite
def _strategy_fichero(draw, campos_por_caso: list[dict]):
    num_grupos = draw(st.integers(min_value=GRUPOS_POR_FICHERO_MIN, max_value=GRUPOS_POR_FICHERO_MAX))
    return [draw(_strategy_caso(campos_por_caso)) for _ in range(num_grupos)]


#FORMATEOS
#convertir los diccionarios de python a texto plano (cada campo en su propia linea)
def _formatear_valor(valor, tipo: str) -> str:
    if tipo == "booleano":
        return "true" if valor else "false"
    if tipo == "real":
        return f"{valor:.2f}"
    return str(valor)

def _formatear_caso(valores: dict, campos_por_caso: list[dict]) -> str:
    partes = []
    for campo in campos_por_caso:
        nombre = campo["nombre"]
        tipo = campo["tipo"]
        valor = valores[nombre]
        if tipo in _TIPO_BASE_VECTOR:
            tipo_elemento = _TIPO_BASE_VECTOR[tipo]
            elementos = " ".join(_formatear_valor(v, tipo_elemento) for v in valor)
            if campo.get("tipo_lectura_caso") == "centinela":
                valor_literal = campo.get("valor_centinela_campo")
                if valor_literal is not None:
                    terminador = valor_literal
                elif campo.get("tipo_centinela_campo") in (None, "cadena", "caracter"):
                    terminador = "fin"
                else:
                    terminador = "999999999"
                elementos = f"{elementos} {terminador}".strip()
            partes.append(elementos)
        else:
            partes.append(_formatear_valor(valor, tipo))
    return "\n".join(partes)


def _formatear_fichero(grupos: list[dict], campos_por_caso: list[dict],
                        tipo_lectura: str, valor_centinela) -> str:
    lineas = [_formatear_caso(g, campos_por_caso) for g in grupos]
    if tipo_lectura == "numCasos":
        lineas = [str(len(grupos))] + lineas
    elif tipo_lectura == "centinela":
        lineas = lineas + [valor_centinela if valor_centinela is not None else "0"]
    return "\n".join(lineas)

#Junta todo
def generar_conjunto_de_pruebas(estructura: dict, total: int = 20) -> list[dict]:
    campos = estructura["campos_por_caso"]
    tipo_lectura = estructura["tipo_lectura"]
    valor_centinela = estructura.get("valor_centinela")

    ficheros_generados = []

    @settings(max_examples=total, deadline=None, database=None)
    @given(_strategy_fichero(campos))
    def _recolectar(grupos):
        ficheros_generados.append(grupos)

    _recolectar()

    resultados = []
    for grupos in ficheros_generados[:total]:
        texto = _formatear_fichero(grupos, campos, tipo_lectura, valor_centinela)
        resultados.append({"perfiles": ["aleatorio"], "input": texto})

    return resultados

