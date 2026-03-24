"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./registro.module.css";

type Role = "estudiante" | "profesor";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("estudiante");

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
          <Link href="/login" className={styles.signupBtn}>SignUp</Link>
        </div>
      </nav>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>¡BIENVENIDO A MinCheck!</h1>

          {/* Role Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${role === "estudiante" ? styles.tabActive : ""}`}
              onClick={() => setRole("estudiante")}
            >
              <span className={styles.tabIcon}>🎓</span>
              Estudiante
            </button>
            <button
              className={`${styles.tab} ${role === "profesor" ? styles.tabActive : ""}`}
              onClick={() => setRole("profesor")}
            >
              <span className={styles.tabIcon}>🧑‍🏫</span>
              Profesor
            </button>
          </div>

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
              <label className={styles.label}>Correo</label>
              <div className={styles.cuadranteInput}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  placeholder="Introduce tu correo"
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

            <div className={styles.field}>
              <label className={styles.label}>Repite tu contraseña</label>
              <div className={styles.cuadranteInput}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="Introduce tu contraseña"
                  className={styles.input}
                />
              </div>
            </div>
            {/* El campo de seleccionar el centro solo aparece para profesores */}
            {role === "profesor" && (
              <div className={styles.field}>
                <label className={styles.label}>Centro educativo</label>
                <div className={styles.cuadranteInput}>
                  <span className={styles.inputIcon}>🏫</span>
                  <input
                    type="text"
                    placeholder="Introduce el centro en el que impartes"
                    className={styles.input}
                  />
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn}>
              REGISTRARSE
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
