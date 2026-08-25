"use client";

import React from "react";
import { Wallet, AlertTriangle, ShieldCheck, TrendingUp } from "lucide-react";

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
      <div className="luminous-card luminous-card-hover rounded-2xl p-5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-on-surface-variant text-xs font-semibold uppercase tracking-wider font-display">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Wallet className="h-4 w-4" />
            </div>
            <span>Modal Restock</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-primary font-mono">
            14 Hari
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-on-surface font-mono tracking-tight mb-1">
          {formatIDR(summary.total_capital_required_idr)}
        </div>
        <p className="text-xs text-on-surface-variant font-mono">
          Rekomendasi alokasi dana pengadaan barang
        </p>
      </div>

      {/* 2. Potential Lost Sales (What-If Risk) */}
      <div className="luminous-card luminous-card-hover rounded-2xl p-5 border-error/20 relative overflow-hidden group bg-gradient-to-br from-white to-error-container/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-error text-xs font-semibold uppercase tracking-wider font-display">
            <div className="p-1.5 rounded-lg bg-error/10 text-error border border-error/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span>Potensi Omset Hilang</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-error/10 text-error font-mono">
            Risiko
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-error font-mono tracking-tight mb-1">
          {formatIDR(summary.potential_lost_sales_idr)}
        </div>
        <p className="text-xs text-on-surface-variant font-mono">
          Estimasi kerugian jika stok habis dan tidak restock
        </p>
      </div>

      {/* 3. Critical SKU Count */}
      <div className="luminous-card luminous-card-hover rounded-2xl p-5 border-warning/20 relative overflow-hidden group bg-gradient-to-br from-white to-warning-light/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-warning-dark text-xs font-semibold uppercase tracking-wider font-display">
            <div className="p-1.5 rounded-lg bg-warning/10 text-warning border border-warning/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span>SKU Kritis</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning/10 text-warning-dark font-mono">
            {criticalRatio}% Urgent
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-on-surface font-mono tracking-tight mb-1">
          {summary.critical_items_count}{" "}
          <span className="text-sm font-medium text-on-surface-variant font-mono">/ {summary.total_skus_evaluated} SKU</span>
        </div>
        <p className="text-xs text-on-surface-variant font-mono">
          Barang mendesak dipesan sebelum stockout
        </p>
      </div>

      {/* 4. Stochastic Safety Stock Buffer */}
      <div className="luminous-card luminous-card-hover rounded-2xl p-5 border-success/20 relative overflow-hidden group bg-gradient-to-br from-white to-success-light/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-success-dark text-xs font-semibold uppercase tracking-wider font-display">
            <div className="p-1.5 rounded-lg bg-success/10 text-success border border-success/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span>Stochastic Buffer</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success-dark font-mono">
            95% SL
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-success-dark font-mono tracking-tight mb-1">
          {summary.average_safety_stock_ratio}
        </div>
        <p className="text-xs text-on-surface-variant font-mono">
          Target Service Level: {summary.service_level_target || "95.0% (Z=1.65)"}
        </p>
      </div>
    </section>
  );
}
