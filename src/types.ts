export type NavigationTab = 'home' | 'analyzer' | 'simulator' | 'dashboard';
export type UploadMode = 'link_qr' | 'email' | 'text' | 'image';

export type Severity = 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'safe' | 'warning' | 'critical';

export interface SecurityIndicator {
  label: string;
  status: 'danger' | 'warning' | 'safe';
  explanation: string;
}

export interface AIVerificationResult {
  verdict: 'AVOID' | 'SUSPICIOUS' | 'SAFE';
  shouldAvoid: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  headline: string;
  primaryReason: string;
  avoidReasoning: string;
  threatCategory: string;
  impersonatedEntity?: string;
  extractedTarget?: string;
  detailedReasons: string[];
  indicators: SecurityIndicator[];
  recommendedActions: string[];
  source?: 'google-ai-studio' | 'local-threat-engine';
  model?: string;
  latencyMs?: number;
}

export interface IdentifiedTactic {
  id: string;
  code: string; // e.g., "TACTIC 01"
  name: string;
  severity: Severity;
  explanation: string;
  matchedText?: string;
  weight: number;
}

export interface AnnotatedToken {
  text: string;
  isFlagged: boolean;
  severity?: Severity;
  tacticName?: string;
  patternType?: string;
}

export interface AnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  riskTitle: string;
  riskSummary: string;
  riskBadge: string;
  riskPill?: string;
  recommendedAction: string;
  identifiedTactics: IdentifiedTactic[];
  annotatedTokens: AnnotatedToken[];
  latencyMs: number;
  patternCount: number;
}

export interface RecentMessageLog {
  id: string;
  channel: 'SMS' | 'Email' | 'Social DM' | 'Web';
  title: string;
  riskLevel: RiskLevel;
  riskLabel: string;
  timestamp: string;
  snippet: string;
  rawText: string;
  tactics: string[];
  triggers: {
    title: string;
    weight: string;
    token: string;
    description: string;
  }[];
  recommendation: string;
}

export interface SimulatorScenario {
  id: string;
  channel: 'SMS' | 'Email' | 'Social DM' | 'Web';
  title: string;
  sender: string;
  senderVerified: boolean;
  timestamp: string;
  previewText: string;
  fullMessage: string;
  isPhishing: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  threatTacticCategory: string;
  redFlags: {
    keyword: string;
    explanation: string;
    tactic: string;
    severity: Severity;
  }[];
  educationalInsight: string;
  attackerGoal: string;
  safeProtocol: string;
}
