import React, { useState } from 'react';
import { NavigationTab, RecentMessageLog, AnalysisResult } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AnalyzerView } from './components/AnalyzerView';
import { SimulatorView } from './components/SimulatorView';
import { DashboardView } from './components/DashboardView';
import { INITIAL_RECENT_MESSAGES } from './data/mockTelemetry';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('analyzer');
  const [userXp, setUserXp] = useState<number>(350);
  const [recentMessages, setRecentMessages] = useState<RecentMessageLog[]>(INITIAL_RECENT_MESSAGES);
  const [simulatorStats, setSimulatorStats] = useState({
    caughtCount: 23,
    totalPlayed: 25,
  });

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

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#dfe2ee] font-['Inter'] flex flex-col selection:bg-[#06b6d4]/20 selection:text-[#4cd7f6]">
      {/* Top Fixed Header */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} userXp={userXp} />

      {/* Main Workspace Stage */}
      <main className="w-full pt-20 pb-12 flex-1">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {currentTab === 'home' && <HomeView onNavigate={setCurrentTab} />}

          {currentTab === 'analyzer' && (
            <AnalyzerView onNavigate={setCurrentTab} onLogAnalysis={handleLogAnalysis} />
          )}

          {currentTab === 'simulator' && (
            <SimulatorView onNavigate={setCurrentTab} onAwardXp={handleAwardXp} />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              recentMessages={recentMessages}
              onResetSession={handleResetSession}
              simulatorStats={simulatorStats}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
