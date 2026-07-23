"use client";

import { use } from "react";
import Sidebar from "../../../components/sidebar";
import styles from "../visualizarEstructura.module.css";

export default function VisualizarEstructura({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />
      <main className={styles.main}>
        <div className={styles.proximamente}>
          <span className={styles.icono}>🧩</span>
          <h2 className={styles.proximamenteTitulo}>Próximamente</h2>
          <p className={styles.proximamenteDesc}>
            Aquí podrás visualizar paso a paso cómo evolucionan las estructuras de datos de tu código para el ejercicio {id}, integrando PythonTutor.
          </p>
        </div>
      </main>
    </div>
  );
}
