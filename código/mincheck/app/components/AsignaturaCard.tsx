import styles from "./AsignaturaCard.module.css";

type Props = {
  id: number;
  nombre: string;
  color: string;
  imagen?: string;
  alumnos?: number;
  ejercicios?: number;
  profesor?: string;
  onClick: () => void;
};

export default function AsignaturaCard({ nombre, color, imagen, alumnos, ejercicios, profesor, onClick }: Props) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imagen} style={{ backgroundColor: color }}>
        {imagen ? (
          <img src={imagen} alt={nombre} className={styles.imagenFoto} />
        ) : (
          <span className={styles.iconoImagen}>📚</span>
        )}
      </div>
      <div className={styles.infoAsignatura}>
        <p className={styles.nombreAsignatura}>{nombre}</p>
        {profesor && <p className={styles.detalleAsignatura}>{profesor}</p>}
        {alumnos !== undefined && <p className={styles.detalleAsignatura}>{alumnos} alumnos</p>}
        {ejercicios !== undefined && <p className={styles.detalleAsignatura}>{ejercicios} ejercicios</p>}
      </div>
    </div>
  );
}
