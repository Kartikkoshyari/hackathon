import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ScamShieldLogo } from './Logo';
import { ShieldCheck, User, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userXp?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, userXp = 350 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'analyzer', label: 'Analyzer' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'dashboard', label: 'Dashboard' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111827]/85 backdrop-blur-xl border-b border-white/8">
      <div className="h-16 max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand & Hackathon Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
            id="brandNavBtn"
          >
            <ScamShieldLogo size={34} className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="font-['Space_Grotesk'] text-lg font-bold tracking-tight text-[#F8FAFC] group-hover:text-[#4cd7f6] transition-colors">
              ScamShield
            </span>
          </button>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-['JetBrains_Mono'] font-semibold tracking-wider bg-[#1E293B] text-[#4cd7f6] border border-[#06b6d4]/35 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            CYBER THREAT DEFENSE
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#06b6d4] text-[#003640] font-semibold shadow-[0_0_15px_-3px_rgba(6,182,212,0.35)]'
                    : 'text-[#bcc9cd] hover:bg-[#262a33] hover:text-[#dfe2ee]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicator & Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06090E]/80 border border-[#10B981]/30 text-[#10B981] font-['JetBrains_Mono'] text-[11px] font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>In-browser sandboxed (zero data transmitted)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E293B] text-[#ffb95f] border border-[#ffb95f]/30 font-['JetBrains_Mono'] text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb95f]" />
            <span>{userXp} XP</span>
          </div>

          <div
            className="w-8 h-8 rounded-full bg-[#4cd7f6] text-[#003640] flex items-center justify-center font-bold text-xs shadow-sm"
            title="Defense Agent"
          >
            <User className="w-4 h-4" />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-[#1E293B] text-[#bcc9cd] hover:text-white"
            id="mobileMenuToggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B0F17] border-b border-white/10 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-['JetBrains_Mono'] text-[#10B981] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Sandbox Isolated (0.4ms)
            </span>
            <span className="text-xs font-['JetBrains_Mono'] text-[#ffb95f]">{userXp} Defense XP</span>
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#06b6d4] text-[#003640] font-bold' : 'text-[#bcc9cd] hover:bg-[#1E293B] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
