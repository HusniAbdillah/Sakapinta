import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sakapinta | AI Decision Support Engine for Indonesian Retail",
  description: "Tiang Penyangga Keputusan Stok UMKM Indonesia - Prescriptive AI-powered demand forecasting and dynamic safety stock optimization for COMPFEST 18 AI Innovation Challenge.",
  keywords: ["AI Decision Support", "Demand Forecasting", "SME Logistics", "COMPFEST 18", "Smart Commerce", "Indonesian Retail", "Supply Chain AI"],
  authors: [{ name: "Sakapinta AI Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/Sakapinta.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-surface-base text-on-surface antialiased selection:bg-primary-container selection:text-white font-mono min-h-screen">
        <div className="relative min-h-screen flex flex-col bg-luminous-pattern">
          {/* Subtle glowing ambient spheres */}
          <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-electric-cyan/5 rounded-full blur-3xl pointer-events-none -z-10" />
          {children}
        </div>
      </body>
    </html>
  );
}
