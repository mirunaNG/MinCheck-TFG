"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";

const navItemsByRol = {
  profesor: [
    { label: "Dashboard", href: "/dashboard", icon: "▦" },
    { label: "Asignaturas", href: "/asignaturas", icon: "🔖" },
    { label: "Estadísticas", href: "/estadisticas", icon: "📊" },
    { label: "Mi perfil", href: "/perfilProfesor", icon: "👤" },
    { label: "Generador de casos", href: "/generadorCasos", icon: "📋" },
  ],
  alumno: [
    { label: "Dashboard", href: "/dashboardAlumno", icon: "▦" },
    { label: "Cursos", href: "/cursos", icon: "🔖" },
    { label: "Resultados", href: "/resultados", icon: "📊" },
    { label: "Perfil", href: "/perfilAlumno", icon: "👤" },
  ],
};

type Rol = keyof typeof navItemsByRol;

export default function Sidebar({ rol }: { rol: Rol }) {
  const pathname = usePathname();
  const navItems = navItemsByRol[rol];

  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.logo}>MinCheck</Link>

      <div className={styles.profile}>
        <div className={styles.avatar}>
          <span className={styles.avatarInitials}>PG</span>
        </div>
        <span className={styles.profileName}>Prof. García</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.navItemActive : ""}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}