import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ScamShieldLogo } from './Logo';
import { ShieldCheck, User, Menu, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userXp?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, userXp = 350 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);

  const toggleSound = () => {
    soundFX.enabled = !soundFX.enabled;
    setSoundEnabled(soundFX.enabled);
    if (soundFX.enabled) {
      soundFX.click();
    }
  };

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'Command Hub' },
    { id: 'analyzer', label: 'Threat Analyzer' },
    { id: 'simulator', label: 'Attack Simulator' },
    { id: 'dashboard', label: 'Threat Intel' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    soundFX.click();
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080b12]/90 backdrop-blur-xl border-b border-white/10">
      <div className="h-16 max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand & Hackathon Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
            id="brandNavBtn"
            title="Return to Command Hub"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/20 flex items-center justify-center text-white shadow-md group-hover:border-white/50 transition-colors">
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
            <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-white group-hover:text-neutral-300 transition-colors">
              ScamShield
            </span>
          </button>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-['JetBrains_Mono'] tracking-wider bg-white/5 text-neutral-400 border border-white/10">
            CYBER DEFENSE
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-[#05070a] rounded-full border border-white/10">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-1 rounded-full text-xs md:text-sm font-['Space_Grotesk'] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicator & Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-['JetBrains_Mono'] text-[11px] font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sandboxed (0 Telemetry)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10 font-['JetBrains_Mono'] text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>{userXp} XP</span>
          </div>

          {/* Tactical Audio Feedback Toggle */}
          <button
            onClick={toggleSound}
            id="soundToggleBtn"
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute synthesized cyber audio' : 'Enable synthesized cyber audio'}
            aria-label="Toggle audio effects"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-neutral-200" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
          </button>

          <div
            className="w-8 h-8 rounded-full bg-neutral-900 border border-white/20 text-white flex items-center justify-center font-bold text-xs shadow-sm"
            title="Defense Agent"
          >
            <User className="w-4 h-4 text-neutral-200" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white border border-white/10"
            id="mobileMenuToggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#080b12] border-b border-white/10 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-['JetBrains_Mono'] text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sandbox Isolated (0.4ms)
            </span>
            <span className="text-xs font-['JetBrains_Mono'] text-neutral-300">{userXp} XP</span>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-['Space_Grotesk'] font-medium transition-colors ${
                  currentTab === item.id
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
