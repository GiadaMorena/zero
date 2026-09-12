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
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // transparent: the app bg shows through
    title: "Zero",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // themeColor is managed dynamically by ThemeSync to match each screen's background
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={plusJakarta.variable}>
      <body className="font-sans antialiased m-0 p-0 selection:bg-[#FDC909]">
        {children}
      </body>
    </html>
  );
}

