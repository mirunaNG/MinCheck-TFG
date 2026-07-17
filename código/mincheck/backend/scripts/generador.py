import random

#Propociones para generar casos de todo tipo, que sean extremos, grandes, pequeños y aleatorios
PROPORCION_PERFILES = {
    "borde_minimo": 0.10,
    "borde_maximo": 0.10,
    "pequeno": 0.20,
    "grande": 0.20,
    "aleatorio": 0.40,
}

#Dado un rango, recorta segun el perfil 
def _rango_por_perfil(lo, hi, perfil: str, es_entero: bool):
    rango = hi - lo
    if perfil == "borde_minimo":
        nuevo_lo, nuevo_hi = lo, lo
    elif perfil == "borde_maximo":
        nuevo_lo, nuevo_hi = hi, hi
    elif perfil == "pequeno":
        nuevo_lo, nuevo_hi = lo, lo + rango * 0.1
    elif perfil == "grande":
        nuevo_lo, nuevo_hi = hi - rango * 0.1, hi
    else:
        nuevo_lo, nuevo_hi = lo, hi
    if es_entero:
        nuevo_lo = int(nuevo_lo)
        nuevo_hi = max(nuevo_lo, int(nuevo_hi))
    return nuevo_lo, nuevo_hi

#Genera un valor escalar segun el tipo de campo y el perfil
def _generar_valor_escalar(campo: dict, perfil: str = "aleatorio"):
    tipo = campo["tipo"]
    minimo = campo["minimo"]
    maximo = campo["maximo"]
    salto = campo["salto"]

    if tipo == "entero":
        lo = minimo if minimo is not None else -1000
        hi = maximo if maximo is not None else 1000
        lo, hi = _rango_por_perfil(lo, hi, perfil, es_entero=True)
        paso = int(salto) if salto else 1
        pasos_posibles = max(0, (hi - lo) // paso)
        return lo + random.randint(0, pasos_posibles) * paso

    if tipo == "real":
        lo = minimo if minimo is not None else -1000.0
        hi = maximo if maximo is not None else 1000.0
        lo, hi = _rango_por_perfil(lo, hi, perfil, es_entero=False)
        valor = random.uniform(lo, hi)
        if salto:
            valor = round(round(valor / salto) * salto, 10)
        return round(valor, 4)

    if tipo == "booleano":
        return random.choice([True, False])

    if tipo == "caracter":
        return random.choice("abcdefghijklmnopqrstuvwxyz")

    if tipo == "cadena":
        longitud = campo["longitud_minima"] or 5
        return "".join(random.choice("abcdefghijklmnopqrstuvwxyz") for _ in range(longitud))

    raise ValueError(f"Tipo escalar desconocido: {tipo}")


#Decide cuantos elementos tiene un vector , si ya hay referencia, ignora el perfil y usa N
def _generar_longitud(campo: dict, valores_previos: dict, perfil: str) -> int:
    if campo["longitud_referencia"]:
        return int(valores_previos[campo["longitud_referencia"]])
    lo = campo["longitud_minima"] or 1
    hi = campo["longitud_maxima"] or lo + 10
    lo, hi = _rango_por_perfil(lo, hi, perfil, es_entero=True)
    return random.randint(lo, hi)

#Genera valores para cada campo, si es un vector calcula la longitud y genera esa cantidad de elementos
def _generar_valor_campo(campo: dict, valores_previos: dict, perfil: str):
    tipo = campo["tipo"]
    if tipo.startswith("vector_"):
        tipo_elemento = tipo.replace("vector_", "")
        longitud = _generar_longitud(campo, valores_previos, perfil)
        campo_elemento = {**campo, "tipo": tipo_elemento}
        return [_generar_valor_escalar(campo_elemento, perfil) for _ in range(longitud)]
    return _generar_valor_escalar(campo, perfil)

#Convierte el valor a texto
def _formatear_valor(valor) -> str:
    if isinstance(valor, list):
        return " ".join(str(v) for v in valor)
    if isinstance(valor, bool):
        return "1" if valor else "0"
    return str(valor)

#Recorre los campos en orden y genera los valores para cada uno gurdando los previos
def _generar_caso(campos_por_caso: list, perfil: str) -> list:
    valores_previos = {}
    lineas = []
    for campo in campos_por_caso:
        valor = _generar_valor_campo(campo, valores_previos, perfil)
        valores_previos[campo["nombre"]] = valor
        lineas.append(_formatear_valor(valor))
    return lineas

#Añade numCasos al principio si es necesario, genera cada caso y añade el centinela al final si es necesario
def generar_entrada(estructura: dict, perfiles: list) -> str:
    tipo_lectura = estructura["tipo_lectura"]
    campos = estructura["campos_por_caso"]
    lineas = []

    if tipo_lectura == "numCasos":
        lineas.append(str(len(perfiles)))

    for perfil in perfiles:
        lineas.extend(_generar_caso(campos, perfil))

    if tipo_lectura == "centinela":
        lineas.append(str(estructura["valor_centinela"]))

    return "\n".join(lineas) + "\n"


#Convierte las proporciones en una lista concreta de perfiles a generar 
def _plan_de_perfiles(total: int) -> list:
    plan = []
    for perfil, proporcion in PROPORCION_PERFILES.items():
        plan.extend([perfil] * round(total * proporcion))
    while len(plan) < total:
        plan.append("aleatorio")
    plan = plan[:total]
    random.shuffle(plan)
    return plan

#Funcion que se usa desde fuera
def generar_conjunto_de_pruebas(estructura: dict, total: int = 20,
                                 casos_internos_min: int = 1, casos_internos_max: int = 5) -> list:
    resultado = []
    for _ in range(total):
        num_internos = random.randint(casos_internos_min, casos_internos_max)
        perfiles = _plan_de_perfiles(num_internos)
        resultado.append({"perfiles": perfiles, "input": generar_entrada(estructura, perfiles)})
    return resultado



if __name__ == "__main__":
    estructura_ejemplo = {
        "tipo_lectura": "centinela",
        "valor_centinela": "0",
        "campos_por_caso": [
            {
                "nombre": "N", "tipo": "entero",
                "minimo": 1, "maximo": 25000, "salto": None,
                "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None,
            },
            {
                "nombre": "valores", "tipo": "vector_entero",
                "minimo": None, "maximo": None, "salto": None,
                "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": "N",
            },
        ],
    }

    conjunto = generar_conjunto_de_pruebas(estructura_ejemplo, total=20)

    for i, caso in enumerate(conjunto, start=1):
        lineas = caso["input"].strip("\n").split("\n")
        j = 0
        contados = 0
        while lineas[j] != estructura_ejemplo["valor_centinela"]:
            n = int(lineas[j])
            valores = lineas[j + 1].split()
            assert len(valores) == n, f"Caso {i}: N={n} pero {len(valores)} valores"
            j += 2
            contados += 1
        print(f"Caso {i:2d}: {contados} sub-casos internos -> perfiles {caso['perfiles']}")

    with open("prueba_conjunto.txt", "w") as f:
        for i, caso in enumerate(conjunto, start=1):
            f.write(f"--- Caso {i} ({', '.join(caso['perfiles'])}) ---\n")
            f.write(caso["input"])
    print("\nConjunto completo escrito en prueba_conjunto.txt")
