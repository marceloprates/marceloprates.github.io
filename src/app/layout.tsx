import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Archivo_Black } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Providers } from "./providers";
import { getProjectMetadata } from "@/lib/project-metadata.server";

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
  // Get project metadata at build time
  const projectMetadata = getProjectMetadata();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PROJECT_METADATA__ = ${JSON.stringify(projectMetadata)};`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable} antialiased relative overflow-x-hidden`}
      >
        {/* <FilmGrain /> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
