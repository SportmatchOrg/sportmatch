import type { Metadata } from "next";
import { AuthProvider } from "@/context/auth-context";
import { SplashProvider } from "@/context/splash-context";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SportMatch",
  description: "Encontrá partidos y jugadores cerca tuyo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} h-full antialiased`}
    >
    <body className="min-h-full flex flex-col">
    <SplashProvider>
      <AuthProvider>{children}</AuthProvider>
    </SplashProvider>
    </body>
    </html>
  );
}
