"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import Modal from "../../components/Modal";
import AsignaturaCard from "../../components/AsignaturaCard";
import styles from "./asignaturasProfesor.module.css";
import { asignaturasDe, totalAlumnosDe, totalEjerciciosDe } from "../../lib/mockData";

// toDo: id del profesor autenticado vendrá de la sesión
const PROFESOR_ID = 1;

function generarCodigo(): string {
  /* toDo: el código lo generará el backend al crear la asignatura */
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const asignaturasIniciales = asignaturasDe(PROFESOR_ID).map((a) => ({
  ...a,
  codigo:     a.codigoAsignatura,
  alumnos:    totalAlumnosDe(a.id),
  ejercicios: totalEjerciciosDe(a.id),
}));

export default function PaginaDashboardProfesor() {
  {/*Estado del componente
    const [variable, funcion setter] = useState(<valor inicial>) */}
  const router = useRouter();
  const [asignaturas, setAsignaturas] = useState(asignaturasIniciales);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState(""); {/*Lo que se escribe en el input*/}

  function handlerAnadirAsignatura(e: React.SyntheticEvent<HTMLFormElement>) {
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
        codigoAsignatura: generarCodigo(),
        profesorId: PROFESOR_ID,
        curso: "2025-2026",
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
        <header className={styles.encabezado}>
          {/* Aqui coger el nombre del profesor de quien inicia sesion */}
          <h1 className={styles.bienvenida}>Hola, Prof. García</h1>
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
