"use client";

import {useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/sidebar";
import AsignaturaCard from "../../components/AsignaturaCard";
import styles from "./dashAlumn.module.css";
import {asignaturasDeAlumno, ultimasEntregasDeAlumno, usuarios} from "../../lib/mockData";


export default function PaginaDashboardAlumno() {
  const router = useRouter();
  const [ALUMNO_ID, setAlumnoId] = useState(0);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    setAlumnoId(Number(localStorage.getItem("id")));
    setNombre(localStorage.getItem("nombre") ?? "");
  }, []);

  const asignaturas = asignaturasDeAlumno(ALUMNO_ID).map((a) => ({
    ...a,
    profesor: usuarios.find((u) => u.id === a.profesorId)?.nombreCompleto ?? "–",
  }));

  const ultimasEntregas = ultimasEntregasDeAlumno(ALUMNO_ID, 4);


  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno"/>

      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.bienvenida}>Hola {nombre} </h1>
        </header>

        <div className={styles.contenidoPagina}>

          <section className={styles.zona}>
            <div className={styles.encabezadoZona}>
              <h2 className={styles.tituloZona}>Mis asignaturas</h2>
              <a href="/asignaturasAlumno" className={styles.verTodas}>Ver todas →</a>
            </div>
            <div className={styles.asignaturasLista}>
              {asignaturas.slice(0, 4).map((a) => (
                <AsignaturaCard
                  key={a.id}
                  id={a.id}
                  nombre={a.nombre}
                  color={a.color}
                  profesor={a.profesor}
                  onClick={() => router.push(`/vistaAsignaturaAlumno/${a.id}`)}
                />
              ))}
            </div>
          </section>

          <section className={styles.zona}>
            <h2 className={styles.tituloZona}>Últimas entregas</h2>
            <div className={styles.entregasGrid}>
              {ultimasEntregas.map((e) => (
                <div key={e.id} className={styles.entregaCard}>
                  <div className={styles.entregaEncabezado}>
                    <span
                      className={styles.circulo}
                      style={{
                        backgroundColor:
                          e.resultado === "correcto"
                            ? "#2d7a3a"
                            : e.resultado === "incorrecto"
                            ? "#8b2020"
                            : "#5a5a20",
                      }}
                    />
                    <span className={styles.entregaNombre}>{e.ejercicio}</span>
                  </div>
                  <div className={styles.entregaFeedback}>
                    {e.resultado === "correcto"
                      ? "El ejercicio es correcto, ¡enhorabuena!"
                      : e.errorPrincipal
                      ? e.errorPrincipal
                      : "Pendiente de corrección."}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
