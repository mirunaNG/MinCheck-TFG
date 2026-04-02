/**
 * Datos de EJEMPLO que simulan la base de datos.
 * toDo: reemplazar cada función/constante por llamadas fetch al backend.
 *
 * Modelo de datos:
 *   Usuario ──< Asignatura (profesor crea)
 *   Usuario ──< Matricula >── Asignatura (alumno se matricula)
 *   Asignatura ──< Tema ──< Ejercicio
 *   Usuario ──< Entrega >── Ejercicio
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Rol = "profesor" | "alumno";

export type Usuario = {
  id: number;
  nombreCompleto: string;
  rol: Rol;
  correo: string;
};

export type Asignatura = {
  id: number;
  nombre: string;
  codigoAsignatura: string;
  profesorId: number;
  color: string;
  imagen: string;
  curso: string;
};

export type Matricula = {
  alumnoId: number;
  asignaturaId: number;
};

export type Tema = {
  id: number;
  nombre: string;
  color: string;
  asignaturaId: number;
};

export type Ejercicio = {
  id: number;
  nombre: string;
  temaId: number;
};

export type ResultadoEntrega = "correcto" | "incorrecto" | "pendiente";

export type Entrega = {
  id: number;
  alumnoId: number;
  ejercicioId: number;
  resultado: ResultadoEntrega;
  fechaHora: string;
};

// ─── Datos ────────────────────────────────────────────────────────────────────

export const usuarios: Usuario[] = [
  // Profesor
  { id: 1, nombreCompleto: "Carlos García",    rol: "profesor", correo: "cgarcia@uni.es"   },
  // Alumnos
  { id: 2,  nombreCompleto: "García, Alejandro",  rol: "alumno", correo: "agarcia@uni.es"  },
  { id: 3,  nombreCompleto: "Martínez, Elena",    rol: "alumno", correo: "emartinez@uni.es"},
  { id: 4,  nombreCompleto: "Torres, Roberto",    rol: "alumno", correo: "rtorres@uni.es"  },
  { id: 5,  nombreCompleto: "Zorita, Miguel",     rol: "alumno", correo: "mzorita@uni.es"  },
  { id: 6,  nombreCompleto: "López, Carmen",      rol: "alumno", correo: "clopez@uni.es"   },
  { id: 7,  nombreCompleto: "Ruiz, Andrés",       rol: "alumno", correo: "aruiz@uni.es"    },
  { id: 8,  nombreCompleto: "Fernández, Sofía",   rol: "alumno", correo: "sfernandez@uni.es"},
  { id: 9,  nombreCompleto: "Sánchez, Pablo",     rol: "alumno", correo: "psanchez@uni.es" },
  { id: 10, nombreCompleto: "Navarro, Sofía",     rol: "alumno", correo: "snavarro@uni.es" },
  { id: 11, nombreCompleto: "Fernández, Luis",    rol: "alumno", correo: "lfernandez@uni.es"},
  { id: 12, nombreCompleto: "Mora, Patricia",     rol: "alumno", correo: "pmora@uni.es"    },
  { id: 13, nombreCompleto: "Vega, Daniel",       rol: "alumno", correo: "dvega@uni.es"    },
];

export const asignaturas: Asignatura[] = [
  { id: 1, nombre: "Fundamentos de la Algoritmia",  codigoAsignatura: "458C3",  profesorId: 1, color: "#2a3a5a", imagen: "/asignaturas/algoritmos.jpg", curso: "2025-2026" },
  { id: 2, nombre: "Estructuras de datos",           codigoAsignatura: "DAT002", profesorId: 1, color: "#1a3a4a", imagen: "/asignaturas/datos.jpg",      curso: "2025-2026" },
  { id: 3, nombre: "Bases de datos",                 codigoAsignatura: "BDD003", profesorId: 1, color: "#2a2a4a", imagen: "/asignaturas/bbdd.jpg",       curso: "2025-2026" },
];

// Qué alumno está matriculado en qué asignatura
export const matriculas: Matricula[] = [
  // Asignatura 1 – 8 alumnos
  { alumnoId: 2,  asignaturaId: 1 },
  { alumnoId: 3,  asignaturaId: 1 },
  { alumnoId: 4,  asignaturaId: 1 },
  { alumnoId: 5,  asignaturaId: 1 },
  { alumnoId: 6,  asignaturaId: 1 },
  { alumnoId: 7,  asignaturaId: 1 },
  { alumnoId: 8,  asignaturaId: 1 },
  { alumnoId: 9,  asignaturaId: 1 },
  // Asignatura 2 – 3 alumnos
  { alumnoId: 6,  asignaturaId: 2 },
  { alumnoId: 7,  asignaturaId: 2 },
  { alumnoId: 10, asignaturaId: 2 },
  // Asignatura 3 – 3 alumnos
  { alumnoId: 11, asignaturaId: 3 },
  { alumnoId: 12, asignaturaId: 3 },
  { alumnoId: 13, asignaturaId: 3 },
];

export const temas: Tema[] = [
  { id: 1, nombre: "Recursividad",            color: "#4d7cfe", asignaturaId: 1 },
  { id: 2, nombre: "Algoritmos de ordenación", color: "#4caf50", asignaturaId: 1 },
  { id: 3, nombre: "Divide y vencerás",        color: "#e38500", asignaturaId: 1 },
  { id: 4, nombre: "Listas y árboles",         color: "#4d7cfe", asignaturaId: 2 },
  { id: 5, nombre: "Consultas y modelado",     color: "#4caf50", asignaturaId: 3 },
];

export const ejercicios: Ejercicio[] = [
  // Tema 1 – Recursividad
  { id: 1,  nombre: "Factorial recursivo",         temaId: 1 },
  { id: 2,  nombre: "Torres de Hanói",             temaId: 1 },
  { id: 3,  nombre: "Problema de las N-reinas",    temaId: 1 },
  { id: 4,  nombre: "Sudoku 1",                    temaId: 1 },
  // Tema 2 – Ordenación
  { id: 5,  nombre: "Bubble sort",                 temaId: 2 },
  { id: 6,  nombre: "Merge sort",                  temaId: 2 },
  { id: 7,  nombre: "Quick sort",                  temaId: 2 },
  { id: 8,  nombre: "Heap sort",                   temaId: 2 },
  // Tema 3 – Divide y vencerás
  { id: 9,  nombre: "Búsqueda binaria",            temaId: 3 },
  { id: 10, nombre: "Par de puntos más cercanos",  temaId: 3 },
  // Tema 4 – Listas y árboles
  { id: 11, nombre: "Listas enlazadas",            temaId: 4 },
  { id: 12, nombre: "Pilas y colas",               temaId: 4 },
  { id: 13, nombre: "Árboles AVL",                 temaId: 4 },
  // Tema 5 – Consultas y modelado
  { id: 14, nombre: "Consultas SQL",               temaId: 5 },
  { id: 15, nombre: "Normalización",               temaId: 5 },
  { id: 16, nombre: "Joins y subconsultas",        temaId: 5 },
];

// Cada fila = un alumno entrega un ejercicio
export const entregas: Entrega[] = [
  // ── Asignatura 1 ──
  { id: 1,  alumnoId: 2,  ejercicioId: 1,  resultado: "correcto",    fechaHora: "Hoy, 14:30"   },
  { id: 2,  alumnoId: 3,  ejercicioId: 1,  resultado: "correcto",    fechaHora: "Hoy, 13:10"   },
  { id: 3,  alumnoId: 4,  ejercicioId: 1,  resultado: "incorrecto",  fechaHora: "Ayer, 18:45"  },
  { id: 4,  alumnoId: 5,  ejercicioId: 1,  resultado: "correcto",    fechaHora: "Ayer, 10:45"  },
  { id: 5,  alumnoId: 6,  ejercicioId: 1,  resultado: "correcto",    fechaHora: "Ayer, 09:00"  },
  { id: 6,  alumnoId: 7,  ejercicioId: 1,  resultado: "correcto",    fechaHora: "Lun, 17:00"   },
  { id: 7,  alumnoId: 8,  ejercicioId: 2,  resultado: "incorrecto",  fechaHora: "Hoy, 10:00"   },
  { id: 8,  alumnoId: 9,  ejercicioId: 2,  resultado: "correcto",    fechaHora: "Ayer, 11:30"  },
  { id: 9,  alumnoId: 2,  ejercicioId: 3,  resultado: "correcto",    fechaHora: "Lun, 16:00"   },
  { id: 10, alumnoId: 3,  ejercicioId: 3,  resultado: "incorrecto",  fechaHora: "Lun, 12:00"   },
  // ── Asignatura 2 ──
  { id: 11, alumnoId: 6,  ejercicioId: 11, resultado: "correcto",    fechaHora: "Hoy, 09:00"   },
  { id: 12, alumnoId: 7,  ejercicioId: 12, resultado: "incorrecto",  fechaHora: "Ayer, 17:00"  },
  { id: 13, alumnoId: 10, ejercicioId: 13, resultado: "correcto",    fechaHora: "Ayer, 11:30"  },
  // ── Asignatura 3 ──
  { id: 14, alumnoId: 11, ejercicioId: 14, resultado: "correcto",    fechaHora: "Hoy, 12:00"   },
  { id: 15, alumnoId: 12, ejercicioId: 15, resultado: "incorrecto",  fechaHora: "Hoy, 08:45"   },
  { id: 16, alumnoId: 13, ejercicioId: 16, resultado: "correcto",    fechaHora: "Ayer, 16:00"  },
];

// ─── Helpers (sustituirán a llamadas fetch cuando haya backend) ───────────────

/** Asignaturas que imparte un profesor */
export function asignaturasDe(profesorId: number): Asignatura[] {
  return asignaturas.filter((a) => a.profesorId === profesorId);
}

/** Alumnos matriculados en una asignatura */
export function alumnosDe(asignaturaId: number): Usuario[] {
  const ids = matriculas
    .filter((m) => m.asignaturaId === asignaturaId)
    .map((m) => m.alumnoId);
  return usuarios.filter((u) => ids.includes(u.id));
}

/** Total de alumnos matriculados en una asignatura */
export function totalAlumnosDe(asignaturaId: number): number {
  return matriculas.filter((m) => m.asignaturaId === asignaturaId).length;
}

/** Temas de una asignatura */
export function temasDe(asignaturaId: number): Tema[] {
  return temas.filter((t) => t.asignaturaId === asignaturaId);
}

/** Ejercicios de un tema, con el número de entregas calculado */
export function ejerciciosDeTema(temaId: number): (Ejercicio & { numEntregas: number })[] {
  return ejercicios
    .filter((e) => e.temaId === temaId)
    .map((e) => ({
      ...e,
      numEntregas: entregas.filter((en) => en.ejercicioId === e.id).length,
    }));
}

/** Total de ejercicios de una asignatura (suma de todos sus temas) */
export function totalEjerciciosDe(asignaturaId: number): number {
  const temaIds = temas.filter((t) => t.asignaturaId === asignaturaId).map((t) => t.id);
  return ejercicios.filter((e) => temaIds.includes(e.temaId)).length;
}

/** Cuántos ejercicios ha completado (resultado correcto) un alumno en una asignatura */
export function ejerciciosCompletados(alumnoId: number, asignaturaId: number): number {
  const temaIds = temas.filter((t) => t.asignaturaId === asignaturaId).map((t) => t.id);
  const ejercicioIds = ejercicios.filter((e) => temaIds.includes(e.temaId)).map((e) => e.id);
  return entregas.filter(
    (en) => en.alumnoId === alumnoId && ejercicioIds.includes(en.ejercicioId) && en.resultado === "correcto"
  ).length;
}

/** Últimas N entregas de una asignatura, con nombres resueltos */
export function ultimasEntregasDe(
  asignaturaId: number,
  limit = 5
): { id: number; alumno: string; ejercicio: string; fechaHora: string; correcto: boolean }[] {
  const temaIds = temas.filter((t) => t.asignaturaId === asignaturaId).map((t) => t.id);
  const ejercicioIds = ejercicios.filter((e) => temaIds.includes(e.temaId)).map((e) => e.id);

  return entregas
    .filter((en) => ejercicioIds.includes(en.ejercicioId))
    .slice(-limit)
    .reverse()
    .map((en) => ({
      id: en.id,
      alumno:    usuarios.find((u) => u.id === en.alumnoId)?.nombreCompleto ?? "–",
      ejercicio: ejercicios.find((e) => e.id === en.ejercicioId)?.nombre ?? "–",
      fechaHora: en.fechaHora,
      correcto:  en.resultado === "correcto",
    }));
}
