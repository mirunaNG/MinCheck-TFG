"""
LangForge — Servidor de análisis de enunciados
Ejecutar: python server.py
Puerto:   8001
"""

from typing import List, Literal, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
import json
import re
import time
import pdfplumber
import os
import tempfile

from generador_inputs import generar_conjunto_de_pruebas
from calculador_outputs import calcular_outputs, TIMEOUT_SEGUNDOS
from juez import juzgar_entrega



# ── Intentar importar ollama; si no está disponible, usar modo mock ──
try:
    from ollama import chat as ollama_chat
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

app = FastAPI(title="LangForge Analizador de Enunciados")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

MODEL = "qwen2.5-coder:7b"

# ══════════════════════════════════════════════════════
#  SCHEMAS
# ══════════════════════════════════════════════════════

class EstructuraEjercicio(BaseModel):
    tipo_lectura: Literal["centinela", "numCasos", "ilimitado"]
    valor_centinela: Optional[str] = None
    campos_por_caso: List[dict]

class GenerarCasosRequest(BaseModel):
    estructura: dict
    entrada_ejemplo: Optional[str] = None
    salida_ejemplo: Optional[str] = None


class EjemploEjercicio(BaseModel):
    entrada_ejemplo: str
    salida_ejemplo: str

EJEMPLO_SCHEMA = {
    "type": "object",
    "properties": {
        "entrada_ejemplo": {"type": "string"},
        "salida_ejemplo": {"type": "string"},
    },
    "required": ["entrada_ejemplo", "salida_ejemplo"],
}


CAMPO_SCHEMA = {
    "type": "object",
    "properties": {
        "nombre": {"type": "string"},
        "tipo": {"type": "string", "enum": ["entero", "real", "cadena", "caracter", "booleano",
                                            "vector_entero", "vector_real", "vector_cadena"]},
        "minimo": {"type": ["number", "null"]},
        "maximo": {"type": ["number", "null"]},
        "salto": {"type": ["number", "null"]},
        "longitud_minima": {"type": ["integer", "null"]},
        "longitud_maxima": {"type": ["integer", "null"]},
        "longitud_referencia": {"type": ["string", "null"]},
        "tipo_lectura_caso": {"type": ["string", "null"], "enum": ["centinela", "numCasos", "ilimitado", None]},
        "valor_centinela_campo": {"type": ["string", "null"]},
        "tipo_centinela_campo": {"type": ["string", "null"],
                                 "enum": ["entero", "real", "cadena", "caracter", "booleano", None]},
    },
    "required": ["nombre", "tipo", "minimo", "maximo", "salto",
                 "longitud_minima", "longitud_maxima", "longitud_referencia", "tipo_lectura_caso",
                 "valor_centinela_campo", "tipo_centinela_campo"],
}


ESTRUCTURA_SCHEMA = {
    "type": "object",
    "properties": {
        "tipo_lectura": {"type": "string", "enum": ["centinela", "numCasos", "ilimitado"]},
        "valor_centinela": {"type": ["string", "null"]},
        "campos_por_caso": {"type": "array", "items": CAMPO_SCHEMA},
    },
    "required": ["tipo_lectura", "valor_centinela", "campos_por_caso"],
}


class AnalizarEnunciadoRequest(BaseModel):
    enunciado_texto: Optional[str] = None
    ruta_pdf: Optional[str] = None
    tipo_forzado: Optional[Literal["centinela", "numCasos", "ilimitado"]] = None


# ══════════════════════════════════════════════════════
#  SYSTEM PROMPT
# ══════════════════════════════════════════════════════
SYSTEM_EJEMPLO = """
You are extracting the worked example from a programming exercise statement. Statements usually contain
an input example (often under a heading like "Entrada de ejemplo") and its matching output example (often
under "Salida de ejemplo").

Copy them EXACTLY as they appear in the statement: same numbers, same line breaks, same order. Do not
invent, complete, translate, or reformat anything — this is a literal copy, not a summary.

If the statement shows no example at all, return empty strings for both fields.

Return ONLY valid JSON matching the requested schema.
"""

SYSTEM_ANALISIS = """
You are an expert in programming judges (online judges like DOMjudge or AceptaElReto). You analyze
exercise statements to extract the STRUCTURE of their input — not concrete test data. That structure
will later be used by a separate program to generate as many test cases as needed and to validate
student submissions, so it must be precise and complete.

You will receive the statement of a programming exercise. Your task is to fill in:

1. "tipo_lectura": how a solving program must read the input, choosing exactly one of:
   - "centinela": reading of the WHOLE FILE stops when a specific value is found — meaning NO MORE
     TEST CASES follow after it.
   - "numCasos": a single number, read ONCE before any test case, states the total number of cases.
   - "ilimitado": input is read until end-of-file, with no count and no stop value.
   Base this strictly on the "Entrada" section of the statement, not assumptions.

   IMPORTANT — do not confuse a per-case count field with the file-level "numCasos": if a number
   appears ONCE INSIDE EACH test case (e.g. "en la primera línea de cada caso se indica el número de
   elementos del vector") and the statement says cases keep repeating until the file ends with no total
   given beforehand, that number is a regular field of "campos_por_caso", and the vector/cadena it sizes
   should get "tipo_lectura_caso": "numCasos" (see below) — this is NOT the file-level tipo_lectura
   "numCasos". Reserve tipo_lectura "numCasos" for a single number that appears exactly ONCE, BEFORE any
   test case, stating the total number of cases in the whole file.



2. "valor_centinela": if tipo_lectura is "centinela", the exact sentinel value described in the
   statement (as text, e.g. "0" or "-1"). Otherwise null.

3. "campos_por_caso": the ORDERED list of data fields that make up ONE test case, in the same order
   the statement says they are read. Each item must be a JSON object with exactly these keys:
   - "nombre": short identifier for the field (e.g. "N", "vector", "temperatura")
   - "tipo": one of "entero", "real", "cadena", "caracter", "booleano",
             "vector_entero", "vector_real", "vector_cadena"
   - "minimo": number or null — lower bound allowed for each value (numeric types, or elements of a
     vector type)
   - "maximo": number or null — upper bound allowed for each value
   - "salto": number or null — increment between consecutive valid values (e.g. 0.5 if only multiples
     of 0.5 are allowed, or 1 for whole numbers only); null if any value in [minimo, maximo] is valid
   - "longitud_minima": integer or null — min number of elements (vector types) or characters (cadena),
     used only when longitud_referencia is null
   - "longitud_maxima": integer or null — max number of elements/characters, used only when
     longitud_referencia is null
   - "longitud_referencia": string or null — if the number of elements of a vector/cadena is determined
     by the value of an earlier field in this same list (e.g. "N" read right before a vector of N
     numbers), put that field's "nombre" here. Otherwise null.
   - "tipo_lectura_caso": ONLY for "vector_*" fields. Uses the EXACT SAME three values as "tipo_lectura"
     above, but describes how THIS field's own elements are read WITHIN one case — independently of the
     file-level "tipo_lectura". The two do not have to match: a file classified as "ilimitado" can still
     contain a field read the "numCasos" way, if a count for THAT specific field appears once at the
     start of each case (see the worked example below).
       - "numCasos": an earlier field in this SAME case states, once, how many elements this field has
         (use "longitud_referencia" with that field's "nombre", as before).
       - "centinela": the statement says THIS list (not the whole file) is read element by element until
         a stop value/word is found. "longitud_referencia", "longitud_minima" and "longitud_maxima" must
         be null in this case.
       - "ilimitado": no count field and no stop value are given for this list; its length is free/random,
         bounded by "longitud_minima"/"longitud_maxima".
     For any non-vector field, "tipo_lectura_caso" is null.
   - "valor_centinela_campo": ONLY relevant if "tipo_lectura_caso" is "centinela". If the statement gives
     a specific stop value (e.g. "until a -1 is read"), put it here as text. If it gives no specific
     value, null.
   - "tipo_centinela_campo": ONLY relevant if "tipo_lectura_caso" is "centinela" AND "valor_centinela_campo"
     is null (generic stop condition, no specific value given). States the type of whatever ends the
     reading, choosing one of "entero", "real", "cadena", "caracter", "booleano" — for example, "any
     word" or "any non-numeric text" is "cadena". Otherwise, null.

     - IMPORTANT — do not confuse a per-case sentinel with the file-level "centinela": if a stop value/word
    ends each INDIVIDUAL case's list (e.g., a list is read element by element until a word like "fin"
    appears, and then a NEW case starts on the next line) and the statement gives no separate value that
    stops the WHOLE FILE, then tipo_lectura must be "ilimitado" (cases are simply read until EOF), and it
    is the FIELD that gets "tipo_lectura_caso": "centinela". Reserve the file-level tipo_lectura
    "centinela" for when the statement says reading of the WHOLE FILE (no more cases at all) stops upon
    that value — never just because one case's own list ends that way.


Rules:
- For ANY field, scalar or vector, never assume "minimo", "maximo", "salto", "longitud_minima" or
  "longitud_maxima" from what the type conventionally implies. Use a value only if the statement gives
  an explicit limit; otherwise leave it null.
- If "longitud_referencia" is set for a field, "longitud_minima" and "longitud_maxima" for that same
  field MUST be null — a length is stated either by a reference field or by explicit bounds, never both.
- If the statement describes a value only by its number of digits N (e.g. "número de cuatro dígitos",
  "a 3-digit number"), that is an explicit bound: maximo = 10^N - 1. For minimo, look specifically for
  wording about leading zeros:
  - If the statement explicitly says leading zeros ARE allowed (e.g. "es válido colocar el dígito 0 al
    principio", "0009 es válido", "leading zeros are allowed"): minimo = 0.
  - Otherwise (leading zeros explicitly forbidden, or nothing said about it): minimo = 10^(N-1).
  Read this part of the statement carefully — do not default to 10^(N-1) if there is an explicit
  sentence permitting a leading zero.
- A field's "tipo" depends on how its value is used (numeric operations vs. text), not on how it is
  displayed (leading zeros, fixed decimals, separators). Use "cadena" only when the value is non-numeric
  or never used arithmetically.
- Return ONLY valid JSON matching the requested schema.
"""

SYSTEM_ANALISIS += """

Worked example of the digit-count rule above, using a generic made-up statement (not tied to any
specific real exercise) — pay close attention to how leading zeros are handled:

Statement fragment: "El código tiene tres dígitos. Los ceros a la izquierda son válidos, así que 007
es un código correcto."
→ field: {"nombre": "codigo", "tipo": "entero", "minimo": 0, "maximo": 999, "salto": null,
          "longitud_minima": null, "longitud_maxima": null, "longitud_referencia": null}
(minimo is 0, NOT 100, because the statement explicitly allows a leading zero — apply the same logic
to any statement with this pattern, regardless of the domain or wording.)
"""

EJEMPLO_CENTINELA = {
    "tipo_lectura": "centinela",
    "valor_centinela": "0 0",
    "campos_por_caso": [
        {"nombre": "a", "tipo": "entero", "minimo": None, "maximo": None,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None,
         "tipo_lectura_caso": None, "valor_centinela_campo": None, "tipo_centinela_campo": None},
        {"nombre": "b", "tipo": "entero", "minimo": None, "maximo": None,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None,
         "tipo_lectura_caso": None, "valor_centinela_campo": None, "tipo_centinela_campo": None},
    ],
}

EJEMPLO_CENTINELA_POR_CASO = {
    "tipo_lectura": "ilimitado",
    "valor_centinela": None,
    "campos_por_caso": [
        {"nombre": "lista", "tipo": "vector_entero", "minimo": None, "maximo": None,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None,
         "tipo_lectura_caso": "centinela", "valor_centinela_campo": None, "tipo_centinela_campo": "cadena"},
    ],
}


EJEMPLO_NUMCASOS = {   
    "tipo_lectura": "numCasos",
    "valor_centinela": None,
    "campos_por_caso": [
        {"nombre": "N", "tipo": "entero", "minimo": 1, "maximo": 100,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None,
         "tipo_lectura_caso": None, "valor_centinela_campo": None, "tipo_centinela_campo": None},
        {"nombre": "vector", "tipo": "vector_entero", "minimo": 0, "maximo": 1000,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": "N",
         "tipo_lectura_caso": "numCasos", "valor_centinela_campo": None, "tipo_centinela_campo": None},
    ],
}

EJEMPLO_ILIMITADO = {
    "tipo_lectura": "ilimitado",
    "valor_centinela": None,
    "campos_por_caso": [
        {"nombre": "N", "tipo": "entero", "minimo": 1, "maximo": 100,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": None,
         "tipo_lectura_caso": None, "valor_centinela_campo": None, "tipo_centinela_campo": None},
        {"nombre": "vector", "tipo": "vector_entero", "minimo": 0, "maximo": 1000,
         "salto": None, "longitud_minima": None, "longitud_maxima": None, "longitud_referencia": "N",
         "tipo_lectura_caso": "numCasos", "valor_centinela_campo": None, "tipo_centinela_campo": None},
    ],
}

SYSTEM_ANALISIS += f"""

Examples of valid responses, one per tipo_lectura:

Example (tipo_lectura = "centinela"):
{json.dumps(EJEMPLO_CENTINELA, ensure_ascii=False, indent=2)}

Example (tipo_lectura = "numCasos"):
{json.dumps(EJEMPLO_NUMCASOS, ensure_ascii=False, indent=2)}

Example (tipo_lectura = "ilimitado") — notice this has the EXACT SAME campos_por_caso as the "numCasos"
example above (a per-case field "N" sizing a vector via tipo_lectura_caso "numCasos"). The only
difference is tipo_lectura itself: here the statement never gives a total case count before all cases,
so cases are simply read until the file ends. Never infer tipo_lectura "numCasos" just because some
campos_por_caso field looks like a count — check ONLY whether that count is stated ONCE before all
cases (→ tipo_lectura "numCasos"), or repeats inside each case (→ tipo_lectura "ilimitado" or
"centinela", with tipo_lectura_caso capturing the per-field count instead):
{json.dumps(EJEMPLO_ILIMITADO, ensure_ascii=False, indent=2)}

"""

SYSTEM_ANALISIS += """

Heuristic cue for tipo_lectura "ilimitado" vs "numCasos": phrases like "una serie de casos",
"consta de varios casos", "hasta el final del fichero", or any wording that does NOT state a total
count before the cases start, are a strong signal for "ilimitado" — even if a number appears at the
start of EVERY case. That per-case number sizes something WITHIN that case (e.g. a vector), it is not
a file-level case count, no matter how similar it looks to one.

Worked example of this exact confusion, using a real exercise statement:

Statement fragment: "La entrada consta de una serie de casos de prueba. Cada caso de prueba consta de
dos líneas. En la primera se indica el número de elementos del vector y en la segunda los valores del
vector."

WRONG: tipo_lectura = "numCasos", treating "el número de elementos del vector" as the total case count.
CORRECT: tipo_lectura = "ilimitado" — the statement never gives a total number of cases, it only says
cases keep coming ("una serie de casos") until the file ends. "N" is a per-case field that sizes the
vector via longitud_referencia, exactly like campos_por_caso in the EJEMPLO_ILIMITADO example above:

{"tipo_lectura": "ilimitado", "valor_centinela": null, "campos_por_caso": [
  {"nombre": "N", "tipo": "entero", "minimo": 1, "maximo": null, "salto": null,
   "longitud_minima": null, "longitud_maxima": null, "longitud_referencia": null,
   "tipo_lectura_caso": null, "valor_centinela_campo": null, "tipo_centinela_campo": null},
  {"nombre": "vector", "tipo": "vector_entero", "minimo": null, "maximo": null, "salto": null,
   "longitud_minima": null, "longitud_maxima": null, "longitud_referencia": "N",
   "tipo_lectura_caso": "numCasos", "valor_centinela_campo": null, "tipo_centinela_campo": null}
]}

Never assign tipo_lectura "numCasos" just because a number appears once per case and sizes a vector —
check first whether the statement gives ONE total count BEFORE any case starts. If it doesn't, use
"ilimitado" regardless of how the per-case field looks.
"""


# ══════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════

def extraer_texto_pdf(ruta_pdf: str) -> str:
    texto = []
    with pdfplumber.open(ruta_pdf) as pdf:
        for pagina in pdf.pages:
            texto.append(pagina.extract_text() or "")
    return "\n".join(texto)

def extraer_texto_pdf_bytes(contenido: bytes) -> str:
    texto = []
    with pdfplumber.open(BytesIO(contenido)) as pdf:
        for pagina in pdf.pages:
            texto.append(pagina.extract_text() or "")
    return "\n".join(texto)


#pdfplumber separa los acentos
_ACENTOS_ROTOS = {
    "´a": "á", "´e": "é", "´ı": "í", "´i": "í", "´o": "ó", "´u": "ú",
    "¨u": "ü", "~n": "ñ",
}

def _limpiar_diacriticos_rotos(texto: str) -> str:
    for roto, bien in _ACENTOS_ROTOS.items():
        texto = texto.replace(roto, bien)
    return texto.replace("ı", "i")


_NUMEROS_PALABRA_ES = {
    "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
    "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
}

def _numeros_en_texto(texto: str) -> set:
    numeros = set()
    for grupo in re.findall(r"\d{1,3}(?:[.,]\d{3})+", texto):
        numeros.add(int(re.sub(r"[.,]", "", grupo)))
    for suelto in re.findall(r"\d+", texto):
        numeros.add(int(suelto))

    #Detectar expresiones como "cuatro dígitos", "3 cifras", etc. y añadir los límites correspondientes
    patron_digitos = r"(\d+|" + "|".join(_NUMEROS_PALABRA_ES) + r")\s+(?:d[ií]gitos|cifras)"
    for grupo in re.findall(patron_digitos, texto, flags=re.IGNORECASE):
        n = int(grupo) if grupo.isdigit() else _NUMEROS_PALABRA_ES[grupo.lower()]
        numeros.add(10 ** n - 1)   # p.ej. "cuatro dígitos" -> 9999 también válido como límite
        numeros.add(10 ** (n - 1))

    return numeros

def _valor_aparece_en_texto(valor, numeros_texto: set, texto: str) -> bool:
    if valor is None:
        return True
    if float(valor).is_integer() and int(abs(valor)) in numeros_texto:
        return True
    return str(abs(valor)) in texto or f"{abs(valor):g}".replace(".", ",") in texto


def limitar_a_texto(estructura: EstructuraEjercicio, texto_original: str) -> EstructuraEjercicio:
    numeros_texto = _numeros_en_texto(texto_original)
    for campo in estructura.campos_por_caso:
        for clave in ("minimo", "maximo", "longitud_minima", "longitud_maxima"):
            valor = campo.get(clave)
            if valor is not None and not _valor_aparece_en_texto(valor, numeros_texto, texto_original):
                campo[clave] = None
    return estructura


# ══════════════════════════════════════════════════════
#  STREAMING GENERATOR
# ══════════════════════════════════════════════════════
def stream_analisis(enunciado_texto: str, tipo_forzado: Optional[str] = None):
    """
    Yields SSE events:
      data: {"type": "progress", "text": "..."}   — estado intermedio
      data: {"type": "result",   "tipo_lectura": "...", "valor_centinela": ..., "campos_por_caso": [...]}
      data: {"type": "error",    "message": "..."}
    """
    mensaje_usuario = enunciado_texto
    if tipo_forzado:
        mensaje_usuario += (
            f"\n\n[NOTA: el tipo de lectura de entrada ya ha sido fijado manualmente como "
            f"'{tipo_forzado}'. No lo detectes ni lo cambies: usa 'tipo_lectura': '{tipo_forzado}' "
            f"en la respuesta y limítate a describir los campos_por_caso.]"
        )

    if not OLLAMA_AVAILABLE:
        # ── Modo mock cuando ollama no está instalado ──
        yield f"data: {json.dumps({'type': 'progress', 'text': 'Ollama no disponible — modo demo'})}\n\n"
        time.sleep(0.4)
        mock = EstructuraEjercicio(
            tipo_lectura="numCasos",
            valor_centinela=None,
            campos_por_caso=[
                {
                    "nombre": "numero",
                    "tipo": "entero",
                    "minimo": 0000,
                    "maximo": 9999,
                    "salto": None,
                    "longitud_minima": None,
                    "longitud_maxima": None,
                    "longitud_referencia": None,
                }
            ],
        )
        yield f"data: {json.dumps({'type': 'result', **mock.model_dump()})}\n\n"
        return

    try:
        yield f"data: {json.dumps({'type': 'progress', 'text': '⏳ Conectando con el modelo...'})}\n\n"

        import threading

        result_holder = {}
        error_holder = {}

        def call_ollama():
            try:
                response = ollama_chat(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_ANALISIS},
                        {"role": "user", "content": mensaje_usuario},
                    ],
                    format=ESTRUCTURA_SCHEMA,
                    options={"temperature":0},
                )
                result_holder['content'] = response.message.content
            except Exception as e:
                error_holder['msg'] = str(e)

        thread = threading.Thread(target=call_ollama)
        thread.start()

        dots = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        i = 0
        while thread.is_alive():
            yield f"data: {json.dumps({'type': 'progress', 'text': f'{dots[i % len(dots)]} Analizando enunciado...'})}\n\n"
            i += 1
            time.sleep(0.2)
            thread.join(timeout=0.2)

        if 'msg' in error_holder:
            yield f"data: {json.dumps({'type': 'error', 'message': error_holder['msg']})}\n\n"
            return

        raw = result_holder.get('content', '{}')

        try:
            estructura = EstructuraEjercicio.model_validate_json(raw)
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Respuesta del modelo inválida: {e}'})}\n\n"
            return

        estructura = limitar_a_texto(estructura, enunciado_texto)

        yield f"data: {json.dumps({'type': 'progress', 'text': '✓ Análisis completado'})}\n\n"
        yield f"data: {json.dumps({'type': 'result', **estructura.model_dump()})}\n\n"

        # ── Segunda llamada, independiente: extraer el ejemplo tal cual del enunciado ──
        yield f"data: {json.dumps({'type': 'progress', 'text': '⏳ Buscando el ejemplo del enunciado...'})}\n\n"

        result_holder_ejemplo = {}
        error_holder_ejemplo = {}

        def call_ollama_ejemplo():
            try:
                response = ollama_chat(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_EJEMPLO},
                        {"role": "user", "content": enunciado_texto},
                    ],
                    format=EJEMPLO_SCHEMA,
                    options={"temperature": 0},
                )
                result_holder_ejemplo['content'] = response.message.content
            except Exception as e:
                error_holder_ejemplo['msg'] = str(e)

        thread_ejemplo = threading.Thread(target=call_ollama_ejemplo)
        thread_ejemplo.start()

        i = 0
        while thread_ejemplo.is_alive():
            yield f"data: {json.dumps({'type': 'progress', 'text': f'{dots[i % len(dots)]} Buscando el ejemplo...'})}\n\n"
            i += 1
            time.sleep(0.2)
            thread_ejemplo.join(timeout=0.2)

        if 'msg' in error_holder_ejemplo:
            yield f"data: {json.dumps({'type': 'error', 'message': error_holder_ejemplo['msg']})}\n\n"
            return

        raw_ejemplo = result_holder_ejemplo.get('content', '{}')

        try:
            ejemplo = EjemploEjercicio.model_validate_json(raw_ejemplo)
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Respuesta del modelo inválida (ejemplo): {e}'})}\n\n"
            return

        yield f"data: {json.dumps({'type': 'result_ejemplo', **ejemplo.model_dump()})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


# ══════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "ok", "ollama": OLLAMA_AVAILABLE, "model": MODEL}

@app.post("/analizar/enunciado/archivo")
async def analizar_enunciado_archivo(archivo: UploadFile = File(...)):
    contenido = await archivo.read()
    texto = extraer_texto_pdf_bytes(contenido)
    texto = _limpiar_diacriticos_rotos(texto)

    if not OLLAMA_AVAILABLE:
        raise HTTPException(status_code=503, detail="Ollama no disponible")

    response = ollama_chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_ANALISIS},
            {"role": "user", "content": texto},
        ],
        format=ESTRUCTURA_SCHEMA,
        options={"temperature": 0},
    )
    estructura = EstructuraEjercicio.model_validate_json(response.message.content)
    estructura = limitar_a_texto(estructura, texto)
    print(json.dumps(estructura.model_dump(), indent=2, ensure_ascii=False))


    response_ejemplo = ollama_chat(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_EJEMPLO},
            {"role": "user", "content": texto},
        ],
        format=EJEMPLO_SCHEMA,
        options={"temperature": 0},
    )
    ejemplo = EjemploEjercicio.model_validate_json(response_ejemplo.message.content)

    return {**estructura.model_dump(), **ejemplo.model_dump()}


@app.post("/generar/casos")
def generar_casos(req: GenerarCasosRequest):
    casos = generar_conjunto_de_pruebas(req.estructura)

    if req.entrada_ejemplo:
        casos.insert(0, {
            "perfiles": ["ejemplo_enunciado"],
            "input": req.entrada_ejemplo,
            "output_esperado": req.salida_ejemplo,
        })

    return {"casos": casos}

@app.post("/calcular/outputs")
#guarda fichero con nombre original en directorio temporal porque la extensión determina qué compilador se usa
async def calcular_outputs_endpoint(solucion: UploadFile = File(...), casos: str = Form(...)):
    casos_lista = json.loads(casos)
    contenido = await solucion.read()

    with tempfile.TemporaryDirectory() as tmp_dir:
        ruta_solucion = os.path.join(tmp_dir, solucion.filename)
        with open(ruta_solucion, "wb") as f:
            f.write(contenido)
        try:
            casos_lista = calcular_outputs(casos_lista, ruta_solucion)
        except (ValueError, RuntimeError) as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"casos": casos_lista}

@app.post("/juzgar/entrega")
async def juzgar_entrega_endpoint(
    codigo: UploadFile = File(...), casos: str = Form(...), tiempo_limite: float = Form(TIMEOUT_SEGUNDOS)
):
    casos_lista = json.loads(casos)
    contenido = await codigo.read()

    with tempfile.TemporaryDirectory() as tmp_dir:
        ruta_codigo = os.path.join(tmp_dir, codigo.filename)
        with open(ruta_codigo, "wb") as f:
            f.write(contenido)
        try:
            resultado = juzgar_entrega(casos_lista, ruta_codigo, tiempo_limite)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    return resultado




# ══════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    print("══════════════════════════════════════════")
    print("   LangForge Analizador de Enunciados      ")
    print(f"   Ollama disponible: {str(OLLAMA_AVAILABLE):<19}")
    print(f"   Modelo: {MODEL:<31}")
    print("   Escuchando en http://localhost:8001      ")
    print("══════════════════════════════════════════")
    uvicorn.run(app, host="0.0.0.0", port=8001)
