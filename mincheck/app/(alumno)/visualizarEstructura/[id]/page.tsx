"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar";
import VisualizadorTrace from "../../../components/visualizador";
import { TraceOPT } from "../../../lib/opt";
import styles from "../visualizarEstructura.module.css";

export default function VisualizarEstructura({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trace, setTrace] = useState<TraceOPT | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    fetch(`http://localhost:5001/entrega/${id}/visualizacion`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo generar la visualización");
        return r.json();
      })
      .then((data: TraceOPT) => setTrace(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Error desconocido"))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />
      <main className={styles.main}>
        {cargando && <p className={styles.aviso}>⏳ Generando visualización...</p>}
        {error && <p className={styles.mensajeError}>{error}</p>}
        {trace && <VisualizadorTrace trace={trace} />}
      </main>
    </div>
  );
}
