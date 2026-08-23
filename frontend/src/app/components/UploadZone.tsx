"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

interface UploadZoneProps {
  onAnalyzeFile: (file: File | null) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export default function UploadZone({ onAnalyzeFile, loading, error }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        setSelectedFile(file);
        await onAnalyzeFile(file);
      } else {
        alert("Harap unggah file berformat .CSV");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await onAnalyzeFile(file);
    }
  };

  const handleUseSampleData = async () => {
    setSelectedFile(null);
    await onAnalyzeFile(null); // Passing null triggers the backend sample dataset
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all duration-300 ${
          isDragOver
            ? "border-brand-400 bg-brand-500/10 shadow-glow-emerald scale-[1.008]"
            : "border-slate-700/80 bg-surface-200/50 hover:border-slate-600 hover:bg-surface-200/70"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-surface-100 to-surface-50 border border-slate-700 flex items-center justify-center shadow-lg">
            {loading ? (
              <RefreshCw className="h-8 w-8 text-brand-400 animate-spin" />
            ) : selectedFile ? (
              <CheckCircle2 className="h-8 w-8 text-brand-400" />
            ) : (
              <UploadCloud className="h-8 w-8 text-brand-400" />
            )}
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-semibold text-white">
              {loading
                ? "Menjalankan Model AI & Hybrid Decision Layer..."
                : selectedFile
                ? `File Terpilih: ${selectedFile.name}`
                : "Unggah Data Riwayat Penjualan (.CSV)"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Drag & Drop file CSV Anda di sini, atau klik tombol di bawah untuk memilih file dari komputer.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-brand-500 hover:bg-brand-400 text-slate-950 transition-all shadow-lg hover:shadow-glow-emerald disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Pilih File CSV</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleUseSampleData}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-surface-50 hover:bg-surface-100 text-slate-200 border border-slate-700 hover:border-brand-500/40 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-accent-amber" />
              <span>⚡ Gunakan Mock Retail UMKM Indonesia</span>
            </button>
          </div>

          {/* Supported Format Hint */}
          <div className="pt-2">
            <p className="text-[11px] text-slate-500">
              Format Kolom: <code className="text-slate-400">Date</code>, <code className="text-slate-400">ProductID</code>, <code className="text-slate-400">ProductName</code>, <code className="text-slate-400">Qty</code>, <code className="text-slate-400">Price</code>, <code className="text-slate-400">Cost</code>, <code className="text-slate-400">CurrentStock</code>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Gagal Memproses Data</p>
            <p className="text-xs text-rose-300/90">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
