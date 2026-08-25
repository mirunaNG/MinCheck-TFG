"use client";

import { useState } from "react";
import Sidebar from "../../components/sidebar";
import VisualizadorTrace from "../../components/visualizador";
import { TraceOPT } from "../../lib/opt";
import styles from "./visualizarEstructuraLibre.module.css";

export default function VisualizarEstructuraLibre() {
  const [codigo, setCodigo] = useState("");
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [lenguaje, setLenguaje] = useState<"c" | "cpp">("cpp");
  const [generando, setGenerando] = useState(false);
  const [trace, setTrace] = useState<TraceOPT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entrada, setEntrada] = useState("");

  function handlerArchivo(file: File) {
    setArchivoNombre(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") setCodigo(e.target.result);
    };
    reader.readAsText(file);
  }

  async function handlerVisualizar() {
    if (!codigo.trim()) return;
    setGenerando(true);
    setError(null);
    setTrace(null);

    try {
      const form = new FormData();
      const blob = new Blob([codigo], { type: "text/plain" });
      form.append("codigo", blob, archivoNombre ?? `solucion.${lenguaje}`);
      form.append("lenguaje", lenguaje);
      form.append("entrada", entrada);


      const res = await fetch("http://localhost:8001/visualizar/entrega", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("No se pudo generar la visualización");
      const data: TraceOPT = await res.json();
      setTrace(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />
      <main className={styles.main}>
        <div className={styles.encabezado}>
          <h1 className={styles.titulo}>VISUALIZAR ESTRUCTURA DE DATOS</h1>
          <p className={styles.subtitulo}>
            Escribe o sube un código en C/C++ para ver paso a paso cómo evolucionan sus variables.
          </p>
          <p className={styles.subtitulo} style={{ fontSize: "0.85em", opacity: 0.85 }}>
             ⚠️ Este visualizador funciona mejor con variables ya inicializadas en el código. No
             admite entrada por <code>cin</code> ni muestra <code>cout</code> en tiempo real: si tu
             función lee de <code>cin</code>, sustitúyela por valores literales antes de visualizar. Ejemplo:
           </p>
           <pre style={{ fontSize: "0.8em", opacity: 0.85, whiteSpace: "pre-wrap" }}>
 {`int main(){
     int n;
     n = 5;
     n = n + 5;
     return 0;
 }`}
           </pre>
        </div>

        <div className={styles.contenido}>
          <div className={styles.codigoCard}>
            <div className={styles.filaOpciones}>
              <label className={styles.botonSubir}>
                Subir archivo 📄
                <input
                  type="file"
                  accept=".c,.cpp,.cc"
                  className={styles.archivodeEntrada}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlerArchivo(f);
                  }}
                />
              </label>

              <select
                className={styles.selectorLenguaje}
                value={lenguaje}
                onChange={(e) => setLenguaje(e.target.value as "c" | "cpp")}
              >
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>

            {archivoNombre && (
              <div className={styles.seccionArchivoSubido}>
                <span>📄</span>
                <span className={styles.archivoNombre}>{archivoNombre}</span>
                <button
                  className={styles.botonEliminarArchivo}
                  onClick={() => { setArchivoNombre(null); setCodigo(""); }}
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
              rows={10}
              spellCheck={false}
            />
            {/* <textarea
              className={styles.codigoTextarea}
              placeholder="Entrada estándar (stdin) — opcional, una línea por cada lectura de cin"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              rows={4}
              spellCheck={false}
            /> */}
            
            <div className={styles.grupoGenerar}>
              <button
                className={styles.botonGenerar}
                onClick={handlerVisualizar}
                disabled={!codigo.trim() || generando}
              >
                {generando ? "GENERANDO..." : "VISUALIZAR"}
              </button>
            </div>
            {error && <span className={styles.mensajeError}>{error}</span>}
          </div>

          {trace && <VisualizadorTrace trace={trace} />}
        </div>
      </main>
    </div>
  );
}
