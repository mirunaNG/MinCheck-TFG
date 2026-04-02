"use client";

import styles from "./modal.module.css";

type Props = {
  titulo: string;
  subtitulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
};

export default function Modal({ titulo, subtitulo, onCerrar, children }: Props) {
  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitulo}>{titulo}</h2>
          <p className={styles.modalSubtitulo}>{subtitulo}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
