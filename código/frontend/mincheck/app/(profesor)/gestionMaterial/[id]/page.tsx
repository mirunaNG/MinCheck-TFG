"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import Modal from "../../../components/Modal";
import styles from "../gestionMat.module.css";
import { asignaturas, temasDe, ejerciciosDeTema, totalAlumnosDe } from "../../../lib/mockData";

type EjercicioUI = {
  id: number;
  nombre: string;
  entregas: number;
};

type TemaUI = {
  id: number;
  nombre: string;
  color: string;
  ejercicios: EjercicioUI[];
};

const COLORES_TEMA = ["#e38500", "#4caf50", "#4d7cfe", "#e53935", "#ab47bc", "#f9ca24", "#26c6da"];

type ModalTipo = "ejercicio" | "tema" | null;

export default function GestionMaterial({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const asignaturaId = Number(id);
  const router = useRouter();

  const asignatura = asignaturas.find((a) => a.id === asignaturaId);
  const totalAlumnos = totalAlumnosDe(asignaturaId);

  function colorBadge(entregas: number): string {
    if (totalAlumnos === 0) return "#7a1010";
    const pct = entregas / totalAlumnos;
    if (pct >= 0.66) return "#1e5c2d"; // >= 66 % → verde
    if (pct >= 0.33) return "#7a4800"; // >= 33 % → naranja
    return "#7a1010";                  //  < 33 % → rojo
  }

  function temasIniciales(): TemaUI[] {
    return temasDe(asignaturaId).map((t) => ({
      ...t,
      ejercicios: ejerciciosDeTema(t.id).map((e) => ({
        id: e.id,
        nombre: e.nombre,
        entregas: e.numEntregas,
      })),
    }));
  }

  const [temas, setTemas] = useState<TemaUI[]>(temasIniciales());

  /* ── Estado modales ── */
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);

  /* Estado formulario nuevo ejercicio */
  const [temaSeleccionado, setTemaSeleccionado] = useState<number>(temasIniciales()[0]?.id ?? 0);
  const [nombreEjercicio, setNombreEjercicio] = useState("");
  const [enunciadoFile, setEnunciadoFile] = useState<File | null>(null);
  const [solucionFile, setSolucionFile] = useState<File | null>(null);

  /* Estado formulario nuevo tema */
  const [nombreTema, setNombreTema] = useState("");
  const [colorTema, setColorTema] = useState(COLORES_TEMA[2]);

  function abrirModalEjercicio(temaId?: number) {
    setTemaSeleccionado(temaId ?? temas[0]?.id);
    setNombreEjercicio("");
    setEnunciadoFile(null);
    setSolucionFile(null);
    setModalAbierto("ejercicio");
  }

  function abrirModalTema() {
    setNombreTema("");
    setColorTema(COLORES_TEMA[2]);
    setModalAbierto("tema");
  }

  function cerrarModal() {
    setModalAbierto(null);
  }

  function crearEjercicio() {
    if (!nombreEjercicio.trim()) return;
    /* toDo: enviar al backend */
    const nuevoId = Date.now();
    setTemas(
      temas.map((t) =>
        t.id === temaSeleccionado
          ? { ...t, ejercicios: [...t.ejercicios, { id: nuevoId, nombre: nombreEjercicio.trim(), entregas: 0 }] }
          : t
      )
    );
    cerrarModal();
  }

  function crearTema() {
    if (!nombreTema.trim()) return;
    /* toDo: enviar al backend */
    const nuevoId = Date.now();
    setTemas([...temas, { id: nuevoId, nombre: `Tema ${nombreTema.trim()}`, color: colorTema, ejercicios: [] }]);
    cerrarModal();
  }

  function eliminarTema(temaId: number) {
    setTemas(temas.filter((t) => t.id !== temaId));
  }

  function eliminarEjercicio(temaId: number, ejercicioId: number) {
    setTemas(
      temas.map((t) =>
        t.id === temaId
          ? { ...t, ejercicios: t.ejercicios.filter((e) => e.id !== ejercicioId) }
          : t
      )
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>

        {/* Cabecera */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.titulo}>{asignatura?.nombre.toUpperCase()}</h1>
            <p className={styles.subtitulo}>Gestiona aquí los temas y ejercicios de tu asignatura</p>
          </div>
          <button className={styles.nuevoEjercicioBtn} onClick={() => abrirModalEjercicio()}>
            + Nuevo ejercicio
          </button>
        </div>

        {/* Lista de temas */}
        <div className={styles.content}>

          {temas.map((tema) => (
            <div key={tema.id} className={styles.temaCard}>

              <div className={styles.temaHeader}>
                <div className={styles.temaLeft}>
                  <span className={styles.temaCircle} style={{ backgroundColor: tema.color }} />
                  <span className={styles.temaNombre}>{tema.nombre}</span>
                </div>
                <div className={styles.temaRight}>
                  <span className={styles.ejerciciosCount}>{tema.ejercicios.length} ejercicios</span>
                  <button
                    className={styles.iconBtn}
                    onClick={() => eliminarTema(tema.id)}
                    title="Eliminar tema"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className={styles.ejerciciosList}>
                {tema.ejercicios.map((ej, idx) => (
                  <div
                    key={ej.id}
                    className={`${styles.ejercicioRow} ${idx === tema.ejercicios.length - 1 ? styles.ejercicioRowLast : ""}`}
                  >
                    <span className={styles.ejercicioNombre}>{ej.nombre}</span>
                    <div className={styles.ejercicioAcciones}>
                      <span
                        className={styles.badge}
                        style={{ backgroundColor: colorBadge(ej.entregas) }}
                      >
                        {ej.entregas} entregas
                      </span>
                      {/*CAMBIAR A LINK CUANDO HAYA CREADO LAS ESTADISTICAS */}
                      <button
                        className={styles.iconBtn}
                        title="Ver estadísticas"
                        onClick={() => router.push(`/detalleEjercicio/${ej.id}`)}
                      >📊</button>
                      <Link href={`/detalleEjercicio/${ej.id}`} className={styles.iconBtn}> ✎ </Link>
                      <button
                        className={styles.iconBtn}
                        onClick={() => eliminarEjercicio(tema.id, ej.id)}
                        title="Eliminar ejercicio"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className={styles.añadirEjercicioBtn}
                onClick={() => abrirModalEjercicio(tema.id)}
              >
                + Añadir ejercicio a este tema
              </button>

            </div>
          ))}

          <button className={styles.añadirTemaBtn} onClick={abrirModalTema}>
            + Añadir nuevo tema
          </button>

        </div>
      </main>

      {/* ── Modal nuevo ejercicio ── */}
      {modalAbierto === "ejercicio" && (
        <Modal
          titulo="Nuevo Ejercicio"
          subtitulo="Agregar ejercicio a un tema"
          onCerrar={cerrarModal}
        >
          <div className={styles.campoModal}>
            <label className={styles.labelModal}>Nombre del ejercicio</label>
            <input
              className={styles.inputModal}
              type="text"
              placeholder="Ej. permutaciones"
              value={nombreEjercicio}
              onChange={(e) => setNombreEjercicio(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearEjercicio()}
              autoFocus
            />
          </div>

          <div className={styles.campoModal}>
            <label className={styles.labelModal}>Tema</label>
            <select
              className={styles.selectModal}
              value={temaSeleccionado}
              onChange={(e) => setTemaSeleccionado(Number(e.target.value))}
            >
              {temas.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.campoModal}>
            <label className={styles.labelModal}>Enunciado</label>
            <label className={styles.fileArea}>
              <span className={styles.fileIcon}>📄</span>
              <span className={styles.fileTexto}>
                {enunciadoFile ? enunciadoFile.name : "Seleccionar archivos"}
              </span>
              <input
                type="file"
                className={styles.fileInput}
                onChange={(e) => setEnunciadoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className={styles.campoModal}>
            <label className={styles.labelModal}>Código solución</label>
            <label className={styles.fileArea}>
              <span className={styles.fileIcon}>📄</span>
              <span className={styles.fileTexto}>
                {solucionFile ? solucionFile.name : "Seleccionar archivos"}
              </span>
              <input
                type="file"
                className={styles.fileInput}
                onChange={(e) => setSolucionFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className={styles.botonesModal}>
            <button className={styles.confirmarModalBtn} onClick={crearEjercicio}>
              Crear ejercicio +
            </button>
            <button className={styles.cancelarModalBtn} onClick={cerrarModal}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal nuevo tema ── */}
      {modalAbierto === "tema" && (
        <Modal
          titulo="Nuevo Tema"
          subtitulo="Agregar un tema a tu asignatura"
          onCerrar={cerrarModal}
        >
          <div className={styles.campoModal}>
            <label className={styles.labelModal}>Nombre del tema</label>
            <input
              className={styles.inputModal}
              type="text"
              placeholder="Ej. permutaciones"
              value={nombreTema}
              onChange={(e) => setNombreTema(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearTema()}
              autoFocus
            />
          </div>

          <div className={styles.campoModal}>
            <label className={styles.labelModal}>Color identificativo</label>
            <div className={styles.coloresGrid}>
              {COLORES_TEMA.map((c) => (
                <button
                  key={c}
                  className={`${styles.colorCircle} ${colorTema === c ? styles.colorCircleActivo : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColorTema(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className={styles.botonesModal}>
            <button className={styles.confirmarModalBtn} onClick={crearTema}>
              Crear tema +
            </button>
            <button className={styles.cancelarModalBtn} onClick={cerrarModal}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}
