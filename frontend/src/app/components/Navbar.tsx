"use client";

import React from "react";
import Image from "next/image";
import { Cpu, ShieldCheck, Activity } from "lucide-react";

interface NavbarProps {
  apiHealthy: boolean | null;
}

export default function Navbar({ apiHealthy }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/60 luminous-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand identity with Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-sm border border-outline-variant/80 bg-white flex items-center justify-center p-1">
            <Image
              src="/images/Sakapinta.png"
              alt="Sakapinta Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-on-surface font-display">
                Sakapinta
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono hidden sm:block">
              Tiang Penyangga Keputusan Stok UMKM Indonesia
            </p>
          </div>
        </div>

        {/* Challenge Badges & API Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 font-mono">
          
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/80 text-xs text-on-surface">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold font-display">COMPFEST 18 AIC</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-outline-variant/80 text-xs shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                apiHealthy === true
                  ? "bg-success animate-pulse"
                  : apiHealthy === false
                  ? "bg-error"
                  : "bg-warning"
              }`}
            />
            <span className="text-on-surface font-medium">
              {apiHealthy === true
                ? "FastAPI Active"
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
