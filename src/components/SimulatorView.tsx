import React, { useState } from 'react';
import { SimulatorScenario, NavigationTab } from '../types';
import { SIMULATOR_SCENARIOS } from '../data/mockTelemetry';
import {
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  ExternalLink,
  Target,
  Trophy,
} from 'lucide-react';

interface SimulatorViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onAwardXp?: (xp: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ onNavigate, onAwardXp }) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [taggedFlags, setTaggedFlags] = useState<string[]>([]);
  const [userVerdict, setUserVerdict] = useState<'phishing' | 'legitimate' | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(23);
  const [totalAttempts, setTotalAttempts] = useState(25);

  const currentScenario: SimulatorScenario = SIMULATOR_SCENARIOS[selectedScenarioIndex];

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setTaggedFlags([]);
    setUserVerdict(null);
    setHasSubmitted(false);
  };

  const handleToggleTag = (keyword: string) => {
    if (hasSubmitted) return;
    if (taggedFlags.includes(keyword)) {
      setTaggedFlags(taggedFlags.filter((k) => k !== keyword));
    } else {
      setTaggedFlags([...taggedFlags, keyword]);
    }
  };

  const handleMakeVerdict = (verdict: 'phishing' | 'legitimate') => {
    setUserVerdict(verdict);
    setHasSubmitted(true);

    const isCorrect =
      (verdict === 'phishing' && currentScenario.isPhishing) ||
      (verdict === 'legitimate' && !currentScenario.isPhishing);

    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
      setTotalAttempts((prev) => prev + 1);
      if (onAwardXp) onAwardXp(50);
    } else {
      setTotalAttempts((prev) => prev + 1);
    }
  };

  const handleResetCurrent = () => {
    setTaggedFlags([]);
    setUserVerdict(null);
    setHasSubmitted(false);
  };

  const isVerdictCorrect =
    userVerdict !== null &&
    ((userVerdict === 'phishing' && currentScenario.isPhishing) ||
      (userVerdict === 'legitimate' && !currentScenario.isPhishing));

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header HUD */}
      <section className="relative w-full">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E293B] text-[#4edea3] border border-[#10B981]/35 font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              Active Training Arena
            </span>
            <span className="text-[#64748B] font-['JetBrains_Mono'] text-[11px]">/ SOCIAL_SIMULATOR</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                Phishing Detection <span className="text-[#4edea3]">Simulator</span>
              </h1>
              <p className="text-sm md:text-[15px] text-[#94A3B8] max-w-3xl mt-1 leading-relaxed">
                Test your instincts against real-world social engineering vectors. Inspect incoming headers, spot
                manipulative cognitive hooks, and decide: legitimate or deceptive?
              </p>
            </div>

            {/* Live Session Catch Stats */}
            <div className="flex items-center gap-3 bg-[#111827] px-4 py-2 rounded-lg border border-white/8 shadow-sm self-start md:self-auto">
              <Trophy className="w-4 h-4 text-[#ffb95f]" />
              <div className="flex items-baseline gap-1.5 font-['JetBrains_Mono'] text-xs">
                <span className="text-[#94A3B8]">Session Accuracy:</span>
                <span className="text-[#4edea3] font-bold">
                  {Math.round((totalCorrect / Math.max(1, totalAttempts)) * 100)}%
                </span>
                <span className="text-[#64748B]">
                  ({totalCorrect}/{totalAttempts})
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Selector Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SIMULATOR_SCENARIOS.map((scen, idx) => {
          const isSelected = idx === selectedScenarioIndex;
          return (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(idx)}
              className={`px-3.5 py-2 rounded-lg text-xs font-['JetBrains_Mono'] transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-[#1E293B] border-[#4edea3] text-[#4edea3] shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-[#111827] border-white/10 text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              {scen.channel === 'SMS' ? (
                <Smartphone className="w-3.5 h-3.5" />
              ) : scen.channel === 'Email' ? (
                <Mail className="w-3.5 h-3.5" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
              <span className="font-semibold">{scen.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  scen.difficulty === 'Beginner'
                    ? 'bg-[#10B981]/15 text-[#10B981]'
                    : scen.difficulty === 'Intermediate'
                    ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                    : 'bg-[#4cd7f6]/15 text-[#4cd7f6]'
                }`}
              >
                {scen.difficulty}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Simulator View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Device Mockup (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative bg-[#06090E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Device Window Header / Status Bar */}
            <div className="bg-[#111827] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
                <span className="w-3 h-3 rounded-full bg-[#10B981]/80" />
                <span className="ml-2 font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5 font-semibold">
                  {currentScenario.channel === 'SMS' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-[#4cd7f6]" />
                      SMS Messaging Gateway
                    </>
                  ) : currentScenario.channel === 'Email' ? (
                    <>
                      <Mail className="w-3.5 h-3.5 text-[#4cd7f6]" />
                      Inbox Client Preview
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5 text-[#4cd7f6]" />
                      Direct Messaging Feed
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-['JetBrains_Mono'] text-[#64748B]">
                  {currentScenario.threatTacticCategory}
                </span>
              </div>
            </div>

            {/* Sender Metadata Box */}
            <div className="bg-[#111827]/70 p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1E293B] flex items-center justify-center font-bold text-xs text-[#4cd7f6] border border-white/10">
                  {currentScenario.sender.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#F8FAFC]">{currentScenario.sender}</span>
                    {currentScenario.senderVerified ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#10B981] text-[10px] font-['JetBrains_Mono'] font-bold">
                        VERIFIED SENDER
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-[#F59E0B]/15 text-[#F59E0B] text-[10px] font-['JetBrains_Mono'] font-bold">
                        UNVERIFIED SENDER
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#64748B]">{currentScenario.timestamp}</span>
                </div>
              </div>

              <button
                onClick={handleResetCurrent}
                className="text-xs font-['JetBrains_Mono'] text-[#64748B] hover:text-[#4cd7f6] flex items-center gap-1 cursor-pointer"
                title="Reset simulation state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Message Body with Interactive Red Flag Tagging */}
            <div className="p-6 bg-[#0B0F17]/90 min-h-[220px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#181c24] border border-white/10 font-['JetBrains_Mono'] text-sm leading-relaxed text-[#dfe2ee] shadow-inner">
                  {currentScenario.fullMessage.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-2 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Red Flag Hunter Interactive Chips */}
                {currentScenario.redFlags.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-[#111827] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-['Space_Grotesk'] font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-[#4cd7f6]" />
                        Red Flag Hunter (Spot Clues in Text):
                      </span>
                      <span className="font-['JetBrains_Mono'] text-[#ffb95f] text-[11px]">
                        {taggedFlags.length} / {currentScenario.redFlags.length} Tagged
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentScenario.redFlags.map((flag, fIdx) => {
                        const isTagged = taggedFlags.includes(flag.keyword);
                        return (
                          <button
                            key={fIdx}
                            onClick={() => handleToggleTag(flag.keyword)}
                            className={`px-2.5 py-1 rounded-md text-xs font-['JetBrains_Mono'] transition-all flex items-center gap-1.5 cursor-pointer border ${
                              isTagged
                                ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                : 'bg-[#1E293B] border-white/10 text-[#94A3B8] hover:border-[#4cd7f6] hover:text-[#F8FAFC]'
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>“{flag.keyword}”</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Verdict Buttons Bar */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <button
                  disabled={hasSubmitted}
                  onClick={() => handleMakeVerdict('phishing')}
                  className={`flex-1 w-full py-3 px-4 rounded-lg font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    hasSubmitted && userVerdict === 'phishing'
                      ? 'bg-[#EF4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                      : 'bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  } ${hasSubmitted ? 'opacity-90' : ''}`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Flag as Phishing Scam
                </button>

                <button
                  disabled={hasSubmitted}
                  onClick={() => handleMakeVerdict('legitimate')}
                  className={`flex-1 w-full py-3 px-4 rounded-lg font-['Space_Grotesk'] text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    hasSubmitted && userVerdict === 'legitimate'
                      ? 'bg-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'bg-[#10B981]/20 hover:bg-[#10B981] text-[#10B981] hover:text-white border border-[#10B981]/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  } ${hasSubmitted ? 'opacity-90' : ''}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify as Legitimate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback, Intel & Tactical Threat Deconstruction (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Submission Result Card */}
          {hasSubmitted ? (
            <div
              className={`p-5 rounded-xl border shadow-xl animate-in fade-in zoom-in-95 ${
                isVerdictCorrect
                  ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#F8FAFC]'
                  : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#F8FAFC]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isVerdictCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                  ) : (
                    <XCircle className="w-6 h-6 text-[#EF4444]" />
                  )}
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold">
                    {isVerdictCorrect ? 'Analysis Spot On! +50 XP' : 'Defense Breach: False Call'}
                  </h3>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs font-semibold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  {currentScenario.isPhishing ? 'ACTUAL: PHISHING' : 'ACTUAL: LEGITIMATE'}
                </span>
              </div>

              <p className="text-xs md:text-sm text-[#dfe2ee] leading-relaxed mb-3">
                {currentScenario.educationalInsight}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    const nextIdx = (selectedScenarioIndex + 1) % SIMULATOR_SCENARIOS.length;
                    handleSelectScenario(nextIdx);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] text-xs font-bold font-['Space_Grotesk'] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  Next Training Scenario
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('analyzer')}
                  className="text-xs font-['JetBrains_Mono'] text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Test in Threat Analyzer
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#111827] border border-white/8 shadow-md flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#4edea3]">
                <Target className="w-5 h-5" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#F8FAFC]">
                  Tactical Challenge Instructions
                </h3>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                1. Inspect the sender domain or phone prefix carefully.
                <br />
                2. Tap the Red Flag tags above if you see manipulative hooks (false deadlines, lookalike URLs).
                <br />
                3. Choose your verdict. A correct diagnosis earns <strong>+50 Defense XP</strong> toward your student scout tier!
              </p>
            </div>
          )}

          {/* Red Flag Explanations & Tactical Deconstruction */}
          <div className="bg-[#111827] p-5 rounded-xl border border-white/8 shadow-md space-y-3">
            <h4 className="font-['Space_Grotesk'] text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ffb95f]" />
              Threat Deconstruction &amp; Tactics Breakdown
            </h4>

            {currentScenario.redFlags.length === 0 ? (
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                This scenario contains no predatory social engineering indicators. Legitimate notices address recipients
                by name, come from authenticated domains, and lack manufactured countdown urgency.
              </p>
            ) : (
              <div className="space-y-2.5">
                {currentScenario.redFlags.map((flag, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#06090E] border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-['JetBrains_Mono']">
                      <span className="text-[#EF4444] font-bold">HOOK #{idx + 1}: {flag.tactic}</span>
                      <span className="text-[#ffb95f] text-[10px] font-semibold">{flag.severity} RISK</span>
                    </div>
                    <p className="text-[#94A3B8] leading-relaxed">{flag.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safe Defensive Protocol */}
          <div className="bg-[#181c24] p-4 rounded-xl border border-white/8 text-xs space-y-1.5">
            <span className="font-['JetBrains_Mono'] text-[#10B981] font-bold uppercase tracking-wider block">
              Safe Handling Protocol
            </span>
            <p className="text-[#dfe2ee] leading-relaxed">{currentScenario.safeProtocol}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
