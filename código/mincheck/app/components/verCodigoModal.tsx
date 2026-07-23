"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import styles from "./verCodigoModal.module.css";

type Props = {
  entregaId: number;
  onCerrar: () => void;
};

type CodigoEntrega = {
  codigo: string;
  nombreArchivo: string;
  alumno: string;
};

export default function CodigoViewerModal({ entregaId, onCerrar }: Props) {
  const [datos, setDatos] = useState<CodigoEntrega | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCargando(true);
    setError(false);
    setDatos(null);
    fetch(`http://localhost:5001/entrega/${entregaId}/codigo`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: CodigoEntrega) => setDatos(data))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [entregaId]);

  function handleDescargar() {
    if (!datos) return;
    const blob = new Blob([datos.codigo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = datos.nombreArchivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal
      titulo={datos ? `Código de ${datos.alumno}` : "Código"}
      subtitulo={datos?.nombreArchivo ?? ""}
      onCerrar={onCerrar}
      ancho={720}
    >
      {cargando && <p className={styles.estado}>Cargando código...</p>}
      {error && <p className={styles.estado}>No se ha podido cargar el código.</p>}
      {datos && (
        <>
          <pre className={styles.codigo}>{datos.codigo}</pre>
          <div className={styles.footer}>
            <button className={styles.descargarBtn} onClick={handleDescargar}>
              ⬇ Descargar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
