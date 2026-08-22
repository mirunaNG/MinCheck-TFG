import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MinCheck",
  description: "Herramienta de ayuda para la corrección de ejercicios de programación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaCode.variable} ${styles.html}`}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
