"use client";

import Link from "next/link";
import styles from "./init.module.css";

export default function LandingPage() {
  return (
    <div>
      {/*Barra de navegación*/}
      <nav className={styles.headerInicio}>
        <div className={styles.zonaLogo}>
          <span className={styles.iconoLogo}>[&gt;_]</span>
          <span className={styles.tituloLogo}>MinCheck</span>
        </div>
        <div className={styles.linksNavegar}>
          <a href="#caracteristicas">About</a>
          <Link href="/login" className={styles.botonLogin}>Iniciar sesión</Link>
          <Link href="/registro" className={styles.botonRegitsro}>Registrarse</Link>
        </div>
      </nav>

      {/*Presentación */}
      <section className={styles.presentacionInicio}>
        <div>
          <span className={styles.bienvenidaInicio}>Bienvenido a MinCheck</span>
          <h1 className={styles.tituloPresentacion}>
            Aprende de tus errores con <br />
            <span className={styles.destacableTitulo}>feedback inteligente</span>
          </h1>
          <p className={styles.subtituloPresentacion}>
            Pensado para alumnos y profesores de programación. <br />
            <br />
            Si eres alumno, sube tu código, recibe feedback detallado, mejora tus habilidades 
            de depuración y aprende de tus errores.
            <br />
            <br />
            Si eres profesor, sube tus soluciones, genera casos de prueba automáticos y accede 
            a estadísticas detalladas del progreso de tus alumnos.
          </p>
        </div>

        <div className={styles.fondoPresentacion}>
          <div className={styles.brilloDecoracionFondo} />
        </div>
      </section>

      {/* Características de MinCheck*/}
      <section className={styles.zonaCaracteristicas} id="caracteristicas"> {/*generar id porque desde la navegacion se redirige aqui */}
        <h2 className={styles.queHace}>¿Qué puedes hacer con MinCheck?</h2>
        <div className={styles.caracteristicasGrid}>

          <div className={styles.caracteristicaCard}>
            <div className={styles.iconoCaracteristica}>🔍</div>
            <h3 className={styles.tituloCaracteristica}>Feedback al instante</h3>
            <p className={styles.explicacionCaracteristica}>
              Sube tu código y recibe un diagnóstico detallado: tipo de error,
              línea exacta del fallo y comparación con la salida esperada.
            </p>
          </div>

          <div className={styles.caracteristicaCard}>
            <div className={styles.iconoCaracteristica}>💡</div>
            <h3 className={styles.tituloCaracteristica}>Pistas antes que soluciones</h3>
            <p className={styles.explicacionCaracteristica}>
              El sistema te da una pista primero para que reflexiones. Solo si
              lo necesitas, accedes al feedback completo.
            </p>
          </div>

          <div className={styles.caracteristicaCard}>
            <div className={styles.iconoCaracteristica}>🧪</div>
            <h3 className={styles.tituloCaracteristica}>Casos de prueba automáticos</h3>
            <p className={styles.explicacionCaracteristica}>
              El profesor sube el código solución y MinCheck genera los casos
              de prueba automáticamente para el juez virtual.
            </p>
          </div>

          <div className={styles.caracteristicaCard}>
            <div className={styles.iconoCaracteristica}>📊</div>
            <h3 className={styles.tituloCaracteristica}>Estadísticas del grupo</h3>
            <p className={styles.explicacionCaracteristica}>
              Los profesores ven un resumen de los errores más comunesy
              el progreso de cada alumno.
            </p>
          </div>

          <div className={styles.caracteristicaCard}>
            <div className={styles.iconoCaracteristica}>⚙️</div>
            <h3 className={styles.tituloCaracteristica}>Feedback configurable</h3>
            <p className={styles.explicacionCaracteristica}>
              El profesor decide el nivel de detalle del feedback, según el momento del curso.
            </p>
          </div>

          <div className={styles.caracteristicaCard}>
            <div className={styles.iconoCaracteristica}>🔬</div>
            <h3 className={styles.tituloCaracteristica}>Contraejemplos mínimos</h3>
            <p className={styles.explicacionCaracteristica}>
              MinCheck genera el contraejemplo más pequeño posible que
              invalida tu solución, para facilitarte la depuración.
            </p>
          </div>

        </div>
      </section>

      {/*Cierre */}
      <section className={styles.zonaCierre}>
        <h2 className={styles.tituloCierre}>¿Listo para empezar?</h2>
        <p className={styles.textoCierre}>
          Únete a MinCheck y mejora tus habilidades de programación con ayuda inteligente.
        </p>
        <Link href="/registro" className={styles.botonRegistroCierre}>
          Crear cuenta 
        </Link>
        <p className={styles.loginCierre}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={styles.linkLoginCierre}>Inicia sesión</Link>
        </p>
      </section>

      {/*Pie de página*/}
      <footer className={styles.piePagina}>
        <div className={styles.logoPie}>
          <span className={styles.logoPie}>[&gt;_]</span>
          <span className={styles.textoPie}>MinCheck</span>
        </div>
        <p className={styles.textoPie}>© 2026 MinCheck. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}