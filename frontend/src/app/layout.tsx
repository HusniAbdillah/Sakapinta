import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sakapinta | AI Decision Support for Indonesian SME Inventory",
  description: "Tiang Penyangga Keputusan Stok UMKM Indonesia - AI-powered demand forecasting and prescriptive inventory optimization for COMPFEST 18 AI Innovation Challenge.",
  keywords: ["AI Decision Support", "Demand Forecasting", "SME Logistics", "COMPFEST 18", "Smart Commerce", "Indonesian Retail"],
  authors: [{ name: "Sakapinta AI Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-brand-500 selection:text-slate-950">
        <div className="relative min-h-screen flex flex-col bg-grid-pattern">
          {/* Background subtle glowing radial gradients */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none -z-10" />
          {children}
        </div>
      </body>
    </html>
  );
}
