import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../types';
import { analyzeMessage, PRESET_MESSAGES } from '../utils/heuristics';
import { CyberGlobe3D } from './CyberGlobe3D';
import { CrystallineShield3D } from './CrystallineShield3D';
import { TiltCard3D } from './TiltCard3D';
import { soundFX } from '../utils/soundEffects';
import {
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  Brain,
  Sparkles,
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
  QrCode,
  Link2,
  Mail,
  MessageSquare,
  Flame,
  X,
  Layers,
  Compass,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavigationTab, payload?: string) => void;
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
  const [liveThreats, setLiveThreats] = useState<LiveThreatEvent[]>(INITIAL_LIVE_THREATS);
  const [interceptedCount, setInterceptedCount] = useState(19482);
  const [activePreset, setActivePreset] = useState<'bank' | 'urgency' | 'package'>('bank');
  const [hero3DMode, setHero3DMode] = useState<'radar' | 'shield'>('radar');

  // Dynamic live defense telemetry stream
  useEffect(() => {
    const interval = setInterval(() => {
      setInterceptedCount((prev) => prev + 1);

      const newThreatPool: LiveThreatEvent[] = [
        {
          id: `t-${Date.now()}-1`,
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
          origin: 'Frankfurt / Hetzner',
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
        {
          id: `t-${Date.now()}-5`,
          type: 'LINK',
          target: 'https://microsoft-onedrive-share.online/doc',
          category: 'Credential Stealing Phish',
          origin: 'Ashburn / Azure',
          timeAgo: 'Just now',
          risk: 95,
        },
      ];

      const chosen = newThreatPool[Math.floor(Math.random() * newThreatPool.length)];
      setLiveThreats((current) => [chosen, ...current.slice(0, 4)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAnalyze = (text: string, presetKey?: 'bank' | 'urgency' | 'package') => {
    setQuickTestText(text);
    setQuickResult(analyzeMessage(text));
    if (presetKey) setActivePreset(presetKey);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setQuickTestText(val);
    setQuickResult(analyzeMessage(val));
  };

  return (
    <div className="w-full flex flex-col gap-10 py-2">
      {/* HERO SECTION: 3D CYBER SPHERICAL COMMAND DECK */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e121c] via-[#090d14] to-[#05070a] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-[140px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 md:p-12 items-center">
          {/* Left Hero Column: Tactical Mission & 3D Key Triggers (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="keycap-3d inline-flex items-center gap-2 px-3 py-1 rounded-full text-white font-['JetBrains_Mono'] text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>DEFENSE ENGINE v4.8 ACTIVE</span>
              </div>
              <div className="keycap-3d inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-emerald-400 font-['JetBrains_Mono'] text-xs font-semibold">
                <Activity className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>0.4ms LOCAL PARSING</span>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="font-['Space_Grotesk'] text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                Real-Time Threat <span className="text-neutral-200 underline decoration-white/30 underline-offset-8">Deconstruction</span> &amp; Attack Defense
              </h1>
              <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl font-['Inter']">
                ScamShield exposes malicious intent behind spoofed banking notifications, fraudulent QR quishing traps, and deceptive links. Inspect payloads with deterministic sub-millisecond scoring.
              </p>
            </div>

            {/* Tactical 3D Action Keypad */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('analyzer')}
                className="btn-3d-cyan px-6 py-3.5 rounded-xl font-['Space_Grotesk'] text-sm md:text-base font-bold flex items-center gap-2.5 cursor-pointer"
                id="heroLaunchAnalyzer"
              >
                <Zap className="w-5 h-5 fill-current" />
                Launch Threat Verifier
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('simulator')}
                className="btn-3d-dark px-6 py-3.5 rounded-xl font-['Space_Grotesk'] text-sm md:text-base font-bold flex items-center gap-2.5 cursor-pointer"
                id="heroLaunchSimulator"
              >
                <PlayCircle className="w-5 h-5 text-[#4edea3]" />
                Phishing Simulator
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="keycap-3d px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-['JetBrains_Mono'] text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                id="heroLaunchDashboard"
              >
                <BarChart3 className="w-4 h-4 text-[#ffb95f]" />
                Threat Intel
              </button>
            </div>

            {/* Quick Stat Indicators */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Neutralized Today</span>
                <span className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-cyan-400">
                  {interceptedCount.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Detection Speed</span>
                <span className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-emerald-400">
                  &lt; 0.4 ms
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Privacy Sandbox</span>
                <span className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-slate-100">
                  100% In-Browser
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Interactive 3D Cyber Deck with Switcher */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative gap-3">
            {/* 3D Telemetry Mode Selector */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 z-20 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  soundFX.click();
                  setHero3DMode('radar');
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-['Space_Grotesk'] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  hero3DMode === 'radar'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>3D Global Radar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.click();
                  setHero3DMode('shield');
                }}
                className={`px-3.5 py-1 rounded-full text-xs font-['Space_Grotesk'] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  hero3DMode === 'shield'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3D Crystalline Aegis</span>
              </button>
            </div>

            {/* 3D Canvas Stage */}
            <div className="w-full max-w-[480px] aspect-square rounded-2xl bg-[#0a0d14]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 relative overflow-hidden flex items-center justify-center">
              {hero3DMode === 'radar' ? (
                <CyberGlobe3D
                  height={440}
                  className="w-full h-full rounded-xl"
                  interactive={true}
                  onSelectThreat={(threat) => onNavigate('analyzer', threat.target || threat.label)}
                />
              ) : (
                <CrystallineShield3D
                  className="w-full h-full rounded-xl"
                  onClick={() => soundFX.scan()}
                />
              )}
            </div>
          </div>
        </div>

        {/* Live Cyber Threat Feed Bar */}
        <div className="border-t border-white/10 p-4 md:px-8 bg-[#070b13] relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Global Threat Interception Feed
              </span>
              <span className="text-xs font-mono text-[#64748B]">|</span>
              <span className="text-xs font-mono text-[#10B981]">
                Continuous Stream
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Telemetry: Online
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Zero-Leak Mode: Active
              </span>
            </div>
          </div>

          {/* Real-time Threat Ticker Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {liveThreats.slice(0, 3).map((threat, idx) => (
              <div
                key={threat.id}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                  idx === 0
                    ? 'bg-red-950/30 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse'
                    : 'bg-[#0f1624] border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      threat.type === 'LINK'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : threat.type === 'EMAIL'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : threat.type === 'QR'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {threat.type}
                  </span>
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-mono text-slate-100 truncate" title={threat.target}>
                      {threat.target}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {threat.category} &bull; {threat.origin}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                    {threat.risk}%
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.click();
                      onNavigate('analyzer', threat.target);
                    }}
                    className="px-2 py-0.5 rounded bg-white text-black font-semibold text-[10px] hover:bg-neutral-200 transition-colors cursor-pointer"
                    title="Inspect this threat in Analyzer"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE HEURISTIC TESTBENCH (With Click-to-Select-All Feature) */}
      <section className="relative rounded-2xl bg-[#0e121c] p-6 md:p-8 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-neutral-300" />
              Live Heuristic Evaluation Testbench
            </h2>
            <p className="text-xs text-neutral-400">
              Click any text below to <strong className="text-white">auto-select all</strong> and replace or remove instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-['JetBrains_Mono'] text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded border border-[#10B981]/30">
              Deterministic Parsing: {quickResult.latencyMs}ms
            </span>
          </div>
        </div>

        {/* 3D Tactile Preset Keys */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400 mr-1">Load Preset Payload:</span>
          <button
            onClick={() => handleQuickAnalyze(PRESET_MESSAGES.bank.text, 'bank')}
            className={`keycap-3d px-3.5 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold cursor-pointer transition-all ${
              activePreset === 'bank' ? 'keycap-3d-active' : 'text-slate-300'
            }`}
          >
            Bank Fraud SMS
          </button>
          <button
            onClick={() => handleQuickAnalyze(PRESET_MESSAGES.urgency.text, 'urgency')}
            className={`keycap-3d px-3.5 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold cursor-pointer transition-all ${
              activePreset === 'urgency' ? 'keycap-3d-active' : 'text-slate-300'
            }`}
          >
            Urgent Invoice BEC
          </button>
          <button
            onClick={() => handleQuickAnalyze(PRESET_MESSAGES.package.text, 'package')}
            className={`keycap-3d px-3.5 py-1.5 rounded-lg text-xs font-['JetBrains_Mono'] font-bold cursor-pointer transition-all ${
              activePreset === 'package' ? 'keycap-3d-active' : 'text-slate-300'
            }`}
          >
            USPS Smishing Vector
          </button>

          {quickTestText && (
            <button
              onClick={() => {
                setQuickTestText('');
                setQuickResult(analyzeMessage(''));
              }}
              className="ml-auto text-xs font-mono text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
              title="Clear all text"
            >
              <X className="w-3.5 h-3.5" />
              Clear text
            </button>
          )}
        </div>

        {/* Split Input & Live Score Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch bg-[#06090E] p-4 rounded-xl border border-white/10 input-3d-inset">
          <div className="md:col-span-8 flex flex-col justify-center relative">
            <textarea
              value={quickTestText}
              onChange={handleTextChange}
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.currentTarget.select()}
              rows={3}
              placeholder="Click here to type or paste any suspicious text or link (auto-selects all on click)..."
              className="w-full bg-transparent text-xs font-['JetBrains_Mono'] text-[#dfe2ee] placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
            />
            <span className="text-[10px] font-mono text-slate-500 mt-1">
              Tip: Click text to select all for fast deletion or replacement
            </span>
          </div>

          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-['JetBrains_Mono'] text-slate-400 uppercase tracking-wider">
                Deception Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-['Space_Grotesk'] text-3xl font-extrabold ${
                    quickResult.score >= 80
                      ? 'text-[#EF4444] drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                      : quickResult.score >= 50
                      ? 'text-[#F59E0B]'
                      : 'text-[#10B981]'
                  }`}
                >
                  {quickResult.score}
                </span>
                <span className="text-xs font-mono text-slate-500">/100</span>
              </div>
              <span
                className={`text-[11px] font-mono font-bold ${
                  quickResult.riskLevel === 'critical'
                    ? 'text-red-400'
                    : quickResult.riskLevel === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {quickResult.riskLevel === 'critical'
                  ? 'CRITICAL THREAT'
                  : quickResult.riskLevel === 'warning'
                  ? 'SUSPICIOUS'
                  : 'BENIGN / SAFE'}
              </span>
            </div>

            <button
              onClick={() => {
                soundFX.click();
                onNavigate('analyzer', quickTestText);
              }}
              className="btn-3d-cyan px-4 py-2.5 rounded-lg font-['Space_Grotesk'] text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              Inspect in Engine
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3 CORE CAPABILITY PILLARS WITH 3D PERSPECTIVE TILT */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Threat Analyzer */}
        <TiltCard3D
          onClick={() => onNavigate('analyzer')}
          className="group p-6 rounded-2xl bg-[#0e1523] border border-white/10 hover:border-cyan-500/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] group-hover:text-cyan-400 transition-colors">
              Threat &amp; Quishing Analyzer
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Multi-vector deconstruction for suspicious links, QR code image uploads (quishing), and raw email headers. Detects lookalike domains, fake urgency, and credential traps.
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-cyan-400">
            <span className="font-bold">Open Verification Engine</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </TiltCard3D>

        {/* Pillar 2: Phishing Simulator */}
        <TiltCard3D
          onClick={() => onNavigate('simulator')}
          className="group p-6 rounded-2xl bg-[#0e1523] border border-white/10 hover:border-emerald-500/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] group-hover:text-emerald-400 transition-colors">
              Attack Detection Simulator
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Gamified red-flag training arena. Inspect authentic smishing and spear-phishing templates, tag deceptive tokens, sharpen human intuition, and earn defense XP.
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-emerald-400">
            <span className="font-bold">Enter Practice Arena</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </TiltCard3D>

        {/* Pillar 3: Threat Intelligence Dashboard */}
        <TiltCard3D
          onClick={() => onNavigate('dashboard')}
          className="group p-6 rounded-2xl bg-[#0e1523] border border-white/10 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC] group-hover:text-amber-400 transition-colors">
              Threat Intelligence Hub
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Comprehensive telemetry reporting. Track cognitive tactic distributions, examine heuristic trigger weights, review session logs, and export structured threat reports.
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-amber-400">
            <span className="font-bold">Access Intel Dashboard</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </TiltCard3D>
      </section>

      {/* DEFENSE SPECIFICATIONS & ARCHITECTURE BENTO */}
      <section className="bg-[#0b111e] rounded-2xl p-6 md:p-8 border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-['JetBrains_Mono'] text-cyan-400 uppercase tracking-wider font-semibold">
              SECURITY ARCHITECTURE
            </span>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#F8FAFC]">
              Deterministic Rules Engine + Explainable Threat Attribution
            </h2>
          </div>
          <span className="px-3 py-1 rounded bg-[#06090E] text-[#10B981] font-['JetBrains_Mono'] text-xs border border-[#10B981]/30 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="text-[#10B981] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              100% Privacy Sandbox
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Private emails and banking notifications are processed client-side. Zero telemetry or sensitive credentials are ever sent to remote trackers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="text-[#4cd7f6] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              0.4ms Local Execution
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Deterministic syntactic parsing compiles in sub-millisecond speeds. No latency delays or cloud round-trips for standard inspection.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="text-[#ffb95f] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              Quishing Image Deconstruct
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Direct parsing of deceptive QR codes embedded on parking meters, utility bills, and phishing emails before your camera opens them.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#06090E] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="text-[#4edea3] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              Explainable AI (XAI)
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every verdict gives you clear, decisive reasons and specific red flags so you always know why a payload is dangerous and how to act safely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
