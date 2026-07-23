"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import Modal from "../../components/Modal";
import AsignaturaCard from "../../components/AsignaturaCard";
import styles from "./asignaturasProfesor.module.css";

type Asignatura = {
  id: number;
  nombre: string;
  color : string;
  codigoAsignatura: string;
  alumnos: number;
  ejercicios: number;
}

export default function PaginaDashboardProfesor() {
  const router = useRouter();

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (!id) return;

    fetch("http://localhost:5001/profesor/" + id + "/asignaturasProfesor")
    .then((res) => res.json())
    .then((datos) => {
      if (Array.isArray(datos)) setAsignaturas(datos);
    });
  }, [])

  async function handlerAnadirAsignatura(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!nombre.trim()) return;

    const id = localStorage.getItem("id");

    const res = await fetch("http://localhost:5001/asignaturasProfesor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nombre.trim(), profesor_id: Number(id) }),
    });
    const datos = await res.json();

    if (!res.ok) {
      setError(datos.mensaje);
      return;
    }

    setAsignaturas((prev) => [...prev, datos]);
    setNombre("");
    setError("");
    setMostrarModal(false);
  }

  async function handlerEliminarAsignatura(id: number) {
    const confirmado = window.confirm(
      "¿Seguro que quieres eliminar esta asignatura? Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    const res = await fetch(`http://localhost:5001/asignatura/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) return;

    setAsignaturas((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>
        <header className={styles.encabezado}>
          {/* Aqui coger el nombre del profesor de quien inicia sesion */}
          <h1 className={styles.bienvenida}>Tus asignaturas</h1>
        </header>

        <div className={styles.contenidoPagina}>
          <div className={styles.ladoIzquierdo}>
            <div>
              <div className={styles.asignaturasGrid}>
                {asignaturas.map((a) => (
                  <AsignaturaCard
                    key={a.id}
                    id={a.id}
                    nombre={a.nombre}
                    color={a.color}
                    alumnos={a.alumnos}
                    ejercicios={a.ejercicios}
                    onClick={() => router.push(`/vistaAsignatura/${a.id}`)}
                    onEliminar={() => handlerEliminarAsignatura(a.id)}
                  />
                ))}
              </div>
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
          titulo="Nueva asignatura"
          subtitulo="Añade una nueva asignatura a tu lista"
          onCerrar={() => setMostrarModal(false)}
        >
          <form onSubmit={handlerAnadirAsignatura}>
            <div className={styles.grupoFormulario}>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                placeholder="Ej. Programación orientada a objetos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.botonCancelar}
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className={styles.botonAñadir}>
                Añadir
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
