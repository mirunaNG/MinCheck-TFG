"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

export default function PaginaLogin() {
  const [recordarCuenta, setRecordarCuenta] = useState(false);
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const correoGuardado = localStorage.getItem("correoRecordado");
    if (correoGuardado) {
      setCorreo(correoGuardado);
      setRecordarCuenta(true);
    }
  }, []);


  async function handleSubmit(e : {preventDefault(): void}){
    e.preventDefault();
    setError("");
    setCargando(true);

    try{
      const respuesta = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({correo, contrasena}),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok){
        setError(datos.mensaje);
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("rol", datos.rol);
      localStorage.setItem("nombre", datos.nombre);
      localStorage.setItem("id", String(datos.id));

      if (recordarCuenta) {
        localStorage.setItem("correoRecordado", correo);
      } else {
        localStorage.removeItem("correoRecordado");
      }

      router.push(datos.rol === "profesor" ? "/dashboard" : "/dashboardAlumno");
    } catch {
        setError("No se pudo conectar con el servidor");
    } finally {
        setCargando(false);
    }
  }

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
          <form className={styles.formulario} onSubmit={handleSubmit}>
            <div >
              <label className={styles.etiquetaCampo}>Nombre de usuario</label>
              <div className={styles.grupoInput}>
                <span className={styles.iconoEntrada}>👤</span>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Introduce tu correo"
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
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
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

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" className={styles.botonSubmitLogin} disabled={cargando}>
              {cargando ? "Iniciando sesion..." : "INICIAR SESIÓN"}
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