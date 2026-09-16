import React from 'react';
import { ShieldCheck, Lock, Code2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#111827] border-t border-white/8 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#F8FAFC] tracking-tight">
              ScamShield Defensive Core
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              Active Defense
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Real-time multi-vector threat intelligence, anti-phishing heuristic analysis, and cyber protection engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[#94A3B8] font-['JetBrains_Mono'] text-xs">
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Telemetry Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#4cd7f6]">
            <Lock className="w-3.5 h-3.5" />
            <span>Rule-Based Inspection</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#ffb95f]">
            <Code2 className="w-3.5 h-3.5" />
            <span>MIT Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
