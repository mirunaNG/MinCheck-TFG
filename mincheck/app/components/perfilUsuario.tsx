"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import styles from "./perfil.module.css";

export default function PerfilUsuario({ defaultRol = "" }: { defaultRol?: string }) {
  const router = useRouter();
  const [rol, setRol] = useState(defaultRol);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [notificacionesAyuda, setNotificacionesAyuda] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [contrasenaNueva, setContrasenaNueva] = useState("");
  const [contrasenaConfirm, setContrasenaConfirm] = useState("");
  const [mensajePerfil, setMensajePerfil] = useState("");
  const [mensajeContrasena, setMensajeContrasena] = useState("");
  const [errorContrasena, setErrorContrasena] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("id");
    const rolGuardado = localStorage.getItem("rol") || defaultRol;
    setRol(rolGuardado);
    if (!id) return;
    fetch('http://localhost:5001/usuario/' + id)
      .then((r) => r.json())
      .then((d) => {
        setNombre(d.nombre);
        setCorreo(d.correo);
        setUniversidad(d.universidad || "");
        setNotificacionesAyuda(d.notificacionesAyuda || false);
      });
  }, []);

  async function guardarPerfil() {
    const id = localStorage.getItem("id");
    const res = await fetch('http://localhost:5001/usuario/' + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, universidad, notificacionesAyuda }),
    });
    if (res.ok) {
      localStorage.setItem("nombre", nombre);
      setMensajePerfil("Cambios guardados correctamente");
    } else {
      const d = await res.json();
      setMensajePerfil(d.mensaje || "Error al guardar");
    }
  }

  async function cambiarContrasena() {
    setMensajeContrasena("");
    setErrorContrasena(false);
    if (contrasenaNueva !== contrasenaConfirm) {
      setErrorContrasena(true);
      setMensajeContrasena("Las contraseñas no coinciden");
      return;
    }
    const id = localStorage.getItem("id");
    const res = await fetch('http://localhost:5001/usuario/' + id + '/contrasena', {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contrasenaActual, contrasenaNueva }),
    });
    const d = await res.json();
    if (res.ok) {
      setMensajeContrasena("Contraseña actualizada correctamente");
      setContrasenaActual("");
      setContrasenaNueva("");
      setContrasenaConfirm("");
    } else {
      setErrorContrasena(true);
      setMensajeContrasena(d.mensaje || "Error al cambiar la contraseña");
    }
  }

  function cerrarSesion() {
    localStorage.clear();
    router.push("/login");
  }

  const iniciales = nombre ? nombre.slice(0, 2).toUpperCase() : "??";
  const rolTexto = rol === "profesor" ? "Profesor" : "Alumno";

  return (
    <div className={styles.layout}>
      <Sidebar rol={rol as "alumno" | "profesor"} />
      <main className={styles.main}>
        <header className={styles.encabezado}>
          <h1 className={styles.bienvenida}>
            Hola {rol === "profesor" ? 'Prof. ' + nombre : nombre} 
          </h1>
        </header>

        <div className={styles.contenido}>
          <div className={styles.izquierda}>
            <div className={styles.fotoZona}>
              <div className={styles.avatar}>{iniciales}</div>
              <div>
                <p className={styles.rolTexto}>Tu rol: {rolTexto}</p>
                <p className={styles.nombrePerfil}>{nombre}</p>
              </div>
            </div>
            <p className={styles.fotoHint}>Pincha sobre la foto para cambiarla</p>

            <div className={styles.campoGrupo}>
              <label className={styles.label}>Nombre completo</label>
              <input
                className={styles.input}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className={styles.campoGrupo}>
              <label className={styles.label}>Dirección de correo</label>
              <input
                className={styles.input}
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>
            {rol === "profesor" && (
              <div className={styles.campoGrupo}>
                <label className={styles.label}>Universidad</label>
                <input
                  className={styles.input}
                  value={universidad}
                  onChange={(e) => setUniversidad(e.target.value)}
                />
              </div>
            )}

            {rol === "profesor" && (
              <div className={styles.toggleFila}>
                <span className={styles.toggleTexto}>
                  Recibir notificación cuando un alumno pide ayuda
                </span>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    className={styles.toggleCheckbox}
                    checked={notificacionesAyuda}
                    onChange={(e) => setNotificacionesAyuda(e.target.checked)}
                  />

                  <span className={styles.slider}></span>
                </label>
              </div>
            )}

            {mensajePerfil && <p className={styles.mensajeOk}>{mensajePerfil}</p>}

            <button className={styles.btnGuardarPerfil} onClick={guardarPerfil}>
              Guardar cambios
            </button>
            <button className={styles.btnCerrar} onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>

          <div className={styles.derecha}>
            <div className={styles.cardContrasena}>
              <h3 className={styles.tituloCard}>Cambiar contraseña</h3>
              <div className={styles.campoGrupo}>
                <label className={styles.label}>Contraseña actual</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Introduce tu contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                />
              </div>
              <div className={styles.campoGrupo}>
                <label className={styles.label}>Nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Introduce la contraseña nueva"
                  value={contrasenaNueva}
                  onChange={(e) => setContrasenaNueva(e.target.value)}
                />
              </div>
              <div className={styles.campoGrupo}>
                <label className={styles.label}>Confirmar nueva contraseña</label>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Repite la contraseña nueva"
                  value={contrasenaConfirm}
                  onChange={(e) => setContrasenaConfirm(e.target.value)}
                />
              </div>
              {mensajeContrasena && (
                <p className={errorContrasena ? styles.error : styles.mensajeOk}>
                  {mensajeContrasena}
                </p>
              )}
              <button className={styles.btnGuardar} onClick={cambiarContrasena}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
