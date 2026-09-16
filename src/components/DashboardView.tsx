import React, { useState } from 'react';
import { NavigationTab, RecentMessageLog, RiskLevel } from '../types';
import { INITIAL_RECENT_MESSAGES } from '../data/mockTelemetry';
import {
  Download,
  RotateCcw,
  SearchCheck,
  MailCheck,
  PieChart,
  Target,
  Flame,
  History,
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
  Smartphone,
  Mail,
  MessageSquare,
  X,
  PlayCircle,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Award,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  recentMessages?: RecentMessageLog[];
  onResetSession?: () => void;
  simulatorStats?: {
    caughtCount: number;
    totalPlayed: number;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  recentMessages = INITIAL_RECENT_MESSAGES,
  onResetSession,
  simulatorStats = { caughtCount: 23, totalPlayed: 25 },
}) => {
  const [activeModalMessage, setActiveModalMessage] = useState<RecentMessageLog | null>(null);
  const [messagesList, setMessagesList] = useState<RecentMessageLog[]>(recentMessages);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportJSON = () => {
    const reportData = {
      project: 'ScamShield Threat Defense Platform',
      tier: 'Security Sentinel (Active Defense)',
      generatedTimestamp: new Date().toISOString(),
      summaryStats: {
        totalEvaluated: 28,
        highRiskFlags: 14,
        suspiciousFlags: 9,
        benignSafe: 5,
        simulatorCatchRate: '92%',
        aiStudioVerificationEngine: 'Active (gemini-3.8-flash)',
      },
      masteryLevels: {
        falseUrgency: '95%',
        authoritySpoofing: '88%',
        suspiciousLinks: '84%',
        fearAppeals: '78%',
      },
      sampleRecentLogs: messagesList,
      sandboxPrivacyCompliance: {
        telemetrySentToCloud: false,
        onDeviceRegexParsing: true,
        zeroDataRetention: true,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield-threat-telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported threat telemetry JSON successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset simulated student telemetry session data?')) {
      if (onResetSession) onResetSession();
      setMessagesList(INITIAL_RECENT_MESSAGES);
      setActiveModalMessage(null);
      showToast('Telemetry session reinitialized.');
    }
  };

  const getRiskPill = (level: RiskLevel, label: string) => {
    if (level === 'critical') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-['JetBrains_Mono'] text-[11px] font-semibold">
          {label}
        </span>
      );
    }
    if (level === 'warning') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-['JetBrains_Mono'] text-[11px] font-semibold">
          {label}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-['JetBrains_Mono'] text-[11px] font-semibold">
        {label}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-8 relative">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-[#F8FAFC] border border-[#06b6d4]/40 px-4 py-3 rounded-lg shadow-2xl font-['JetBrains_Mono'] text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Intelligence Status Bar */}
      <div className="relative overflow-hidden rounded-xl bg-[#111827]/90 p-6 md:p-8 shadow-xl border border-white/8">
        {/* Ambient background glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#4cd7f6]/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-72 h-72 rounded-full bg-[#4edea3]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06090E] text-[#4cd7f6] font-['JetBrains_Mono'] text-[11px] border border-[#06b6d4]/30 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse shadow-sm" />
                EDUCATIONAL THREAT TELEMETRY
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-['JetBrains_Mono'] text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                SECURITY SENTINEL: ACTIVE
              </span>
            </div>

            <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#F8FAFC] tracking-tight mt-1">
              Cybersecurity Learning &amp; Threat Intelligence Dashboard
            </h1>

            <p className="text-sm md:text-[15px] text-[#94A3B8] max-w-3xl leading-relaxed">
              Client-side heuristic tracking of social engineering patterns. Every scan runs locally in your browser memory
              with zero external telemetry.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1E293B] hover:bg-[#262a33] text-[#F8FAFC] text-xs font-semibold font-['JetBrains_Mono'] transition-all shadow-sm active:scale-95 cursor-pointer border border-white/10"
              id="exportReportBtn"
            >
              <Download className="w-4 h-4 text-[#4cd7f6]" />
              <span>Export Summary JSON</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#181c24] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold font-['JetBrains_Mono'] transition-all shadow-sm active:scale-95 cursor-pointer border border-white/5"
              id="resetTelemetryBtn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Session Data</span>
            </button>

            <button
              onClick={() => onNavigate('analyzer')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#003640] text-xs font-bold font-['Space_Grotesk'] transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
            >
              <SearchCheck className="w-4 h-4" />
              <span>Analyze New Sample</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row (4 Bento KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Messages Checked */}
        <div className="relative overflow-hidden rounded-xl bg-[#111827]/80 p-5 shadow-md border border-white/8 flex flex-col justify-between group hover:bg-[#1E293B]/70 transition-all">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="font-['JetBrains_Mono'] text-[11px] tracking-wider uppercase font-semibold">
              Messages Evaluated
            </span>
            <span className="p-2 rounded-lg bg-[#06b6d4]/10 text-[#4cd7f6]">
              <MailCheck className="w-5 h-5" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#F8FAFC]">28</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#10B981] font-semibold">+12 this week</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[#64748B] text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>100% evaluated on-device sandbox</span>
            </div>
          </div>

          <div className="w-full bg-[#31353e] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4cd7f6] h-full rounded-full transition-all duration-700" style={{ width: '72%' }} />
          </div>
        </div>

        {/* Metric 2: Threat Breakdown Ring */}
        <div className="relative overflow-hidden rounded-xl bg-[#111827]/80 p-5 shadow-md border border-white/8 flex flex-col justify-between group hover:bg-[#1E293B]/70 transition-all">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="font-['JetBrains_Mono'] text-[11px] tracking-wider uppercase font-semibold">
              Detected Tactic Tiers
            </span>
            <span className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <PieChart className="w-5 h-5" />
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 gap-2">
            <div>
              <div className="font-['Space_Grotesk'] text-2xl font-bold text-[#F8FAFC]">
                14 <span className="text-xs font-normal text-[#EF4444]">High</span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">9 Suspicious • 5 Safe</div>
            </div>

            {/* Inline Mini Donut SVG */}
            <svg className="w-14 h-14 -rotate-90 shrink-0" viewBox="0 0 36 36">
              <path
                className="text-[#31353e] stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3.5"
              />
              <path
                className="text-[#EF4444] stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray="50, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              <path
                className="text-[#F59E0B] stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray="32, 100"
                strokeDashoffset="-50"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              <path
                className="text-[#10B981] stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray="18, 100"
                strokeDashoffset="-82"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2 mt-3 text-[11px] font-['JetBrains_Mono'] text-[#64748B]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> 50% High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> 32% Med
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> 18% Clean
            </span>
          </div>
        </div>

        {/* Metric 3: Simulator Catch Rate */}
        <div className="relative overflow-hidden rounded-xl bg-[#111827]/80 p-5 shadow-md border border-white/8 flex flex-col justify-between group hover:bg-[#1E293B]/70 transition-all">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="font-['JetBrains_Mono'] text-[11px] tracking-wider uppercase font-semibold">
              Simulator Catch Rate
            </span>
            <span className="p-2 rounded-lg bg-[#4edea3]/10 text-[#4edea3]">
              <Target className="w-5 h-5" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#4edea3]">92%</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#64748B]">
                {simulatorStats.caughtCount} / {simulatorStats.totalPlayed} Caught
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[#64748B] text-xs">
              <span>Outperformed 84% student peers</span>
            </div>
          </div>

          <div className="w-full bg-[#31353e] h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#4edea3] h-full rounded-full transition-all duration-700" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Metric 4: AI Verification Engine Status */}
        <div className="relative overflow-hidden rounded-xl bg-[#111827]/80 p-5 shadow-md border border-white/8 flex flex-col justify-between group hover:bg-[#1E293B]/70 transition-all">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="font-['JetBrains_Mono'] text-[11px] tracking-wider uppercase font-semibold">
              AI Verification Engine
            </span>
            <span className="p-2 rounded-lg bg-[#06b6d4]/10 text-[#4cd7f6]">
              <SearchCheck className="w-5 h-5" />
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-2xl font-bold text-[#4cd7f6]">Threat Defense</span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#10B981] font-semibold">Ready</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[#64748B] text-xs">
              <span>Links, QR Codes, Emails &amp; Messages</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-[11px] font-['JetBrains_Mono'] text-[#10B981]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Multi-modal Threat Scanner Online</span>
          </div>
        </div>
      </div>

      {/* Primary Asymmetric Section: Activity Feed (7 cols) + Mastery & Challenge (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Recent Analysis Activity Table & Drilldown Modal Drawer (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111827]/90 p-4 rounded-xl border border-white/8">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-[#06b6d4]/10 text-[#4cd7f6]">
                <History className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#F8FAFC]">
                  Recent Analyzed Messages
                </h2>
                <p className="text-xs text-[#64748B]">Interactive live logs &amp; heuristic breakdowns</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#1E293B] font-['JetBrains_Mono'] text-xs text-[#94A3B8]">
                Displaying {messagesList.length} records
              </span>
            </div>
          </div>

          {/* Messages Feed List */}
          <div className="space-y-3" id="analysisHistoryList">
            {messagesList.map((msg) => (
              <div
                key={msg.id}
                className="group relative rounded-xl bg-[#111827] p-4 border border-white/8 transition-all hover:bg-[#1E293B] shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-[#06090E] text-[#4cd7f6] shrink-0 mt-0.5 border border-white/5">
                      {msg.channel === 'SMS' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : msg.channel === 'Email' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#F8FAFC]">
                          {msg.title}
                        </span>
                        {getRiskPill(msg.riskLevel, msg.riskLabel)}
                        <span className="text-[#64748B] text-xs">{msg.timestamp}</span>
                      </div>

                      <p className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] bg-[#06090E]/60 p-2.5 rounded line-clamp-2 leading-relaxed border border-white/5">
                        {msg.snippet}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {msg.tactics.map((tactic, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded bg-[#262a33] text-[#4cd7f6] font-['JetBrains_Mono'] text-[11px]"
                          >
                            {tactic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalMessage(activeModalMessage?.id === msg.id ? null : msg)}
                    className="shrink-0 self-start sm:self-center px-3.5 py-1.5 rounded-lg bg-[#262a33] hover:bg-[#06b6d4] hover:text-[#003640] text-[#F8FAFC] font-['JetBrains_Mono'] text-xs font-semibold transition-all cursor-pointer border border-white/10"
                  >
                    {activeModalMessage?.id === msg.id ? 'Close' : 'Breakdown'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Heuristic Modal Drawer for Selected Message */}
          {activeModalMessage && (
            <div className="rounded-xl bg-[#181c24] p-5 shadow-2xl border border-[#06b6d4]/40 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-[#EF4444]/15 text-[#EF4444]">
                    <AlertOctagon className="w-4 h-4" />
                  </span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-[#F8FAFC]">
                    Deep Rule-Based Heuristic Analysis ({activeModalMessage.title})
                  </span>
                </div>
                <button
                  onClick={() => setActiveModalMessage(null)}
                  className="p-1 rounded hover:bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 font-['JetBrains_Mono'] text-xs">
                {activeModalMessage.triggers.map((trig, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#06090E] border border-white/5">
                    <div className="text-[#4cd7f6] uppercase font-bold mb-1 flex items-center justify-between">
                      <span>{trig.title}</span>
                      <span className="text-xs text-[#ffb95f]">{trig.weight}</span>
                    </div>
                    <p className="text-[#dfe2ee] leading-relaxed">
                      Matched token pattern:{' '}
                      <code className="text-[#ffb95f] bg-[#262a33] px-1.5 py-0.5 rounded font-bold">
                        “{trig.token}”
                      </code>
                      . {trig.description}
                    </p>
                  </div>
                ))}

                <div className="p-3.5 rounded-lg bg-[#06090E] border border-white/5">
                  <div className="text-[#10B981] uppercase font-bold mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Recommended Student Action Protocol
                  </div>
                  <p className="text-[#94A3B8] leading-relaxed">{activeModalMessage.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Simulator Progress & Core Tactics Mastery (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Mastery Bento Card */}
          <div className="relative overflow-hidden rounded-xl bg-[#111827]/90 p-5 md:p-6 shadow-xl border border-white/8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-[#4edea3]/10 text-[#4edea3]">
                  <Target className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#F8FAFC]">
                    Phishing Tactic Mastery
                  </h2>
                  <p className="text-xs text-[#64748B]">Skill progression from 5 practice modules</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#4edea3]/10 text-[#4edea3] font-['JetBrains_Mono'] text-xs font-semibold">
                Overall 86%
              </span>
            </div>

            {/* Tactic 1 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#F8FAFC] font-medium">1. False Urgency &amp; Deadlines</span>
                <span className="font-['JetBrains_Mono'] text-[#10B981] font-semibold">95% (Flawless)</span>
              </div>
              <div className="w-full bg-[#31353e] h-2 rounded-full overflow-hidden">
                <div className="bg-[#10B981] h-full rounded-full transition-all duration-700" style={{ width: '95%' }} />
              </div>
              <span className="text-[11px] text-[#64748B]">“within 24 hrs”, “immediate action required”</span>
            </div>

            {/* Tactic 2 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#F8FAFC] font-medium">2. Authority Spoofing &amp; Impersonation</span>
                <span className="font-['JetBrains_Mono'] text-[#4cd7f6] font-semibold">88% (Proficient)</span>
              </div>
              <div className="w-full bg-[#31353e] h-2 rounded-full overflow-hidden">
                <div className="bg-[#4cd7f6] h-full rounded-full transition-all duration-700" style={{ width: '88%' }} />
              </div>
              <span className="text-[11px] text-[#64748B]">“IRS department”, “IT Support Admin”</span>
            </div>

            {/* Tactic 3 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#F8FAFC] font-medium">3. Suspicious Links &amp; URL Obfuscation</span>
                <span className="font-['JetBrains_Mono'] text-[#4cd7f6] font-semibold">84% (Good)</span>
              </div>
              <div className="w-full bg-[#31353e] h-2 rounded-full overflow-hidden">
                <div className="bg-[#4cd7f6] h-full rounded-full transition-all duration-700" style={{ width: '84%' }} />
              </div>
              <span className="text-[11px] text-[#64748B]">Domain lookalikes, IP direct links, free TLDs</span>
            </div>

            {/* Tactic 4 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#F8FAFC] font-medium">4. Fear Appeals &amp; Extortion Bait</span>
                <span className="font-['JetBrains_Mono'] text-[#F59E0B] font-semibold">78% (Practice Needed)</span>
              </div>
              <div className="w-full bg-[#31353e] h-2 rounded-full overflow-hidden">
                <div className="bg-[#F59E0B] h-full rounded-full transition-all duration-700" style={{ width: '78%' }} />
              </div>
              <span className="text-[11px] text-[#64748B]">Threatening legal actions or embarrassing disclosure</span>
            </div>
          </div>

          {/* Simulator Daily Challenge Card */}
          <div className="relative overflow-hidden rounded-xl bg-[#111827] p-5 border border-white/8 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs text-[#ffb95f] font-semibold">
                <Award className="w-4 h-4" />
                DAILY PRACTICE MISSION
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffb95f]/10 text-[#ffb95f] font-['JetBrains_Mono'] text-[11px] font-semibold">
                PRACTICE SCENARIO
              </span>
            </div>

            <div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#F8FAFC]">
                Challenge: Bank Fraud SMS Bait
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Test your eye on an authentic lookalike scam containing 3 psychological manipulation hooks. Pick all 3
                without triggering false alarms.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#06090E]/80 border border-white/5 font-['JetBrains_Mono'] text-xs text-[#F8FAFC] leading-relaxed">
              “Wells Fargo: A transfer of $840.00 was initiated. If this was not you, call 1-800-FAKE immediately to
              cancel...”
            </div>

            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#ffb95f] hover:bg-[#ffddb8] text-[#2a1700] text-xs font-bold font-['Space_Grotesk'] transition-colors shadow-sm active:scale-95 mt-1 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Interactive Challenge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Defensive Cheatsheet: Tactical Rules Worth Remembering */}
      <div className="relative overflow-hidden rounded-xl bg-[#111827]/90 p-6 md:p-8 shadow-xl border border-white/8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 mb-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-[#06b6d4]/10 text-[#4cd7f6]">
              <Lightbulb className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-['Space_Grotesk'] text-xl md:text-2xl font-bold text-[#F8FAFC]">
                Tactical Rules Worth Remembering
              </h2>
              <p className="text-xs md:text-sm text-[#94A3B8]">
                Core principles to protect yourself against digital social engineering
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[#10B981] font-['JetBrains_Mono'] text-xs font-semibold self-start md:self-center">
            <CheckCircle className="w-4 h-4" />
            <span>CYBER DEFENSE PLAYBOOK</span>
          </span>
        </div>

        {/* 3 Pedagogical Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rule 1 */}
          <div className="rounded-xl bg-[#181c24] p-5 flex flex-col justify-between hover:bg-[#1E293B] transition-all border border-white/5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-xs text-[#4cd7f6] font-bold px-2.5 py-0.5 rounded bg-[#06b6d4]/10 border border-[#06b6d4]/30">
                  RULE 01
                </span>
                <span className="text-[#64748B] text-xs font-mono">CHANNEL SEPARATION</span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#F8FAFC]">
                The Rule of the Second Channel
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Never trust the contact details embedded inside the alert itself. If a text claims your bank or delivery
                is halted, open your phone app separately or dial the number on the back of your physical card.
              </p>
            </div>
            <div className="mt-4 pt-3 flex items-center gap-1.5 text-[#10B981] font-['JetBrains_Mono'] text-xs border-t border-white/5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Breaks 90% of spoof vectors</span>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="rounded-xl bg-[#181c24] p-5 flex flex-col justify-between hover:bg-[#1E293B] transition-all border border-white/5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-xs text-[#F59E0B] font-bold px-2.5 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30">
                  RULE 02
                </span>
                <span className="text-[#64748B] text-xs font-mono">TEMPORAL HOOK</span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#F8FAFC]">
                Urgency Is Always The Tell
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Legitimate institutions almost never demand settlement “within 60 minutes” or threaten instant arrest
                over SMS. Attackers use extreme speed because critical thinking dissolves under artificial panic.
              </p>
            </div>
            <div className="mt-4 pt-3 flex items-center gap-1.5 text-[#F59E0B] font-['JetBrains_Mono'] text-xs border-t border-white/5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Take a mandatory 5-minute pause</span>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="rounded-xl bg-[#181c24] p-5 flex flex-col justify-between hover:bg-[#1E293B] transition-all border border-white/5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-['JetBrains_Mono'] text-xs text-[#4edea3] font-bold px-2.5 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30">
                  RULE 03
                </span>
                <span className="text-[#64748B] text-xs font-mono">SHOTGUN TOKENS</span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#F8FAFC]">
                Look for Generic Tokens
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Broad salutations like “Dear Valued Customer” or “Attention Citizen” indicate high-volume shotgun
                phishing campaigns. Legitimate services will identify you by your real verified profile name.
              </p>
            </div>
            <div className="mt-4 pt-3 flex items-center gap-1.5 text-[#4cd7f6] font-['JetBrains_Mono'] text-xs border-t border-white/5">
              <SearchCheck className="w-3.5 h-3.5" />
              <span>Inspect sender personalization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Security & Verification Disclaimer */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[#181c24]/60 text-[#64748B] text-xs border border-white/5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#4cd7f6]" />
          <span>
            ScamShield threat defense active: Inspect links, QR codes, emails, and messages to receive verified cybersecurity reasons on whether to avoid or trust.
          </span>
        </div>
        <span className="font-['JetBrains_Mono'] text-[#10B981] uppercase text-[11px] font-semibold">STATUS: THREAT ENGINE ONLINE</span>
      </div>
    </div>
  );
};
