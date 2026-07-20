from backend.scripts.generador_inputs import generar_conjunto_de_pruebas

EJEMPLO_NUMCASOS = {
    "tipo_lectura": "numCasos",
    "valor_centinela": None,
    "campos_por_caso": [
        {"nombre": "N", "tipo": "entero", "minimo": 1, "maximo": 100,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None},
        {"nombre": "vector", "tipo": "vector_entero", "minimo": 0, "maximo": 1000,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": "N"},
    ],
}

casos = generar_conjunto_de_pruebas(EJEMPLO_NUMCASOS, total=3)
for c in casos:
    print("----")
    print(c["input"])
