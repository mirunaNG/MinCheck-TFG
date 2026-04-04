"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./registro.module.css";

type Rol = "estudiante" | "profesor";

export default function PaginaRegistro() {
  const [rol, setRol] = useState<Rol>("estudiante");

  return (
    <div>
      {/* Barra de navegación */}
      <nav className={styles.headerInicio}>
        <div className={styles.zonaLogo}>
          <span className={styles.iconoLogo}>{"[>_]"}</span>
          <span className={styles.tituloLogo}>MinCheck</span>
        </div>
        <div className={styles.linksNavegar}>
          <a href="../#caracteristicas">About</a>
          <Link href="/login" className={styles.botonLogin}>Login</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.tituloRegistro}>¡BIENVENIDO A MinCheck!</h1>

          {/*Zona roles*/}
          <div className={styles.zonaRoles}>
            <button
              className={`${styles.rol} ${rol === "estudiante" ? styles.rolSeleccionado : ""}`}
              onClick={() => setRol("estudiante")}
            >
              <span className={styles.iconoRol}>🎓</span>
              Estudiante
            </button>
            <button
              className={`${styles.rol} ${rol === "profesor" ? styles.rolSeleccionado : ""}`}
              onClick={() => setRol("profesor")}
            >
              <span className={styles.iconoRol}>🧑‍🏫</span>
              Profesor
            </button>
          </div>

          {/* Form */}
          <form className={styles.formulario} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.campoForm}>
              <label className={styles.etiquetaCampo}>Nombre de usuario</label>
              <div className={styles.grupoInput}>
                <span className={styles.iconoEntrada}>👤</span>
                <input
                  type="text"
                  placeholder="Introduce tu nombre de usuario"
                  className={styles.entrada}
                />
              </div>
            </div>

            <div className={styles.campoForm}>
              <label className={styles.etiquetaCampo}>Correo</label>
              <div className={styles.grupoInput}>
                <span className={styles.iconoEntrada}>✉️</span>
                <input
                  type="email"
                  placeholder="Introduce tu correo"
                  className={styles.entrada}
                />
              </div>
            </div>

            <div className={styles.campoForm}>
              <label className={styles.etiquetaCampo}>Contraseña</label>
              <div className={styles.grupoInput}>
                <span className={styles.iconoEntrada}>🔒</span>
                <input
                  type="password"
                  placeholder="Introduce tu contraseña"
                  className={styles.entrada}
                />
              </div>
            </div>

            <div className={styles.campoForm}>
              <label className={styles.etiquetaCampo}>Repite tu contraseña</label>
              <div className={styles.grupoInput}>
                <span className={styles.iconoEntrada}>🔒</span>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  className={styles.entrada}
                />
              </div>
            </div>
            
            {/* El campo de seleccionar el centro educativo solo aparece para profesores */}
            {rol === "profesor" && (
              <div className={styles.campoForm}>
                <label className={styles.etiquetaCampo}>Centro educativo</label>
                <div className={styles.grupoInput}>
                  <span className={styles.iconoEntrada}>🏫</span>
                  <input
                    type="text"
                    placeholder="Introduce el centro en el que impartes"
                    className={styles.entrada}
                  />
                </div>
              </div>
            )}

            <button type="submit" className={styles.botonSubmitRegistro}>
              REGISTRARSE
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}