import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Archivo_Black } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Providers } from "./providers";
import { SkipLink } from "@/components/SkipLink";
import { NavShell } from "@/components/nav/NavShell";
import { FilmGrain } from "@/components/FilmGrain";
import { getSearchItems } from "@/lib/search-items.server";

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
  title: "Marcelo Prates — Data Scientist",
  description: "Personal website of Marcelo Prates, Brazilian data scientist. Projects, publications, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build the search index server-side. NavShell is a client
  // component — it must never import fs-backed modules. Layout
  // resolves the index here (in the server boundary) and passes
  // it down as a prop. Phase F replaces this resolver body with
  // a fetch against /public/search-index.json; the prop shape
  // does not change.
  const searchItems = getSearchItems();

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} antialiased relative overflow-x-hidden`}
      >
        <SkipLink />
        <Providers>
          <FilmGrain
            className="pointer-events-none fixed inset-0"
            intensity={20}
            fps={0}
            tileSize={800}
          />
          <NavShell items={searchItems} />
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
