import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0F1E",
};

export const metadata: Metadata = {
  title: "GreenPulse — Биореакторлық орындық",
  description: "GreenPulse — экологиялық ауа тазартатын биореактор орындық. Chlorella vulgaris микробалдырлары арқылы 38 кг CO₂/жыл сіңіреді. Нақты уақытта ауа мониторингі.",
  keywords: ["GreenPulse", "биореактор", "ауа тазарту", "CO2", "экология", "Қазақстан", "хлорелла"],
  authors: [{ name: "Нурдаулет Мейірбек & Сапи Бекнұр" }],
  openGraph: {
    title: "GreenPulse — Биореакторлық орындық",
    description: "1 скамейка = 15 деревьев. Реальный мониторинг воздуха с ESP32.",
    type: "website",
    locale: "kk_KZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenPulse",
    description: "Биореактор-орындық. 38 кг CO₂/год.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="kk"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
