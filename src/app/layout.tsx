import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Zero — Le tue finanze, senza caos",
  description: "Zero: Gestisci spese, abbonamenti, carte e obiettivi finanziari con chiarezza e stile.",
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={plusJakarta.variable}>
      <body className="font-sans antialiased m-0 p-0 selection:bg-[#F5E050]/40">
        {children}
      </body>
    </html>
  );
}

