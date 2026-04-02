"use client";

import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import styles from "./dashProf.module.css";
import { asignaturasDe, totalAlumnosDe, totalEjerciciosDe } from "../../lib/mockData";

// toDo: id del profesor autenticado vendrá de la sesión
const PROFESOR_ID = 1;

const asignaturas = asignaturasDe(PROFESOR_ID).map((a) => ({
  ...a,
  alumnos:    totalAlumnosDe(a.id),
  ejercicios: totalEjerciciosDe(a.id),
}));

const totalEstudiantes = asignaturas.reduce((sum, a) => sum + a.alumnos, 0);
const totalEjercicios  = asignaturas.reduce((sum, a) => sum + a.ejercicios, 0);

// toDo: obtener del backend (análisis de errores frecuentes por ejercicio)
const erroresComunes = [
  { ejercicio: "Quick sort",     descripcion: "Condición incorrecta en loop",   porcentaje: 78, color: "#4d7cfe" },
  { ejercicio: "Quick sort",     descripcion: "No maneja duplicados",            porcentaje: 62, color: "#4d7cfe" },
  { ejercicio: "Factorial rec.", descripcion: "Caso base fallante",              porcentaje: 55, color: "#f0a500" },
  { ejercicio: "Torres Hanói",   descripcion: "Index out of bound",              porcentaje: 48, color: "#9b5fe0" },
  { ejercicio: "Búsqueda bin.",  descripcion: "Condición parada incorrecta",     porcentaje: 41, color: "#2ecc71" },
];

export default function DashboardProfesorPage() {
  const router = useRouter();
  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          {/* Aqui coger el nombre del profesor de quien inicia sesion */}
          <h1 className={styles.greeting}>Hola, Prof. García</h1>
          {/*las notificaciones no se implemetan de momento, se dejan para future work*/}
          <button className={styles.bellBtn} aria-label="Notificaciones">
            <span className={styles.bellIcon}>🔔</span>
            <span className={styles.bellBadge} />
          </button>
        </header>

        <div className={styles.content}>
          {/* Columna izquierda */}
          <div className={styles.leftCol}>

            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ backgroundColor: "rgba(77,124,254,0.15)" }}>
                  <span className={styles.statIcon}>👥</span>
                </div>
                <p className={styles.statLabel}>Total estudiantes</p>
                <p className={styles.statValue}>{totalEstudiantes}</p>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ backgroundColor: "rgba(240,165,0,0.15)" }}>
                  <span className={styles.statIcon}>&lt;/&gt;</span>
                </div>
                <p className={styles.statLabel}>Total ejercicios</p>
                <p className={styles.statValue}>{totalEjercicios}</p>
              </div>
            </div>

            {/* Asignaturas */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Asignaturas actuales</h2>
                <a href="/asignaturas" className={styles.seeAll}>Ver todas →</a>
              </div>
              <div className={styles.asignaturasGrid}>
                {/*Se usa una lambda función para un código más limpio.
                Por cada asignatura del array, se crea una tarjeta */}

                {/*Solo se muestran las 4 primeras asignaturas, si hay más se accede a través del enlace "Ver todas" */}
                {asignaturas.slice(0, 4).map((a) => (
                  <div key={a.id} className={styles.asignaturaCard} onClick={() => router.push(`/vistaAsignatura/${a.id}`)}>
                    <div
                      className={styles.asignaturaImg}
                      style={{ backgroundColor: a.color }}
                    >
                      <span className={styles.asignaturaImgIcon}>📚</span>
                    </div>
                    <div className={styles.asignaturaInfo}>
                      <p className={styles.asignaturaNombre}>{a.nombre}</p>
                      <p className={styles.asignaturaInfo}>{a.alumnos} alumnos</p>
                      <p className={styles.asignaturaInfo}>{a.ejercicios} ejercicios</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Columna derecha — Errores */}
          <div className={styles.rightCol}>
            <div className={styles.erroresCard}>
              <h2 className={styles.erroresTitle}>Errores más comunes<br />por ejercicio</h2>
              <div className={styles.erroresList}>
                {erroresComunes.map((e, i) => (
                  <div key={i} className={styles.errorItem}>
                    <div className={styles.errorTop}>
                      <span
                        className={styles.errorEjercicio}
                        style={{ backgroundColor: e.color }}
                      >
                        {e.ejercicio}
                      </span>
                      <span className={styles.errorDesc}>{e.descripcion}</span>
                      <span className={styles.errorPct}>{e.porcentaje}%</span>
                    </div>
                    <div className={styles.errorBarBg}>
                      <div
                        className={styles.errorBarFill}
                        style={{ width: `${e.porcentaje}%`, backgroundColor: e.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <a href="/estadisticas" className={styles.verAnalisis}>Ver análisis detallado</a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
