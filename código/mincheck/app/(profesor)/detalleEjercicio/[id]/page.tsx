"use client";

import { use, useState, useEffect } from "react";
import Sidebar from "../../../components/sidebar";
import Tabla from "../../../components/Tabla";
import styles from "../detalleEj.module.css";
import CodigoViewerModal from "../../../components/verCodigoModal";


type PestañaActiva = "material" | "entregas" | "feedback";

type ArchivoEjercicio = {
  nombre: string;
  tamaño: string;
  fecha: string;
};

type CasoPrueba = {
  id: number;
  input: string;
  outputEsperado: string;
};

type EntregaDetalle = {
  id: number;
  alumno: string;
  fechaHora: string;
  resultado: "correcto" | "incorrecto" | "pendiente";
  errorPrincipal: string | null;
};

type EjercicioDetalle = {
  id: number;
  nombre: string;
  tema : {id:number; nombre: string};
  asignatura: {id:number; nombre: string} | null;
  enunciadoNombre: string | null;
  enunciadoURL: string | null;
  solucionNombre: string | null;
  solucionURL: string | null;
  casosPrueba: CasoPrueba[];
  entregas: EntregaDetalle[];
  visible: boolean;
  fechaLimite: string | null;
};

type ConfigFeedback = {
  tipoError: boolean;
  lineaFallo: boolean;
  mensajeExplicativo: boolean;
  comparacionSalidas: boolean;
  contraejemplo: boolean;
  visualizacionEstructuras: boolean;
  activarPistas: boolean;
  textoPista: string;
  mostrarTras: number;
};

type FeedbackBoolKey = "tipoError" | "lineaFallo" | "mensajeExplicativo" | "comparacionSalidas" | "contraejemplo" | "visualizacionEstructuras";


const FEEDBACK_DEFAULT: ConfigFeedback = {
  tipoError: true,
  lineaFallo: true,
  mensajeExplicativo: false,
  comparacionSalidas: true,
  contraejemplo: true,
  visualizacionEstructuras: true,
  activarPistas: true,
  textoPista: "",
  mostrarTras: 3,
};


export default function DetalleEjercicio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ejercicioId = Number(id);

  const [datos, setDatos] = useState<EjercicioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  const [pestaña, setPestaña] = useState<PestañaActiva>("material");
  const [visibleAlumnos, setVisibleAlumnos]= useState(true);
  const [fechaLimiteActiva, setFechaLimiteActiva] = useState(false);
  const [fechaLimiteValor, setFechaLimiteValor] = useState("");
  const [enunciadoFile, setEnunciadoFile] = useState<ArchivoEjercicio | null>(null);
  const [solucionFile, setSolucionFile] = useState<ArchivoEjercicio | null>(null);
 
  const [configFeedback, setConfigFeedback]   = useState<ConfigFeedback>(FEEDBACK_DEFAULT);
  const [guardandoFeedback, setGuardandoFeedback] = useState(false);
  const [feedbackGuardado, setFeedbackGuardado]   = useState(false);

  const [casos, setCasos]             = useState<CasoPrueba[]>([]);
  const [generando, setGenerando]     = useState(false);
  const [modalAñadir, setModalAñadir] = useState(false);
  const [nuevoInput, setNuevoInput]   = useState("");
  const [nuevoOutput, setNuevoOutput] = useState("");

  const [entregaCodigo, setEntregaCodigo] = useState<number | null>(null);

  /*Cargar ejercicio */
  async function cargarEjercicio() {
    const r = await fetch('http://localhost:5001/ejercicio/' + ejercicioId);
    const data: EjercicioDetalle = await r.json();
    setDatos(data);
    if (data.casosPrueba) setCasos(data.casosPrueba);
    if (data.enunciadoNombre) {
      setEnunciadoFile({ nombre: data.enunciadoNombre, tamaño: "", fecha: "" });
    }
    if (data.solucionNombre) {
      setSolucionFile({ nombre: data.solucionNombre, tamaño: "", fecha: "" });
    }
    setVisibleAlumnos(data.visible);
    setFechaLimiteActiva(data.fechaLimite !== null);
    if (data.fechaLimite) setFechaLimiteValor(data.fechaLimite.slice(0, 16));
    setCargando(false);
  }

  useEffect(() => {
    cargarEjercicio().catch(() => setCargando(false));
  }, [ejercicioId]);


  /*Cargar configuracion del feedback */
  useEffect(() => {
    fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/feedback')
      .then((r) => r.json())
      .then((data: ConfigFeedback) => setConfigFeedback(data))
      .catch(() => {});
  }, [ejercicioId]);

async function handleGenerar(){
  if (!datos?.enunciadoURL) return;
  setGenerando(true);
  try {
    //Descargar el PDF real desde el backend Flask (5001)
    const resPdf = await fetch('http://localhost:5001' + datos.enunciadoURL);
    const blobPdf = await resPdf.blob();

    //Enviarlo al analizador de IA (server.py en puerto 8001) para sacar la estructura
    const form = new FormData();
    form.append('archivo', blobPdf, datos.enunciadoNombre ?? 'enunciado.pdf');
    const resEstructura = await fetch('http://localhost:8001/analizar/enunciado/archivo', {
      method: 'POST',
      body: form,
    });
        const analisis = await resEstructura.json();
    const { entrada_ejemplo, salida_ejemplo, ...estructura } = analisis;

    //El ejemplo del enunciado solo se añade la primera vez que se generan casos para este ejercicio
    const esPrimeraGeneracion = casos.length === 0;

    //Generar los casos de prueba a partir de esa estructura
    const resCasos = await fetch('http://localhost:8001/generar/casos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estructura,
        entrada_ejemplo: esPrimeraGeneracion ? entrada_ejemplo : undefined,
        salida_ejemplo: esPrimeraGeneracion ? salida_ejemplo : undefined,
      }),
    });

    const data: { casos: { perfiles: string[]; input: string; output_esperado?: string }[] } = await resCasos.json();

    //Si hay solución subida, ejecutarla contra cada input para obtener el output real
    let casosConOutput = data.casos;
    if (datos.solucionURL) {
      const resSolucion = await fetch('http://localhost:5001' + datos.solucionURL);
      const blobSolucion = await resSolucion.blob();

      const formSolucion = new FormData();
      formSolucion.append('solucion', blobSolucion, datos.solucionNombre ?? 'solucion');
      formSolucion.append('casos', JSON.stringify(data.casos));

      const resOutputs = await fetch('http://localhost:8001/calcular/outputs', {
        method: 'POST',
        body: formSolucion,
      });
      if (resOutputs.ok) {
        const outputsData: { casos: { perfiles: string[]; input: string; output_esperado?: string }[] } = await resOutputs.json();
        casosConOutput = outputsData.casos;
      }
    }

    //Guardar los casos generados en el ejercicio (backend Flask, 5001) - se añaden, no se borran los anteriores
    const resGuardado = await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/casos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          casos: casosConOutput.map((c) => ({
          input: c.input,
          outputEsperado: c.output_esperado ?? "(sin calcular todavía)",
        })),
      }),
    });
    const guardado: { casos: CasoPrueba[] } = await resGuardado.json();

    //Añadir los casos nuevos a los que ya había en la tabla
    setCasos((prev) => [...prev, ...guardado.casos]);

  } catch (e) {
    console.error("Error generando casos:", e);
  } finally {
    setGenerando(false);
  }
}

async function handleAñadirManual() {
  if (!nuevoInput.trim()) return;

  const res = await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/casos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      casos: [{ input: nuevoInput.trim(), outputEsperado: nuevoOutput.trim() }],
    }),
  });
  if (!res.ok) return;

  const guardado = await res.json();
  setCasos((prev) => [...prev, ...guardado.casos]);

  setNuevoInput("");
  setNuevoOutput("");
  setModalAñadir(false);
}


  async function handleEliminarCaso(id: number) {
    const res = await fetch('http://localhost:5001/caso/' + id, { method: 'DELETE' });
    if (!res.ok) return;
    setCasos((prev) => prev.filter((c) => c.id !== id));
  }

    async function handleEliminarEnunciado() {
    const res = await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/archivos/enunciado', {
      method: 'DELETE',
    });
    if (!res.ok) return;
    setEnunciadoFile(null);
  }

  async function handleEliminarSolucion() {
    const res = await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/archivos/solucion', {
      method: 'DELETE',
    });
    if (!res.ok) return;
    setSolucionFile(null);
  }

  function handleDescargar(){
    const contenido = casos.map((c) => c.input + ' ' + c.outputEsperado + '\n').join();
    const a = document.createElement("a");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(contenido);
    a.download = "casos_generados.txt";
    a.click();
  }

  function toggleFeedback(key: FeedbackBoolKey) {
    setConfigFeedback((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleNuevoEnunciado(file: File) {
    setEnunciadoFile({
      nombre: file.name,
      tamaño: (file.size / 1024).toFixed(0) + 'KB',
      fecha: "Hoy",
    });
    const form = new FormData();
    form.append('enunciado', file);
    await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/archivos', {
      method: 'PUT',
      body: form,
    });
    await cargarEjercicio();
  }

  async function handleNuevaSolucion(file: File) {
    setSolucionFile({
      nombre: file.name,
      tamaño: (file.size / 1024).toFixed(0) + 'KB',
      fecha: "Hoy",
    });
    const form = new FormData();
    form.append('solucion', file);
    await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/archivos', {
      method: 'PUT',
      body: form,
    });
    await cargarEjercicio();
  }



  async function handleGuardarFeedback(){
    setGuardandoFeedback(true);
    try {
      await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/feedback', {
        method:"PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configFeedback),
      });
      setFeedbackGuardado(true);
      setTimeout(() => setFeedbackGuardado(false), 2500);
    } finally {
      setGuardandoFeedback(false);
    }
  }

  async function handleGuardarConfiguracion() {
    await fetch('http://localhost:5001/ejercicio/' + ejercicioId + '/configuracion', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visible: visibleAlumnos,
        fechaLimite: fechaLimiteActiva && fechaLimiteValor ? fechaLimiteValor : null,
      }),
    });
  }


  const entregasEjercicio = datos?.entregas ?? [];
  const totalEntregas = entregasEjercicio.length;
  const correctas = entregasEjercicio.filter((e) => e.resultado === "correcto").length;
  const conErrores = entregasEjercicio.filter((e) => e.resultado === "incorrecto").length;

  if (cargando) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="profesor" />
        <main className={styles.main}>
          <p style={{ padding: 32, color: "#8b949e" }}>Cargando...</p>
        </main>
      </div>
    );
  }

  if (!datos) {
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
        <div className={styles.header}>
          <div>
            <h1 className={styles.titulo}>{datos.nombre}</h1>
            <p className={styles.subtitulo}>{datos.tema.nombre}·{datos.asignatura?.nombre}</p>
          </div>
        </div>

        {/*Pestañas apartados */}
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

        <div className={styles.content}>

          {/*MATERIAL*/}
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
                        <span className={styles.archivoMeta}>{enunciadoFile.fecha} · {enunciadoFile.tamaño}</span>
                      </div>
                      <button className={styles.eliminarBtn} onClick={handleEliminarEnunciado} title="Eliminar">🗑</button>
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
                        <span className={styles.archivoMeta}>{solucionFile.fecha} · {solucionFile.tamaño}</span>
                      </div>
                      <button className={styles.eliminarBtn} onClick={handleEliminarSolucion} title="Eliminar">🗑</button>
                    </div>
                  )}
                  <label className={styles.dropZone}>
                    <span className={styles.dropIcono}>🔗</span>
                    <span className={styles.dropTexto}>
                      {solucionFile ? "Arrastra un nuevo archivo para reemplazar" : "Arrastra o selecciona un archivo"}
                    </span>
                    <span className={styles.dropHint}> C++</span>
                    <input type="file" accept=".cpp,.cc" className={styles.fileInput}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNuevaSolucion(f); }} />
                  </label>
                </section>

                {/*Casos de prueba */}
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
                    {fechaLimiteActiva && (
                      <>
                        <span style={{ fontSize: 12, color: "#f6ad55", marginTop: 2 }}>
                          {fechaLimiteValor
                            ? new Date(fechaLimiteValor).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                            : "Sin fecha"}
                        </span>
                        <input
                          type="datetime-local"
                          value={fechaLimiteValor}
                          onChange={(e) => setFechaLimiteValor(e.target.value)}
                          style={{ marginTop: 4, background: '#1a1f2e', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: 4, padding: '2px 6px', fontSize: 12 }}
                        />
                      </>
                    )}
                  </div>
                  <button
                    className={`${styles.toggle} ${fechaLimiteActiva ? styles.toggleOn : ""}`}
                    onClick={() => setFechaLimiteActiva(!fechaLimiteActiva)}
                    role="switch" aria-checked={fechaLimiteActiva}
                  />
                </div>
                <button
                  onClick={handleGuardarConfiguracion}
                  style={{ marginTop: 10, width: '100%', padding: '8px', background: '#4d7cfe', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                >
                  Guardar configuración
                </button>

                </div>

                <button
                  className={styles.generarBtn}
                  onClick={handleGenerar}
                  disabled={generando || !enunciadoFile || !solucionFile}
                >
                  {generando ? "Analizando enunciado..." : "Generar casos de prueba"}
                </button>
                {!enunciadoFile && (
                  <p style={{ fontSize: 11, color: "#4a5568", textAlign: "center", margin: 0 }}>
                    Sube el enunciado en PDF para poder generar casos
                  </p>
              )}
              {!solucionFile && (
                  <p style={{ fontSize: 11, color: "#4a5568", textAlign: "center", margin: 0 }}>
                    Sube la solución del ejercicio para poder generar casos
                  </p>
              )}

              </div>
            </div>
          )}

          {/*ENTREGAS */}
          {pestaña === "entregas" && (
            <div className={styles.entregasContent}>

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
                          <span className={styles.alumnoNombre}>{en.alumno}</span>
                          <button className={styles.codigoBtn} onClick={() => setEntregaCodigo(en.id)}>
                            código
                          </button>
                        </div>
                      </td>
                      <td>{en.fechaHora}</td>
                      {/* <td>{en.intentos}</td> */}
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

          {/*FEEDBACK */}
          {pestaña === "feedback" && (
            <div className={styles.feedbackLayout}>

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
                  ] as { key: FeedbackBoolKey; label: string; desc: string }[]
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

              <div className={styles.feedbackCard}>
                <h2 className={styles.feedbackCardTitulo}>SISTEMA DE PISTAS</h2>

                <div className={styles.feedbackItem}>
                  <div className={styles.feedbackItemTexto}>
                    <span className={styles.feedbackItemLabel}>Activar pistas</span>
                    <span className={styles.feedbackItemDesc}>El alumno ve una pista antes del feedback completo</span>
                  </div>
                  <button
                    className={`${styles.toggle} ${configFeedback.activarPistas ? styles.toggleOn : ""}`}
                    onClick={() => setConfigFeedback((prev) => ({ ...prev, activarPistas: !prev.activarPistas }))}
                    role="switch" aria-checked={configFeedback.activarPistas}
                  />
                </div>

                <div className={styles.pistaSeccion}>
                  <h3 className={styles.pistaLabel}>TEXTO DE LA PISTA</h3>
                  <textarea
                    className={styles.pistaTextarea}
                    placeholder="Escribe aquí el texto que quieres que aparezca como pista para los alumnos"
                    value={configFeedback.textoPista}
                    onChange={(e) => setConfigFeedback((prev) => ({ ...prev, textoPista: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className={styles.mostrarTrasRow}>
                  <span className={styles.mostrarTrasLabel}>Mostrar tras</span>
                  <input
                    type="range"
                    min={1} max={10}
                    value={configFeedback.mostrarTras}
                    onChange={(e) => setConfigFeedback((prev) => ({ ...prev, mostrarTras: Number(e.target.value) }))}
                    className={styles.slider}
                  />
                  <span className={styles.mostrarTrasValor}>{configFeedback.mostrarTras}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button
                className={styles.generarBtn}
                onClick={handleGuardarFeedback}
                disabled={guardandoFeedback}
                style={{ width: "auto", padding: "10px 28px" }}
              >
                {guardandoFeedback ? "Guardando..." : feedbackGuardado ? "¡Guardado!" : "Guardar configuración"}
              </button>
            </div>


            </div>
          )}

        </div>
      </main>

      {/*Modal para aádir caso manualmente */}
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
      {entregaCodigo !== null && (
        <CodigoViewerModal entregaId={entregaCodigo} onCerrar={() => setEntregaCodigo(null)} />
      )}
    </div>
  );
}
