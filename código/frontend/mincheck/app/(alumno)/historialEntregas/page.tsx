"use client";

import Sidebar from "../../components/sidebar";
import Tabla from "../../components/Tabla";
import styles from "./historial.module.css";
import { entregasAgrupadasPorAsignatura, temas } from "../../lib/mockData";

const ALUMNO_ID = 2;

function colorCabecera(asignaturaId: number): string {
  const primerTema = temas.find((t) => t.asignaturaId === asignaturaId);
  return primerTema?.color ?? "#4d7cfe";
}

const grupos = entregasAgrupadasPorAsignatura(ALUMNO_ID);

export default function PaginaHistorialEntregas() {
  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />

      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.titulo}>TU HISTORIAL DE ENTREGAS</h1>
        </header>

        <div className={styles.contenido}>
          {grupos.map(({ asignatura, entregas }) => (
            <div key={asignatura.id} className={styles.bloqueAsignatura}>
              <div
                className={styles.cabeceraAsignatura}
                style={{ backgroundColor: colorCabecera(asignatura.id) }}
              >
                <p className={styles.nombreAsignatura}>
                  {asignatura.nombre.toUpperCase()}
                </p>
              </div>

              <Tabla
                columnas={["Ejercicio", "Fecha", "Resultado", ""]}
              >
                {entregas.map((e) => (
                  <tr key={e.id}>
                    <td>{e.ejercicio}</td>
                    <td>{e.fechaHora}</td>
                    <td>
                      <span
                        className={styles.circulo}
                        style={{
                          backgroundColor:
                            e.resultado === "correcto" ? "#2d7a3a" : "#8b2020",
                        }}
                      />
                    </td>
                    <td>
                      {e.resultado === "incorrecto" && (
                        <span className={styles.reintentar}>reintentar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </Tabla>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
