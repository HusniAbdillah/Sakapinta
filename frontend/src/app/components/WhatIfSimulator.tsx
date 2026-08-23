"use client";

import React, { useState } from "react";
import { DecisionResultItem } from "./PriorityTable";
import { formatIDR } from "./ActionableKPIs";
import { Sliders, CheckCircle, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

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
    <div className="glass-panel rounded-2xl border border-brand-500/20 bg-gradient-to-b from-surface-200/90 to-surface-300/90 p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-1.5">
              <span>Simulasi What-If: Batasan Anggaran Modal UMKM</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-semibold border border-brand-500/20">
                Interaktif
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Uji skenario ketersediaan modal terbatas dan lihat SKU mana yang dioptimalkan secara otomatis oleh algoritma.
            </p>
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-2 bg-surface-100/60 p-4 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">Alokasi Modal Tersedia:</span>
          <span className="text-sm font-bold text-brand-400">
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />

        <div className="flex justify-between text-[11px] text-slate-500">
          <span>10% (Modal Sangat Terbatas)</span>
          <span>50%</span>
          <span>100% (Rekomendasi Penuh AI)</span>
        </div>
      </div>

      {/* Simulation Results Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-surface-200/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center space-x-1">
            <CheckCircle className="h-3.5 w-3.5 text-brand-400" />
            <span>SKU Berhasil Dibiayai</span>
          </div>
          <div className="text-xl font-bold text-white">
            {fundedCount} <span className="text-xs text-slate-400 font-normal">/ {results.length} Produk</span>
          </div>
          <div className="text-[11px] text-brand-400">
            Alokasi Prioritas Rank 1 hingga Rank {fundedCount || 0}
          </div>
        </div>

        <div className="bg-surface-200/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Omset Terlindungi</span>
          </div>
          <div className="text-xl font-bold text-accent-cyan">
            {formatIDR(protectedRevenue)}
          </div>
          <div className="text-[11px] text-slate-400">
            Terhindar dari stockout
          </div>
        </div>

        <div className="bg-surface-200/80 p-3.5 rounded-xl border border-rose-500/20 space-y-1">
          <div className="text-rose-300 flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>Risiko Omset Terkorban</span>
          </div>
          <div className="text-xl font-bold text-rose-400">
            {formatIDR(exposedLossRevenue)}
          </div>
          <div className="text-[11px] text-rose-300/80">
            {results.length - fundedCount} SKU berpotensi kehabisan stok
          </div>
        </div>
      </div>
    </div>
  );
}
