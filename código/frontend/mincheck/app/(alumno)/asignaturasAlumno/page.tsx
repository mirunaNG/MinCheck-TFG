"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import Modal from "../../components/Modal";
import AsignaturaCard from "../../components/AsignaturaCard";
import styles from "./asignaturasAlumn.module.css";
import { asignaturas, matriculas, asignaturasDeAlumno, totalAlumnosDe, totalEjerciciosDe} from "../../lib/mockData";

const ALUMNO_ID = 2;

function buildCard(a: ReturnType<typeof asignaturasDeAlumno>[number]) {
  return {
    ...a,
    alumnos:    totalAlumnosDe(a.id),
    ejercicios: totalEjerciciosDe(a.id),
  };
}

export default function AsignaturasAlumno() {
  const router = useRouter();

  const [misAsignaturas, setMisAsignaturas] = useState( () => asignaturasDeAlumno(ALUMNO_ID).map(buildCard));
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  function handlerAnadirAsignatura(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const codigoTrim = codigo.trim().toUpperCase();
    if (!codigoTrim) return;

    const asignatura = asignaturas.find((a) => a.codigoAsignatura.toUpperCase() === codigoTrim);
    if (!asignatura) {
      setError("No existe ninguna asignatura con ese código.");
      return;
    }

    const yaMatriculado = matriculas.some( (m) => m.alumnoId === ALUMNO_ID && m.asignaturaId === asignatura.id);
    if (yaMatriculado) {
      setError("Ya estás matriculado en esa asignatura.");
      return;
    }

    matriculas.push({ alumnoId: ALUMNO_ID, asignaturaId: asignatura.id });
    setMisAsignaturas((prev) => [...prev, buildCard(asignatura)]);
    setCodigo("");
    setError("");
    setMostrarModal(false);
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />

      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.bienvenida}>Mis asignaturas</h1>
        </header>

        <div className={styles.contenidoPagina}>
          <div className={styles.ladoIzquierdo}>
            <div className={styles.asignaturasGrid}>
              {misAsignaturas.map((a) => (
                <AsignaturaCard
                  key={a.id}
                  id={a.id}
                  nombre={a.nombre}
                  color={a.color}
                  alumnos={a.alumnos}
                  ejercicios={a.ejercicios}
                  onClick={() => router.push(`/vistaAsignaturaAlumno/${a.id}`)}
                />
              ))}
            </div>
          </div>

          <div className={styles.ladoDerecho}>
            <button className={styles.botonAñadir} onClick={() => setMostrarModal(true)}>
              + Añadir asignatura
            </button>
          </div>
        </div>
      </main>

      {mostrarModal && (
        <Modal
          titulo="Unirse a una asignatura"
          subtitulo="Introduce el código que te ha dado tu profesor"
          onCerrar={() => { setMostrarModal(false); setCodigo(""); setError(""); }}
        >
          <form onSubmit={handlerAnadirAsignatura}>
            <div className={styles.grupoFormulario}>
              <label htmlFor="codigo">Código de asignatura</label>
              <input
                id="codigo"
                type="text"
                placeholder="Ej. 458C3"
                value={codigo}
                onChange={(e) => { setCodigo(e.target.value); setError(""); }}
              />
              {error && <span className={styles.mensajeError}>{error}</span>}
            </div>

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.botonCancelar}
                onClick={() => { setMostrarModal(false); setCodigo(""); setError(""); }}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.botonAñadir}>
                Unirse
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
