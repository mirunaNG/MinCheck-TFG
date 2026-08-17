"use client";

import { useState } from "react";
import Sidebar from "../../components/sidebar";
import styles from "./generador.module.css";

type CasoPrueba = {
  id: number;
  input: string;
  outputEsperado: string;
};

export default function GeneradorCasos() {
  const [enunciado, setEnunciado] = useState<File | null>(null);
  const [codigo, setCodigo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [casos, setCasos] = useState<CasoPrueba[]>([]);
  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlerEnunciado(file: File) {
    setEnunciado(file);
  }

  function handlerArchivo(file: File) {
    setArchivo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") setCodigo(e.target.result);
    };
    reader.readAsText(file);
  }

  async function handlerGenerar() {
    if (!enunciado || (!codigo.trim() && !archivo)) return;
    setGenerando(true);
    setGenerado(false);
    setError(null);

    try {
      // Analizar el enunciado para sacar su estructura y el ejemplo que trae
      const formEnunciado = new FormData();
      formEnunciado.append("archivo", enunciado, enunciado.name);
      const resEstructura = await fetch("http://localhost:8001/analizar/enunciado/archivo", {
        method: "POST",
        body: formEnunciado,
      });
      if (!resEstructura.ok) throw new Error("No se ha podido analizar el enunciado");
      const analisis = await resEstructura.json();
      const { entrada_ejemplo, salida_ejemplo, ...estructura } = analisis;

      // Generar los casos de prueba a partir de esa estructura
      const resCasos = await fetch("http://localhost:8001/generar/casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estructura,
          entrada_ejemplo,
          salida_ejemplo,
        }),
      });
      if (!resCasos.ok) throw new Error("No se han podido generar los casos de prueba");
      const data: { casos: { perfiles: string[]; input: string; output_esperado?: string }[] } =
        await resCasos.json();

      // Se ejecuta el código contra cada input para obtener el output real.
      // Se usa el archivo si hay uno adjunto; si no, el texto escrito a mano.
      let casosConOutput = data.casos;
      if (archivo || codigo.trim()) {
        const formSolucion = new FormData();
        if (archivo) {
          formSolucion.append("solucion", archivo, archivo.name);
        } else {
          const blob = new Blob([codigo], { type: "text/plain" });
          formSolucion.append("solucion", blob, "solucion.cpp");
        }
        formSolucion.append("casos", JSON.stringify(data.casos));
        const resOutputs = await fetch("http://localhost:8001/calcular/outputs", {
          method: "POST",
          body: formSolucion,
        });
        if (resOutputs.ok) {
          const outputsData: { casos: { perfiles: string[]; input: string; output_esperado?: string }[] } =
            await resOutputs.json();
          casosConOutput = outputsData.casos;
        }
      }



      setCasos(
        casosConOutput.map((c, i) => ({
          id: Date.now() + i,
          input: c.input,
          outputEsperado: c.output_esperado ?? "(sin calcular todavía)",
        }))
      );
      setGenerado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error generando los casos de prueba");
    } finally {
      setGenerando(false);
    }
  }

  function handlerEliminarCaso(id: number) {
    setCasos((prev) => prev.filter((c) => c.id !== id));
  }

  function handlerDescargar() {
    const contenido = casos.map((c) => `${c.input}\n${c.outputEsperado}`).join("\n\n");
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(contenido);
    a.download = "casos_generados.txt";
    a.click();
  }

  // Solo puede pulsar Generar si hay enunciado, código o archivo subido, y no está generando ya
  const puedeGenerar = enunciado !== null && (codigo.trim().length > 0 || archivo !== null) && !generando;

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>
        <div className={styles.encabezado}>
          <h1 className={styles.titulo}>GENERADOR DE CASOS DE PRUEBA</h1>
          <p className={styles.subtitulo}>
            En esta pestaña puedes subir un código y MinCheck te generará un set de casos de prueba incluyendo
            contraejemplos mínimos, casos límite, etc...
          </p>
        </div>

        <div className={styles.contenido}>
          {/*Tarjeta del enunciado */}
          <div className={styles.codigoCard}>
            <h2 className={styles.codigoCardTitulo}>Sube el enunciado del ejercicio (PDF)</h2>

            <div>
              <label className={styles.botonSubir}>
                Subir enunciado 📄
                <input
                  type="file"
                  accept=".pdf"
                  className={styles.archivodeEntrada}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlerEnunciado(f);
                  }}
                />
              </label>
            </div>

            {enunciado && (
              <div className={styles.seccionArchivoSubido}>
                <span>📄</span>
                <span className={styles.archivoNombre}>{enunciado.name}</span>
                <button
                  className={styles.botonEliminarArchivo}
                  onClick={() => setEnunciado(null)}
                  title="Eliminar enunciado"
                >
                  🗑
                </button>
              </div>
            )}
          </div>

          {/*Tarjeta de código */}
          <div className={styles.codigoCard}>
            <h2 className={styles.codigoCardTitulo}>Sube aquí tu código o escríbelo directamente</h2>

            <div>
              <label className={styles.botonSubir}>
                Subir archivo 📄
                <input
                  type="file"
                  accept=".cpp,.cc"
                  className={styles.archivodeEntrada}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlerArchivo(f);
                  }}
                />
              </label>

            </div>

            {archivo && (
              <div className={styles.seccionArchivoSubido}>
                <span>📄</span>
                <span className={styles.archivoNombre}>{archivo.name}</span>
                <button
                  className={styles.botonEliminarArchivo}
                  onClick={() => { setArchivo(null); setCodigo(""); }}
                  title="Eliminar archivo"
                >
                  🗑
                </button>
              </div>
            )}

            <textarea
              className={styles.codigoTextarea}
              placeholder="Escribe aquí tu código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              rows={8}
              spellCheck={false}
            />
          </div>

          <div className={styles.grupoGenerar}>
            <button
              className={styles.botonGenerar}
              onClick={handlerGenerar}
              disabled={!puedeGenerar}
            >
              {generando ? "GENERANDO..." : "GENERAR"}
            </button>
          </div>
          { generando && (<span>Analizando enunciado y código, y generando casos de prueba...</span>) }
          { !generando && !enunciado && <span className={styles.avisoEnunciado}>Sube el enunciado en PDF para poder generar casos</span> }
          { error && <span className={styles.mensajeError}>{error}</span> }

          {generado && casos.length > 0 && (
            <div className={styles.seccionCasos}>
              <div className={styles.encabezadoResultados}>
                <h2 className={styles.resultadosTitulo}>
                  CASOS DE PRUEBA GENERADOS
                </h2>
                <button className={styles.botonDescargar} onClick={handlerDescargar}>
                  ⬇ Descargar
                </button>
              </div>

              {casos.map((caso, i) => (
                <div key={caso.id} className={styles.casoCard}>
                  <div className={styles.casoTitulo}>
                    <span>Caso {i + 1}</span>
                    <button
                      className={styles.botonEliminarCaso}
                      onClick={() => handlerEliminarCaso(caso.id)}
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                  <div className={styles.casoIO}>
                    <div className={styles.casoIOBloque}>
                      <span className={styles.etiquetaCasoIO}>INPUT</span>
                      <pre className={styles.contenidoCasoIO}>{caso.input}</pre>
                    </div>
                    <div className={styles.casoIOBloque}>
                      <span className={styles.etiquetaCasoIO}>OUTPUT ESPERADO</span>
                      <pre className={styles.contenidoCasoIO}>
                        {caso.outputEsperado}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
