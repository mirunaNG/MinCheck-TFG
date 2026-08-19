"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/sidebar";
import Tabla from "../../components/Tabla";
import styles from "./historial.module.css";

type Entrega = {
  id: number;
  ejercicioId: number;
  ejercicio: string;
  fechaHora: string;
  resultado: string;
};

type Grupo = {
  asignatura: { id: number; nombre: string; color: string };
  entregas: Entrega[];
};

export default function PaginaHistorialEntregas() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (!id) return;
    fetch("http://localhost:5001/alumno/" + id + "/historialEntregas")
      .then((res) => res.json())
      .then((datos) => {
        setGrupos(datos);
        setCargando(false);
      });
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />

      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.titulo}>TU HISTORIAL DE ENTREGAS</h1>
        </header>

        <div className={styles.contenido}>
          {!cargando && grupos.length === 0 && (
            <p style={{ padding: 40, color: "#8b949e", textAlign: "center" }}>
              Aún no tienes ninguna entrega.
            </p>
          )}

          {grupos.map(({ asignatura, entregas }) => {
            const ejerciciosAprobados = new Set(
              entregas
                .filter((e) => e.resultado === "correcto")
                .map((e) => e.ejercicio)
            );

            return (
            <div key={asignatura.id} className={styles.bloqueAsignatura}>
              <div
                className={styles.cabeceraAsignatura}
                style={{ backgroundColor: asignatura.color }}
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
                      {e.resultado === "incorrecto" &&
                        !ejerciciosAprobados.has(e.ejercicio) && (
                          <a href={`/intentarEjercicio/${e.ejercicioId}`} className={styles.reintentar}>
                            reintentar
                          </a>
                        )}
                    </td>
                  </tr>
                ))}
              </Tabla>
            </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
