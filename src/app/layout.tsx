import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Archivo_Black } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400", // Specify the required weight
});

export const metadata: Metadata = {
  title: "Your Portfolio - GitHub Pages",
  description: "Personal portfolio website built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} antialiased relative overflow-x-hidden`}
      >
        {/* <FilmGrain /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
