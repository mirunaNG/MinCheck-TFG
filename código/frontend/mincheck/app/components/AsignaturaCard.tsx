import styles from "./AsignaturaCard.module.css";

type Props = {
  id: number;
  nombre: string;
  color: string;
  alumnos: number;
  ejercicios: number;
  onClick: () => void;
};

export default function AsignaturaCard({ nombre, color, alumnos, ejercicios, onClick }: Props) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.img} style={{ backgroundColor: color }}>
        <span className={styles.imgIcon}>📚</span>
      </div>
      <div className={styles.info}>
        <p className={styles.nombre}>{nombre}</p>
        <p className={styles.detalle}>{alumnos} alumnos</p>
        <p className={styles.detalle}>{ejercicios} ejercicios</p>
      </div>
    </div>
  );
}
