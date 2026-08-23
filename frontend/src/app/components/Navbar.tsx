"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, Activity, Cpu, Layers } from "lucide-react";

interface NavbarProps {
  apiHealthy: boolean | null;
}

export default function Navbar({ apiHealthy }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-surface-300/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center shadow-glow-emerald border border-brand-400/30">
            <Layers className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">
                Sakapinta
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Tiang Penyangga Keputusan Stok UMKM Indonesia
            </p>
          </div>
        </div>

        {/* Challenge Badges & API Status */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-surface-200 border border-slate-700/60 text-xs text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-accent-cyan" />
            <span className="font-medium">COMPFEST 18 AI Challenge</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-surface-200/80 border border-slate-700/60 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                apiHealthy === true
                  ? "bg-emerald-400 animate-pulse shadow-glow-emerald"
                  : apiHealthy === false
                  ? "bg-rose-500"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-slate-300 font-medium">
              {apiHealthy === true
                ? "API Active"
                : apiHealthy === false
                ? "API Offline"
                : "Connecting..."}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
