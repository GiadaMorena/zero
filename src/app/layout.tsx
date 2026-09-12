import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Zero — le tue finanze, con chiarezza", description: "Gestione personale delle finanze" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
