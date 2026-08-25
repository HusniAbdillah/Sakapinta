"use client";

import React, { useState } from "react";
import { DecisionResultItem } from "./PriorityTable";
import { formatIDR } from "./ActionableKPIs";
import { Sliders, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

interface WhatIfSimulatorProps {
  results: DecisionResultItem[];
  totalCapitalRequired: number;
}

export default function WhatIfSimulator({
  results,
  totalCapitalRequired,
}: WhatIfSimulatorProps) {
  // Slider: Budget limit as a percentage of total recommended capital (10% to 100%)
  const [budgetPercent, setBudgetPercent] = useState<number>(100);

  const availableBudget = (totalCapitalRequired * budgetPercent) / 100;

  // Allocate budget sequentially down the priority ranked list
  let accumulatedSpend = 0;
  let fundedCount = 0;
  let protectedRevenue = 0;
  let exposedLossRevenue = 0;

  results.forEach((item) => {
    if (accumulatedSpend + item.estimated_cost_idr <= availableBudget) {
      accumulatedSpend += item.estimated_cost_idr;
      fundedCount += 1;
      protectedRevenue += item.potential_lost_sales_idr;
    } else {
      exposedLossRevenue += item.potential_lost_sales_idr;
    }
  });

  return (
    <div className="luminous-card rounded-2xl p-5 sm:p-6 space-y-5 border-primary/20 bg-gradient-to-b from-white to-surface-low/60 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface font-display flex items-center space-x-2">
              <span>Simulasi What-If: Batasan Anggaran Modal UMKM</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 font-mono">
                Interaktif
              </span>
            </h3>
            <p className="text-xs text-on-surface-variant font-mono">
              Uji skenario ketersediaan modal terbatas dan lihat alokasi prioritas produk yang dioptimalkan algoritma.
            </p>
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-2.5 bg-surface-container-low p-4 rounded-xl border border-outline-variant/80 font-mono">
        <div className="flex justify-between items-center text-xs">
          <span className="text-on-surface-variant font-medium">Alokasi Modal Tersedia:</span>
          <span className="text-sm font-bold text-primary">
            {formatIDR(availableBudget)} ({budgetPercent}%)
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={budgetPercent}
          onChange={(e) => setBudgetPercent(Number(e.target.value))}
          className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div className="flex justify-between text-[11px] text-on-surface-variant/70">
          <span>10% (Modal Minim)</span>
          <span>50%</span>
          <span>100% (Rekomendasi Optimal AI)</span>
        </div>
      </div>

      {/* Simulation Results Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="bg-white p-4 rounded-xl border border-outline-variant/80 space-y-1 shadow-sm">
          <div className="text-on-surface-variant flex items-center space-x-1.5 font-display font-semibold">
            <CheckCircle className="h-4 w-4 text-success" />
            <span>SKU Berhasil Dibiayai</span>
          </div>
          <div className="text-xl font-bold text-on-surface">
            {fundedCount} <span className="text-xs text-on-surface-variant font-normal">/ {results.length} Produk</span>
          </div>
          <div className="text-[11px] text-success-dark font-medium">
            Prioritas Rank 1 hingga Rank {fundedCount || 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-primary/20 space-y-1 shadow-sm">
          <div className="text-primary flex items-center space-x-1.5 font-display font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Omset Terlindungi</span>
          </div>
          <div className="text-xl font-bold text-primary">
            {formatIDR(protectedRevenue)}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            Terhindar dari risiko stockout
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-error/20 space-y-1 shadow-sm bg-gradient-to-br from-white to-error-container/10">
          <div className="text-error flex items-center space-x-1.5 font-display font-semibold">
            <AlertTriangle className="h-4 w-4 text-error" />
            <span>Risiko Omset Terkorban</span>
          </div>
          <div className="text-xl font-bold text-error">
            {formatIDR(exposedLossRevenue)}
          </div>
          <div className="text-[11px] text-on-surface-variant">
            {results.length - fundedCount} SKU berpotensi kekurangan stok
          </div>
        </div>
      </div>
    </div>
  );
}
