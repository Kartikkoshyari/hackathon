import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, ChatMessageItem, ChatSource } from '../types';
import { soundFX } from '../utils/soundEffects';
import {
  Send,
  Bot,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
  AlertTriangle,
  Radio,
  Search,
  Compass,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface ChatViewProps {
  onNavigate?: (tab: NavigationTab, payload?: string) => void;
  initialQuery?: string;
}

type ModelOption = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';
type PersonaOption = 'threat_hunter' | 'incident_responder' | 'cyber_advisor';

const PERSONAS: {
  id: PersonaOption;
  name: string;
  tagline: string;
  badge: string;
  color: string;
  icon: typeof Shield;
}[] = [
  {
    id: 'threat_hunter',
    name: 'Threat Hunter & SecOps',
    tagline: 'Technical forensic deconstruction of malware, domain spoofing, and IoCs.',
    badge: 'FORENSIC INVESTIGATOR',
    color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30',
    icon: ShieldAlert,
  },
  {
    id: 'incident_responder',
    name: 'Incident Response Commander',
    tagline: 'Urgent containment protocols, post-click breach isolation, and credential rotation.',
    badge: 'CRISIS CONTAINMENT',
    color: 'border-red-500/40 text-red-400 bg-red-950/30',
    icon: AlertTriangle,
  },
  {
    id: 'cyber_advisor',
    name: 'Zero-Trust Safety Coach',
    tagline: 'Plain-English advice on social engineering, smishing, and everyday digital hygiene.',
    badge: 'DEFENSE STRATEGIST',
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30',
    icon: ShieldCheck,
  },
];

const INITIAL_MESSAGES: Record<PersonaOption, ChatMessageItem[]> = {
  threat_hunter: [
    {
      id: 'init-th',
      role: 'model',
      text: `**ScamShield Threat Hunter Online.**
I analyze active adversary campaigns, unmask lookalike domains, investigate phishing infrastructure, and evaluate potential indicators of compromise (IoCs).

*Google Search Grounding is enabled to cross-reference live threat intelligence and newly reported campaigns.* What link, message, or cyber threat would you like me to inspect?`,
      timestamp: Date.now(),
      model: 'gemini-3.5-flash',
      grounded: true,
      sources: [
        {
          uri: 'https://cisa.gov/resources-tools/all-resources-alerts',
          title: 'CISA Cybersecurity Alerts & Directives',
        },
      ],
    },
  ],
  incident_responder: [
    {
      id: 'init-ir',
      role: 'model',
      text: `**🚨 Emergency Incident Commander Standing By.**
If you clicked a deceptive link, entered passwords, downloaded an unexpected file, or suspect an account breach, let me know immediately.

Tell me:
1. What happened? (e.g., entered bank login, opened email attachment, paid gift cards)
2. What device are you using?
3. How long ago did the interaction take place?

I will generate your step-by-step containment checklist immediately.`,
      timestamp: Date.now(),
      model: 'gemini-3.5-flash',
    },
  ],
  cyber_advisor: [
    {
      id: 'init-ca',
      role: 'model',
      text: `**👋 Welcome to ScamShield Cyber Defense Advisory.**
I'm here to help you navigate modern online scams, from AI voice cloning and fake delivery texts to crypto romance traps and deceptive QR codes (quishing).

Ask me anything in plain English, and I'll break down how scammers operate and how you can stay 100% safe.`,
      timestamp: Date.now(),
      model: 'gemini-3.5-flash',
    },
  ],
};

const SUGGESTED_QUERIES: Record<PersonaOption, string[]> = {
  threat_hunter: [
    'How do I spot a typosquatted domain in a banking verification SMS?',
    'What are the latest active smishing campaigns targeting USPS package deliveries?',
    'Analyze the technical risks of scanning parking meter QR codes (quishing).',
    'How do threat actors use Cloudflare or AWS infrastructure to host credential harvesters?',
  ],
  incident_responder: [
    'I just entered my banking login on a suspicious site. What should I do right now?',
    'I clicked a link in a fake invoice email. Did it install malware?',
    'A scammer has my phone number and full name. Are my accounts in danger?',
    'How do I safely lock down my email and reset compromised session tokens?',
  ],
  cyber_advisor: [
    'How can scammers clone voices using AI to fake emergency calls?',
    'What are the classic red flags of a Facebook Marketplace or Zelle payment scam?',
    'Why do banks say they will never ask for a 2-factor authentication code over the phone?',
    'What is the safest way to verify if an email from PayPal or Amazon is authentic?',
  ],
};

export const ChatView: React.FC<ChatViewProps> = ({ onNavigate, initialQuery }) => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaOption>('threat_hunter');
  const [selectedModel, setSelectedModel] = useState<ModelOption>('gemini-3.5-flash');
  const [useSearch, setUseSearch] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessageItem[]>(() => INITIAL_MESSAGES.threat_hunter);
  const [inputValue, setInputValue] = useState<string>(initialQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle persona switch
  const handleSelectPersona = (persona: PersonaOption) => {
    if (persona === selectedPersona) return;
    soundFX.click();
    setSelectedPersona(persona);
    setMessages(INITIAL_MESSAGES[persona]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    soundFX.click();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearThread = () => {
    soundFX.click();
    setMessages(INITIAL_MESSAGES[selectedPersona]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    soundFX.scan();
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare multi-turn messages array for backend
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          useSearch,
          rolePersona: selectedPersona,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error (${res.status})`);
      }

      const data = await res.json();
      soundFX.success();

      const aiMsg: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text || 'No response returned.',
        timestamp: Date.now(),
        sources: data.sources || [],
        model: data.model || selectedModel,
        grounded: Boolean(data.groundedWithGoogleSearch),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat query failed:', err);
      soundFX.threatAlert();
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Defensive System Notice:** Unable to reach remote Gemini engine. Please check your network connection or verify your API key in **Settings > Secrets**.`,
        timestamp: Date.now(),
        model: selectedModel,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activePersonaObj = PERSONAS.find((p) => p.id === selectedPersona) || PERSONAS[0];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER HUD & PERSONA SELECTION */}
      <section className="bg-gradient-to-b from-[#0e121c] via-[#090d14] to-[#05070a] rounded-2xl border border-white/10 p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-['JetBrains_Mono'] text-[11px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                GEMINI MULTI-TURN THREAT COPILOT
              </span>
              <span className="text-neutral-500 text-xs font-mono">/ LIVE AI ADVISOR</span>
            </div>
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cyber Threat Intelligence <span className="text-cyan-400">Chatbot</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-['Inter'] leading-relaxed">
              Consult with Gemini cybersecurity personas equipped with <strong className="text-white">Google Search Grounding</strong> for up-to-the-minute threat data, live breach containment, and deconstruction.
            </p>
          </div>

          {/* Model & Search Control Deck */}
          <div className="flex flex-wrap items-center gap-2.5 bg-[#06090e] p-2 rounded-xl border border-white/10 self-start lg:self-auto">
            {/* Model Pill Switcher */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/5 text-xs font-['JetBrains_Mono']">
              <button
                type="button"
                onClick={() => {
                  soundFX.click();
                  setSelectedModel('gemini-3.5-flash');
                }}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.5-flash'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="gemini-3.5-flash: Balanced reasoning and live Google Search grounding (Recommended)"
              >
                3.5 Flash
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.click();
                  setSelectedModel('gemini-3.1-flash-lite');
                }}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="gemini-3.1-flash-lite: Ultra-fast low-latency processing"
              >
                3.1 Lite
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.click();
                  setSelectedModel('gemini-3.1-pro-preview');
                }}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="gemini-3.1-pro-preview: Deep cognitive reasoning for complex reverse engineering"
              >
                3.1 Pro
              </button>
            </div>

            {/* Google Search Grounding Toggle */}
            <button
              type="button"
              onClick={() => {
                soundFX.click();
                setUseSearch(!useSearch);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                useSearch
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
              title="Toggle Google Search Grounding for live web telemetry"
            >
              <Globe className={`w-3.5 h-3.5 ${useSearch ? 'text-emerald-400 animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>Google Search: {useSearch ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* 3 PERSONA SELECTOR TABS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-5 mt-4 border-t border-white/10">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona === persona.id;
            const Icon = persona.icon;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => handleSelectPersona(persona.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative ${
                  isSelected
                    ? `${persona.color} shadow-lg ring-1 ring-white/20`
                    : 'bg-[#080b12] border-white/5 text-neutral-400 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-['Space_Grotesk'] font-bold text-sm text-white">
                      {persona.name}
                    </span>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[9px] px-2 py-0.5 rounded uppercase font-semibold bg-black/40 border border-white/10">
                    {persona.badge}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-85">
                  {persona.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* CHAT THREAD WORKSPACE */}
      <section className="bg-[#0b0f19] rounded-2xl border border-white/10 flex flex-col h-[650px] shadow-2xl overflow-hidden relative">
        {/* Thread Control Bar */}
        <div className="px-5 py-3 border-b border-white/10 bg-[#080c14]/90 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-['Space_Grotesk'] text-xs sm:text-sm font-bold text-white">
              {activePersonaObj.name}
            </span>
            <span className="text-neutral-500 text-xs">|</span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-cyan-400">
              {selectedModel}
            </span>
            {useSearch && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                <Globe className="w-3 h-3" />
                Live Search Grounded
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleClearThread}
            className="text-xs font-['JetBrains_Mono'] text-neutral-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded hover:bg-white/5"
            title="Clear and reset chat history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset History</span>
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-4xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold border shadow-md ${
                    isUser
                      ? 'bg-neutral-800 border-white/20 text-white'
                      : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Speech Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-lg font-['Inter'] relative group ${
                      isUser
                        ? 'bg-neutral-800 text-neutral-100 border border-white/15 rounded-tr-none'
                        : 'bg-[#101524] text-neutral-200 border border-white/10 rounded-tl-none'
                    }`}
                  >
                    {/* Render Formatted Text */}
                    <div className="whitespace-pre-wrap space-y-2">
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

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-black/60 text-neutral-400 hover:text-white"
                      title="Copy message to clipboard"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Search Grounding Sources Accordion */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="w-full bg-[#070b14] p-3 rounded-xl border border-emerald-500/25 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-['JetBrains_Mono'] font-bold text-[11px]">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Verified Google Search Sources ({msg.sources.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-neutral-300 hover:text-emerald-300 font-mono text-[10px] transition-colors"
                          >
                            <span className="truncate max-w-[200px]">{source.title || source.uri}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp & Model Telemetry */}
                  <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-neutral-500">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.model && <span>&bull; {msg.model}</span>}
                    {msg.grounded && (
                      <span className="text-emerald-500">&bull; Grounded</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 max-w-4xl mr-auto">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#101524] border border-cyan-500/30 rounded-tl-none flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-['JetBrains_Mono'] text-cyan-300">
                  {useSearch ? 'Consulting Gemini with Google Search Data...' : 'Generating Threat Analysis...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED STARTER CHIPS */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#06090e] overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase shrink-0">
            Suggested Prompts:
          </span>
          {SUGGESTED_QUERIES[selectedPersona].map((prompt, qIdx) => (
            <button
              key={qIdx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-left px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-['Inter'] text-xs whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT PROMPT BOX */}
        <div className="p-4 border-t border-white/10 bg-[#080c14] flex flex-col gap-2">
          <div className="relative flex items-center bg-[#05070a] border border-white/15 focus-within:border-cyan-500/50 rounded-xl px-3 py-2 transition-all shadow-inner">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activePersonaObj.name} anything about suspicious links, scam calls, or breach containment... (Press Enter to Send)`}
              rows={2}
              disabled={isLoading}
              className="w-full bg-transparent text-xs sm:text-[13px] text-white placeholder:text-neutral-500 focus:outline-none resize-none leading-relaxed"
            />

            <button
              type="button"
              disabled={!inputValue.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="ml-2 px-4 py-2.5 rounded-lg font-['Space_Grotesk'] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white text-black hover:bg-neutral-200 active:scale-95 shrink-0"
              title="Send prompt to Gemini"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
            <span>Shift + Enter for new line &bull; Enter to send</span>
            <span>
              Powered by <strong className="text-neutral-300">Google Gemini &amp; Search Grounding</strong>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
