"use client";

import { use, useState } from "react";
import Link from "next/link";
import Sidebar from "../../../components/sidebar";
import Tabla from "../../../components/Tabla";
import styles from "../vistaAsigProf.module.css";
import { asignaturas, alumnosDe, ejerciciosCompletados, totalEjerciciosDe, ultimasEntregasDe } from "../../../lib/mockData";

export default function VistaAsignaturaProfesor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const asignaturaId = Number(id);

  const asignatura = asignaturas.find((a) => a.id === asignaturaId);
  const [verTodosAlumnos, setVerTodosAlumnos] = useState(false);

  {/*Si la asignatura no existe, muestra mensaje de error */}
  if (!asignatura) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="profesor" />
        <main className={styles.main}>
          <p className={styles.notFound}>Asignatura no encontrada.</p>
        </main>
      </div>
    );
  }

  const alumnos = alumnosDe(asignaturaId);
  const totalEjercicios = totalEjerciciosDe(asignaturaId);
  const ultimas = ultimasEntregasDe(asignaturaId);
  const codigo = asignatura.codigoAsignatura;

  {/*Función para copiar el código de la asignatura al portapapeles */}
  function copiarCodigo() {
    navigator.clipboard.writeText(codigo);
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>

        {/* Banner de la asignatura */}
        <div className={styles.banner} style={{ backgroundColor: asignatura.color }}>
          <div>
            <div className={styles.iconoBanner}>📚</div>
            <div>
              <h1 className={styles.bannerNombre}>{asignatura.nombre}</h1>
              <p className={styles.bannerCurso}>curso {asignatura.curso}</p>
            </div>
          </div>
          <div className={styles.bannerCodigo}>
            código: <span className={styles.codigoValor}>#{codigo}</span>
            <button
              className={styles.copiarBtn}
              onClick={copiarCodigo}
              aria-label="Copiar código"
              title="Copiar código"
            >
              📋
            </button>
          </div>
        </div>

        <div className={styles.contenidoPagina}>
          {/* Columna izquierda */}
          <div className={styles.columnaIzquierda}>

            {/* Alumnos apuntados*/}
            <div className={styles.card}>
              <div className={styles.cardEncabezado}>
                <h2 className={styles.tituloCard}>Alumnos matriculados</h2>
                <button className={styles.botonVerTodos} onClick={() => setVerTodosAlumnos(!verTodosAlumnos)}>
                  {verTodosAlumnos ? "Ver menos ↑" : "Ver todos →"}
                </button>
              </div>
              <ul className={styles.listaAlumnos}>
                {(verTodosAlumnos ? alumnos : alumnos.slice(0, 4)).map((a) => (
                  <li key={a.id} className={styles.filaAlumno}>
                    <div className={styles.alumnoAvatar} />
                    <span className={styles.alumnoNombre}>{a.nombreCompleto}</span>
                    <span className={styles.alumnoProgreso}>
                      {ejerciciosCompletados(a.id, asignaturaId)}/{totalEjercicios} ejercicios completados
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Últimas entregas */}
              <h2 className={styles.tituloCard}>Últimas entregas</h2>
              <Tabla columnas={["Alumno", "Ejercicio", "Fecha/Hora", "Estado", "Revisar"]}>
                  {ultimas.map((e) => (
                    <tr key={e.id}>
                      <td>{e.alumno}</td>
                      <td>{e.ejercicio}</td>
                      <td>{e.fechaHora}</td>
                      <td>
                        <span
                          className={styles.marcaEstado}
                          style={{ backgroundColor: e.correcto ? "#4caf50" : "#f44336" }}
                        />
                      </td>
                      <td>
                        {/*toDo: implementar que muestre el código del alumno, sacado de la BBDD */}
                        <button className={styles.linkAlCodigo}>código →</button>
                      </td>
                    </tr>
                  ))}
              </Tabla>
          </div>

          {/* Columna derecha */}
          <div className={styles.columnaDerecha}>
            <Link href={`/gestionMaterial/${asignaturaId}`} className={styles.botonGestionMaterial}>Temas y ejercicios</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
