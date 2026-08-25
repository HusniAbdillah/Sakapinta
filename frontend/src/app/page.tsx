"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import UploadZone from "./components/UploadZone";
import ActionableKPIs, { DecisionSummary } from "./components/ActionableKPIs";
import PriorityTable, { DecisionResultItem } from "./components/PriorityTable";
import ForecastChart from "./components/ForecastChart";
import WhatIfSimulator from "./components/WhatIfSimulator";
import confetti from "canvas-confetti";
import { Sparkles, CheckCircle2, RotateCcw, Download, ShieldCheck } from "lucide-react";

interface DecisionApiResponse {
  status: string;
  horizon_days: number;
  summary: DecisionSummary;
  results: DecisionResultItem[];
}

export default function DashboardPage() {
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [decisionData, setDecisionData] = useState<DecisionApiResponse | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) {
          setApiHealthy(true);
        } else {
          setApiHealthy(false);
        }
      } catch (err) {
        try {
          const res2 = await fetch("/api/health");
          if (res2.ok) setApiHealthy(true);
          else setApiHealthy(false);
        } catch {
          setApiHealthy(false);
        }
      }
    };
    checkHealth();
  }, [API_BASE_URL]);

  const handleAnalyze = async (file: File | null) => {
    setLoading(true);
    setError(null);

    try {
      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        response = await fetch(`${API_BASE_URL}/api/predict-and-decide`, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/predict-and-decide`, {
          method: "POST",
        });
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: "Gagal memproses file." }));
        throw new Error(errJson.detail || `Server returned status ${response.status}`);
      }

      const data: DecisionApiResponse = await response.json();
      setDecisionData(data);

      if (data.results && data.results.length > 0) {
        setSelectedProductId(data.results[0].product_id);
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.75 },
          colors: ["#0058c3", "#00CED1", "#1E40AF", "#10B981"],
        });
      } catch {
        // Ignore in environments without canvas
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses data ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDecisionData(null);
    setError(null);
    setSelectedProductId("");
  };

  const handleExportCSV = () => {
    if (!decisionData || !decisionData.results) return;

    const headers = [
      "Peringkat Prioritas",
      "ID Produk",
      "Nama Produk",
      "Stok Saat Ini",
      "Prediksi Demand 14 Hari",
      "Safety Stock (Buffer)",
      "Rekomendasi Restock Qty",
      "Tingkat Risiko Stockout",
      "Estimasi Modal Restock (IDR)",
      "Potensi Omset Hilang (IDR)",
      "Profil AI"
    ];

    const rows = decisionData.results.map(item => [
      item.priority_rank,
      `"${item.product_id}"`,
      `"${item.product_name}"`,
      item.current_stock,
      item.forecast_14d_qty,
      item.safety_stock_qty,
      item.recommended_reorder_qty,
      item.risk_score,
      item.estimated_cost_idr,
      item.potential_lost_sales_idr,
      `"${item.demand_profile || 'Fast-Moving'}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Restock_Sakapinta_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedItem = decisionData?.results.find((item) => item.product_id === selectedProductId);

  return (
    <div className="flex flex-col min-h-screen font-mono">
      <Navbar apiHealthy={apiHealthy} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-3 max-w-3xl mx-auto pt-2 pb-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-electric-cyan" />
            <span>AI Decision Support System for Smart Commerce</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface font-display">
            Optimasi Keputusan Stok & Restock UMKM Indonesia
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant font-mono leading-relaxed">
            Bukan sekadar peramalan deret waktu biasa. Sakapinta mengonversi data transaksi menjadi{" "}
            <strong className="text-primary font-bold">tindakan preskriptif</strong>: rekomendasi kuantitas restock,
            stok pengaman stokastik, dan simulasi potensi kerugian finansial.
          </p>
        </section>

        {/* Upload & Ingestion Section */}
        <section className="max-w-4xl mx-auto">
          <UploadZone
            onAnalyzeFile={handleAnalyze}
            loading={loading}
            error={error}
          />
        </section>

        {/* Dynamic AI Results Section */}
        {decisionData && (
          <section className="space-y-8 animate-fade-in">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-outline-variant shadow-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm font-bold text-on-surface font-display">
                  Keputusan Stok 14 Hari Selesai Dihitung
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  ({decisionData.summary.total_skus_evaluated} SKU Dievaluasi)
                </span>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-royal-blue hover:bg-primary text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Laporan Restock (.CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium border border-outline-variant transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* AI Governance & Responsible AI Banner */}
            <div className="bg-surface-container-low border border-primary/20 rounded-2xl p-4 flex items-start space-x-3 text-xs text-on-surface-variant shadow-sm">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-on-surface flex items-center space-x-1.5 font-display text-sm">
                  <span>Tata Kelola & Etika AI Terpenuhi (Responsible AI Governance)</span>
                </div>
                <p className="leading-relaxed font-sans text-xs text-on-surface/90">
                  Model AI diprediksi secara deterministik menggunakan <strong className="font-bold text-on-surface">Multi-Quantile LightGBM</strong> (<em>P</em><sub>10</sub>, <em>P</em><sub>50</sub>, <em>P</em><sub>90</sub>) dengan dekomposisi <strong className="font-bold text-on-surface">Croston</strong> untuk barang intermiten dan <strong className="font-bold text-on-surface">Empirical Bayes</strong> untuk <em>cold-start</em>. Perhitungan <strong className="font-bold text-on-surface">Stochastic Safety Stock</strong> mematuhi <em>Service Level</em> 95% (<em>Z</em> = 1.65) tanpa risiko halusinasi LLM generatif.
                </p>
              </div>
            </div>

            {/* 1. Actionable Executive KPIs */}
            <ActionableKPIs summary={decisionData.summary} />

            {/* 2. Interactive What-If Budget Simulation */}
            <WhatIfSimulator
              results={decisionData.results}
              totalCapitalRequired={decisionData.summary.total_capital_required_idr}
            />

            {/* 3. Priority Matrix Table */}
            <PriorityTable
              results={decisionData.results}
              selectedProductId={selectedProductId}
              onSelectProduct={(pid) => setSelectedProductId(pid)}
            />

            {/* 4. Interactive Forecast & Safety Stock Chart */}
            <ForecastChart
              selectedItem={selectedItem}
              allItems={decisionData.results}
              onSelectProduct={(pid) => setSelectedProductId(pid)}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/60 bg-white/80 backdrop-blur-md py-6 mt-12 text-center text-xs text-on-surface-variant font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-on-surface font-display">Sakapinta</span> • COMPFEST 18 AI Innovation Challenge
          </div>
          <div>
            Kategori: Smart Commerce & Smart Logistics (Backbone of the Economy)
          </div>
        </div>
      </footer>
    </div>
  );
}
