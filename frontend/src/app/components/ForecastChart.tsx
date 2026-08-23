"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { DecisionResultItem } from "./PriorityTable";
import { formatIDR } from "./ActionableKPIs";
import { TrendingUp, Shield, Calendar, Sparkles } from "lucide-react";

interface ForecastChartProps {
  selectedItem: DecisionResultItem | undefined;
  allItems: DecisionResultItem[];
  onSelectProduct: (productId: string) => void;
}

export default function ForecastChart({
  selectedItem,
  allItems,
  onSelectProduct,
}: ForecastChartProps) {
  if (!selectedItem) {
    return (
      <div className="glass-panel rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
        Pilih salah satu produk dari tabel prioritas untuk melihat simulasi visualisasi tren permintaan.
      </div>
    );
  }

  // Combine historical and daily prediction points into a single unified time-series dataset
  const chartData: Array<{
    date: string;
    displayDate: string;
    historicalQty?: number;
    forecastDemand?: number;
    upperBound?: number;
    lowerBound?: number;
    isForecast: boolean;
    eventLabel?: string;
  }> = [];

  // 1. Add historical points (up to 20 recent days for balanced chart)
  const recentHist = selectedItem.historical_points.slice(-20);
  recentHist.forEach((hp) => {
    chartData.push({
      date: hp.date,
      displayDate: hp.date.slice(5), // MM-DD
      historicalQty: hp.qty,
      isForecast: false,
    });
  });

  // Connect historical curve seamlessly to the forecast starting point
  if (recentHist.length > 0 && selectedItem.daily_predictions.length > 0) {
    const lastHist = recentHist[recentHist.length - 1];
    const firstPred = selectedItem.daily_predictions[0];
    
    // Add bridge point on last historical date
    const lastIdx = chartData.length - 1;
    chartData[lastIdx].forecastDemand = lastHist.qty;
  }

  // 2. Add future 14-day daily predictions
  selectedItem.daily_predictions.forEach((dp) => {
    chartData.push({
      date: dp.date,
      displayDate: dp.date.slice(5),
      forecastDemand: dp.predicted_demand,
      upperBound: dp.upper_bound,
      lowerBound: dp.lower_bound,
      isForecast: true,
      eventLabel: dp.event_label,
    });
  });

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-surface-300/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-1.5">
            <span className="font-bold text-white flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-brand-400" />
              <span>{dataPoint.date}</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                dataPoint.isForecast
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {dataPoint.isForecast ? "Prediksi AI" : "Aktual Penjualan"}
            </span>
          </div>

          {dataPoint.historicalQty !== undefined && !dataPoint.isForecast && (
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Permintaan Aktual:</span>
              <span className="font-bold text-white">{dataPoint.historicalQty} unit</span>
            </div>
          )}

          {dataPoint.forecastDemand !== undefined && dataPoint.isForecast && (
            <>
              <div className="flex justify-between text-slate-300">
                <span className="text-brand-400 font-semibold">Prediksi Permintaan:</span>
                <span className="font-bold text-brand-300">{dataPoint.forecastDemand} unit</span>
              </div>
              {dataPoint.upperBound && (
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Batas Atas (P90):</span>
                  <span>{dataPoint.upperBound} unit</span>
                </div>
              )}
            </>
          )}

          {dataPoint.eventLabel && dataPoint.eventLabel !== "Regular Trading Day" && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-700/60 text-[11px] text-amber-300 flex items-center space-x-1">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>{dataPoint.eventLabel}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5">
      {/* Product Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white">{selectedItem.product_name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 text-slate-300 border border-slate-700 font-mono">
              {selectedItem.product_id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grafik 20 Hari Aktual vs Proyeksi 14 Hari ke Depan dengan Safety Stock Margin.
          </p>
        </div>

        {/* SKU Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Ganti SKU:</label>
          <select
            value={selectedItem.product_id}
            onChange={(e) => onSelectProduct(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-200 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {allItems.map((item) => (
              <option key={item.product_id} value={item.product_id}>
                {item.product_name} ({item.product_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mini Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-surface-200/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400">Total Proyeksi 14 Hari</div>
          <div className="text-base font-bold text-white mt-0.5">{selectedItem.forecast_14d_qty} unit</div>
        </div>
        <div className="bg-surface-200/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400">Safety Stock Buffer</div>
          <div className="text-base font-bold text-accent-cyan mt-0.5">+{selectedItem.safety_stock_qty} unit</div>
        </div>
        <div className="bg-surface-200/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400">Rekomendasi Order</div>
          <div className="text-base font-bold text-brand-400 mt-0.5">+{selectedItem.recommended_reorder_qty} unit</div>
        </div>
        <div className="bg-surface-200/60 p-3 rounded-xl border border-slate-800">
          <div className="text-slate-400">Estimasi Modal Reorder</div>
          <div className="text-base font-bold text-slate-200 mt-0.5">{formatIDR(selectedItem.estimated_cost_idr)}</div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="displayDate"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              iconType="circle"
            />

            {/* Historical Area */}
            <Area
              type="monotone"
              dataKey="historicalQty"
              name="Penjualan Historis (Aktual)"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#histGradient)"
            />

            {/* Forecast Area & Line */}
            <Area
              type="monotone"
              dataKey="forecastDemand"
              name="Prediksi Permintaan AI (14 Hari)"
              stroke="#10b981"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#forecastGradient)"
            />

            {/* Upper Confidence Band */}
            <Line
              type="monotone"
              dataKey="upperBound"
              name="Batas Atas Lonjakan (P90)"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
