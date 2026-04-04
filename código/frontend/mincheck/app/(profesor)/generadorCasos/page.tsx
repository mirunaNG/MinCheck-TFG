"use client";

import { useState } from "react";
import Sidebar from "../../components/sidebar";
import styles from "./generador.module.css";
import { CasoPrueba, casosDe } from "../../lib/mockData";

// ID del ejercicio de prueba (factorial), luego se generará con la lógica analizando el código
const MOCK_EJERCICIO_ID = 1;

export default function GeneradorCasos() {
  const [codigo, setCodigo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [casos, setCasos] = useState<CasoPrueba[]>([]);
  const [generando, setGenerando] = useState(false);
  const [generado, setGenerado]  = useState(false);

  function handlerArchivo(file: File) {
    setArchivo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") setCodigo(e.target.result);
    };
    reader.readAsText(file);
  }

  function handlerGenerar() {
    if (!codigo.trim() && !archivo) return;
    setGenerando(true);
    setGenerado(false);
    // Simula llamada al backend
    setTimeout(() => {
      const mockCasos = casosDe(MOCK_EJERCICIO_ID);
      setCasos(mockCasos);
      setGenerando(false);
      setGenerado(true);
    }, 1200);
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

  // Solo puede pulsar Generar si hay código o archivo subido y no está generando ya 
  const puedeGenerar = (codigo.trim().length > 0 || archivo !== null) && !generando;

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
          {/*Tarjeta de código */}
          <div className={styles.codigoCard}>
            <h2 className={styles.codigoCardTitulo}>Sube aquí tu código o escríbelo directamente</h2>

            <div>
              <label className={styles.botonSubir}>
                Subir archivo 📄
                <input
                  type="file"
                  accept=".java,.c,.cpp,.py,.txt"
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
          { generando && (<span>Analizando código y generando casos de prueba...</span>) }

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
