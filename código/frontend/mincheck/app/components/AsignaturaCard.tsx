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
      <div className={styles.imagen} style={{ backgroundColor: color }}>
        <span className={styles.iconoImagen}>📚</span>
      </div>
      <div className={styles.infoAsignatura}>
        <p className={styles.nombreAsignatura}>{nombre}</p>
        <p className={styles.detalleAsignatura}>{alumnos} alumnos</p>
        <p className={styles.detalleAsignatura}>{ejercicios} ejercicios</p>
      </div>
    </div>
  );
}
