"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import styles from "../vistaAsignaAlumno.module.css";

type Asignatura = {
  id: number;
  nombre: string;
  color: string;
};

type EjercicioConEstado = {
  id: number;
  nombre: string;
  estado: "correcto" | "incorrecto" | "pendiente";
  intentos: number;
};

type TemaConEjercicios = {
  id: number;
  nombre: string;
  color: string;
  ejercicios: EjercicioConEstado[];
  resueltos: number;
  total: number;
};

type AlumnoRanking = {
  id: number;
  nombreCompleto: string;
  completados: number;
};


export default function VistaAsignaturaAlumno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [asignatura, setAsignatura] = useState<Asignatura | null>(null);
  const [temas, setTemas] = useState<TemaConEjercicios[]>([]);
  const [ranking, setRanking] = useState<AlumnoRanking[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const idGuardado = localStorage.getItem("id");
    if (!idGuardado) return;

    const alumnoId = Number(idGuardado);
    setAlumnoId(alumnoId);

    Promise.all([
      fetch('http://localhost:5001/asignatura/' + id),
      fetch('http://localhost:5001/asignatura/' + id + '/alumno/' + alumnoId + '/temas'),
      fetch('http://localhost:5001/asignatura/' + id + '/alumnos'),
    ])
      .then(async ([resultadoAsignatura, resultadoTema, resultadoRank]) => {
        const datosAsignatura = await resultadoAsignatura.json();
        const datosTemas = await resultadoTema.json();
        const datosRanking = await resultadoRank.json();
        setAsignatura(datosAsignatura);
        setTemas(datosTemas);
        setRanking(
          [...datosRanking.alumnos].sort((a: AlumnoRanking, b: AlumnoRanking) => b.completados - a.completados)
        );
        setCargando(false);
      });
  }, [id]);

  if (cargando) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="alumno" />
        <main className={styles.main}>
          <p style={{ padding: 40, color: "#8b949e", textAlign: "center" }}>Cargando...</p>
        </main>
      </div>
    );
  }

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

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />

      <main className={styles.main}>
        <h1 className={styles.titulo}>{asignatura.nombre.toUpperCase()}</h1>

        <div className={styles.contenido}>
          <div className={styles.columnaIzquierda}>
            {temas.length === 0 && (
              <p style={{ color: "#8b949e", padding: "20px 0" }}>
                Aún no hay temas subidos en esta asignatura.
              </p>
            )}
            {temas.map((tema) => (
              <section key={tema.id} className={styles.seccionTema}>
                <div className={styles.encabezadoTema}>
                  <span
                    className={styles.circuloTema}
                    style={{ backgroundColor: tema.color }}
                  />
                  <span className={styles.nombreTema}>
                   TEMA: {tema.nombre.toUpperCase()}
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
                  {tema.ejercicios.length === 0 && (
                    <p style={{ color: "#8b949e", fontSize: "13px" }}>
                      Aún no hay ejercicios en este tema.
                    </p>
                  )}
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
                      alumno.id === alumnoId ? styles.rankingYo : ""
                    }`}
                  >
                    {i + 1}. {alumno.nombreCompleto}
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
