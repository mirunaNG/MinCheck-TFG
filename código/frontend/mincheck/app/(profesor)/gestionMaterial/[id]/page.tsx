"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/sidebar";
import Modal from "../../../components/Modal";
import styles from "../gestionMat.module.css";
import { asignaturas, temasDe, ejerciciosDeTema, totalAlumnosDe, erroresDe } from "../../../lib/mockData";

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

type StatsEj = { id: number; nombre: string } | null;

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

  function colorEntregas(entregas: number): string {
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

  /*Estado modal*/
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);

  /* Estado popup estadísticas */
  const [statsEj, setStatsEj] = useState<StatsEj>(null);

  /* Estado formulario nuevo ejercicio*/
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
        <div className={styles.encabezado}>
          <div>
            <h1 className={styles.tituloAsignatura}>{asignatura?.nombre.toUpperCase()}</h1>
            <p className={styles.subtitulo}>Gestiona aquí los temas y ejercicios de tu asignatura</p>
          </div>
          <button className={styles.botonNuevoEjercicio} onClick={() => abrirModalEjercicio()}>
            + Nuevo ejercicio
          </button>
        </div>

        {/* Lista de temas*/}
        <div className={styles.contenido}>
          {temas.map((tema) => (
            <div key={tema.id} className={styles.temaCard}>

              <div className={styles.temaEncabezado}>
                <div className={styles.temaIzquierda}>
                  <span className={styles.circuloTema} style={{ backgroundColor: tema.color }} />
                  <span className={styles.temaNombre}>{tema.nombre}</span>
                </div>
                <div className={styles.temaDerecha}>
                  <span className={styles.numEjercicios}>{tema.ejercicios.length} ejercicios</span>
                  <button
                    className={styles.botonIcono}
                    onClick={() => eliminarTema(tema.id)}
                    title="Eliminar tema"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className={styles.listaEjercicios}>
                {tema.ejercicios.map((ej, idx) => (
                  <div
                    key={ej.id}
                    className={`${styles.filaEjercicio}`}
                  >
                    <span className={styles.ejercicioNombre}>{ej.nombre}</span>
                    <div className={styles.ejercicioAcciones}>
                      <span
                        className={styles.entregas}
                        style={{ backgroundColor: colorEntregas(ej.entregas) }}
                      >
                        {ej.entregas} entregas
                      </span>
                      <button
                          className={styles.botonIcono}
                          onClick={() => setStatsEj({ id: ej.id, nombre: ej.nombre })}
                          title="Ver estadísticas"
                        >📊</button>
                      <Link href={`/detalleEjercicio/${ej.id}`} className={styles.botonIcono}> ✎ </Link>
                      <button
                        className={styles.botonIcono}
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
                className={styles.botonAñadirEjercicio}
                onClick={() => abrirModalEjercicio(tema.id)}
              >
                + Añadir ejercicio a este tema
              </button>

            </div>
          ))}

          <button className={styles.botonAñadirTema} onClick={abrirModalTema}>
            + Añadir nuevo tema
          </button>

        </div>
      </main>

      {/* Modal nuevo ejercicio */}
      {modalAbierto === "ejercicio" && (
        <Modal
          titulo="Nuevo Ejercicio"
          subtitulo="Agregar ejercicio a un tema"
          onCerrar={cerrarModal}
        >
          <div className={styles.campoModal}>
            <label className={styles.etiquetaCampo}>Nombre del ejercicio</label>
            <input
              className={styles.entradaCampo}
              type="text"
              placeholder="Ej. permutaciones"
              value={nombreEjercicio}
              onChange={(e) => setNombreEjercicio(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearEjercicio()}
              autoFocus
            />
          </div>

          <div className={styles.campoModal}>
            <label className={styles.etiquetaCampo}>Tema</label>
            <select
              className={styles.entradaCampo}
              value={temaSeleccionado}
              onChange={(e) => setTemaSeleccionado(Number(e.target.value))}
            >
              {temas.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.campoModal}>
            <label className={styles.etiquetaCampo}>Enunciado</label>
            <label className={styles.archivo}>
              <span className={styles.iconoArchivo}>📄</span>
              <span className={styles.textoArchivo}>
                {enunciadoFile ? enunciadoFile.name : "Seleccionar archivos"}
              </span>
              <input
                type="file"
                className={styles.archivodeEntrada}
                onChange={(e) => setEnunciadoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className={styles.campoModal}>
            <label className={styles.etiquetaCampo}>Código solución</label>
            <label className={styles.archivo}>
              <span className={styles.iconoArchivo}>📄</span>
              <span className={styles.textoArchivo}>
                {solucionFile ? solucionFile.name : "Seleccionar archivos"}
              </span>
              <input
                type="file"
                className={styles.archivodeEntrada}
                onChange={(e) => setSolucionFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className={styles.botonesModal}>
            <button className={styles.botonConfirmar} onClick={crearEjercicio}>
              Crear ejercicio +
            </button>
            <button className={styles.botonCancelar} onClick={cerrarModal}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Modal añadir tema*/}
      {modalAbierto === "tema" && (
        <Modal
          titulo="Nuevo Tema"
          subtitulo="Agregar un tema a tu asignatura"
          onCerrar={cerrarModal}
        >
          <div className={styles.campoModal}>
            <label className={styles.etiquetaCampo}>Nombre del tema</label>
            <input
              className={styles.entradaCampo}
              type="text"
              placeholder="Ej. permutaciones"
              value={nombreTema}
              onChange={(e) => setNombreTema(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && crearTema()}
              autoFocus
            />
          </div>

          <div className={styles.campoModal}>
            <label className={styles.etiquetaCampo}>Color identificativo</label>
            <div className={styles.coloresGrid}>
              {COLORES_TEMA.map((c) => (
                <button
                  key={c}
                  className={`${styles.circuloColor} ${colorTema === c ? styles.circuloColorActivo : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColorTema(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className={styles.botonesModal}>
            <button className={styles.botonConfirmar} onClick={crearTema}>
              Crear tema +
            </button>
            <button className={styles.botonCancelar} onClick={cerrarModal}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* Popup estadísticas de errores */}
      {statsEj && (() => {
        const errores = erroresDe(statsEj.id);
        return (
          <div className={styles.statsOverlay} onClick={() => setStatsEj(null)}>
            <div className={styles.statsCard} onClick={(e) => e.stopPropagation()}>
              <p className={styles.statsTitulo}>Estadísticas de errores en {statsEj.nombre}</p>
              {errores.length === 0 ? (
                <p className={styles.statsVacio}>No hay errores registrados para este ejercicio.</p>
              ) : (
                <div className={styles.statsLista}>
                  {errores.map(({ error, porcentaje }) => (
                    <div key={error}>
                      <div className={styles.statsFilaLabel}>
                        <span>{error}</span>
                        <span>{porcentaje}%</span>
                      </div>
                      <div className={styles.statsBarFondo}>
                        <div className={styles.statsBarRelleno} style={{ width: `${porcentaje}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className={styles.statsBtnCerrar} onClick={() => setStatsEj(null)}>
                Cerrar
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
