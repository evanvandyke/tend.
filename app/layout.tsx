import type { Metadata, Viewport } from "next";
import { EB_Garamond, Lora } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tend.",
  description: "An almanac for the home. Organize your household by season, rhythm, and weather.",
  keywords: ["almanac", "home", "garden", "lawn care", "household tasks"],
  authors: [{ name: "Evan Van Dyke" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tend.",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "theme-color": "#F2E8CF",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--forest)] focus:text-[var(--vellum)] focus:rounded"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
