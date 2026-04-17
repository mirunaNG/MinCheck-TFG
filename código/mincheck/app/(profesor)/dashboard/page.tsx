"use client";

import {useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import AsignaturaCard from "../../components/AsignaturaCard";
import styles from "./dashProf.module.css";

export default function PaginaDashboardProfesor() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [asignaturas, setAsignaturas] = useState([] as any[])
  const [erroresComunes, setErroresComunes] = useState([] as any[])

  useEffect(() => {
    const id = localStorage.getItem("id");
    const nombreGuardado = localStorage.getItem("nombre");
    setNombre(nombreGuardado || "");

    if (!id) return;

    async function cargarDatos(){
      const respuesta = await fetch("http://localhost:5001/profesor/" + id + "/asignaturasProfesor");
      const datos = await respuesta.json();
      setAsignaturas(datos);

      const respuestaErrores = await fetch("http://localhost:5001/profesor/" + id + "/erroresComunes");
      const datosErrores = await respuestaErrores.json();
      setErroresComunes(Array.isArray(datosErrores) ? datosErrores : []);
    }

    cargarDatos();
  }, []);

  const totalEstudiantes = asignaturas.reduce((sum, a) => sum + a.alumnos, 0);
  const totalEjercicios = asignaturas.reduce((sum, a) => sum + a.ejercicios, 0);

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.bienvenida}>Hola {nombre} </h1>
          {/*Ya veré si añadir el boton de las notificaciones, de momento -> trabajo futuro */}
        </header>

        <div className={styles.contenidoPagina}>
          {/* Columna izquierda */}
          <div className={styles.ladoIzquierdo}>

            {/*Estadisticas */}
            <div className={styles.zonaEstadisticas}>
              <div className={styles.estadisticaCard}>
                <div className={styles.grupoIconoEstadistica} style={{ backgroundColor: "rgba(77,124,254,0.15)" }}>
                  <span className={styles.iconoEstadistica}>👥</span>
                </div>
                <p className={styles.etiquetaEstadistica}>Total estudiantes</p>
                <p className={styles.valorEstadistica}>{totalEstudiantes}</p>
              </div>
              <div className={styles.estadisticaCard}>
                <div className={styles.grupoIconoEstadistica} style={{ backgroundColor: "rgba(240,165,0,0.15)" }}>
                  <span className={styles.iconoEstadistica}>&lt;/&gt;</span>
                </div>
                <p className={styles.etiquetaEstadistica}>Total ejercicios</p>
                <p className={styles.valorEstadistica}>{totalEjercicios}</p>
              </div>
            </div>

            {/* Asignaturas */}
            <div className={styles.zonaAsignaturas}>
              <div className={styles.encabezadoZona}>
                <h2 className={styles.tituloZona}>Asignaturas actuales</h2>
                <a href="/asignaturas" className={styles.verTodas}>Ver todas →</a>
              </div>
              <div className={styles.asignaturasGrid}>
                {/*Por cada asignatura del array, se crea una tarjeta */}
                {/*Solo se muestran las 4 primeras asignaturas, si hay más se accede a través del enlace "Ver todas" */}
                {asignaturas.slice(0, 4).map((a) => (
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

          {/* Columna derecha —> Errores */}
          <div className={styles.ladoDerecho}>
            <div className={styles.erroresCard}>
              <h2 className={styles.tituloErrores}>Errores más comunes<br />por ejercicio</h2>
              <div className={styles.listaErrores}>
                {erroresComunes.map((e, i) => (
                  <div key={i} className={styles.error}>
                    <div className={styles.errorTop}>
                      <span
                        className={styles.errorEjercicio}
                        style={{ backgroundColor: e.color }}
                      >
                        {e.ejercicio}
                      </span>
                      <span className={styles.descripcionError}>{e.descripcion}</span>
                      <span className={styles.porcentajeError}>{e.porcentaje}%</span>
                    </div>
                    <div className={styles.progressBarError}>
                      <div
                        className={styles.rellenoProgressBarError}
                        style={{ width: `${e.porcentaje}%`, backgroundColor: e.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <a href="/estadisticas" className={styles.verAnalisis}>Ver análisis detallado</a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
