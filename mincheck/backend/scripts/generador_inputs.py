import string
from hypothesis import given, settings, strategies as st
from faker import Faker
import random

#Como min/max/longitudes pueden venir a null, hay que definir un rango por defecto para no generar valores sin sentido
RANGO_ENTERO_DEFECTO = (-1000, 1000)
RANGO_REAL_DEFECTO = (-1000.0, 1000.0)
RANGO_LONGITUD_DEFECTO = (0, 10)      # para vectores/cadenas sin longitud explícita
ALFABETO_CADENA = string.ascii_lowercase

# Vocabulario para generar cadenas con palabras reales en vez de basura aleatoria.
# Se descartan las que llevan tilde/ñ: una solucion que manipule la cadena byte a byte
# (invertir, palindromo con char con signo...) puede generar UTF-8 invalido en su salida
# y tumbar la decodificacion del subproceso.
# El pool se calcula una vez al importar el modulo porque la lista de Faker es fija.
_fake = Faker("es_ES")
_PALABRAS_BASE = sorted({p for p in _fake.words(500) if p.isascii()})


def _palabras_en_rango(lm: int, hi: int) -> list[str]:
    return [p for p in _PALABRAS_BASE if lm <= len(p) <= hi]

LIMITE_HYPOTHESIS_LISTA = 200       # limite bajo porque salta el health check

LIMITE_PEQUENO_ENTERO = 20      # valores en [-20, 20] se consideran "pequeños"
LIMITE_PEQUENO_REAL = 20.0

# Perfiles al estilo de un juez real: se generan 5 ficheros con un propósito cada uno.
NUM_CASOS_SIMPLES = 2        # casos "de manual", valores pequeños tipo enunciado
GRUPOS_CASO_SIMPLE = 6       # varios inputs sencillos dentro de cada caso simple

GRUPOS_CASO_EXHAUSTIVO = 5  # caso recorre valores límite

NUM_CASOS_GRANDES = 2        # casos con inputs muy grandes para probar timeout
GRUPOS_CASO_GRANDE = 100
MARGEN_GRANDE = 5            # cuánto por debajo del máximo se permite en el caso grande

#Estrategia para un valor que representa un tamaño: longitud de vector/cadena
# o un contador que otro campo referencia como longitud_referencia.
def _strategy_tamano(lo: int, hi: int, modo: str):
    if modo == "simple":
        hi_p = min(hi, 5)
        if hi_p < lo:
            hi_p = hi
        return st.integers(min_value=lo, max_value=hi_p)

    if modo == "borde":
        candidatos = sorted({v for v in {lo, lo + 1, hi - 1, hi} if lo <= v <= hi})
        return st.sampled_from(candidatos)

    return st.integers(min_value=lo, max_value=hi)



#Estrategia -> traduce el campo a una estrategia de Hypothesis para generar valores válidos
def _strategy_escalar(campo: dict, modo: str = "normal"):
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

        if modo == "simple":
            lo_p, hi_p = max(lo, -LIMITE_PEQUENO_ENTERO), min(hi, LIMITE_PEQUENO_ENTERO)
            if lo_p > hi_p:
                lo_p, hi_p = lo, hi
            return st.integers(min_value=lo_p, max_value=hi_p)

        if modo == "borde":
            candidatos = sorted({v for v in {lo, lo + 1, 0, hi - 1, hi} if lo <= v <= hi})
            return st.sampled_from(candidatos)

        return st.integers(min_value=lo, max_value=hi)

    if tipo == "real":
        lo = float(minimo) if minimo is not None else RANGO_REAL_DEFECTO[0]
        hi = float(maximo) if maximo is not None else RANGO_REAL_DEFECTO[1]
        if salto:
            pasos = int((hi - lo) / salto)
            return st.integers(min_value=0, max_value=pasos).map(lambda n: round(lo + n * salto, 6))

        if modo == "simple":
            lo_p, hi_p = max(lo, -LIMITE_PEQUENO_REAL), min(hi, LIMITE_PEQUENO_REAL)
            if lo_p > hi_p:
                lo_p, hi_p = lo, hi
            return st.floats(min_value=lo_p, max_value=hi_p, allow_nan=False, allow_infinity=False)

        if modo == "borde":
            candidatos = sorted({v for v in {lo, 0.0, hi} if lo <= v <= hi})
            return st.sampled_from(candidatos)

        return st.floats(min_value=lo, max_value=hi, allow_nan=False, allow_infinity=False)


    if tipo == "booleano":
        return st.booleans()

    if tipo == "caracter":
        if modo == "borde":
            return st.sampled_from([ALFABETO_CADENA[0], ALFABETO_CADENA[-1]])
        return st.text(alphabet=ALFABETO_CADENA, min_size=1, max_size=1)

    if tipo == "cadena":
        lm = campo.get("longitud_minima") if campo.get("longitud_minima") is not None else RANGO_LONGITUD_DEFECTO[0]
        lM = campo.get("longitud_maxima") if campo.get("longitud_maxima") is not None else RANGO_LONGITUD_DEFECTO[1]

        if modo == "borde":
            candidatos = sorted({v for v in {lm, lm + 1, lM - 1, lM} if lm <= v <= lM})
            return st.one_of(*[st.text(alphabet=ALFABETO_CADENA, min_size=n, max_size=n) for n in candidatos])

        hi_p = min(lM, 5) if modo == "simple" else lM
        if hi_p < lm:
            hi_p = lM

        palabras = _palabras_en_rango(lm, hi_p)
        if palabras:
            return st.sampled_from(palabras)
        return st.text(alphabet=ALFABETO_CADENA, min_size=lm, max_size=hi_p)

    raise ValueError(f"tipo escalar desconocido: {tipo}")

_TIPO_BASE_VECTOR = {
    "vector_entero": "entero",
    "vector_real": "real",
    "vector_cadena": "cadena",
}

#estrategia para un campo vector -> se aplica la del escalar a cada uno de sus elemetnos
def _strategy_elemento_vector(campo: dict, modo: str = "normal"):
    tipo_base = _TIPO_BASE_VECTOR[campo["tipo"]]
    return _strategy_escalar({**campo, "tipo": tipo_base}, modo)


def _strategy_longitud_vector(campo: dict, modo: str):
    lm = campo.get("longitud_minima") if campo.get("longitud_minima") is not None else RANGO_LONGITUD_DEFECTO[0]
    lM = campo.get("longitud_maxima") if campo.get("longitud_maxima") is not None else RANGO_LONGITUD_DEFECTO[1]
    lM = min(lM, LIMITE_HYPOTHESIS_LISTA)
    return _strategy_tamano(lm, lM, modo)


def _strategy_contador(campo: dict, modo: str):
    lo = int(campo["minimo"]) if campo.get("minimo") is not None else RANGO_ENTERO_DEFECTO[0]
    hi = int(campo["maximo"]) if campo.get("maximo") is not None else RANGO_ENTERO_DEFECTO[1]
    hi = min(hi, LIMITE_HYPOTHESIS_LISTA)
    return _strategy_tamano(lo, hi, modo)


#estrategia sesgada hacia el valor exacto de una relacion aritmetica (y sus vecinos +-1/2/3,
#para cubrir bugs de tipo off-by-one como > en vez de >=) entre dos campos
def _strategy_valor_relacionado(base_valor, operacion: str, valor: float, lo, hi, modo: str):
    if operacion == "multiplo":
        centro = base_valor * valor
    elif operacion == "suma":
        centro = valor - base_valor
    elif operacion == "resta":
        centro = base_valor - valor
    else:
        raise ValueError(f"relacion_operacion desconocida: {operacion}")

    deltas = [0, 0, -1, 1, -2, 2, -3, 3]
    candidatos = sorted({v for v in (centro + d for d in deltas) if lo <= v <= hi})
    if not candidatos:
        return st.just(max(lo, min(hi, centro)))
    return st.sampled_from(candidatos)


#st.composite permite dependencias (unas estrategias que dependan de otras)
@st.composite
#devuelve una estrategia que produce un diccionario con los valores para un CASO COMPLETO
def _strategy_caso(draw, campos_por_caso: list[dict], modo: str = "normal"):
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
                n = draw(_strategy_longitud_vector(campo, modo))
            elemento = _strategy_elemento_vector(campo, modo)
            valores[nombre] = draw(st.lists(elemento, min_size=n, max_size=n))
        elif nombre in referenciados:
            valores[nombre] = draw(_strategy_contador(campo, modo))
        else:
            valores[nombre] = draw(_strategy_escalar(campo, modo))

    # segunda pasada: sesgar hacia relaciones aritmeticas explicitas entre campos escalares.
    # va aparte para no depender del orden (relacion_campo puede apuntar a un campo posterior).
    for campo in campos_por_caso:
        ref = campo.get("relacion_campo")
        operacion = campo.get("relacion_operacion")
        valor_relacion = campo.get("relacion_valor")
        if not ref or not operacion or valor_relacion is None:
            continue
        if campo["tipo"] not in ("entero", "real") or ref not in valores:
            continue

        nombre = campo["nombre"]
        minimo = campo.get("minimo")
        maximo = campo.get("maximo")
        if campo["tipo"] == "entero":
            lo = int(minimo) if minimo is not None else RANGO_ENTERO_DEFECTO[0]
            hi = int(maximo) if maximo is not None else RANGO_ENTERO_DEFECTO[1]
        else:
            lo = float(minimo) if minimo is not None else RANGO_REAL_DEFECTO[0]
            hi = float(maximo) if maximo is not None else RANGO_REAL_DEFECTO[1]

        sesgada = _strategy_valor_relacionado(valores[ref], operacion, valor_relacion, lo, hi, modo)
        valores[nombre] = draw(st.one_of(st.just(valores[nombre]), sesgada))

    return valores


#genera un fichero con un número fijo de grupos (lo decide el perfil, no el azar)
@st.composite
def _strategy_fichero(draw, campos_por_caso: list[dict], modo: str, num_grupos: int):
    return [draw(_strategy_caso(campos_por_caso, modo)) for _ in range(num_grupos)]


#FORMATEOS
#convertir los diccionarios de python a texto plano (cada campo en su propia linea)
def _formatear_valor(valor, tipo: str) -> str:
    if tipo == "booleano":
        return "true" if valor else "false"
    if tipo == "real":
        return f"{valor:.2f}"
    return str(valor)

def _formatear_caso(valores: dict, campos_por_caso: list[dict]) -> str:
    lineas: list[list[str]] = []
    linea_de: dict[str, int] = {}  # nombre de campo -> indice en `lineas` donde se escribio
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
            lineas.append([elementos])
            linea_de[nombre] = len(lineas) - 1
        else:
            texto = _formatear_valor(valor, tipo)
            ref = campo.get("misma_linea_que")
            if ref and ref in linea_de:
                lineas[linea_de[ref]].append(texto)
                linea_de[nombre] = linea_de[ref]
            else:
                lineas.append([texto])
                linea_de[nombre] = len(lineas) - 1
    return "\n".join(" ".join(linea) for linea in lineas)


def _formatear_fichero(grupos: list[dict], campos_por_caso: list[dict],
                        tipo_lectura: str, valor_centinela) -> str:
    lineas = [_formatear_caso(g, campos_por_caso) for g in grupos]
    if tipo_lectura == "numCasos":
        lineas = [str(len(grupos))] + lineas
    elif tipo_lectura == "centinela":
        lineas = lineas + [valor_centinela if valor_centinela is not None else "0"]
    return "\n".join(lineas)


def _generar_ficheros(campos: list[dict], modo: str, num_grupos: int, cantidad: int) -> list[list[dict]]:
    ficheros_generados = []

    @settings(max_examples=cantidad, deadline=None, database=None)
    @given(_strategy_fichero(campos, modo, num_grupos))
    def _recolectar(grupos):
        ficheros_generados.append(grupos)

    _recolectar()
    return ficheros_generados[:cantidad]

# ---- Perfil "grande": generado con random puro, sin Hypothesis ----

def _dominio_entero(campo: dict):
    """(lo, hi) del campo si es entero de rango fijo, o None si no aplica
    (real/cadena: dominio tan grande que una colision por azar es improbable)."""
    tipo_base = _TIPO_BASE_VECTOR.get(campo["tipo"], campo["tipo"])
    if tipo_base != "entero" or campo.get("salto"):
        return None
    minimo = campo.get("minimo")
    maximo = campo.get("maximo")
    lo = int(minimo) if minimo is not None else RANGO_ENTERO_DEFECTO[0]
    hi = int(maximo) if maximo is not None else RANGO_ENTERO_DEFECTO[1]
    return lo, hi


def _valor_grande_escalar(campo: dict):
    tipo = campo["tipo"]
    minimo = campo.get("minimo")
    maximo = campo.get("maximo")
    salto = campo.get("salto")

    if tipo == "entero":
        lo = int(minimo) if minimo is not None else RANGO_ENTERO_DEFECTO[0]
        hi = int(maximo) if maximo is not None else RANGO_ENTERO_DEFECTO[1]
        if salto:
            pasos = (hi - lo) // int(salto)
            return lo + random.randint(0, pasos) * int(salto)
        return random.randint(lo, hi)

    if tipo == "real":
        lo = float(minimo) if minimo is not None else RANGO_REAL_DEFECTO[0]
        hi = float(maximo) if maximo is not None else RANGO_REAL_DEFECTO[1]
        if salto:
            pasos = int((hi - lo) / salto)
            return round(lo + random.randint(0, pasos) * salto, 6)
        return round(random.uniform(lo, hi), 6)

    if tipo == "booleano":
        return random.choice([True, False])

    if tipo == "caracter":
        return random.choice(ALFABETO_CADENA)

    if tipo == "cadena":
        lm = campo.get("longitud_minima") if campo.get("longitud_minima") is not None else RANGO_LONGITUD_DEFECTO[0]
        lM = campo.get("longitud_maxima") if campo.get("longitud_maxima") is not None else RANGO_LONGITUD_DEFECTO[1]
        lo_g = max(lm, lM - MARGEN_GRANDE)
        if lo_g > lM:
            lo_g = lM
        n = random.randint(lo_g, lM)
        return "".join(random.choice(ALFABETO_CADENA) for _ in range(n))

    raise ValueError(f"tipo escalar desconocido: {tipo}")


def _columna_sin_repetir(campo: dict, n: int):
    """n valores para el caso "grande": distintos entre si mientras el dominio
    de valores posibles lo permita, porque repetir un valor que el juez ya
    evaluo no aporta nada nuevo. Si el dominio es mas pequeno que n, se
    reparte lo que hay en vez de fallar."""
    if n <= 0:
        return []

    dominio = _dominio_entero(campo)
    if dominio is not None:
        lo, hi = dominio
        tamano_dominio = hi - lo + 1
        if tamano_dominio <= n:
            base = list(range(lo, hi + 1))
            random.shuffle(base)
            return [base[i % tamano_dominio] for i in range(n)]
        return random.sample(range(lo, hi + 1), n)

    tipo_base = _TIPO_BASE_VECTOR.get(campo["tipo"], campo["tipo"])
    campo_base = {**campo, "tipo": tipo_base}
    return [_valor_grande_escalar(campo_base) for _ in range(n)]


def _longitud_grande(lm: int, lM: int) -> int:
    lM = min(lM, LIMITE_HYPOTHESIS_LISTA)
    lo_g = max(lm, lM - MARGEN_GRANDE)
    if lo_g > lM:
        lo_g = lM
    return random.randint(lo_g, lM)


def _contador_grande(campo: dict) -> int:
    lo = int(campo["minimo"]) if campo.get("minimo") is not None else RANGO_ENTERO_DEFECTO[0]
    hi = int(campo["maximo"]) if campo.get("maximo") is not None else RANGO_ENTERO_DEFECTO[1]
    hi = min(hi, LIMITE_HYPOTHESIS_LISTA)
    lo_g = max(lo, hi - MARGEN_GRANDE)
    return random.randint(lo_g, hi)


def _generar_fichero_grande(campos_por_caso: list[dict], num_grupos: int) -> list[dict]:
    referenciados = {c["longitud_referencia"] for c in campos_por_caso if c.get("longitud_referencia")}

    # Los campos "de valor" (no longitudes) se generan por columnas para que
    # ningun valor se repita entre grupos mientras el dominio lo permita.
    columnas = {}
    for campo in campos_por_caso:
        if campo["tipo"] in _TIPO_BASE_VECTOR or campo["nombre"] in referenciados:
            continue
        columnas[campo["nombre"]] = _columna_sin_repetir(campo, num_grupos)

    grupos = []
    for i in range(num_grupos):
        valores = {nombre: columnas[nombre][i] for nombre in columnas}
        for campo in campos_por_caso:
            nombre = campo["nombre"]
            if nombre in valores:
                continue
            if nombre in referenciados:
                valores[nombre] = _contador_grande(campo)
            else:
                ref = campo.get("longitud_referencia")
                if ref:
                    n = int(valores[ref])
                else:
                    lm = campo.get("longitud_minima") if campo.get("longitud_minima") is not None else RANGO_LONGITUD_DEFECTO[0]
                    lM = campo.get("longitud_maxima") if campo.get("longitud_maxima") is not None else RANGO_LONGITUD_DEFECTO[1]
                    n = _longitud_grande(lm, lM)
                valores[nombre] = _columna_sin_repetir(campo, n)
        grupos.append(valores)
    return grupos


#Junta todo: genera los 5 casos al estilo de un juez real
def generar_conjunto_de_pruebas(estructura: dict) -> list[dict]:
    campos = estructura["campos_por_caso"]
    tipo_lectura = estructura["tipo_lectura"]
    valor_centinela = estructura.get("valor_centinela")

    resultados = []

    # "simple" y "exhaustivo" van por Hypothesis. 
    perfiles_hypothesis = [
        ("simple", "simple", GRUPOS_CASO_SIMPLE, NUM_CASOS_SIMPLES),
        ("exhaustivo", "borde", GRUPOS_CASO_EXHAUSTIVO, 1),
    ]
    for nombre, modo, num_grupos, cantidad in perfiles_hypothesis:
        for grupos in _generar_ficheros(campos, modo, num_grupos, cantidad + 1)[1:]:
            texto = _formatear_fichero(grupos, campos, tipo_lectura, valor_centinela)
            resultados.append({"perfiles": [nombre], "input": texto})

    # "grande" va aparte, generado directamente con random 
    for _ in range(NUM_CASOS_GRANDES):
        grupos = _generar_fichero_grande(campos, GRUPOS_CASO_GRANDE)
        texto = _formatear_fichero(grupos, campos, tipo_lectura, valor_centinela)
        resultados.append({"perfiles": ["grande"], "input": texto})

    return resultados