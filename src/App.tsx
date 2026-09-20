import React, { useState } from 'react';
import { NavigationTab, RecentMessageLog, AnalysisResult } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AnalyzerView } from './components/AnalyzerView';
import { SimulatorView } from './components/SimulatorView';
import { DashboardView } from './components/DashboardView';
import { LandingCoverView } from './components/LandingCoverView';
import { INITIAL_RECENT_MESSAGES } from './data/mockTelemetry';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [pendingPayload, setPendingPayload] = useState<string | null>(null);
  const [userXp, setUserXp] = useState<number>(350);
  const [recentMessages, setRecentMessages] = useState<RecentMessageLog[]>(INITIAL_RECENT_MESSAGES);
  const [simulatorStats, setSimulatorStats] = useState({
    caughtCount: 23,
    totalPlayed: 25,
  });

  const handleNavigate = (tab: NavigationTab, payload?: string) => {
    if (payload) {
      setPendingPayload(payload);
    }
    setCurrentTab(tab);
  };

  const handleAwardXp = (amount: number) => {
    setUserXp((prev) => prev + amount);
    setSimulatorStats((prev) => ({
      caughtCount: prev.caughtCount + 1,
      totalPlayed: prev.totalPlayed + 1,
    }));
  };

  const handleLogAnalysis = (text: string, result: AnalysisResult) => {
    // Only log substantial text and avoid repeating exact same snippet
    const snippet = text.length > 90 ? text.substring(0, 90) + '...' : text;
    const exists = recentMessages.some((m) => m.rawText === text);
    if (exists || text.trim().length < 15) return;

    const newLog: RecentMessageLog = {
      id: `msg-${Date.now()}`,
      channel: text.toLowerCase().includes('http') || text.toLowerCase().includes('dear') ? 'Email' : 'SMS',
      title: result.riskLevel === 'critical' ? 'Evaluated Threat Payload' : 'Scanned Telemetry Sample',
      riskLevel: result.riskLevel,
      riskLabel: result.riskLevel === 'critical' ? 'HIGH RISK' : result.riskLevel === 'warning' ? 'SUSPICIOUS' : 'CLEAN / SAFE',
      timestamp: 'Just now',
      snippet: `“${snippet}”`,
      rawText: text,
      tactics: result.identifiedTactics.map((t) => `${t.name}`),
      triggers: result.identifiedTactics.map((t) => ({
        title: `${t.code}: ${t.name}`,
        weight: `+${(t.weight / 100).toFixed(2)}`,
        token: t.matchedText || 'Matched Token',
        description: t.explanation,
      })),
      recommendation: result.recommendedAction,
    };

    setRecentMessages((prev) => [newLog, ...prev.slice(0, 7)]);
  };

  const handleResetSession = () => {
    setRecentMessages(INITIAL_RECENT_MESSAGES);
    setUserXp(350);
    setSimulatorStats({ caughtCount: 23, totalPlayed: 25 });
  };

  // Main Cover Entry Page
  if (currentTab === 'cover') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="cover-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen w-full bg-[#05070a]"
        >
          <LandingCoverView
            onEnter={(targetTab) => {
              setCurrentTab(targetTab || 'analyzer');
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-[#f8fafc] font-['Inter'] flex flex-col selection:bg-white/20 selection:text-white">
      {/* Top Fixed Header */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} userXp={userXp} />

      {/* Main Workspace Stage */}
      <main className="w-full pt-20 pb-12 flex-1">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {currentTab === 'home' && <HomeView onNavigate={handleNavigate} />}

              {currentTab === 'analyzer' && (
                <AnalyzerView
                  onNavigate={handleNavigate}
                  onLogAnalysis={handleLogAnalysis}
                  initialPayload={pendingPayload}
                  onClearInitialPayload={() => setPendingPayload(null)}
                />
              )}

              {currentTab === 'simulator' && (
                <SimulatorView onNavigate={handleNavigate} onAwardXp={handleAwardXp} />
              )}

              {currentTab === 'dashboard' && (
                <DashboardView
                  onNavigate={handleNavigate}
                  recentMessages={recentMessages}
                  onResetSession={handleResetSession}
                  simulatorStats={simulatorStats}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
