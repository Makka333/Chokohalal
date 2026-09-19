import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Choko Halal | Исламская рассрочка",
  description: "MVP веб-сервиса исламской рассрочки с предварительным расчётом и заявками.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen">
          <Header />
          {children}
          <Footer />
        </div>
        <Link
          href="/calculator"
          className="fixed bottom-4 right-4 z-20 hidden rounded-full bg-[#0c3b2e] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-950/20 sm:inline-flex"
        >
          Рассчитать
        </Link>
      </body>
    </html>
  );
}
