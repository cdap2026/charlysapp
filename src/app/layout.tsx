import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const manrope = localFont({
  src: [
    { path: "../../public/fonts/manrope-regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/manrope-semibold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/manrope-bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/manrope-extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Punto de Juego · Ciencia en movimiento",
  description: "Evaluación postural asistida por cámara, registros morfométricos y biométricos, y análisis de técnica en rutinas de ejercicio.",
  applicationName: "Punto de Juego",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Punto de Juego", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: "Punto de Juego · Ciencia en movimiento",
    description: "Evaluación postural con cámara HD, registros morfo/biométricos y análisis de rutinas.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#168b75",
  colorScheme: "light",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body className={manrope.variable}>{children}</body></html>;
}
