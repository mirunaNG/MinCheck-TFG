"use client";

import Link from "next/link";
import styles from "./init.module.css";

export default function LandingPage() {
  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>[&gt;_]</span>
          <span className={styles.logoText}>MinCheck</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">About</a>
          <a href="#features">Help</a>
          <Link href="/login" className={styles.loginBtn}>Iniciar sesión</Link>
          <Link href="/registro" className={styles.signupBtn}>Registrarse</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.contenidoHero}>
          <span className={styles.bienvenidaHero}>Bienvenido a MinCheck</span>
          <h1 className={styles.heroTitle}>
            Aprende de tus errores con <br />
            <span className={styles.heroAccent}>feedback inteligente</span>
          </h1>
          <p className={styles.heroSubtitle}>
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

        {/* Decoración fondo */}
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.bgGlow} />
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.features} id="features">
        <h2 className={styles.sectionTitle}>¿Qué puedes hacer con MinCheck?</h2>
        <div className={styles.featureGrid}>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔍</div>
            <h3 className={styles.featureCardTitle}>Feedback al instante</h3>
            <p className={styles.featureCardText}>
              Sube tu código y recibe un diagnóstico detallado: tipo de error,
              línea exacta del fallo y comparación con la salida esperada.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💡</div>
            <h3 className={styles.featureCardTitle}>Pistas antes que soluciones</h3>
            <p className={styles.featureCardText}>
              El sistema te da una pista primero para que reflexiones. Solo si
              lo necesitas, accedes al feedback completo.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🧪</div>
            <h3 className={styles.featureCardTitle}>Casos de prueba automáticos</h3>
            <p className={styles.featureCardText}>
              El profesor sube el código solución y MinCheck genera los casos
              de prueba automáticamente para el juez virtual.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureCardTitle}>Estadísticas del grupo</h3>
            <p className={styles.featureCardText}>
              Los profesores ven un resumen de los errores más comunesy
              el progreso de cada alumno.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚙️</div>
            <h3 className={styles.featureCardTitle}>Feedback configurable</h3>
            <p className={styles.featureCardText}>
              El profesor decide el nivel de detalle del feedback, según el momento del curso.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔬</div>
            <h3 className={styles.featureCardTitle}>Contraejemplos mínimos</h3>
            <p className={styles.featureCardText}>
              MinCheck genera el contraejemplo más pequeño posible que
              invalida tu solución, para facilitarte la depuración.
            </p>
          </div>

        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Listo para empezar?</h2>
        <p className={styles.ctaText}>
          Únete a MinCheck y mejora tus habilidades de programación con ayuda inteligente.
        </p>
        <Link href="/registro" className={styles.ctaBig}>
          Crear cuenta 
        </Link>
        <p className={styles.ctaLogin}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={styles.ctaLoginLink}>Inicia sesión</Link>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <span className={styles.logoIcon}>[&gt;_]</span>
          <span className={styles.logoText}>MinCheck</span>
        </div>
        <p className={styles.footerText}>© 2025 MinCheck. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}