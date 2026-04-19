"use client";

import{ useState } from "react";
import { useRouter } from "next/navigation";  //porque usamos /app
import Link from "next/link";
import styles from "./registro.module.css";

type Rol = "alumno" | "profesor";

export default function PaginaRegistro() {
  /*Cada campo del formulario necesita un sitio en memoria donde guardar lo que el usuario escribe.
  cuando el usuario escribe, se llama al set con el nuevo valor */
  const [rol, setRol] = useState<Rol>("alumno");
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [repetirContrasena, setRepetirContrasena] = useState("");
  
  /*para mostrar mensaje de error o desactivar el boton mientras carga */
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  /*async obligatorio porque se usa await dentro de la funcion */
  async function handleSubmit(e: {preventDefault():void}) {
    e.preventDefault();
    setError("");

    if (contrasena !== repetirContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setCargando(true);
    /*manda los datos del formulario al backend de Flask */
    /*se usa await para esperar la respuesta del servidor */
    try{
      const respuesta = await fetch("http://localhost:5001/registro", {
        method: "POST",
        headers:{"Content-Type": "application/json"}, //le decimos al servidor que enviamos JSONs
        body: JSON.stringify({nombre, correo, contrasena, rol}), //convertir datos a JSON
      });

      const datos = await respuesta.json();

      if(!respuesta.ok){
        setError(datos.mensaje || "Error al registrarse");
        return;
      }

      localStorage.setItem("token", datos.token);
      localStorage.setItem("rol", datos.rol);
      localStorage.setItem("nombre", datos.nombre);
      localStorage.setItem("id", String(datos.id));

      router.push(rol === "profesor" ? "/dashboard" : "/dashboardAlumno");
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
          <Link href="/login" className={styles.botonLogin}>Login</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.tituloRegistro}>¡BIENVENIDO A MinCheck!</h1>

          {/*Zona roles*/}
          <div className={styles.zonaRoles}>
            <button
              className={`${styles.rol} ${rol === "alumno" ? styles.rolSeleccionado : ""}`}
              onClick={() => setRol("alumno")}
            >
              <span className={styles.iconoRol}>🎓</span>
              Alumno
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
          <form className={styles.formulario} onSubmit={handleSubmit}>
            <div className={styles.campoForm}>
              <label className={styles.etiquetaCampo}>Nombre de usuario</label>
              <div className={styles.grupoInput}>
                <span className={styles.iconoEntrada}>👤</span>
                <input
                  type="text"
                  placeholder="Introduce tu nombre de usuario"
                  value = {nombre}
                  onChange={(e) => setNombre(e.target.value)}
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
                  value = {correo}
                  onChange={(e) => setCorreo(e.target.value)}
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
                  value = {contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
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
                  value = {repetirContrasena}
                  onChange={(e) => setRepetirContrasena(e.target.value)}
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
            
            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit" className={styles.botonSubmitRegistro} disabled={cargando}>
              {cargando ? "Registrando..." : "REGISTRARSE"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}