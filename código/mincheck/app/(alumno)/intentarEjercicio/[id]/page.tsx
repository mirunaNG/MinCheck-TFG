"use client";

import { use, useState, useEffect, useCallback } from "react";
import Sidebar from "../../../components/sidebar";
import styles from "../intentarEjercicio.module.css";

type IntentoPrevio = {
  id: number;
  resultado: "correcto" | "incorrecto" | "pendiente";
  fechaHora: string;
  errorPrincipal: string | null;
};

type EjercicioInfo = {
  id: number;
  nombre: string;
  tema: string;
  enunciadoNombre: string | null;
  enunciadoURL: string | null;
};

export default function IntentarEjercicio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [alumnoId, setAlumnoId] = useState<number | null>(null);
  const [ejercicio, setEjercicio] = useState<EjercicioInfo | null>(null);
  const [intentosPrevios, setIntentosPrevios] = useState<IntentoPrevio[]>([]);
  const [codigo, setCodigo] = useState("");
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const idGuardado = localStorage.getItem("id");
    if (!idGuardado) return;

    const aId = Number(idGuardado);
    setAlumnoId(aId);

    fetch('http://localhost:5001/ejercicio/' + id + '/alumno/' + aId + '/intentos')
      .then((r) => r.json())
      .then((datos) => {
        setEjercicio(datos.ejercicio);
        setIntentosPrevios(datos.intentos);
        if (datos.ultimoCodigo) {
          setCodigo(datos.ultimoCodigo);
          setArchivoNombre(
            `${datos.ejercicio.nombre.toLowerCase().replace(/ /g, "_")}_sol.cpp`
          );
        }
        setCargando(false);
      });
  }, [id]);


  const handleFile = (file: File) => {
    setArchivoNombre(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setCodigo(e.target?.result as string ?? "");
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

 const handleEnviar = async () => {
    if (!alumnoId) return;
    setEnviando(true);

    const res = await fetch('http://localhost:5001/ejercicio/' + id + '/entregas', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumnoId, codigo }),
    });

    if (res.ok) {
      const nuevo = await res.json();
      setIntentosPrevios((prev) => [nuevo, ...prev]);
    }
    setEnviando(false);
  };

  if (cargando) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="alumno" />
        <main className={styles.main}>
          <p style={{ padding: 40, color: "#8b949e", textAlign: "center" }}>
            Cargando...
          </p>
        </main>
      </div>
    );
  }

  if (!ejercicio) {
    return (
      <div className={styles.layout}>
        <Sidebar rol="alumno" />
        <main className={styles.main}>
          <p style={{ padding: 40, color: "#8b949e", textAlign: "center" }}>
            Ejercicio no encontrado.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar rol="alumno" />

      <main className={styles.main}>
        <div className={styles.encabezado}>
          <h1 className={styles.titulo}>{ejercicio.nombre.toUpperCase()}</h1>
          <p className={styles.subtitulo}>TEMA {ejercicio.tema.toUpperCase()}</p>
          <p className={styles.instruccion}>
            Sube aquí tu solución o escribe el código directamente
          </p>
        </div>

        <div className={styles.contenido}>
          <div className={styles.columnaIzquierda}>
            <div className={styles.editorCard}>
              <div className={styles.editorHeader}>
                <span className={styles.nombreArchivo}>
                  {archivoNombre ?? "sin_archivo.cpp"}
                </span>
                <button className={styles.botonEnviar} onClick={handleEnviar}>
                  enviar 🗑
                </button>
              </div>
              <textarea
                className={styles.codigoArea}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder={
                  intentosPrevios.length > 0
                    ? ""
                    : "Escribe aquí tu solución o sube un archivo..."
                }
                spellCheck={false}
              />
            </div>

            <label
              className={`${styles.zonaArchivo}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".c,.cpp,.java,.py"
                className={styles.inputOculto}
                onChange={handleInputChange}
              />
              <span className={styles.iconoClip}>📎</span>
              <p className={styles.dropTexto}>
                {archivoNombre
                  ? "Arrastra un nuevo archivo para "
                  : "Arrastra un archivo aquí para "}
                <span className={styles.dropDestacado}>
                  {archivoNombre ? "reemplazar" : "subirlo"}
                </span>
              </p>
              <p className={styles.dropSubtexto}>Java, C, C++, python</p>
            </label>
          </div>

          <div className={styles.columnaDerecha}>
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>ENUNCIADO</h3>
              {ejercicio.enunciadoNombre ? (
                <div className={styles.pdfRow}>
                  <span className={styles.pdfNombre}>
                    {ejercicio.enunciadoNombre}
                  </span>
                  <button className={styles.btnDescargar}>Descargar pdf</button>
                </div>
              ) : (
                <p className={styles.sinContenido}>Sin enunciado</p>
              )}
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>INTENTOS ANTERIORES</h3>
              {intentosPrevios.length === 0 ? (
                <p className={styles.sinContenido}>
                  ¡Vaya! Aún no tienes ningún intento
                </p>
              ) : (
                <ul className={styles.intentosList}>
                  {intentosPrevios.map((en) => (
                    <li key={en.id} className={styles.intentoItem}>
                      <span
                        className={styles.intentoEstado}
                        style={{
                          color:
                            en.resultado === "correcto"
                              ? "#4caf50"
                              : en.resultado === "incorrecto"
                              ? "#f44336"
                              : "#e38500",
                        }}
                      >
                        {en.resultado === "correcto"
                          ? "✓ Correcto"
                          : en.resultado === "incorrecto"
                          ? "✗ Incorrecto"
                          : "⏱ Pendiente"}

                      </span>
                      <span className={styles.intentoFecha}>{en.fechaHora}</span>
                      {en.errorPrincipal && (
                        <span className={styles.intentoError}>
                          {en.errorPrincipal}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
