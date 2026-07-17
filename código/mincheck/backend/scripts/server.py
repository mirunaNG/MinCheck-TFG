"""
LangForge — Servidor de análisis de enunciados
Ejecutar: python server.py
Puerto:   8001
"""

from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import re
import time


import pdfplumber
from generador import generar_entrada  # añadir junto a los demás imports de arriba




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
    num_casos_por_input: int = 1
    cuantos_inputs: int = 5


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
    },
    "required": ["nombre", "tipo", "minimo", "maximo", "salto",
                 "longitud_minima", "longitud_maxima", "longitud_referencia"],
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
SYSTEM_ANALISIS = """
You are an expert in programming judges (online judges like DOMjudge or AceptaElReto). You analyze
exercise statements to extract the STRUCTURE of their input — not concrete test data. That structure
will later be used by a separate program to generate as many test cases as needed and to validate
student submissions, so it must be precise and complete.

You will receive the statement of a programming exercise. Your task is to fill in:

1. "tipo_lectura": how a solving program must read the input, choosing exactly one of:
   - "centinela": reading stops when a specific value is found, even if that value is carried by a field
     that also states a case's size or count.
   - "numCasos": a single number, read ONCE before any test case, states the total number of cases.
   - "ilimitado": input is read until end-of-file, with no count and no stop value.
   Base this strictly on the "Entrada" section of the statement, not assumptions.

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

Rules:
Rules:
- For ANY field, scalar or vector, never assume "minimo", "maximo", "salto", "longitud_minima" or
  "longitud_maxima" from what the type conventionally implies. Use a value only if the statement gives
  an explicit limit; otherwise leave it null.
- If "longitud_referencia" is set for a field, "longitud_minima" and "longitud_maxima" for that same
  field MUST be null — a length is stated either by a reference field or by explicit bounds, never both.
- Do NOT generate example values, sample inputs, or outputs — only describe the structure.
- A field's "tipo" depends on how its value is used (numeric operations vs. text), not on how it is
  displayed (leading zeros, fixed decimals, separators). Use "cadena" only when the value is non-numeric
  or never used arithmetically.
- Return ONLY valid JSON matching the requested schema.
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

def _numeros_en_texto(texto: str) -> set:
    numeros = set()
    for grupo in re.findall(r"\d{1,3}(?:[.,]\d{3})+", texto):
        numeros.add(int(re.sub(r"[.,]", "", grupo)))
    for suelto in re.findall(r"\d+", texto):
        numeros.add(int(suelto))
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

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


# ══════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════

@app.get("/health")
def health():
    return {"status": "ok", "ollama": OLLAMA_AVAILABLE, "model": MODEL}


@app.post("/analizar/enunciado")
def analizar_enunciado(req: AnalizarEnunciadoRequest):
    if req.enunciado_texto:
        texto = req.enunciado_texto
    elif req.ruta_pdf:
        texto = extraer_texto_pdf(req.ruta_pdf)
    else:
        raise HTTPException(status_code=400, detail="Debes indicar 'enunciado_texto' o 'ruta_pdf'")

    return StreamingResponse(
        stream_analisis(texto, req.tipo_forzado),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )

@app.post("/generar/casos")
def generar_casos(req: GenerarCasosRequest):
    return {
        "inputs": [
            generar_entrada(req.estructura, req.num_casos_por_input)
            for _ in range(req.cuantos_inputs)
        ]
    }

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
