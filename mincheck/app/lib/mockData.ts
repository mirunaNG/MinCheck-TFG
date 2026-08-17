// /**
//  * Datos de EJEMPLO que simulan la base de datos.
//  *  */

// /* PARA CUANDO HACÏA LAS PRUEBAS DE FRONTEND SIN TENER CONECTADO EL BACK */

// export type Rol = "profesor" | "alumno";

// export type Usuario = {
//   id: number;
//   nombreCompleto: string;
//   rol: Rol;
//   correo: string;
// };

// export type Asignatura = {
//   id: number;
//   nombre: string;
//   codigoAsignatura: string;
//   profesorId: number;
//   color: string;
//   imagen: string;
//   curso: string;
// };

// export type Matricula = {
//   alumnoId: number;
//   asignaturaId: number;
// };

// export type Tema = {
//   id: number;
//   nombre: string;
//   color: string;
//   asignaturaId: number;
// };

// export type ArchivoEjercicio = {
//   nombre: string;
//   tamano: string;
//   fecha: string;
// };

// export type Ejercicio = {
//   id: number;
//   nombre: string;
//   temaId: number;
//   enunciadoPdf: ArchivoEjercicio | null;
//   codigoSolucion: ArchivoEjercicio | null;
// };

// export type CasoPrueba = {
//   id: number;
//   ejercicioId: number;
//   input: string;
//   outputEsperado: string;
// };

// export type ResultadoEntrega = "correcto" | "incorrecto" | "pendiente";

// export type Entrega = {
//   id: number;
//   alumnoId: number;
//   ejercicioId: number;
//   resultado: ResultadoEntrega;
//   fechaHora: string;
//   intentos: number;
//   errorPrincipal: string | null;
// };

// export const usuarios: Usuario[] = [
//   // Profesor
//   { id: 1, nombreCompleto: "Carlos García",    rol: "profesor", correo: "cgarcia@uni.es"   },
//   // Alumnos
//   { id: 2,  nombreCompleto: "García, Alejandro",  rol: "alumno", correo: "agarcia@uni.es"  },
//   { id: 3,  nombreCompleto: "Martínez, Elena",    rol: "alumno", correo: "emartinez@uni.es"},
//   { id: 4,  nombreCompleto: "Torres, Roberto",    rol: "alumno", correo: "rtorres@uni.es"  },
//   { id: 5,  nombreCompleto: "Zorita, Miguel",     rol: "alumno", correo: "mzorita@uni.es"  },
//   { id: 6,  nombreCompleto: "López, Carmen",      rol: "alumno", correo: "clopez@uni.es"   },
//   { id: 7,  nombreCompleto: "Ruiz, Andrés",       rol: "alumno", correo: "aruiz@uni.es"    },
//   { id: 8,  nombreCompleto: "Fernández, Sofía",   rol: "alumno", correo: "sfernandez@uni.es"},
//   { id: 9,  nombreCompleto: "Sánchez, Pablo",     rol: "alumno", correo: "psanchez@uni.es" },
//   { id: 10, nombreCompleto: "Navarro, Sofía",     rol: "alumno", correo: "snavarro@uni.es" },
//   { id: 11, nombreCompleto: "Fernández, Luis",    rol: "alumno", correo: "lfernandez@uni.es"},
//   { id: 12, nombreCompleto: "Mora, Patricia",     rol: "alumno", correo: "pmora@uni.es"    },
//   { id: 13, nombreCompleto: "Vega, Daniel",       rol: "alumno", correo: "dvega@uni.es"    },
// ];

// export const asignaturas: Asignatura[] = [
//   { id: 1, nombre: "Fundamentos de la Algoritmia",  codigoAsignatura: "458C3",  profesorId: 1, color: "#2a3a5a", imagen: "/asignaturas/algoritmos.jpg", curso: "2025-2026" },
//   { id: 2, nombre: "Estructuras de datos",           codigoAsignatura: "DAT002", profesorId: 1, color: "#1a3a4a", imagen: "/asignaturas/datos.jpg",      curso: "2025-2026" },
//   { id: 3, nombre: "Bases de datos",                 codigoAsignatura: "BDD003", profesorId: 1, color: "#2a2a4a", imagen: "/asignaturas/bbdd.jpg",       curso: "2025-2026" },
// ];

// // Qué alumno está matriculado en qué asignatura
// export const matriculas: Matricula[] = [
//   // Asignatura 1 – 8 alumnos
//   { alumnoId: 2,  asignaturaId: 1 },
//   { alumnoId: 3,  asignaturaId: 1 },
//   { alumnoId: 4,  asignaturaId: 1 },
//   { alumnoId: 5,  asignaturaId: 1 },
//   { alumnoId: 6,  asignaturaId: 1 },
//   { alumnoId: 7,  asignaturaId: 1 },
//   { alumnoId: 8,  asignaturaId: 1 },
//   { alumnoId: 9,  asignaturaId: 1 },
//   // Asignatura 2 – 3 alumnos
//   { alumnoId: 6,  asignaturaId: 2 },
//   { alumnoId: 7,  asignaturaId: 2 },
//   { alumnoId: 10, asignaturaId: 2 },
//   // Asignatura 3 – 3 alumnos + alumno 2 (demo)
//   { alumnoId: 2,  asignaturaId: 3 },
//   { alumnoId: 11, asignaturaId: 3 },
//   { alumnoId: 12, asignaturaId: 3 },
//   { alumnoId: 13, asignaturaId: 3 },
// ];

// export const temas: Tema[] = [
//   { id: 1, nombre: "Recursividad",            color: "#4d7cfe", asignaturaId: 1 },
//   { id: 2, nombre: "Algoritmos de ordenación", color: "#4caf50", asignaturaId: 1 },
//   { id: 3, nombre: "Divide y vencerás",        color: "#e38500", asignaturaId: 1 },
//   { id: 4, nombre: "Listas y árboles",         color: "#4d7cfe", asignaturaId: 2 },
//   { id: 5, nombre: "Consultas y modelado",     color: "#4caf50", asignaturaId: 3 },
// ];

// export const ejercicios: Ejercicio[] = [
//   // Tema 1 – Recursividad
//   { id: 1,  nombre: "Factorial recursivo",        temaId: 1, enunciadoPdf:   { nombre: "FACT_RECURSIVO.pdf",    tamano: "145 KB", fecha: "1 feb 2025" }, codigoSolucion: { nombre: "FactRecursivo_sol.cpp",  tamano: "2.4 KB", fecha: "1 feb 2025" } },
//   { id: 2,  nombre: "Torres de Hanói",            temaId: 1, enunciadoPdf:   { nombre: "HANOI.pdf",             tamano: "98 KB",  fecha: "3 feb 2025" }, codigoSolucion: { nombre: "Hanoi_sol.cpp",           tamano: "1.8 KB", fecha: "3 feb 2025" } },
//   { id: 3,  nombre: "Problema de las N-reinas",   temaId: 1, enunciadoPdf:   { nombre: "N_REINAS.pdf",          tamano: "210 KB", fecha: "5 feb 2025" }, codigoSolucion: { nombre: "NReinas_sol.cpp",         tamano: "3.1 KB", fecha: "5 feb 2025" } },
//   { id: 4,  nombre: "Sudoku 1",                   temaId: 1, enunciadoPdf:   { nombre: "SUDOKU1.pdf",           tamano: "175 KB", fecha: "7 feb 2025" }, codigoSolucion: { nombre: "Sudoku_sol.pdf",            tamano: "1.1 KB", fecha: "7 feb 2025" } },
//   // Tema 2 – Ordenación
//   { id: 5,  nombre: "Bubble sort",                temaId: 2, enunciadoPdf:   { nombre: "BUBBLE_SORT.pdf",       tamano: "88 KB",  fecha: "10 feb 2025" }, codigoSolucion: { nombre: "BubbleSort_sol.cpp",      tamano: "1.2 KB", fecha: "10 feb 2025" } },
//   { id: 6,  nombre: "Merge sort",                 temaId: 2, enunciadoPdf:   { nombre: "MERGE_SORT.pdf",        tamano: "112 KB", fecha: "10 feb 2025" }, codigoSolucion: { nombre: "MergeSort_sol.cpp",       tamano: "2.0 KB", fecha: "10 feb 2025" } },
//   { id: 7,  nombre: "Quick sort",                 temaId: 2, enunciadoPdf:   { nombre: "QUICK_SORT.pdf",        tamano: "95 KB",  fecha: "12 feb 2025" }, codigoSolucion: { nombre: "QuickSort_sol.cpp",       tamano: "1.6 KB", fecha: "12 feb 2025" } },
//   { id: 8,  nombre: "Heap sort",                  temaId: 2, enunciadoPdf:   { nombre: "HEAP_SORT.pdf",         tamano: "105 KB", fecha: "14 feb 2025" }, codigoSolucion: { nombre: "HeapSort_sol.cpp",        tamano: "1.9 KB", fecha: "14 feb 2025" } },
//   // Tema 3 – Divide y vencerás
//   { id: 9,  nombre: "Búsqueda binaria",           temaId: 3, enunciadoPdf:   { nombre: "BUSQUEDA_BINARIA.pdf",  tamano: "130 KB", fecha: "15 feb 2025" }, codigoSolucion: { nombre: "BusquedaBinaria_sol.cpp", tamano: "1.5 KB", fecha: "15 feb 2025" } },
//   { id: 10, nombre: "Par de puntos más cercanos", temaId: 3, enunciadoPdf:   { nombre: "PAR_PUNTOS.pdf",        tamano: "190 KB", fecha: "17 feb 2025" }, codigoSolucion: { nombre: "ParPuntos_sol.pdf",         tamano: "1.2 KB", fecha: "17 feb 2025" } },
//   // Tema 4 – Listas y árboles
//   { id: 11, nombre: "Listas enlazadas",           temaId: 4, enunciadoPdf:   { nombre: "LISTAS_ENLAZADAS.pdf",  tamano: "155 KB", fecha: "1 mar 2025"  }, codigoSolucion: { nombre: "ListasEnlazadas_sol.cpp", tamano: "2.7 KB", fecha: "1 mar 2025"  } },
//   { id: 12, nombre: "Pilas y colas",              temaId: 4, enunciadoPdf:   { nombre: "PILAS_COLAS.pdf",       tamano: "120 KB", fecha: "3 mar 2025"  }, codigoSolucion: { nombre: "PilasColas_sol.cpp",      tamano: "1.8 KB", fecha: "3 mar 2025"  } },
//   { id: 13, nombre: "Árboles AVL",                temaId: 4, enunciadoPdf:   { nombre: "ARBOLES_AVL.pdf",       tamano: "230 KB", fecha: "5 mar 2025"  }, codigoSolucion: { nombre: "ArbolesAVL_sol.cpp",      tamano: "4.2 KB", fecha: "5 mar 2025"  } },
//   // Tema 5 – Consultas y modelado
//   { id: 14, nombre: "Consultas SQL",              temaId: 5, enunciadoPdf:   { nombre: "CONSULTAS_SQL.pdf",     tamano: "165 KB", fecha: "10 mar 2025" }, codigoSolucion: { nombre: "ConsultasSQL_sol.sql",    tamano: "1.9 KB", fecha: "10 mar 2025" } },
//   { id: 15, nombre: "Normalización",              temaId: 5, enunciadoPdf:   { nombre: "NORMALIZACION.pdf",     tamano: "200 KB", fecha: "12 mar 2025" }, codigoSolucion:  { nombre: "Normalizacion_sol.pdf",     tamano: "1.4 KB", fecha: "12 mar 2025" } },
//   { id: 16, nombre: "Joins y subconsultas",       temaId: 5, enunciadoPdf:   { nombre: "JOINS.pdf",             tamano: "145 KB", fecha: "14 mar 2025" }, codigoSolucion: { nombre: "Joins_sol.sql",           tamano: "2.3 KB", fecha: "14 mar 2025" } },
// ];

// // Cada fila = un alumno entrega un ejercicio
// export const entregas: Entrega[] = [
//   // ── Asignatura 1 ──
//   { id: 1,  alumnoId: 2,  ejercicioId: 1,  resultado: "correcto",   fechaHora: "Hoy, 14:30",  intentos: 1, errorPrincipal: null                  },
//   { id: 2,  alumnoId: 3,  ejercicioId: 1,  resultado: "incorrecto", fechaHora: "Hoy, 13:10",  intentos: 3, errorPrincipal: "Index out of bound"   },
//   { id: 3,  alumnoId: 4,  ejercicioId: 1,  resultado: "correcto",   fechaHora: "Ayer, 18:45", intentos: 2, errorPrincipal: null                  },
//   { id: 4,  alumnoId: 5,  ejercicioId: 1,  resultado: "correcto",   fechaHora: "Ayer, 10:45", intentos: 2, errorPrincipal: null                  },
//   { id: 5,  alumnoId: 6,  ejercicioId: 1,  resultado: "incorrecto", fechaHora: "Ayer, 20:32", intentos: 1, errorPrincipal: "Null pointer exception"},
//   { id: 6,  alumnoId: 7,  ejercicioId: 1,  resultado: "incorrecto", fechaHora: "Ayer, 10:45", intentos: 1, errorPrincipal: "Infinite loop"        },
//   { id: 7,  alumnoId: 8,  ejercicioId: 2,  resultado: "incorrecto", fechaHora: "Hoy, 10:00",  intentos: 2, errorPrincipal: "Stack overflow"        },
//   { id: 8,  alumnoId: 9,  ejercicioId: 2,  resultado: "correcto",   fechaHora: "Ayer, 11:30", intentos: 1, errorPrincipal: null                  },
//   { id: 9,  alumnoId: 2,  ejercicioId: 3,  resultado: "correcto",   fechaHora: "Lun, 16:00",  intentos: 1, errorPrincipal: null                  },
//   { id: 10, alumnoId: 3,  ejercicioId: 3,  resultado: "incorrecto", fechaHora: "Lun, 12:00",  intentos: 4, errorPrincipal: "Wrong output"          },
//   // ── Asignatura 2 ──
//   { id: 11, alumnoId: 6,  ejercicioId: 11, resultado: "correcto",   fechaHora: "Hoy, 09:00",  intentos: 1, errorPrincipal: null                  },
//   { id: 12, alumnoId: 7,  ejercicioId: 12, resultado: "incorrecto", fechaHora: "Ayer, 17:00", intentos: 2, errorPrincipal: "Null pointer exception"},
//   { id: 13, alumnoId: 10, ejercicioId: 13, resultado: "correcto",   fechaHora: "Ayer, 11:30", intentos: 1, errorPrincipal: null                  },
//   // ── Asignatura 3 ──
//   { id: 14, alumnoId: 11, ejercicioId: 14, resultado: "correcto",   fechaHora: "Hoy, 12:00",  intentos: 1, errorPrincipal: null                  },
//   { id: 15, alumnoId: 12, ejercicioId: 15, resultado: "incorrecto", fechaHora: "Hoy, 08:45",  intentos: 3, errorPrincipal: "Syntax error"          },
//   { id: 16, alumnoId: 13, ejercicioId: 16, resultado: "correcto",   fechaHora: "Ayer, 16:00", intentos: 2, errorPrincipal: null                  },
//   // ── Alumno 2 (Juan) – más entregas para demo ──
//   { id: 17, alumnoId: 2,  ejercicioId: 2,  resultado: "correcto",   fechaHora: "Hoy, 13:25",  intentos: 4, errorPrincipal: null                  },
//   { id: 18, alumnoId: 2,  ejercicioId: 4,  resultado: "incorrecto", fechaHora: "Hoy, 12:00",  intentos: 3, errorPrincipal: "Wrong output"          },
//   { id: 19, alumnoId: 2,  ejercicioId: 5,  resultado: "correcto",   fechaHora: "Jue, 18:20",  intentos: 1, errorPrincipal: null                  },
//   { id: 20, alumnoId: 2,  ejercicioId: 6,  resultado: "incorrecto", fechaHora: "Mie, 10:30",  intentos: 2, errorPrincipal: "Time limit exceeded"   },
//   { id: 21, alumnoId: 2,  ejercicioId: 9,  resultado: "incorrecto", fechaHora: "Mie, 11:15",  intentos: 1, errorPrincipal: "Wrong output"          },
//   { id: 22, alumnoId: 2,  ejercicioId: 10, resultado: "correcto",   fechaHora: "Mie, 13:30",  intentos: 2, errorPrincipal: null                  },
//   { id: 23, alumnoId: 2,  ejercicioId: 7,  resultado: "incorrecto", fechaHora: "Ayer, 20:30", intentos: 2, errorPrincipal: "Runtime error"         },
//   { id: 24, alumnoId: 2,  ejercicioId: 3,  resultado: "correcto",   fechaHora: "Jue, 16:30",  intentos: 1, errorPrincipal: null                  },
//   // ── Alumno 2 en Bases de datos (asignatura 3) ──
//   { id: 25, alumnoId: 2,  ejercicioId: 14, resultado: "correcto",   fechaHora: "Hoy, 16:30",  intentos: 1, errorPrincipal: null                  },
//   { id: 26, alumnoId: 2,  ejercicioId: 16, resultado: "correcto",   fechaHora: "Mar, 18:30",  intentos: 1, errorPrincipal: null                  },
//   { id: 27, alumnoId: 2,  ejercicioId: 15, resultado: "incorrecto", fechaHora: "Mar, 17:43",  intentos: 2, errorPrincipal: "Syntax error"          },
// ];

// export const casosPrueba: CasoPrueba[] = [
//   // ── Ejercicio 1: Factorial recursivo ──
//   { id: 1,  ejercicioId: 1, input: "0",  outputEsperado: "1"       },
//   { id: 2,  ejercicioId: 1, input: "1",  outputEsperado: "1"       },
//   { id: 3,  ejercicioId: 1, input: "5",  outputEsperado: "120"     },
//   { id: 4,  ejercicioId: 1, input: "10", outputEsperado: "3628800" },
//   { id: 5,  ejercicioId: 1, input: "7",  outputEsperado: "5040"    },
//   // ── Ejercicio 2: Torres de Hanói ──
//   { id: 6,  ejercicioId: 2, input: "1",  outputEsperado: "1"  },
//   { id: 7,  ejercicioId: 2, input: "2",  outputEsperado: "3"  },
//   { id: 8,  ejercicioId: 2, input: "3",  outputEsperado: "7"  },
//   { id: 9,  ejercicioId: 2, input: "4",  outputEsperado: "15" },
//   { id: 10, ejercicioId: 2, input: "5",  outputEsperado: "31" },
//   // ── Ejercicio 5: Bubble sort ──
//   { id: 11, ejercicioId: 5, input: "5\n3 1 4 1 5", outputEsperado: "1 1 3 4 5" },
//   { id: 12, ejercicioId: 5, input: "4\n8 2 6 3",   outputEsperado: "2 3 6 8"   },
//   { id: 13, ejercicioId: 5, input: "1\n42",         outputEsperado: "42"        },
//   { id: 14, ejercicioId: 5, input: "6\n5 4 3 2 1 0", outputEsperado: "0 1 2 3 4 5" },
//   { id: 15, ejercicioId: 5, input: "3\n7 7 7",      outputEsperado: "7 7 7"     },
//   // ── Ejercicio 6: Merge sort ──
//   { id: 16, ejercicioId: 6, input: "5\n9 3 7 1 5",  outputEsperado: "1 3 5 7 9" },
//   { id: 17, ejercicioId: 6, input: "4\n10 4 8 2",   outputEsperado: "2 4 8 10"  },
//   { id: 18, ejercicioId: 6, input: "6\n6 5 4 3 2 1", outputEsperado: "1 2 3 4 5 6" },
//   // ── Ejercicio 7: Quick sort ──
//   { id: 19, ejercicioId: 7, input: "5\n3 6 8 10 1", outputEsperado: "1 3 6 8 10" },
//   { id: 20, ejercicioId: 7, input: "4\n7 2 1 9",    outputEsperado: "1 2 7 9"    },
//   { id: 21, ejercicioId: 7, input: "5\n5 4 3 2 1",  outputEsperado: "1 2 3 4 5"  },
//   // ── Ejercicio 9: Búsqueda binaria ──
//   { id: 22, ejercicioId: 9, input: "5\n1 3 5 7 9\n5", outputEsperado: "2"  },
//   { id: 23, ejercicioId: 9, input: "5\n1 3 5 7 9\n1", outputEsperado: "0"  },
//   { id: 24, ejercicioId: 9, input: "5\n1 3 5 7 9\n4", outputEsperado: "-1" },
// ];


// /** Asignaturas que imparte un profesor */
// export function asignaturasDe(profesorId: number): Asignatura[] {
//   return asignaturas.filter((a) => a.profesorId === profesorId);
// }

// /** Asignaturas en las que está matriculado un alumno */
// export function asignaturasDeAlumno(alumnoId: number): Asignatura[] {
//   const ids = matriculas
//     .filter((m) => m.alumnoId === alumnoId)
//     .map((m) => m.asignaturaId);
//   return asignaturas.filter((a) => ids.includes(a.id));
// }

// /** Últimas N entregas de un alumno con el nombre del ejercicio */
// export function ultimasEntregasDeAlumno(
//   alumnoId: number,
//   limit = 4
// ): { id: number; ejercicio: string; resultado: ResultadoEntrega; errorPrincipal: string | null; fechaHora: string }[] {
//   return entregas
//     .filter((e) => e.alumnoId === alumnoId)
//     .slice(-limit)
//     .reverse()
//     .map((e) => ({
//       id:            e.id,
//       ejercicio:     ejercicios.find((ej) => ej.id === e.ejercicioId)?.nombre ?? "–",
//       resultado:     e.resultado,
//       errorPrincipal: e.errorPrincipal,
//       fechaHora:     e.fechaHora,
//     }));
// }

// /** Alumnos matriculados en una asignatura */
// export function alumnosDe(asignaturaId: number): Usuario[] {
//   const ids = matriculas
//     .filter((m) => m.asignaturaId === asignaturaId)
//     .map((m) => m.alumnoId);
//   return usuarios.filter((u) => ids.includes(u.id));
// }

// /** Total de alumnos matriculados en una asignatura */
// export function totalAlumnosDe(asignaturaId: number): number {
//   return matriculas.filter((m) => m.asignaturaId === asignaturaId).length;
// }

// /** Temas de una asignatura */
// export function temasDe(asignaturaId: number): Tema[] {
//   return temas.filter((t) => t.asignaturaId === asignaturaId);
// }

// /** Ejercicios de un tema, con el número de entregas calculado */
// export function ejerciciosDeTema(temaId: number): (Ejercicio & { numEntregas: number })[] {
//   return ejercicios
//     .filter((e) => e.temaId === temaId)
//     .map((e) => ({
//       ...e,
//       numEntregas: entregas.filter((en) => en.ejercicioId === e.id).length,
//     }));
// }

// /** Total de ejercicios de una asignatura (suma de todos sus temas) */
// export function totalEjerciciosDe(asignaturaId: number): number {
//   const temaIds = temas.filter((t) => t.asignaturaId === asignaturaId).map((t) => t.id);
//   return ejercicios.filter((e) => temaIds.includes(e.temaId)).length;
// }

// /** Cuántos ejercicios ha completado (resultado correcto) un alumno en una asignatura */
// export function ejerciciosCompletados(alumnoId: number, asignaturaId: number): number {
//   const temaIds = temas.filter((t) => t.asignaturaId === asignaturaId).map((t) => t.id);
//   const ejercicioIds = ejercicios.filter((e) => temaIds.includes(e.temaId)).map((e) => e.id);
//   return entregas.filter(
//     (en) => en.alumnoId === alumnoId && ejercicioIds.includes(en.ejercicioId) && en.resultado === "correcto"
//   ).length;
// }

// /** Todas las entregas de un alumno agrupadas por asignatura */
// export function entregasAgrupadasPorAsignatura(
//   alumnoId: number
// ): { asignatura: Asignatura; entregas: { id: number; ejercicio: string; resultado: ResultadoEntrega; fechaHora: string }[] }[] {
//   const misAsignaturas = asignaturasDeAlumno(alumnoId);
//   return misAsignaturas.map((asig) => {
//     const temaIds = temas.filter((t) => t.asignaturaId === asig.id).map((t) => t.id);
//     const ejercicioIds = ejercicios.filter((e) => temaIds.includes(e.temaId)).map((e) => e.id);
//     const misEntregas = entregas
//       .filter((en) => en.alumnoId === alumnoId && ejercicioIds.includes(en.ejercicioId))
//       .map((en) => ({
//         id:        en.id,
//         ejercicio: ejercicios.find((ej) => ej.id === en.ejercicioId)?.nombre ?? "–",
//         resultado: en.resultado,
//         fechaHora: en.fechaHora,
//       }));
//     return { asignatura: asig, entregas: misEntregas };
//   }).filter((grupo) => grupo.entregas.length > 0);
// }

// /** Casos de prueba de un ejercicio */
// export function casosDe(ejercicioId: number): CasoPrueba[] {
//   return casosPrueba.filter((c) => c.ejercicioId === ejercicioId);
// }

// /** Errores más comunes de un ejercicio con su tasa (% sobre total de entregas) */
// export function erroresDe(ejercicioId: number): { error: string; porcentaje: number }[] {
//   const entregasEj = entregas.filter((e) => e.ejercicioId === ejercicioId);
//   const total = entregasEj.length;
//   if (total === 0) return [];
//   const conteo: Record<string, number> = {};
//   for (const e of entregasEj) {
//     if (e.errorPrincipal) {
//       conteo[e.errorPrincipal] = (conteo[e.errorPrincipal] ?? 0) + 1;
//     }
//   }
//   return Object.entries(conteo)
//     .map(([error, count]) => ({ error, porcentaje: Math.round((count / total) * 100) }))
//     .sort((a, b) => b.porcentaje - a.porcentaje);
// }

// /** Últimas N entregas de una asignatura, con nombres resueltos */
// export function ultimasEntregasDe(
//   asignaturaId: number,
//   limit = 5
// ): { id: number; alumno: string; ejercicio: string; fechaHora: string; correcto: boolean }[] {
//   const temaIds = temas.filter((t) => t.asignaturaId === asignaturaId).map((t) => t.id);
//   const ejercicioIds = ejercicios.filter((e) => temaIds.includes(e.temaId)).map((e) => e.id);

//   return entregas
//     .filter((en) => ejercicioIds.includes(en.ejercicioId))
//     .slice(-limit)
//     .reverse()
//     .map((en) => ({
//       id: en.id,
//       alumno:    usuarios.find((u) => u.id === en.alumnoId)?.nombreCompleto ?? "–",
//       ejercicio: ejercicios.find((e) => e.id === en.ejercicioId)?.nombre ?? "–",
//       fechaHora: en.fechaHora,
//       correcto:  en.resultado === "correcto",
//     }));
// }
