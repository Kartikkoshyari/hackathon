import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, ChatMessageItem } from '../types';
import { soundFX } from '../utils/soundEffects';
import { generateClientChatFallback } from '../utils/heuristics';
import {
  Send,
  Bot,
  User,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface HomeAiCopilotProps {
  onNavigate?: (tab: NavigationTab, payload?: string) => void;
  initialQuery?: string;
}

type PersonaOption = 'threat_hunter' | 'incident_responder' | 'cyber_advisor';

const PERSONAS: {
  id: PersonaOption;
  name: string;
  badge: string;
  icon: typeof ShieldAlert;
  color: string;
}[] = [
  {
    id: 'threat_hunter',
    name: 'Threat Hunter',
    badge: 'FORENSIC INVESTIGATION',
    icon: ShieldAlert,
    color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
  },
  {
    id: 'incident_responder',
    name: 'Incident Responder',
    badge: 'CRISIS CONTAINMENT',
    icon: AlertTriangle,
    color: 'border-red-500/40 text-red-300 bg-red-950/40',
  },
  {
    id: 'cyber_advisor',
    name: 'Cyber Advisor',
    badge: 'ZERO-TRUST DEFENSE',
    icon: ShieldCheck,
    color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
  },
];

const INITIAL_MESSAGES: Record<PersonaOption, ChatMessageItem[]> = {
  threat_hunter: [
    {
      id: 'init-th',
      role: 'model',
      text: `**ScamShield Threat Hunter Online.**
I analyze active adversary campaigns, unmask lookalike domains, investigate quishing/smishing traps, and evaluate indicators of compromise.

What suspicious link, message, or cyber threat would you like me to inspect?`,
      timestamp: Date.now(),
      model: 'gemini-3.1-flash-lite',
    },
  ],
  incident_responder: [
    {
      id: 'init-ir',
      role: 'model',
      text: `**🚨 Emergency Incident Commander Standing By.**
If you clicked a deceptive link, entered passwords, or suspect an account breach, let me know what happened so I can generate an emergency isolation checklist.`,
      timestamp: Date.now(),
      model: 'gemini-3.1-flash-lite',
    },
  ],
  cyber_advisor: [
    {
      id: 'init-ca',
      role: 'model',
      text: `**👋 Welcome to ScamShield Cyber Defense Advisory.**
Ask me anything about identifying fake delivery texts, banking smishing, AI voice cloning scams, or everyday digital safety habits.`,
      timestamp: Date.now(),
      model: 'gemini-3.1-flash-lite',
    },
  ],
};

const SUGGESTED_QUERIES: Record<PersonaOption, string[]> = {
  threat_hunter: [
    'How do I spot a typosquatted domain in a banking verification SMS?',
    'What are the technical risks of scanning parking meter QR codes (quishing)?',
    'How do threat actors register lookalike domains to bypass spam filters?',
  ],
  incident_responder: [
    'I just clicked a link in a fake invoice email. What should I do right now?',
    'I entered my login on a suspicious site. How do I lock down my accounts?',
    'A scammer has my phone number. How do I protect my two-factor codes?',
  ],
  cyber_advisor: [
    'Why will legitimate banks never ask for 2FA one-time codes over the phone?',
    'What are the classic red flags of an unprompted package delivery text?',
    'How can scammers use AI voice clones to impersonate family members?',
  ],
};

export const HomeAiCopilot: React.FC<HomeAiCopilotProps> = ({ onNavigate, initialQuery }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption>('threat_hunter');
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => INITIAL_MESSAGES.threat_hunter);
  const [inputValue, setInputValue] = useState<string>(initialQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isCollapsed) {
      scrollToBottom();
    }
  }, [messages, isLoading, isCollapsed]);

  const handleSelectPersona = (persona: PersonaOption) => {
    if (persona === selectedPersona) return;
    soundFX.click();
    setSelectedPersona(persona);
    setMessages(INITIAL_MESSAGES[persona]);
  };

  const handleCopy = (id: string, text: string) => {
    soundFX.click();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleReset = () => {
    soundFX.click();
    setMessages(INITIAL_MESSAGES[selectedPersona]);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputValue).trim();
    if (!text || isLoading) return;

    soundFX.scan();
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputValue('');
    setIsLoading(true);

    try {
      const payloadMessages = updated.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: 'gemini-3.1-flash-lite',
          useSearch: false,
          rolePersona: selectedPersona,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      soundFX.success();

      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text || 'No response returned.',
        timestamp: Date.now(),
        sources: data.sources || [],
        model: data.model || 'gemini-3.1-flash-lite',
        grounded: Boolean(data.groundedWithGoogleSearch),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('Copilot remote query fallback:', err);
      soundFX.success();
      const localResponse = generateClientChatFallback(text, selectedPersona);
      const fallbackMsg: ChatMessageItem = {
        id: `local-${Date.now()}`,
        role: 'model',
        text: localResponse.text,
        timestamp: Date.now(),
        sources: localResponse.sources,
        model: localResponse.model,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  return (
    <section
      id="ai-copilot-section"
      className="w-full bg-gradient-to-b from-[#0c101a] via-[#090d15] to-[#06080e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Top Copilot Bar */}
      <div className="px-5 py-3.5 bg-[#0a0e17] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                AI Cyber Copilot
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-['JetBrains_Mono'] text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-['Inter']">
              Real-time Gemini assistance for threat deconstruction, smishing analysis &amp; incident triage
            </p>
          </div>
        </div>

        {/* Persona quick switch + Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Persona Pills */}
          <div className="flex items-center bg-[#05070a] p-1 rounded-xl border border-white/10 text-xs font-['Space_Grotesk']">
            {PERSONAS.map((p) => {
              const isSelected = selectedPersona === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPersona(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? `${p.color} border shadow-sm`
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title={p.badge}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Reset Thread */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFX.click();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand AI Copilot' : 'Collapse AI Copilot'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Chat Body */}
      {!isCollapsed && (
        <div className="flex flex-col">
          {/* Messages Stream */}
          <div className="h-[280px] sm:h-[320px] overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 bg-[#070a12]/60">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold border shadow-sm ${
                      isUser
                        ? 'bg-neutral-800 border-white/20 text-white'
                        : 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Speech Bubble */}
                  <div className={`flex flex-col gap-1 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 rounded-xl text-xs leading-relaxed shadow font-['Inter'] relative group ${
                        isUser
                          ? 'bg-neutral-800 text-white border border-white/15 rounded-tr-none'
                          : 'bg-[#0f1422] text-neutral-200 border border-white/10 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap space-y-1.5">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx}>
                            {paragraph.split('**').map((chunk, cIdx) =>
                              cIdx % 2 === 1 ? (
                                <strong key={cIdx} className="text-white font-semibold">
                                  {chunk}
                                </strong>
                              ) : (
                                chunk
                              )
                            )}
                          </p>
                        ))}
                      </div>

                      {/* Copy message button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-black/60 text-neutral-400 hover:text-white"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Sources (if available) */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400 hover:text-cyan-300 font-mono text-[9px] transition-colors"
                          >
                            <span className="truncate max-w-[160px]">{src.title || src.uri}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-[#0f1422] border border-cyan-500/30 rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-['JetBrains_Mono'] text-cyan-300 ml-1">
                    Analyzing threat with Gemini...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-4 py-2 border-t border-white/5 bg-[#06080e] overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">
              Suggested:
            </span>
            {SUGGESTED_QUERIES[selectedPersona].map((prompt, qIdx) => (
              <button
                key={qIdx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt)}
                className="text-left px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-['Inter'] text-[11px] whitespace-nowrap transition-all cursor-pointer disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Integrated Bottom Input Bar */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-[#080c14] flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-[#05070a] border border-white/15 focus-within:border-cyan-500/50 rounded-xl px-3 py-1.5 shadow-inner transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${activePersonaObj.name} anything about suspicious links, emails, QR scams...`}
                disabled={isLoading}
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={!inputValue.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="px-4 py-2 rounded-xl bg-white text-black font-['Space_Grotesk'] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-200 active:scale-95 shrink-0 shadow-md"
              title="Send to AI Cyber Copilot"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
