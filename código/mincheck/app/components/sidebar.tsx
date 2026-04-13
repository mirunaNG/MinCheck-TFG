"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";

const rutasSegunRol = {
  profesor: [
    { texto: "Dashboard", ruta: "/dashboard", icono: "▦" },
    { texto: "Asignaturas", ruta: "/asignaturas", icono: "🔖" },
    { texto: "Estadísticas", ruta: "/estadisticas", icono: "📊" },
    { texto: "Mi perfil", ruta: "/perfilProfesor", icono: "👤" },
    { texto: "Generador de casos", ruta: "/generadorCasos", icono: "📋" },
  ],
  alumno: [
    { texto: "Dashboard", ruta: "/dashboardAlumno", icono: "▦" },
    { texto: "Cursos", ruta: "/asignaturasAlumno", icono: "🔖" },
    { texto: "Resultados", ruta: "/historialEntregas", icono: "📊" },
    { texto: "Perfil", ruta: "/perfilAlumno", icono: "👤" },
  ],
};

type TipoRol = keyof typeof rutasSegunRol;

export default function Sidebar({ rol }: { rol: TipoRol }) {
  const rutaActual = usePathname(); 
  const menuParaMostrar = rutasSegunRol[rol];

  return (
    <aside className={styles.menuLateral}>
      <Link href="/" className={styles.logo}>MinCheck</Link>

      <div className={styles.perfilUsuario}>
        <div className={styles.fotoPerfil}>
          <span className={styles.siglasAvatar}>PG</span>
        </div>
        <span className={styles.nombreUsuario}>Prof. García</span>
      </div>

      <nav className={styles.listaEnlaces}>
        {menuParaMostrar.map((item) => (
          <Link
            key={item.ruta}
            href={item.ruta}
            className={`${styles.opcionMenu} ${
              rutaActual === item.ruta ? styles.opcionActiva : ""
            }`}
          >
            <span className={styles.iconoOpcion}>{item.icono}</span>
            {item.texto}
          </Link>
        ))}
      </nav>
    </aside>
  );
}