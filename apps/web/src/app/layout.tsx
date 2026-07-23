import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dapur Kampoeng Raharja",
  description: "Menu hari ini — Dapur Kampoeng Raharja",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative" style={{ fontFamily: "var(--font-body)" }}>
        {/* Latar belakang dekoratif (Gelombang/Glow) */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          {/* Glow Oranye di tengah atas (di bawah navbar) */}
          <div className="absolute top-[-15%] md:top-[-25%] left-1/2 -translate-x-1/2 w-[400px] md:w-[800px] h-[300px] md:h-[500px] bg-[#E96D31]/20 rounded-full blur-[80px] md:blur-[120px]"></div>
          {/* Glow Hijau di kiri bawah */}
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-[#2C5E3B]/15 rounded-full blur-[100px] md:blur-[150px]"></div>
        </div>
        
        {children}
      </body>
    </html>
  );
}
