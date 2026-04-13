"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import styles from "../vistaAsignaAlumno.module.css";
import {asignaturas, temasDe, ejercicios, entregas, alumnosDe, ejerciciosCompletados} from "../../../lib/mockData";

const ALUMNO_ID = 2;

export default function VistaAsignaturaAlumno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const asignaturaId = Number(id);

  const asignatura = asignaturas.find((a) => a.id === asignaturaId);

  if (!asignatura) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="alumno" />
        <main className={styles.main}>
          <p style={{ padding: 40, color: "#8b949e", textAlign: "center" }}>
            Asignatura no encontrada.
          </p>
        </main>
      </div>
    );
  }

  const temas = temasDe(asignaturaId);

  const ranking = alumnosDe(asignaturaId)
    .map((a) => ({
      id: a.id,
      nombre: a.nombreCompleto,
      completados: ejerciciosCompletados(a.id, asignaturaId),
    }))
    .sort((a, b) => b.completados - a.completados);

  const temasConEjercicios = temas.map((tema) => {
    const ejerciciosTema = ejercicios.filter((e) => e.temaId === tema.id);
    const ejerciciosConEstado = ejerciciosTema.map((ej) => {
      const entregasAlumno = entregas
        .filter((en) => en.alumnoId === ALUMNO_ID && en.ejercicioId === ej.id)
        .sort((a, b) => a.id - b.id);
      const ultima = entregasAlumno[entregasAlumno.length - 1] ?? null;
      return {
        ...ej,
        estado: (ultima?.resultado ?? "pendiente") as
          | "correcto"
          | "incorrecto"
          | "pendiente",
        intentos: ultima?.intentos ?? 0,
      };
    });
    const resueltos = ejerciciosConEstado.filter(
      (e) => e.estado === "correcto"
    ).length;
    return {
      ...tema,
      ejercicios: ejerciciosConEstado,
      resueltos,
      total: ejerciciosTema.length,
    };
  });

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />

      <main className={styles.main}>
        <h1 className={styles.titulo}>{asignatura.nombre.toUpperCase()}</h1>

        <div className={styles.contenido}>
          <div className={styles.columnaIzquierda}>
            {temasConEjercicios.map((tema) => (
              <section key={tema.id} className={styles.seccionTema}>
                <div className={styles.encabezadoTema}>
                  <span
                    className={styles.circuloTema}
                    style={{ backgroundColor: tema.color }}
                  />
                  <span className={styles.nombreTema}>
                    TEMA {tema.nombre.toUpperCase()}
                  </span>
                  <div className={styles.barraProg}>
                    <div
                      className={styles.barraRelleno}
                      style={{
                        width: `${tema.total > 0 ? (tema.resueltos / tema.total) * 100 : 0}%`,
                        backgroundColor: tema.color,
                      }}
                    />
                  </div>
                  <span className={styles.fraccionProg}>
                    {tema.resueltos}/{tema.total}
                  </span>
                </div>

                <hr className={styles.separador} />

                <div className={styles.ejerciciosGrid}>
                  {tema.ejercicios.map((ej) => (
                    <div
                      key={ej.id}
                      className={styles.ejercicioCard}
                      style={{
                        borderLeft: `4px solid ${
                          ej.estado === "correcto"
                            ? "#4caf50"
                            : ej.estado === "incorrecto"
                            ? "#f44336"
                            : "#e38500"
                        }`,
                      }}
                    >
                      <span className={styles.cardNombre}>{ej.nombre}</span>
                      <span
                        className={styles.cardEstado}
                        style={{
                          color:
                            ej.estado === "correcto"
                              ? "#4caf50"
                              : ej.estado === "incorrecto"
                              ? "#f44336"
                              : "#e38500",
                        }}
                      >
                        {ej.estado === "correcto"
                          ? "✓ resuelto"
                          : ej.estado === "incorrecto"
                          ? "✗ incorrecto"
                          : "⏱ pendiente"}
                      </span>
                      <div className={styles.cardPie}>
                        {ej.intentos > 0 && (
                          <span className={styles.intentos}>
                            {ej.intentos} intento{ej.intentos !== 1 ? "s" : ""}
                          </span>
                        )}
                        {ej.estado !== "correcto" && (
                          <button
                            className={
                              ej.estado === "incorrecto"
                                ? styles.botonReintentar
                                : styles.botonIntentar
                            }
                            onClick={() => router.push(`/intentarEjercicio/${ej.id}`)}
                          >
                            {ej.estado === "incorrecto"
                              ? "REINTENTAR →"
                              : "intentar →"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className={styles.columnaDerecha}>
            <div className={styles.rankingCard}>
              <h3 className={styles.rankingTitulo}>RANKING DE LA CLASE</h3>
              <ul className={styles.rankingLista}>
                {ranking.map((alumno, i) => (
                  <li
                    key={alumno.id}
                    className={`${styles.rankingItem} ${
                      alumno.id === ALUMNO_ID ? styles.rankingYo : ""
                    }`}
                  >
                    {i + 1}. {alumno.nombre}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
