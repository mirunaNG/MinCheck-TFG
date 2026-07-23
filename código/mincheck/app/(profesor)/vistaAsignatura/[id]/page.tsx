"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../../components/sidebar";
import Tabla from "../../../components/Tabla";
import styles from "../vistaAsigProf.module.css";
import CodigoViewerModal from "../../../components/verCodigoModal";

type Asignatura = {
  id: number;
  nombre: string;
  codigoAsignatura: string;
  curso: string;
  color: string;
}

type Alumno = {
  id: number;
  nombreCompleto: string;
  completados: string;
  total: number;
}

type Entrega = {
  id: number;
  alumno: string;
  ejercicio: string;
  fechaHora: string;
  correcto: boolean;
}

export default function VistaAsignaturaProfesor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const asignaturaId = Number(id);

  const [asignatura, setAsignatura] = useState<Asignatura | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [totalEjercicios, setTtotalEjercicios] = useState(0);
  const[ultimasEntregas, setUltimasEntregas] = useState<Entrega[]>([]);
  const [verTodosAlumnos, setVerTodosAlumnos] = useState(false);
  // necesario porque asignatura es null hasta que carga, entonces muestra por un momento 'asignatura no encontrada'
  const [cargando, setCargando] = useState(true);
  const [entregaCodigo, setEntregaCodigo] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5001/asignatura/` + id),
      fetch('http://localhost:5001/asignatura/' + id + '/alumnos'),
      fetch('http://localhost:5001/asignatura/'+ id+'/ultimasEntregas'),
    ])
      .then(async ([resA, resAl, resE]) => {
        const datosAsignatura = await resA.json();
        const datosAlumnos = await resAl.json();
        const datosEntregas = await resE.json();
        setAsignatura(datosAsignatura);
        setAlumnos(datosAlumnos.alumnos);
        setTtotalEjercicios(datosAlumnos.totalEjercicios);
        setUltimasEntregas(datosEntregas);

        setCargando(false);
      })
  }, [asignaturaId]);

  function copiarCodigo() {
    if (asignatura) navigator.clipboard.writeText(asignatura.codigoAsignatura);
  }

  if (cargando){
    return (
      <div className={styles.layout}>
        <Sidebar rol="profesor" />
        <main className={styles.main}>
          <p className={styles.notFound}>Cargando...</p>
        </main>
      </div>
    );
  }

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
            código: <span className={styles.codigoValor}>#{asignatura.codigoAsignatura}</span>
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
                      {a.completados}/{totalEjercicios} ejercicios completados
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Últimas entregas */}
              <h2 className={styles.tituloCard}>Últimas entregas</h2>
              <Tabla columnas={["Alumno", "Ejercicio", "Fecha/Hora", "Estado", "Revisar"]}>
                  {ultimasEntregas.map((e) => (
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
                        <button className={styles.linkAlCodigo} onClick={() => setEntregaCodigo(e.id)}>
                          código →
                        </button>
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
      {entregaCodigo !== null && (
        <CodigoViewerModal entregaId={entregaCodigo} onCerrar={() => setEntregaCodigo(null)} />
      )}
    </div>
  );
}
