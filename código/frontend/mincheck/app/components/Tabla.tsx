import styles from "./Tabla.module.css";

type Props = {
  columnas: string[];
  children: React.ReactNode;
  pie?: React.ReactNode;
};

export default function Tabla({ columnas, children, pie }: Props) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {pie && <div className={styles.pie}>{pie}</div>}
    </div>
  );
}
