"use client";

import { useState, useMemo } from "react";
import { TraceOPT, formatearValorOPT } from "../lib/opt";
import styles from "./visualizador.module.css";

export default function VisualizadorTrace({ trace }: { trace: TraceOPT }) {
  const [pasoActual, setPasoActual] = useState(0);

  const pasos = trace.trace;
  const paso = pasos[pasoActual];
  const lineasCodigo = useMemo(() => trace.code.split("\n"), [trace.code]);

  if (pasos.length === 0) {
    return <p className={styles.aviso}>No hay pasos para mostrar.</p>;
  }

  const esError = paso.event === "uncaught_exception";

  return (
    <div className={styles.contenedor}>
      <div className={styles.panelCodigo}>
        <pre className={styles.codigo}>
          {lineasCodigo.map((linea, i) => (
            <div
              key={i}
              className={`${styles.lineaCodigo} ${
                i + 1 === paso.line ? styles.lineaActual : ""
              }`}
            >
              <span className={styles.numeroLinea}>{i + 1}</span>
              <span>{linea}</span>
            </div>
          ))}
        </pre>
      </div>

      <div className={styles.panelEstado}>
        <div className={styles.controles}>
          <button onClick={() => setPasoActual(0)} disabled={pasoActual === 0}>
            ⏮ Primero
          </button>
          <button
            onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
            disabled={pasoActual === 0}
          >
            ◀ Anterior
          </button>
          <span className={styles.contadorPaso}>
            Paso {pasoActual + 1} de {pasos.length}
          </span>
          <button
            onClick={() => setPasoActual((p) => Math.min(pasos.length - 1, p + 1))}
            disabled={pasoActual === pasos.length - 1}
          >
            Siguiente ▶
          </button>
          <button
            onClick={() => setPasoActual(pasos.length - 1)}
            disabled={pasoActual === pasos.length - 1}
          >
            Último ⏭
          </button>
        </div>

        {esError ? (
          <div className={styles.error}>
            <strong>Error:</strong>
            <pre>{paso.exception_msg}</pre>
          </div>
        ) : (
          <>
            <div className={styles.seccion}>
              <h3 className={styles.tituloSeccion}>Pila de llamadas</h3>
              {paso.stack_to_render.length === 0 && (
                <p className={styles.aviso}>Sin frames activos.</p>
              )}
              {paso.stack_to_render.map((frame) => (
                <div
                  key={frame.frame_id}
                  className={`${styles.frame} ${
                    frame.is_highlighted ? styles.frameActivo : ""
                  }`}
                >
                  <div className={styles.frameNombre}>{frame.func_name}</div>
                  {frame.ordered_varnames.length === 0 ? (
                    <p className={styles.sinVariables}>Sin variables locales</p>
                  ) : (
                    <table className={styles.tablaVariables}>
                      <tbody>
                        {frame.ordered_varnames.map((nombre) => (
                          <tr key={nombre}>
                            <td className={styles.nombreVariable}>{nombre}</td>
                            <td className={styles.valorVariable}>
                              {frame.encoded_locals[nombre]
                                ? formatearValorOPT(frame.encoded_locals[nombre])
                                : "?"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.seccion}>
              <h3 className={styles.tituloSeccion}>Salida (stdout)</h3>
              <pre className={styles.stdout}>{paso.stdout || "(vacío)"}</pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
