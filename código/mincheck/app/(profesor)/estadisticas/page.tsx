"use client";

import Sidebar from "../../components/sidebar";
import styles from "./estadisticas.module.css";

export default function PaginaEstadisticas() {
  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.titulo}>Estadísticas</h1>
        </header>

        <div className={styles.proximamente}>
          <span className={styles.icono}>📊</span>
          <h2 className={styles.proximamenteTitulo}>Próximamente</h2>
          <p className={styles.proximamenteDesc}>
            Las estadísticas detalladas de cada asignatura estarán disponibles en una versión futura de MinCheck.
          </p>
        </div>
      </main>
    </div>
  );
}
