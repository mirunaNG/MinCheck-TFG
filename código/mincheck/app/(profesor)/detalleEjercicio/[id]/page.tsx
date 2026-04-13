"use client";

import { use, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Tabla from "../../../components/Tabla";
import styles from "../detalleEj.module.css";
import { ejercicios, temas, asignaturas, entregas, usuarios, ArchivoEjercicio, CasoPrueba, casosDe } from "../../../lib/mockData";

type PestañaActiva = "material" | "entregas" | "feedback";

type ArchivoMock = ArchivoEjercicio;

type ConfigFeedback = {
  tipoError: boolean;
  lineaFallo: boolean;
  mensajeExplicativo: boolean;
  comparacionSalidas: boolean;
  contraejemplo: boolean;
  visualizacionEstructuras: boolean;
};

export default function DetalleEjercicio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ejercicioId = Number(id);

  const ejercicio = ejercicios.find((e) => e.id === ejercicioId);
  const tema = temas.find((t) => t.id === ejercicio?.temaId);
  const asignatura = asignaturas.find((a) => a.id === tema?.asignaturaId);

  /* ── Estado pestañas y material ── */
  const [pestaña, setPestaña]                    = useState<PestañaActiva>("material");
  const [visibleAlumnos, setVisibleAlumnos]       = useState(true);
  const [fechaLimiteActiva, setFechaLimiteActiva] = useState(false);
  const [enunciadoFile, setEnunciadoFile]         = useState<ArchivoMock | null>(ejercicio?.enunciadoPdf ?? null);
  const [solucionFile, setSolucionFile]           = useState<ArchivoMock | null>(ejercicio?.codigoSolucion ?? null);

  /* ── Estado feedback ── */
  const [configFeedback, setConfigFeedback] = useState<ConfigFeedback>({
    tipoError:               true,
    lineaFallo:              true,
    mensajeExplicativo:      false,
    comparacionSalidas:      true,
    contraejemplo:           true,
    visualizacionEstructuras: true,
  });
  const [activarPistas, setActivarPistas] = useState(true);
  const [textoPista, setTextoPista]       = useState("");
  const [mostrarTras, setMostrarTras]     = useState(3);

  /* ── Estado casos de prueba ── */
  const [casos, setCasos]             = useState<CasoPrueba[]>([]);
  const [generando, setGenerando]     = useState(false);
  const [modalAñadir, setModalAñadir] = useState(false);
  const [nuevoInput, setNuevoInput]   = useState("");
  const [nuevoOutput, setNuevoOutput] = useState("");

  function handleGenerar() {
    setGenerando(true);
    // Simula llamada al backend (analizaría el código solución y ejecutaría los casos)
    setTimeout(() => {
      setCasos(casosDe(ejercicioId).map((c) => ({ ...c })));
      setGenerando(false);
    }, 900);
  }

  function handleAñadirManual() {
    if (!nuevoInput.trim()) return;
    setCasos((prev) => [
      ...prev,
      { id: Date.now(), ejercicioId, input: nuevoInput.trim(), outputEsperado: nuevoOutput.trim() },
    ]);
    setNuevoInput("");
    setNuevoOutput("");
    setModalAñadir(false);
  }

  function handleEliminarCaso(id: number) {
    setCasos((prev) => prev.filter((c) => c.id !== id));
  }

  function handleDescargar() {
  const contenido = casos.map((c) => `${c.input}\n${c.outputEsperado}`).join("\n\n");
  const a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(contenido);
  a.download = "casos_generados.txt";
  a.click();
  }
  /* ── Entregas para este ejercicio ── */
  const entregasEjercicio = entregas
    .filter((en) => en.ejercicioId === ejercicioId)
    .map((en) => ({
      ...en,
      alumnoNombre: usuarios.find((u) => u.id === en.alumnoId)?.nombreCompleto ?? "–",
    }));

  const totalEntregas = entregasEjercicio.length;
  const correctas = entregasEjercicio.filter((e) => e.resultado === "correcto").length;
  const conErrores = entregasEjercicio.filter((e) => e.resultado === "incorrecto").length;

  function toggleFeedback(key: keyof ConfigFeedback) {
    setConfigFeedback((configAnterior) => {
    const configNueva = { ...configAnterior };
    configNueva[key] = !configAnterior[key];
    return configNueva;
  });
}

  function handleNuevoEnunciado(file: File) {
    setEnunciadoFile({ nombre: file.name, tamano: `${(file.size / 1024).toFixed(0)} KB`, fecha: "Hoy" });
  }

  function handleNuevaSolucion(file: File) {
    setSolucionFile({ nombre: file.name, tamano: `${(file.size / 1024).toFixed(0)} KB`, fecha: "Hoy" });
  }

  if (!ejercicio) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="profesor" />
        <main className={styles.main}>
          <p style={{ padding: 32, color: "#8b949e" }}>Ejercicio no encontrado.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="profesor" />

      <main className={styles.main}>

        {/* ── Cabecera ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.titulo}>{ejercicio.nombre}</h1>
            <p className={styles.subtitulo}>{tema?.nombre}{asignatura ? ` · ${asignatura.nombre}` : ""}</p>
          </div>
        </div>

        {/* ── Pestañas ── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${pestaña === "material" ? styles.tabActivo : ""}`}
            onClick={() => setPestaña("material")}
          >
            🔗 MATERIAL
          </button>
          <button
            className={`${styles.tab} ${pestaña === "entregas" ? styles.tabActivo : ""}`}
            onClick={() => setPestaña("entregas")}
          >
            📬 ENTREGAS
          </button>
          <button
            className={`${styles.tab} ${pestaña === "feedback" ? styles.tabActivo : ""}`}
            onClick={() => setPestaña("feedback")}
          >
            ⚙️ FEEDBACK
          </button>
        </div>

        {/* ── Contenido ── */}
        <div className={styles.content}>

          {/* ─── MATERIAL ─── */}
          {pestaña === "material" && (
            <div className={styles.materialLayout}>

              <div className={styles.materialLeft}>

                <section className={styles.seccion}>
                  <h2 className={styles.seccionTitulo}>ENUNCIADO (PDF)</h2>
                  {enunciadoFile && (
                    <div className={styles.archivoCard}>
                      <span className={styles.archivoIcono}>📄</span>
                      <div className={styles.archivoInfo}>
                        <span className={styles.archivoNombre}>{enunciadoFile.nombre}</span>
                        <span className={styles.archivoMeta}>{enunciadoFile.fecha} · {enunciadoFile.tamano}</span>
                      </div>
                      <button className={styles.eliminarBtn} onClick={() => setEnunciadoFile(null)} title="Eliminar">🗑</button>
                    </div>
                  )}
                  <label className={styles.dropZone}>
                    <span className={styles.dropIcono}>🔗</span>
                    <span className={styles.dropTexto}>
                      {enunciadoFile ? "Arrastra un nuevo PDF para reemplazar" : "Arrastra o selecciona un PDF"}
                    </span>
                    <span className={styles.dropHint}>SOLO PDF</span>
                    <input type="file" accept=".pdf" className={styles.fileInput}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNuevoEnunciado(f); }} />
                  </label>
                </section>

                <section className={styles.seccion}>
                  <h2 className={styles.seccionTitulo}>CÓDIGO SOLUCIÓN</h2>
                  {solucionFile && (
                    <div className={styles.archivoCard}>
                      <span className={styles.archivoIcono}>💻</span>
                      <div className={styles.archivoInfo}>
                        <span className={styles.archivoNombre}>{solucionFile.nombre}</span>
                        <span className={styles.archivoMeta}>{solucionFile.fecha} · {solucionFile.tamano}</span>
                      </div>
                      <button className={styles.eliminarBtn} onClick={() => setSolucionFile(null)} title="Eliminar">🗑</button>
                    </div>
                  )}
                  <label className={styles.dropZone}>
                    <span className={styles.dropIcono}>🔗</span>
                    <span className={styles.dropTexto}>
                      {solucionFile ? "Arrastra un nuevo archivo para reemplazar" : "Arrastra o selecciona un archivo"}
                    </span>
                    <span className={styles.dropHint}>Java, C, C++, python</span>
                    <input type="file" accept=".java,.c,.cpp,.py" className={styles.fileInput}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNuevaSolucion(f); }} />
                  </label>
                </section>

                {/* ── Casos de prueba ── */}
                <section className={styles.seccion}>
                  <div className={styles.casosHeader}>
                    <h2 className={styles.seccionTitulo}>
                      CASOS DE PRUEBA
                    </h2>
                    <div className={styles.casosAcciones}>
                      <button className={styles.casosAñadirBtn} onClick={() => setModalAñadir(true)}>
                        + Añadir manual
                      </button>
                      {casos.length > 0 && (
                        <button className={styles.casosDescargarBtn} onClick={handleDescargar}>
                          ⬇ Descargar
                        </button>
                      )}
                    </div>
                  </div>

                  {casos.length === 0 ? (
                    <div className={styles.casosVacio}>
                      Sin casos de prueba · Pulsa «Generar» para crearlos automáticamente
                      <br />o añade uno manualmente
                    </div>
                  ) : (
                    casos.map((caso, i) => (
                      <div key={caso.id} className={styles.casoCard}>
                        <div className={styles.casoTitulo}>
                          <span>Caso {i + 1}</span>
                          <button className={styles.eliminarBtn} onClick={() => handleEliminarCaso(caso.id)} title="Eliminar">🗑</button>
                        </div>
                        <div className={styles.casoIO}>
                          <div className={styles.casoIOBloque}>
                            <span className={styles.casoIOLabel}>INPUT</span>
                            <pre className={styles.casoIOContent}>{caso.input}</pre>
                          </div>
                          <div className={styles.casoIOBloque}>
                            <span className={styles.casoIOLabel}>OUTPUT ESPERADO</span>
                            <pre className={styles.casoIOContent}>
                              {caso.outputEsperado}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </section>

              </div>

              <div className={styles.materialRight}>
                <div className={styles.configuracionCard}>
                  <h2 className={styles.configuracionTitulo}>CONFIGURACIÓN</h2>

                  <div className={styles.configItem}>
                    <div className={styles.configTexto}>
                      <span className={styles.configNombre}>Visible para alumnos</span>
                      <span className={styles.configDesc}>Los alumnos pueden ver y entregar</span>
                    </div>
                    <button
                      className={`${styles.toggle} ${visibleAlumnos ? styles.toggleOn : ""}`}
                      onClick={() => setVisibleAlumnos(!visibleAlumnos)}
                      role="switch" aria-checked={visibleAlumnos}
                    />
                  </div>

                  <div className={styles.configItem}>
                    <div className={styles.configTexto}>
                      <span className={styles.configNombre}>Fecha límite</span>
                      <span className={styles.configDesc}>20 mar 2025 · 23:59</span>
                    </div>
                    <button
                      className={`${styles.toggle} ${fechaLimiteActiva ? styles.toggleOn : ""}`}
                      onClick={() => setFechaLimiteActiva(!fechaLimiteActiva)}
                      role="switch" aria-checked={fechaLimiteActiva}
                    />
                  </div>
                </div>

                <button
                  className={styles.generarBtn}
                  onClick={handleGenerar}
                  disabled={generando || !solucionFile}
                >
                  {generando ? "Analizando solución..." : "Generar casos de prueba"}
                </button>
                {!solucionFile && (
                  <p style={{ fontSize: 11, color: "#4a5568", textAlign: "center", margin: 0 }}>
                    Sube el código solución para poder generar casos
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── ENTREGAS ─── */}
          {pestaña === "entregas" && (
            <div className={styles.entregasContent}>

              {/* Tarjetas de resumen */}
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <span className={styles.statNumero}>{totalEntregas}</span>
                  <span className={styles.statLabel}>Total de entregas</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardVerde}`}>
                  <span className={`${styles.statNumero} ${styles.statNumeroVerde}`}>
                    {correctas}<span className={styles.statDenominador}>/{totalEntregas}</span>
                  </span>
                  <span className={styles.statLabel}>Soluciones correctas</span>
                </div>
                <div className={`${styles.statCard} ${styles.statCardRojo}`}>
                  <span className={`${styles.statNumero} ${styles.statNumeroRojo}`}>{conErrores}</span>
                  <span className={styles.statLabel}>Con errores</span>
                </div>
              </div>

              {/* Tabla */}
              {entregasEjercicio.length === 0 ? (
                <p className={styles.sinEntregas}>No hay entregas para este ejercicio todavía.</p>
              ) : (
                <Tabla
                  columnas={["Alumno", "Fecha", "Intentos", "Estado", "Error Principal"]}
                  pie={
                    <>
                      <span>Mostrando {entregasEjercicio.length} de {totalEntregas}</span>
                      <button className={styles.siguienteBtn}>→</button>
                    </>
                  }
                >
                  {entregasEjercicio.map((en) => (
                    <tr key={en.id}>
                      <td>
                        <div className={styles.alumnoCell}>
                          <span className={styles.alumnoNombre}>{en.alumnoNombre}</span>
                          <button className={styles.codigoBtn}>código</button>
                        </div>
                      </td>
                      <td>{en.fechaHora}</td>
                      <td>{en.intentos}</td>
                      <td>
                        {en.resultado === "correcto"
                          ? <span className={styles.check}>✓</span>
                          : <span className={styles.cross}>✗</span>}
                      </td>
                      <td>{en.errorPrincipal ?? "–"}</td>
                    </tr>
                  ))}
                </Tabla>
              )}
            </div>
          )}

          {/* ─── FEEDBACK ─── */}
          {pestaña === "feedback" && (
            <div className={styles.feedbackLayout}>

              {/* Izquierda: qué ve el alumno */}
              <div className={styles.feedbackCard}>
                <h2 className={styles.feedbackCardTitulo}>QUÉ VE EL ALUMNO</h2>

                {(
                  [
                    { key: "tipoError", label: "Tipo de error", desc: "El 'error tipo' clase de compilación..." },
                    { key: "lineaFallo", label: "Línea exacta del fallo", desc: "Señala la línea donde se produce el error" },
                    { key: "mensajeExplicativo", label: "Mensaje explicativo", desc: "Descripción natural del error" },
                    { key: "comparacionSalidas", label: "Comparación de salidas", desc: "Muestra salida esperada vs obtenida" },
                    { key: "contraejemplo", label: "Contraejemplo mínimo", desc: "La entrada más simple que falla" },
                    { key: "visualizacionEstructuras", label: "Visualización de estructuras de datos", desc: "Muestra como evoluciona las estructuras de datos y su contenido" },
                  ] as { key: keyof ConfigFeedback; label: string; desc: string }[]
                ).map(({ key, label, desc }) => (
                  <div key={key} className={styles.feedbackItem}>
                    <div className={styles.feedbackItemTexto}>
                      <span className={styles.feedbackItemLabel}>{label}</span>
                      <span className={styles.feedbackItemDesc}>{desc}</span>
                    </div>
                    <button
                      className={`${styles.toggle} ${configFeedback[key] ? styles.toggleOn : ""}`}
                      onClick={() => toggleFeedback(key)}
                      role="switch" aria-checked={configFeedback[key]}
                    />
                  </div>
                ))}
              </div>

              {/* Derecha: sistema de pistas */}
              <div className={styles.feedbackCard}>
                <h2 className={styles.feedbackCardTitulo}>SISTEMA DE PISTAS</h2>

                <div className={styles.feedbackItem}>
                  <div className={styles.feedbackItemTexto}>
                    <span className={styles.feedbackItemLabel}>Activar pistas</span>
                    <span className={styles.feedbackItemDesc}>El alumno ve una pista antes del feedback completo</span>
                  </div>
                  <button
                    className={`${styles.toggle} ${activarPistas ? styles.toggleOn : ""}`}
                    onClick={() => setActivarPistas(!activarPistas)}
                    role="switch" aria-checked={activarPistas}
                  />
                </div>

                <div className={styles.pistaSeccion}>
                  <h3 className={styles.pistaLabel}>TEXTO DE LA PISTA</h3>
                  <textarea
                    className={styles.pistaTextarea}
                    placeholder="Escribe aquí el texto que quieres que aparezca como pista para los alumnos"
                    value={textoPista}
                    onChange={(e) => setTextoPista(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className={styles.mostrarTrasRow}>
                  <span className={styles.mostrarTrasLabel}>Mostrar tras</span>
                  <input
                    type="range"
                    min={1} max={10}
                    value={mostrarTras}
                    onChange={(e) => setMostrarTras(Number(e.target.value))}
                    className={styles.slider}
                  />
                  <span className={styles.mostrarTrasValor}>{mostrarTras}</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
      {/* ── Modal: añadir caso manual ── */}
      {modalAñadir && (
        <div className={styles.modalOverlay} onClick={() => setModalAñadir(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitulo}>Añadir caso de prueba</h2>

            <div className={styles.modalSeccion}>
              <label className={styles.modalLabel}>Input</label>
              <textarea
                className={styles.modalTextarea}
                value={nuevoInput}
                onChange={(e) => setNuevoInput(e.target.value)}
                placeholder={"3\n1 2 3"}
                rows={5}
              />
            </div>

            <div className={styles.modalSeccion}>
              <label className={styles.modalLabel}>Output esperado</label>
              <textarea
                className={styles.modalTextarea}
                value={nuevoOutput}
                onChange={(e) => setNuevoOutput(e.target.value)}
                placeholder="6"
                rows={3}
              />
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalBtnCancelar} onClick={() => setModalAñadir(false)}>
                Cancelar
              </button>
              <button
                className={styles.modalBtnConfirmar}
                onClick={handleAñadirManual}
                disabled={!nuevoInput.trim()}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
