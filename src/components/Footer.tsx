import React from 'react';
import { ShieldCheck, Lock, Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#05070a] border-t border-white/10 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-white tracking-tight">
              ScamShield Defensive Core
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-['JetBrains_Mono'] uppercase bg-white/5 text-neutral-300 border border-white/10">
              Active Defense
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time multi-vector threat intelligence, anti-phishing heuristic analysis, and cyber protection engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400 font-['JetBrains_Mono'] text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Sandboxed Engine</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
