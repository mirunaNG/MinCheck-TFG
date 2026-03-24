"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";


export default function LoginPage() {
  const [remember, setRemember] = useState(false);

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>{"[>_]"}</span>
          <span className={styles.logoText}>MinCheck</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#">About</a>
          <a href="#">Help</a>
          <p className={styles.signupBtn}>SignUp</p>
        </div>
      </nav>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>¡BIENVENIDO DE NUEVO!</h1>
          {/* Form */}
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.field}>
              <label className={styles.label}>Nombre de usuario</label>
              <div className={styles.cuadranteInput}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  placeholder="Introduce tu nombre de usuario"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <div className={styles.cuadranteInput}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="Introduce tu contraseña"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.extras}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={styles.checkbox}
                />
                Recuérdame
              </label>
              <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.submitBtn}>
              INICIAR SESIÓN
            </button>
          </form>

          {/* Register redirect */}
          <div className={styles.registerSection}>
            <p className={styles.registerText}>¿No tienes cuenta todavía?</p>
            <p className={styles.registerSub}>Crea una y disfruta de MinCheck</p>
            <Link href="/registro" className={styles.registerBtn}>
              Registrarse
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
