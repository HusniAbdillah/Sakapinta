"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles, AlertCircle, RefreshCw, CheckCircle2, Download, Zap } from "lucide-react";

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
    await onAnalyzeFile(null);
  };

  const handleDownloadTemplate = () => {
    const templateContent =
      "Date,ProductID,ProductName,Qty,Price,Cost,CurrentStock\n" +
      "2026-08-01,SKU-BERAS-05,Beras Ramos Premium 5kg,22,78000,68000,15\n" +
      "2026-08-01,SKU-MINYAK-02,Minyak Goreng Sawit 2L,35,34000,29000,10\n" +
      "2026-08-02,SKU-BERAS-05,Beras Ramos Premium 5kg,26,78000,68000,15\n" +
      "2026-08-02,SKU-MINYAK-02,Minyak Goreng Sawit 2L,38,34000,29000,10\n";

    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Template_Format_Penjualan_Sakapinta.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all duration-300 ${
          isDragOver
            ? "border-primary bg-primary/5 shadow-cyan-halo scale-[1.008]"
            : "border-outline-variant/80 bg-white hover:border-primary/60 hover:bg-surface-container-low/40 shadow-card"
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
          <div className="h-16 w-16 rounded-2xl bg-surface-container-low border border-outline-variant flex items-center justify-center shadow-sm">
            {loading ? (
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            ) : selectedFile ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <UploadCloud className="h-8 w-8 text-primary" />
            )}
          </div>

          <div className="space-y-2 max-w-lg">
            <h3 className="text-lg font-bold text-on-surface font-display">
              {loading
                ? "Menjalankan Model AI & Hybrid Decision Layer..."
                : selectedFile
                ? "File Berhasil Dipilih & Siap Dianalisis"
                : "Unggah Riwayat Transaksi Penjualan (.CSV)"}
            </h3>

            {selectedFile ? (
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-mono">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-2 text-on-surface-variant hover:text-error text-xs font-bold underline cursor-pointer"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-on-surface-variant font-mono">
                Drag & drop file CSV transaksi UMKM Anda di sini, atau pilih file dari perangkat lokal.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono">
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-royal-blue hover:bg-primary text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Pilih File CSV</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleUseSampleData}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant hover:border-primary/40 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-4 w-4 text-warning" />
              <span>Muat Data Sampel Ritel Indonesia</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Format Template</span>
            </button>
          </div>

          <div className="pt-2 font-mono">
            <p className="text-[11px] text-on-surface-variant/80">
              Format Kolom: <code className="text-primary font-semibold">Date</code>, <code className="text-primary font-semibold">ProductID</code>, <code className="text-primary font-semibold">ProductName</code>, <code className="text-primary font-semibold">Qty</code>, <code className="text-primary font-semibold">Price</code>, <code className="text-primary font-semibold">Cost</code>, <code className="text-primary font-semibold">CurrentStock</code>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-error/10 border border-error/30 flex items-start space-x-3 text-error text-sm font-mono">
          <AlertCircle className="h-5 w-5 shrink-0 text-error mt-0.5" />
          <div>
            <p className="font-bold text-error">Gagal Memproses Data</p>
            <p className="text-xs text-on-surface-variant">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
