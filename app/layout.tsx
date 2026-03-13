import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Importguiden",
    default: "Importguiden – Oberoende guide till privat fordonsimport",
  },
  description:
    "Lär dig allt om att importera bil och husbil privat från Tyskland och Europa. Gratis kalkylator, steg-för-steg-guider och aktuell information.",
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Importguiden",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:shadow-lg"
        >
          Hoppa till innehåll
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
