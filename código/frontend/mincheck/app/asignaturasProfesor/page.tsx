"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../sidebar/sidebar";
import styles from "./asignaturasProfesor.module.css";

/**
 * Datos de EJEMPLO para asignaturas y errores comunes.
 */

function generarCodigo(): string {
  /* toDo: el código lo generará el backend al crear la asignatura */
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const asignaturasIniciales = [
  {
    id: 1,
    nombre: "Fundamentos de la Algoritmia",
    alumnos: 42,
    ejercicios: 10,
    codigo: "458C3",
    imagen: "/asignaturas/algoritmos.jpg",
    color: "#2a3a5a",
  },
  {
    id: 2,
    nombre: "Estructuras de datos",
    alumnos: 30,
    ejercicios: 9,
    codigo: "DAT002",
    imagen: "/asignaturas/datos.jpg",
    color: "#1a3a4a",
  },
  {
    id: 3,
    nombre: "Bases de datos",
    alumnos: 36,
    ejercicios: 8,
    codigo: "BDD003",
    imagen: "/asignaturas/bbdd.jpg",
    color: "#2a2a4a",
  },
];

export default function DashboardProfesorPage() {
  {/*Estado del componente
    const [variable, funcion setter] = useState(<valor inicial>) */}
  const router = useRouter();
  const [asignaturas, setAsignaturas] = useState(asignaturasIniciales);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState(""); {/*Lo que se escribe en el input*/}

  function handleAnadir(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault(); {/*Evita que se recargue la pagina al enviar el formulario*/}
    if (!nombre.trim()) return;
    {/*Agrega una nueva asignatura al estado. Luego limpia los campos del formulario y cierra el modal.*/}
    setAsignaturas((prev) => [
      ...prev,
      {
        id: Date.now(), /*toDo: el id se asiganará automáticamente en la BBDD */
        nombre: nombre.trim(),
        alumnos: 0, /*siempre empieza en 0, se incrementa cuando los alumnos se unen con el código*/
        ejercicios: 0,
        codigo: generarCodigo(), /*toDo: el código lo generará el backend*/
        imagen: "",
        color: "#2a3a5a",
      },
    ]);
    setNombre("");
    setMostrarModal(false);
  }

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
          <div className={styles.leftCol}>

            {/* Asignaturas */}
            <div className={styles.section}>
              <div className={styles.asignaturasGrid}>
                {asignaturas.map((a) => (
                  <div key={a.id} className={styles.asignaturaCard} onClick={() => router.push(`/vistaAsignaturaProfesor/${a.id}`)}>
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

          <div className={styles.rightCol}>
            <button className={styles.addBtn} onClick={() => setMostrarModal(true)}>
              + Añadir asignatura
            </button>
          </div>
        </div>
      </main>

      {/* Modal */}
      {mostrarModal && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Nueva asignatura</h2>
            <form onSubmit={handleAnadir}>
              <div className={styles.formGroup}>
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

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
