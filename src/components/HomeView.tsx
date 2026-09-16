import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../types';
import { analyzeMessage, PRESET_MESSAGES } from '../utils/heuristics';
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Brain,
  Sparkles,
  Award,
  Terminal,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  BarChart3,
  Search,
  Activity,
  Radio,
  Globe2,
  ShieldAlert,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

interface LiveThreatEvent {
  id: string;
  type: 'LINK' | 'QR' | 'EMAIL' | 'SMS';
  target: string;
  category: string;
  origin: string;
  timeAgo: string;
  risk: number;
}

const INITIAL_LIVE_THREATS: LiveThreatEvent[] = [
  {
    id: 't-1',
    type: 'LINK',
    target: 'chase-security-verify882.xyz/login',
    category: 'Credential Harvester',
    origin: 'US-East / AWS',
    timeAgo: 'Just now',
    risk: 98,
  },
  {
    id: 't-2',
    type: 'EMAIL',
    target: 'payroll-update@workday-secure8.com',
    category: 'BEC Payroll Redirection',
    origin: 'Frankfurt / DigitalOcean',
    timeAgo: '4s ago',
    risk: 94,
  },
  {
    id: 't-3',
    type: 'QR',
    target: 'http://pay-fast.top/qr-meter?p=89',
    category: 'Parking Meter Quishing Trap',
    origin: 'Amsterdam / OVH',
    timeAgo: '12s ago',
    risk: 96,
  },
  {
    id: 't-4',
    type: 'SMS',
    target: 'USPS: Package #US948194 customs fee $1.95',
    category: 'Smishing Micro-Charge Fraud',
    origin: 'Singapore / Cloudflare',
    timeAgo: '19s ago',
    risk: 91,
  },
  {
    id: 't-5',
    type: 'LINK',
    target: 'dhl-tracking-express8.top/reschedule',
    category: 'Delivery Impersonation',
    origin: 'London / Linode',
    timeAgo: '28s ago',
    risk: 95,
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [quickTestText, setQuickTestText] = useState(PRESET_MESSAGES.bank.text);
  const [quickResult, setQuickResult] = useState(() => analyzeMessage(PRESET_MESSAGES.bank.text));

  // Live background activity states
  const [liveThreats, setLiveThreats] = useState<LiveThreatEvent[]>(INITIAL_LIVE_THREATS);
  const [interceptedCount, setInterceptedCount] = useState(18942);
  const [radarPulse, setRadarPulse] = useState(0);

  // Interval to simulate live threat defense telemetry stream
  useEffect(() => {
    const interval = setInterval(() => {
      setInterceptedCount((prev) => prev + 1);
      setRadarPulse((p) => (p + 1) % 4);

      // Cycle in new threat samples
      const newThreatPool: LiveThreatEvent[] = [
        {
          id: `t-${Date.now()}`,
          type: 'LINK',
          target: 'paypal-auth-resolution.cc/secure',
          category: 'Banking Spoof Vector',
          origin: 'Tokyo / Vultr',
          timeAgo: 'Just now',
          risk: 97,
        },
        {
          id: `t-${Date.now()}-2`,
          type: 'EMAIL',
          target: 'ceo-desk@board-urgent-wire.net',
          category: 'Executive Impersonation (BEC)',
          origin: 'Toronto / Hetzner',
          timeAgo: 'Just now',
          risk: 99,
        },
        {
          id: `t-${Date.now()}-3`,
          type: 'QR',
          target: 'https://qr-restaurant-menu.site/bill',
          category: 'Quishing Payment Skimmer',
          origin: 'Dublin / AWS',
          timeAgo: 'Just now',
          risk: 93,
        },
        {
          id: `t-${Date.now()}-4`,
          type: 'SMS',
          target: 'Netflix: Payment failed. Update details now',
          category: 'Urgent Account Smishing',
          origin: 'Sydney / Equinix',
          timeAgo: 'Just now',
          risk: 92,
        },
      ];

      const chosen = newThreatPool[Math.floor(Math.random() * newThreatPool.length)];
      setLiveThreats((current) => [chosen, ...current.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAnalyze = (text: string) => {
    setQuickTestText(text);
    setQuickResult(analyzeMessage(text));
  };

  return (
    <div className="w-full flex flex-col gap-10 py-4">
      {/* Hero Section with Live Background Cyber Activity */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0d131f] border border-white/10 p-6 md:p-10 shadow-2xl">
        {/* Animated Cyber Grid Canvas Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #06b6d4 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 40px 40px, 40px 40px',
          }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#06b6d4]/15 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#10B981]/12 blur-3xl pointer-events-none" />

        {/* Floating Cyber Radar Sweep Visualizer */}
        <div className="absolute top-6 right-6 w-48 h-48 md:w-64 md:h-64 rounded-full border border-cyan-500/20 pointer-events-none hidden md:flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border border-cyan-500/25 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-cyan-500/30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </div>
          </div>
          {/* Radar sweeping scan line */}
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-transparent to-transparent animate-spin"
            style={{ animationDuration: '6s' }}
          />
          {/* Radar Blip Dots */}
          <div className="absolute top-12 left-14 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping" />
          <div className="absolute bottom-16 right-16 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
          <div className="absolute top-20 right-10 text-[9px] font-mono text-cyan-400/70">
            DEFENSE SCAN ACTIVE
          </div>
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E293B]/90 text-[#4cd7f6] border border-[#06b6d4]/40 font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
              THREAT DEFENSE PLATFORM ACTIVE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-['JetBrains_Mono'] text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              LIVE TELEMETRY STREAM
            </span>
          </div>

          <h1 className="font-['Space_Grotesk'] text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F8FAFC] leading-[1.1]">
            Instant Threat Deconstruction &amp; Attack <span className="text-[#4cd7f6]">Neutralization</span>
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed">
            ScamShield deconstructs deceptive links, QR quishing codes, malicious emails, and spoofed messages.
            Deep multi-modal threat analysis reveals exactly why dangerous payloads should be avoided.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('analyzer')}
              className="px-6 py-3.5 rounded-xl bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] font-['Space_Grotesk'] text-sm md:text-base font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              Launch Threat Analyzer
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="px-6 py-3.5 rounded-xl bg-[#1E293B] hover:bg-[#262a33] text-[#F8FAFC] font-['Space_Grotesk'] text-sm md:text-base font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-[#4edea3]" />
              Interactive Attack Simulator
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3.5 rounded-xl bg-[#181c24] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-['JetBrains_Mono'] text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all border border-white/5 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[#ffb95f]" />
              Threat Intel Dashboard
            </button>
          </div>
        </div>

        {/* Live Cyber Threat Feed Bar (Real-Time Background Activity Widget) */}
        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Live Global Threat Interceptions
              </span>
              <span className="text-xs font-mono text-[#64748B]">|</span>
              <span className="text-xs font-mono text-[#10B981]">
                {interceptedCount.toLocaleString()} Attacks Neutralized Today
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Response: 0.4ms
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Engine: Active
              </span>
            </div>
          </div>

          {/* Scrolling / Animated Live Threat Feed Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {liveThreats.slice(0, 3).map((threat, idx) => (
              <div
                key={threat.id}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                  idx === 0
                    ? 'bg-red-950/30 border-red-500/40 animate-pulse'
                    : 'bg-[#111827]/80 border-white/5'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      threat.type === 'LINK'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : threat.type === 'EMAIL'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : threat.type === 'QR'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {threat.type}
                  </span>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-mono text-slate-200 truncate" title={threat.target}>
                      {threat.target}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {threat.category} &bull; {threat.origin}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-red-400 shrink-0 px-1.5 py-0.5 rounded bg-red-500/10">
                  {threat.risk}% RISK
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Quick Scanner Preview Widget */}
      <section className="bg-[#111827] rounded-xl p-6 md:p-8 border border-white/8 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/8 pb-4">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#4cd7f6]" />
              Live Heuristic Evaluation Testbench
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Try sample payloads below to verify our 0.4ms rule-based scoring engine
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-['JetBrains_Mono'] text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/30">
              Evaluated in {quickResult.latencyMs}ms
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickAnalyze(PRESET_MESSAGES.bank.text)}
            className="px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#262a33] text-xs font-['JetBrains_Mono'] text-[#4cd7f6] border border-white/10 cursor-pointer"
          >
            Bank Alert SMS
          </button>
          <button
            onClick={() => handleQuickAnalyze(PRESET_MESSAGES.urgency.text)}
            className="px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#262a33] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] border border-white/10 cursor-pointer"
          >
            Urgency Invoice Email
          </button>
          <button
            onClick={() => handleQuickAnalyze(PRESET_MESSAGES.package.text)}
            className="px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#262a33] text-xs font-['JetBrains_Mono'] text-[#F8FAFC] border border-white/10 cursor-pointer"
          >
            USPS Customs Fee Smishing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#06090E] p-4 rounded-xl border border-white/10">
          <div className="md:col-span-8 font-['JetBrains_Mono'] text-xs text-[#dfe2ee] leading-relaxed">
            {quickTestText}
          </div>

          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-['JetBrains_Mono'] text-[#64748B] uppercase">Deception Score</span>
              <span
                className={`font-['Space_Grotesk'] text-2xl font-bold ${
                  quickResult.score >= 80 ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                }`}
              >
                {quickResult.score}/100
              </span>
            </div>

            <button
              onClick={() => onNavigate('analyzer')}
              className="px-3.5 py-2 rounded-lg bg-[#06b6d4] text-[#003640] font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[#4cd7f6]"
            >
              Full Breakdown
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Analyzer */}
        <div
          onClick={() => onNavigate('analyzer')}
          className="group p-6 rounded-2xl bg-[#111827] border border-white/8 hover:border-[#06b6d4]/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/15 text-[#4cd7f6] flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] group-hover:text-[#4cd7f6] transition-colors">
              Message Threat Analyzer
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Real-time cognitive pattern evaluation. Detects false urgency, bogus legal threats, lookalike phishing
              domains, and micro-charge traps with interactive word-level annotation.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-[#4cd7f6]">
            <span>Open Analyzer Console</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Simulator */}
        <div
          onClick={() => onNavigate('simulator')}
          className="group p-6 rounded-2xl bg-[#111827] border border-white/8 hover:border-[#4edea3]/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#4edea3]/15 text-[#4edea3] flex items-center justify-center font-bold">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] group-hover:text-[#4edea3] transition-colors">
              Phishing Simulator
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Gamified red-flag training arena. Inspect authentic smishing and spear-phishing templates, tag deceptive
              tokens, test false positive intuition, and earn defense XP.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-[#4edea3]">
            <span>Start Practice Challenge</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Dashboard */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="group p-6 rounded-2xl bg-[#111827] border border-white/8 hover:border-[#ffb95f]/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/15 text-[#ffb95f] flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] group-hover:text-[#ffb95f] transition-colors">
              Threat Intelligence Dashboard
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Interactive telemetry reporting. Track your tactic breakdown tiers, detailed
              heuristic trigger weights, and export structured JSON intelligence reports.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-[#ffb95f]">
            <span>View Intelligence Hub</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Intelligence & AI Architecture Bento */}
      <section className="bg-[#181c24]/90 rounded-2xl p-6 md:p-8 border border-white/8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/8 pb-4">
          <div>
            <span className="text-xs font-['JetBrains_Mono'] text-[#ffb95f] uppercase tracking-wider font-semibold">
              HYBRID DEFENSE ARCHITECTURE
            </span>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC]">
              Local Sub-Millisecond Heuristics + Multi-Modal Threat Verification
            </h2>
          </div>
          <span className="px-3 py-1 rounded bg-[#06090E] text-[#10B981] font-['JetBrains_Mono'] text-xs border border-[#10B981]/30">
            THREAT ENGINE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2">
            <div className="text-[#10B981] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              100% Privacy Sandbox
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Private emails and banking notifications are never piped over network sockets to external cloud APIs or
              third-party AI providers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2">
            <div className="text-[#4cd7f6] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              0.4ms Sub-millisecond Execution
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              While remote LLMs require 3 to 6 seconds for inference, ScamShield’s deterministic parsing compiles in
              under 1 millisecond.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2">
            <div className="text-[#ffb95f] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              Offline Capable &amp; Lightweight
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Works completely without an active internet connection after initial bundle load. Ideal for mobile smishing
              interceptors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2">
            <div className="text-[#4edea3] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              Explainable AI (XAI)
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every score is mathematically deconstructed into weighted trigger points, eliminating opaque hallucinations
              common in generative models.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
