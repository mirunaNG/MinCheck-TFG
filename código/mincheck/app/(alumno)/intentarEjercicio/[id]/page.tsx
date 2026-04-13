"use client";

import { use, useState, useCallback } from "react";
import Sidebar from "../../../components/sidebar";
import styles from "../intentarEjercicio.module.css";
import { ejercicios, temas, entregas, Entrega } from "../../../lib/mockData";

const ALUMNO_ID = 2;

// Código del último intento (mock — en producción vendría del backend)
const CODIGO_ULTIMO_INTENTO = `#include <iostream>
#include <vector>

using namespace std;

void quickSort(vector<int>& arr, int low, int high) {
    if (low >= high) return;
    int pivot = arr[high]; // Elegimos el último como pivote
    int i = low;           // Puntero para los elementos menores
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    // Colocar el pivote en su posición final
    int temp = arr[i];
    arr[i] = arr[high];
    arr[high] = temp;
    quickSort(arr, low, i - 1);
    quickSort(arr, i + 1, high);
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int& x : arr) cin >> x;
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) {
        if (i) cout << " ";
        cout << arr[i];
    }
    cout << endl;
}`;

export default function IntentarEjercicio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const ejercicioId = Number(id);

  const ejercicio = ejercicios.find((e) => e.id === ejercicioId);
  const tema = ejercicio ? temas.find((t) => t.id === ejercicio.temaId) : null;

  const intentosPrevios = entregas
    .filter((en) => en.alumnoId === ALUMNO_ID && en.ejercicioId === ejercicioId)
    .sort((a, b) => b.id - a.id);

  const esReintento = intentosPrevios.length > 0;

  const [archivoNombre, setArchivoNombre] = useState<string | null>(
    esReintento
      ? `${ejercicio?.nombre.toLowerCase().replace(/ /g, "_") ?? "solucion"}_sol.cpp`
      : null
  );
  const [codigo, setCodigo] = useState<string>(
    esReintento ? CODIGO_ULTIMO_INTENTO : ""
  );
  const [dragging, setDragging] = useState(false);
  const [intentosLocales, setIntentosLocales] = useState<Entrega[]>([]);

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

  const handleEnviar = () => {
    const nuevoIntento: Entrega = {
      id: Date.now(),
      alumnoId: ALUMNO_ID,
      ejercicioId,
      resultado: "pendiente",
      fechaHora: "Ahora",
      intentos: intentosPrevios.length + intentosLocales.length + 1,
      errorPrincipal: null,
    };
    setIntentosLocales((prev) => [nuevoIntento, ...prev]);
    // toDo: navegar a la vista de veredicto (correcto / incorrecto)
  };

  const todosLosIntentos = [...intentosLocales, ...intentosPrevios];

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
          {tema && (
            <p className={styles.subtitulo}>TEMA {tema.nombre.toUpperCase()}</p>
          )}
          <p className={styles.instruccion}>
            Sube aquí tu solución o escribe el código directamente
          </p>
        </div>

        <div className={styles.contenido}>
          {/* Columna izquierda: editor + drop zone */}
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
                  esReintento
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

          {/* Columna derecha: enunciado + intentos */}
          <div className={styles.columnaDerecha}>
            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>ENUNCIADO</h3>
              {ejercicio.enunciadoPdf ? (
                <div className={styles.pdfRow}>
                  <span className={styles.pdfNombre}>
                    {ejercicio.enunciadoPdf.nombre}
                  </span>
                  <button className={styles.btnDescargar}>Descargar pdf</button>
                </div>
              ) : (
                <p className={styles.sinContenido}>Sin enunciado</p>
              )}
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitulo}>INTENTOS ANTERIORES</h3>
              {todosLosIntentos.length === 0 ? (
                <p className={styles.sinContenido}>
                  ¡Vaya! Aún no tienes ningún intento
                </p>
              ) : (
                <ul className={styles.intentosList}>
                  {todosLosIntentos.map((en) => (
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
