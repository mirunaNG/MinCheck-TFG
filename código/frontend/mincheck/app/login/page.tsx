"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";

export default function PaginaLogin() {
  const [recordarCuenta, setRecordarCuenta] = useState(false);

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
          <Link href="/registro" className={styles.botonRegistro}>SignUp</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.tituloLogin}>¡BIENVENIDO DE NUEVO!</h1>
          {/* Formulario de inicio de sesion*/}
          <form className={styles.formulario} onSubmit={(e) => e.preventDefault()}>
            <div >
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

            <div>
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

            <div className={styles.zonaExtra}>
              <label className={styles.checkboxRecordar}>
                <input
                  type="checkbox"
                  checked={recordarCuenta}
                  onChange={(e) => setRecordarCuenta(e.target.checked)}
                  className={styles.checkbox}
                />
                Recuérdame
              </label>
              <a href="#" className={styles.contrasenaOlvidada}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.botonSubmitLogin}>
              INICIAR SESIÓN
            </button>
          </form>

          {/*Si no tienes cuenta, registrate*/}
          <div className={styles.zonaRegitsrarse}>
            <p className={styles.textoRegistro}>¿No tienes cuenta todavía?</p>
            <p className={styles.subtituloRegistro}>Crea una y disfruta de MinCheck</p>
            <Link href="/registro" className={styles.botonRegistrarse}>
              Registrarse
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}