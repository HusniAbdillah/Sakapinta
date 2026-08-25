"use client";

import React from "react";
import { Wallet, AlertTriangle, ShieldCheck, TrendingUp, HelpCircle } from "lucide-react";

export interface DecisionSummary {
  total_capital_required_idr: number;
  potential_lost_sales_idr: number;
  critical_items_count: number;
  total_skus_evaluated: number;
  average_safety_stock_ratio: string;
  service_level_target?: string;
  stochastic_model?: string;
}

interface ActionableKPIsProps {
  summary: DecisionSummary;
}

export const formatIDR = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function ActionableKPIs({ summary }: ActionableKPIsProps) {
  const criticalRatio = summary.total_skus_evaluated > 0
    ? Math.round((summary.critical_items_count / summary.total_skus_evaluated) * 100)
    : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Capital Required */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 glass-card-hover relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="h-16 w-16 text-brand-400" />
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Wallet className="h-4 w-4" />
          </div>
          <span>Total Modal Restock</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          {formatIDR(summary.total_capital_required_idr)}
        </div>
        <p className="text-xs text-slate-400 flex items-center space-x-1">
          <span className="text-brand-400 font-semibold">14 Hari ke Depan</span>
          <span>• Rekomendasi Alokasi Dana</span>
        </p>
      </div>

      {/* 2. Potential Lost Sales (What-If Risk) */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 glass-card-hover relative overflow-hidden group bg-gradient-to-br from-surface-200 to-rose-950/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertTriangle className="h-16 w-16 text-rose-400" />
        </div>
        <div className="flex items-center space-x-2 text-rose-300 text-xs font-medium uppercase tracking-wider mb-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span>Potensi Omset Hilang</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 tracking-tight mb-1">
          {formatIDR(summary.potential_lost_sales_idr)}
        </div>
        <p className="text-xs text-rose-400/90 flex items-center space-x-1">
          <span>Risiko jika stok habis dan tidak restock</span>
        </p>
      </div>

      {/* 3. Critical SKU Count */}
      <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 glass-card-hover relative overflow-hidden group bg-gradient-to-br from-surface-200 to-amber-950/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="h-16 w-16 text-amber-400" />
        </div>
        <div className="flex items-center space-x-2 text-amber-300 text-xs font-medium uppercase tracking-wider mb-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span>SKU Prioritas Kritis</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight mb-1">
          {summary.critical_items_count}{" "}
          <span className="text-sm font-medium text-amber-400/80">/ {summary.total_skus_evaluated} SKU</span>
        </div>
        <p className="text-xs text-amber-400/90 flex items-center space-x-1">
          <span>{criticalRatio}% SKU mendesak harus dipesan</span>
        </p>
      </div>

      {/* 4. Stochastic Safety Stock Buffer */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 glass-card-hover relative overflow-hidden group bg-gradient-to-br from-surface-200 to-emerald-950/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className="h-16 w-16 text-emerald-400" />
        </div>
        <div className="flex items-center space-x-2 text-emerald-300 text-xs font-medium uppercase tracking-wider mb-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span>Stochastic Safety Buffer</span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 tracking-tight mb-1">
          {summary.average_safety_stock_ratio}
        </div>
        <p className="text-xs text-emerald-400/90 flex items-center space-x-1">
          <span>Service Level Target: {summary.service_level_target || "95.0% (Z=1.65)"}</span>
        </p>
      </div>
    </section>
  );
}
