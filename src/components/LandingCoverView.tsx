import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ArrowRight,
  Terminal,
  Activity,
  Zap,
  Sparkles,
  Lock,
  ChevronDown,
  X,
  Layers,
  Cpu,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import frostbreakShieldImg from '../assets/images/frostbreak_shield_1789908098913.jpg';
import { CrystallineShield3D } from './CrystallineShield3D';
import { soundFX } from '../utils/soundEffects';

interface LandingCoverViewProps {
  onEnter: (targetTab?: NavigationTab) => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  isShard: boolean;
}

export const LandingCoverView: React.FC<LandingCoverViewProps> = ({ onEnter }) => {
  const [activeModal, setActiveModal] = useState<'manifesto' | 'architecture' | null>(null);
  const [isHoveringShield, setIsHoveringShield] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle entering main page: shatter 3D shield and transition
  const handleTriggerEnter = (targetTab: NavigationTab = 'analyzer') => {
    if (isDismissing) return;
    setIsDismissing(true);
    soundFX.shatter();
    setTimeout(() => {
      onEnter(targetTab);
    }, 280);
  };

  // Interactive ambient crystalline shards & dust particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.1,
        opacity: Math.random() * 0.6 + 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        isShard: Math.random() > 0.4,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Mouse slight repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          const force = (140 - dist) / 140;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        // Wrap around boundaries
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(235, 245, 255, ${p.opacity})`;

        if (p.isShard) {
          // Draw diamond/shard polygon
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(0, p.size * 2);
          ctx.lineTo(-p.size, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Micro glowing dust sphere
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Scroll or Keyboard trigger to enter main application
  useEffect(() => {
    let triggered = false;

    const handleWheel = (e: WheelEvent) => {
      if (activeModal) return;
      if (e.deltaY > 45 && !triggered) {
        triggered = true;
        handleTriggerEnter('analyzer');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal) {
        if (e.key === 'Escape') setActiveModal(null);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Enter') {
        handleTriggerEnter('analyzer');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal, onEnter]);

  return (
    <div className="relative min-h-screen w-full bg-[#05070a] text-[#f8fafc] font-['Inter'] overflow-x-hidden selection:bg-white/20 selection:text-white flex flex-col justify-between">
      {/* Background Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-70"
      />

      {/* Subtle Radial Vignette Gradient Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(14,23,38,0.45)_0%,rgba(5,7,10,0.95)_70%,#05070a_100%)] pointer-events-none z-0" />

      {/* Editorial Top Navigation Header (matching reference image) */}
      <header className="relative z-20 w-full max-w-[1340px] mx-auto px-6 md:px-12 pt-7 flex items-center justify-between">
        {/* Logo / Monogram */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/20 flex items-center justify-center text-white shadow-lg">
            <svg
              className="w-4 h-4 text-neutral-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-['Space_Grotesk'] text-sm md:text-base font-bold tracking-widest uppercase text-white">
              ScamShield
            </span>
            <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 uppercase tracking-widest hidden sm:inline">
              // Frostbreak
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-['Space_Grotesk'] font-medium text-neutral-400">
          <button
            onClick={() => setActiveModal('manifesto')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Manifesto
          </button>
          <button
            onClick={() => setActiveModal('architecture')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button
            onClick={() => handleTriggerEnter('dashboard')}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Live Radar</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-3">
          <button
            id="coverLaunchConsoleBtn"
            onClick={() => handleTriggerEnter('analyzer')}
            className="px-4 py-1.5 rounded-full text-xs md:text-sm font-medium border border-white/20 text-white hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer backdrop-blur-sm"
          >
            Launch Console
          </button>
        </div>
      </header>

      {/* Main Centerpiece Stage */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-[1100px] mx-auto py-10">
        {/* Shattering Ice/Glass Shield Visual - Removed completely when dismissed */}
        <AnimatePresence mode="wait">
          {!isDismissing && (
            <motion.div
              key="shield-visual"
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(16px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setIsHoveringShield(true)}
              onMouseLeave={() => setIsHoveringShield(false)}
              className="relative w-full max-w-[560px] md:max-w-[680px] h-[240px] sm:h-[300px] md:h-[360px] flex items-center justify-center cursor-pointer group"
              onClick={() => handleTriggerEnter('analyzer')}
              title="Click to enter Threat Defense Engine"
            >
              {/* Subtle Ambient Backlight Glow */}
              <div
                className={`absolute inset-0 rounded-full bg-white/5 blur-[90px] transition-opacity duration-700 pointer-events-none ${
                  isHoveringShield ? 'opacity-90' : 'opacity-30'
                }`}
              />

              {/* Shattered Crystal Shield Photorealistic Glass Artwork */}
              <img
                src={frostbreakShieldImg}
                alt="Frostbreak Crystalline Shield"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-70 filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
              />

              {/* Interactive 3D Crystalline Aegis Facet Simulation */}
              <div className="relative z-10 w-full h-full">
                <CrystallineShield3D
                  isShattered={isDismissing}
                  onClick={() => handleTriggerEnter('analyzer')}
                />
              </div>

              {/* Floating Subtle Micro Badge */}
              <div className="absolute top-2 right-4 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-white/15 text-[10px] font-['JetBrains_Mono'] text-neutral-300 backdrop-blur-md shadow-lg pointer-events-none">
                <Lock className="w-3 h-3 text-white" />
                <span>3D AEGIS PAYLOAD DISSECTOR</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cinematic Headline (Matching "Hard to break. Easy to remember.") */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 space-y-1"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-extrabold tracking-tight text-white leading-[1.05] select-none font-['Space_Grotesk']">
            Hard to break.
            <br />
            Easy to remember.
          </h1>
        </motion.div>

        {/* Minimalist Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-sm sm:text-base md:text-lg text-neutral-400 max-w-[620px] font-normal leading-relaxed select-none"
        >
          An identity and threat defense system built to take pressure. Break the exploit,
          watch it come back, and know exactly what holds.
        </motion.p>

        {/* Action Button Pills (matching reference image style) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {/* Primary High-Contrast White Pill */}
          <button
            id="landingStartProjectBtn"
            onClick={() => handleTriggerEnter('analyzer')}
            className="px-7 py-3 rounded-full bg-white text-black text-sm md:text-base font-semibold hover:bg-neutral-200 transition-all transform active:scale-95 shadow-[0_4px_24px_rgba(255,255,255,0.2)] cursor-pointer flex items-center gap-2"
          >
            <span>Start a project</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>

          {/* Secondary Dark Frosted Pill */}
          <button
            id="landingSeeWorkBtn"
            onClick={() => handleTriggerEnter('dashboard')}
            className="px-7 py-3 rounded-full bg-neutral-900/80 border border-white/15 text-neutral-200 text-sm md:text-base font-medium hover:border-white/40 hover:bg-neutral-800/80 hover:text-white transition-all transform active:scale-95 cursor-pointer backdrop-blur-md flex items-center gap-2"
          >
            <span>See the work</span>
          </button>
        </motion.div>

        {/* Quick Capabilities Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-2 max-w-[700px]"
        >
          <button
            onClick={() => handleTriggerEnter('analyzer')}
            className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30 hover:bg-white/[0.08] text-xs font-['JetBrains_Mono'] text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            ⚡ QR & Link Deobfuscator
          </button>
          <button
            onClick={() => handleTriggerEnter('analyzer')}
            className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30 hover:bg-white/[0.08] text-xs font-['JetBrains_Mono'] text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            🛡️ AI Deep Threat Dissector
          </button>
          <button
            onClick={() => handleTriggerEnter('simulator')}
            className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30 hover:bg-white/[0.08] text-xs font-['JetBrains_Mono'] text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            🎮 Gamified Phishing Arena
          </button>
        </motion.div>
      </section>

      {/* Bottom Scroll / Enter Trigger (matching reference image) */}
      <footer className="relative z-20 pb-8 text-center flex flex-col items-center justify-center">
        <button
          id="scrollOrClickTriggerBtn"
          onClick={() => handleTriggerEnter('analyzer')}
          className="group flex flex-col items-center gap-2 text-[11px] font-['Space_Grotesk'] tracking-[0.25em] uppercase text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
        >
          <span>Scroll</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-neutral-500 to-transparent group-hover:from-white transition-all group-hover:h-8" />
        </button>
      </footer>

      {/* Modal: Manifesto */}
      <AnimatePresence>
        {activeModal === 'manifesto' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#0d121c] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-white/10 text-white uppercase tracking-wider">
                  The Manifesto
                </span>
              </div>

              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white mb-3">
                Security is crystal clarity under pressure.
              </h2>

              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed font-['Inter']">
                <p>
                  Attackers exploit fear, urgency, and manufactured authority. They thrive in
                  the fog of subtle typosquats, invisible unicode redirects, and hidden quishing payloads.
                </p>
                <p>
                  ScamShield shatters deception into transparent crystal shards. Every token is weighed.
                  Every URL redirected through headless sandbox isolation. Nothing passes unchecked.
                </p>
                <p className="text-neutral-400 italic pt-2 border-t border-white/10">
                  “Hard to break. Impossible to fool.”
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onEnter('analyzer');
                  }}
                  className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Enter Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Architecture */}
      <AnimatePresence>
        {activeModal === 'architecture' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-[#0d121c] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-cyan-500/20 text-cyan-300 uppercase tracking-wider">
                  Defense Engine Architecture
                </span>
              </div>

              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white mb-4">
                Multi-Layered Threat Neutralization
              </h2>

              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Tier 1: Client-Side Heuristics</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Sub-10ms deterministic regex, homoglyph detection, urgency weighting, and zero-data-leak tokenizers.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Tier 2: Gemini Neural Verification</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Server-side deep psychological vector analysis, impersonated brand attribution, and counter-measure strategy.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                  <Eye className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">Tier 3: Optical Quishing & QR Decoder</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Embedded malicious payload extraction from camera feeds, screenshots, and encoded vector targets.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    onEnter('analyzer');
                  }}
                  className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Explore in Analyzer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
