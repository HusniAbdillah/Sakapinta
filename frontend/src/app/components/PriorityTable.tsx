"use client";

import React, { useState } from "react";
import { formatIDR } from "./ActionableKPIs";
import { Search, ChevronRight, Sparkles } from "lucide-react";

export interface DecisionResultItem {
  product_id: string;
  product_name: string;
  unit_cost_idr: number;
  unit_price_idr: number;
  current_stock: number;
  forecast_14d_qty: number;
  safety_stock_qty: number;
  recommended_reorder_qty: number;
  estimated_cost_idr: number;
  potential_lost_sales_idr: number;
  risk_score: "High" | "Medium" | "Low" | string;
  risk_score_numeric: number;
  priority_rank: number;
  lead_time_days: number;
  lead_time_sigma_days?: number;
  demand_profile?: string;
  days_of_stock_remaining: number;
  historical_points: Array<{ date: string; qty: number }>;
  daily_predictions: Array<{
    date: string;
    predicted_demand: number;
    lower_bound: number;
    upper_bound: number;
    safety_buffer: number;
    event_label: string;
  }>;
}

interface PriorityTableProps {
  results: DecisionResultItem[];
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
}

export default function PriorityTable({
  results,
  selectedProductId,
  onSelectProduct,
}: PriorityTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const filteredResults = results.filter((item) => {
    const matchesSearch =
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === "ALL" || item.risk_score.toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-error mr-1.5 animate-pulse" />
            Tinggi (Kritis)
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/15 text-warning-dark border border-warning/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-warning mr-1.5" />
            Sedang
          </span>
        );
      case "low":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success-dark border border-success/30 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-success mr-1.5" />
            Aman
          </span>
        );
    }
  };

  const selectedItem = results.find(r => r.product_id === selectedProductId);

  return (
    <div className="luminous-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-card">
      {/* Header with Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface font-display flex items-center space-x-2">
            <span>Matriks Prioritas Keputusan Stok</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono font-semibold">
              {filteredResults.length} SKU
            </span>
          </h3>
          <p className="text-xs text-on-surface-variant font-mono">
            Diurutkan secara preskriptif berdasarkan skor risiko gabungan, volume permintaan, dan margin keuntungan.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60" />
            <input
              type="text"
              placeholder="Cari SKU / Nama Barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-outline-variant text-xs text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-electric-cyan focus:shadow-cyan-halo transition-all"
            />
          </div>

          <div className="flex items-center space-x-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/80 text-xs">
            {["ALL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterRisk === risk
                    ? "bg-royal-blue text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {risk === "ALL" ? "Semua" : risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/80 font-mono">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant font-display font-semibold border-b border-outline-variant uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 sm:px-4 text-center">Rank</th>
              <th className="py-3 px-3 sm:px-4">Produk / Profil AI</th>
              <th className="py-3 px-3 sm:px-4 text-center">Tingkat Risiko</th>
              <th className="py-3 px-3 sm:px-4 text-right">Stok Saat Ini</th>
              <th className="py-3 px-3 sm:px-4 text-right">Prediksi 14D</th>
              <th className="py-3 px-3 sm:px-4 text-right font-bold text-primary">Rekomendasi Restock</th>
              <th className="py-3 px-3 sm:px-4 text-right">Estimasi Modal</th>
              <th className="py-3 px-3 sm:px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 text-on-surface">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-on-surface-variant text-xs font-mono">
                  Tidak ada produk yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredResults.map((item) => {
                const isSelected = item.product_id === selectedProductId;
                return (
                  <tr
                    key={item.product_id}
                    onClick={() => onSelectProduct(item.product_id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary-fixed/40 border-l-4 border-l-primary"
                        : "hover:bg-surface-container-low/60"
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                          item.priority_rank === 1
                            ? "bg-warning text-slate-950 shadow-sm"
                            : item.priority_rank <= 3
                            ? "bg-surface-container-highest text-on-surface font-bold"
                            : "bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        {item.priority_rank}
                      </span>
                    </td>

                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-bold text-on-surface font-display">{item.product_name}</div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[11px] text-on-surface-variant font-mono">{item.product_id}</span>
                        {item.demand_profile && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-mono font-medium">
                            {item.demand_profile.includes("Croston") ? "Croston Hurdle" : item.demand_profile.includes("Bayesian") ? "Bayesian Prior" : "LightGBM SOTA"}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      {getRiskBadge(item.risk_score)}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right font-medium">
                      <span>{item.current_stock} unit</span>
                      <div className="text-[10px] text-on-surface-variant">
                        ~{item.days_of_stock_remaining} hari sisa
                      </div>
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right font-semibold text-on-surface">
                      {item.forecast_14d_qty} unit
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-primary">
                      <span className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                        +{item.recommended_reorder_qty} unit
                      </span>
                      <div className="text-[10px] text-on-surface-variant mt-1">
                        (Buffer +{item.safety_stock_qty})
                      </div>
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right font-medium text-on-surface whitespace-nowrap">
                      {formatIDR(item.estimated_cost_idr)}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(item.product_id);
                        }}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-royal-blue text-white font-bold"
                            : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant"
                        }`}
                      >
                        <span>XAI Math</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expandable Explainable AI (XAI) Breakdown Panel for Selected Product */}
      {selectedItem && (
        <div className="p-4 rounded-xl bg-surface-container-low border border-primary/30 space-y-3 animate-in fade-in duration-300 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-2.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-xs sm:text-sm font-bold text-on-surface font-display">
                Rincian Transparansi AI & Formulasi Matematika (XAI) — {selectedItem.product_name}
              </h4>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-on-surface-variant">
              <span>Profil: {selectedItem.demand_profile || "Fast-Moving"}</span>
              <span>•</span>
              <span>Lead Time: {selectedItem.lead_time_days}D (σL={selectedItem.lead_time_sigma_days || 0.6}D)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-outline-variant/80 space-y-1 shadow-sm">
              <div className="text-on-surface-variant font-medium font-display">1. Rumus Kuantitas Restock</div>
              <div className="text-on-surface font-semibold text-[11px]">
                Q = max(0, Forecast {selectedItem.forecast_14d_qty} + SS {selectedItem.safety_stock_qty} - Stok {selectedItem.current_stock})
              </div>
              <div className="text-primary font-bold text-sm">
                = {selectedItem.recommended_reorder_qty} Unit
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-outline-variant/80 space-y-1 shadow-sm">
              <div className="text-on-surface-variant font-medium font-display">2. Stochastic Joint Safety Stock (95% SL)</div>
              <div className="text-on-surface font-semibold text-[11px]">
                SS = ⌈ Z(1.65) × √(L·σD² + D̄²·σL²) ⌉
              </div>
              <div className="text-success-dark font-bold text-sm">
                = +{selectedItem.safety_stock_qty} Unit (Buffer Ketidakpastian Ganda)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-outline-variant/80 space-y-1 shadow-sm">
              <div className="text-on-surface-variant font-medium font-display">3. Skor Risiko & Ketahanan</div>
              <div className="text-on-surface font-semibold text-[11px]">
                Indeks Risiko: {selectedItem.risk_score_numeric} / 100 ({selectedItem.risk_score})
              </div>
              <div className="text-warning-dark font-bold text-sm">
                Sisa Ketahanan Stok: ~{selectedItem.days_of_stock_remaining} Hari
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
