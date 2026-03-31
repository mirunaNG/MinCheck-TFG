"use client";

import { use, useState } from "react";
import Sidebar from "../../sidebar/sidebar";
import styles from "../vistaAsigProf.module.css";

/**
 * Datos de EJEMPLO. toDo: obtener del backend por id de asignatura.
 */
const asignaturasEjemplo: Record<string, Asignatura> = {
  "1": {
    id: 1,
    nombre: "Fundamentos de la Algoritmia",
    curso: "2025-2026",
    codigo: "458C3",
    color: "#2a3a5a",
    alumnos: [
      { id: 1, nombre: "García, Alejandro",  ejerciciosCompletados: 10, totalEjercicios: 12 },
      { id: 2, nombre: "Martínez, Elena",    ejerciciosCompletados: 8,  totalEjercicios: 12 },
      { id: 3, nombre: "Torres, Roberto",    ejerciciosCompletados: 4,  totalEjercicios: 12 },
      { id: 4, nombre: "Zorita, Miguel",     ejerciciosCompletados: 4,  totalEjercicios: 12 },
      { id: 5, nombre: "López, Carmen",      ejerciciosCompletados: 11, totalEjercicios: 12 },
      { id: 6, nombre: "Ruiz, Andrés",       ejerciciosCompletados: 7,  totalEjercicios: 12 },
      { id: 7, nombre: "Fernández, Sofía",   ejerciciosCompletados: 2,  totalEjercicios: 12 },
      { id: 8, nombre: "Sánchez, Pablo",     ejerciciosCompletados: 9,  totalEjercicios: 12 },
    ],
    ultimasEntregas: [
      { id: 1, alumno: "Elena Díaz",     ejercicio: "El problema de la mochila", fechaHora: "Hoy, 14:30",   correcto: true  },
      { id: 2, alumno: "Miguel Martínez",ejercicio: "Árboles binarios",          fechaHora: "Hoy, 10:00",   correcto: false },
      { id: 3, alumno: "Ana López",      ejercicio: "Factorial recursivo",       fechaHora: "Ayer, 18:45",  correcto: false },
      { id: 4, alumno: "Pablo Gómez",    ejercicio: "El problema de la mochila", fechaHora: "Ayer, 10:45",  correcto: true  },
    ],
  },
  "2": {
    id: 2,
    nombre: "Estructuras de datos",
    curso: "2025-2026",
    codigo: "DAT002",
    color: "#1a3a4a",
    alumnos: [
      { id: 1, nombre: "López, Carmen",    ejerciciosCompletados: 9, totalEjercicios: 10 },
      { id: 2, nombre: "Ruiz, Andrés",     ejerciciosCompletados: 7, totalEjercicios: 10 },
      { id: 3, nombre: "Navarro, Sofía",   ejerciciosCompletados: 5, totalEjercicios: 10 },
    ],
    ultimasEntregas: [
      { id: 1, alumno: "Carmen López",  ejercicio: "Listas enlazadas",  fechaHora: "Hoy, 09:00",   correcto: true  },
      { id: 2, alumno: "Andrés Ruiz",   ejercicio: "Pilas y colas",     fechaHora: "Ayer, 17:00",  correcto: false },
      { id: 3, alumno: "Sofía Navarro", ejercicio: "Árboles AVL",       fechaHora: "Ayer, 11:30",  correcto: true  },
    ],
  },
  "3": {
    id: 3,
    nombre: "Bases de datos",
    curso: "2025-2026",
    codigo: "BDD003",
    color: "#2a2a4a",
    alumnos: [
      { id: 1, nombre: "Fernández, Luis",  ejerciciosCompletados: 8, totalEjercicios: 9 },
      { id: 2, nombre: "Mora, Patricia",   ejerciciosCompletados: 6, totalEjercicios: 9 },
      { id: 3, nombre: "Vega, Daniel",     ejerciciosCompletados: 3, totalEjercicios: 9 },
    ],
    ultimasEntregas: [
      { id: 1, alumno: "Luis Fernández", ejercicio: "Consultas SQL",       fechaHora: "Hoy, 12:00",   correcto: true  },
      { id: 2, alumno: "Patricia Mora",  ejercicio: "Normalización",       fechaHora: "Hoy, 08:45",   correcto: false },
      { id: 3, alumno: "Daniel Vega",    ejercicio: "Joins y subconsultas", fechaHora: "Ayer, 16:00", correcto: true  },
    ],
  },
};

type Alumno = {
  id: number;
  nombre: string;
  ejerciciosCompletados: number;
  totalEjercicios: number;
};

type Entrega = {
  id: number;
  alumno: string;
  ejercicio: string;
  fechaHora: string;
  correcto: boolean;
};

type Asignatura = {
  id: number;
  nombre: string;
  curso: string;
  codigo: string;
  color: string;
  alumnos: Alumno[];
  ultimasEntregas: Entrega[];
};

export default function VistaAsignaturaProfesor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  /* toDo: fetch al backend con id */
  const asignatura = asignaturasEjemplo[id];
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
  {/*Función para copiar el código de la asignatura al portapapeles */}
  function copiarCodigo() {
    navigator.clipboard.writeText(asignatura.codigo);
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>

        {/* Banner de la asignatura */}
        <div className={styles.banner} style={{ backgroundColor: asignatura.color }}>
          <div className={styles.bannerInner}>
            <div className={styles.bannerIcon}>📚</div>
            <div>
              <h1 className={styles.bannerNombre}>{asignatura.nombre}</h1>
              <p className={styles.bannerCurso}>curso {asignatura.curso}</p>
            </div>
          </div>
          <div className={styles.bannerCodigo}>
            código: <span className={styles.codigoValor}>#{asignatura.codigo}</span>
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

        <div className={styles.content}>

          {/* Columna izquierda */}
          <div className={styles.leftCol}>

            {/* Alumnos inscritos */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Alumnos inscritos</h2>
                <button className={styles.verTodosBtn} onClick={() => setVerTodosAlumnos(!verTodosAlumnos)}>
                  {verTodosAlumnos ? "Ver menos ↑" : "Ver todos →"}
                </button>
              </div>
              <ul className={styles.alumnosList}>
                {(verTodosAlumnos ? asignatura.alumnos : asignatura.alumnos.slice(0, 4)).map((a) => (
                  <li key={a.id} className={styles.alumnoRow}>
                    <div className={styles.alumnoAvatar} />
                    <span className={styles.alumnoNombre}>{a.nombre}</span>
                    <span className={styles.alumnoProgreso}>
                      {a.ejerciciosCompletados}/{a.totalEjercicios} ejercicios completados
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Últimas entregas */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Últimas entregas</h2>
              </div>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Ejercicio</th>
                    <th>Fecha/Hora</th>
                    <th>Estado</th>
                    <th>Revisar</th>
                  </tr>
                </thead>
                <tbody>
                  {asignatura.ultimasEntregas.map((e) => (
                    <tr key={e.id}>
                      <td>{e.alumno}</td>
                      <td>{e.ejercicio}</td>
                      <td>{e.fechaHora}</td>
                      <td>
                        <span
                          className={styles.estadoDot}
                          style={{ backgroundColor: e.correcto ? "#4caf50" : "#f44336" }}
                        />
                      </td>
                      <td>
                        {/*toDo: implementar que muestre el código del alumno, sacado de la BBDD */}
                        <button className={styles.codigoLink}>código →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna derecha */}
          <div className={styles.rightCol}>
            <button className={styles.temasBtn}>Temas y ejercicios</button>
          </div>

        </div>
      </main>
    </div>
  );
}
