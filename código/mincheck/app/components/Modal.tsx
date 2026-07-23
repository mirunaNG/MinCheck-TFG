"use client";

import styles from "./modal.module.css";

type Props = {
  titulo: string;
  subtitulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
  ancho?: number;
};

export default function Modal({ titulo, subtitulo, onCerrar, children, ancho }: Props) {
  return (
    <div className={styles.fondoModal} onClick={onCerrar}>
      <div
        className={styles.modal}
        style={ancho ? { width: ancho } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className={styles.modalTitulo}>{titulo}</h2>
          <p className={styles.modalSubtitulo}>{subtitulo}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
