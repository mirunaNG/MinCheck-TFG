import styles from "./Tabla.module.css";

type Props = {
  columnas: string[];
  children: React.ReactNode;
  pie?: React.ReactNode; // opcional, pie de tabla
  className?: string;
};

export default function Tabla({ columnas, children, pie, className }: Props) {
  return (
    <div className={`${styles.contenedorTabla}${className ? ` ${className}` : ""}`}>
      <table className={styles.listaDatos}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {/* Si hay contenido para el pie, usamos la variable */}
      {pie && <div className={styles.resumenInferior}>{pie}</div>}
    </div>
  );
}