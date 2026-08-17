"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import Modal from "../../components/Modal";
import AsignaturaCard from "../../components/AsignaturaCard";
import styles from "./asignaturasAlumn.module.css";

type Asignatura = {
  id: number;
  nombre: string;
  color: string;
  profesor: string;
  alumnos: number;
  ejercicios: number;
};

export default function AsignaturasAlumno() {
  const router = useRouter();

  const [misAsignaturas, setMisAsignaturas] = useState<Asignatura[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (!id) return;
    fetch("http://localhost:5001/alumno/" + id + "/asignaturasAlumno")
      .then((res) => res.json())
      .then((datos) => setMisAsignaturas(datos));
  }, []);

  async function handlerAnadirAsignatura(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const codigoTrim = codigo.trim().toUpperCase();
    if (!codigoTrim) return;

    const id = localStorage.getItem("id");

    const res = await fetch("http://localhost:5001/matriculas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumno_id: Number(id), codigo_asignatura: codigoTrim })
    });
    const datos = await res.json();

    if (!res.ok) {
      setError(datos.mensaje);
      return;
    }

    setMisAsignaturas((prev) => [...prev, datos]);
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
