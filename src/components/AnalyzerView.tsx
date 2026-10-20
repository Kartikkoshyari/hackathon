import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMessage, PRESET_MESSAGES, evaluatePayloadLocally } from '../utils/heuristics';
import { AnalysisResult, NavigationTab, UploadMode, AIVerificationResult } from '../types';
import { TiltCard3D } from './TiltCard3D';
import { CrystallineShield3D, ShieldVerdictTheme } from './CrystallineShield3D';
import { soundFX } from '../utils/soundEffects';
import {
  Terminal,
  Trash2,
  Zap,
  Lock,
  Brain,
  ShieldAlert,
  ShieldCheck,
  Building,
  AlertTriangle,
  Package,
  Coins,
  Headphones,
  Link2,
  Image as ImageIcon,
  QrCode,
  Upload,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  AlertOctagon,
  ExternalLink,
  ChevronRight,
  Info,
  RefreshCw,
  FileText,
  Eye,
  Camera,
  Mail,
  MessageSquare,
  FileUp,
  Paperclip,
} from 'lucide-react';

interface AnalyzerViewProps {
  onNavigate?: (tab: NavigationTab) => void;
  onLogAnalysis?: (text: string, result: AnalysisResult) => void;
  initialPayload?: string | null;
  onClearInitialPayload?: () => void;
}

// Preset samples for Links
const LINK_PRESETS = [
  {
    label: 'Chase Banking Phish',
    url: 'https://chase-security-verify882.xyz/login?account=auth',
    type: 'danger',
  },
  {
    label: 'USPS Redelivery Smish',
    url: 'http://usps-redelivery-package.top/fee-payment?pkg=94001',
    type: 'danger',
  },
  {
    label: 'Bitly Obfuscated Link',
    url: 'https://bit.ly/3xURGENT-IRS-TAX-REFUND',
    type: 'warning',
  },
  {
    label: 'Official Security Portal',
    url: 'https://cloud.google.com/security/products',
    type: 'safe',
  },
];

// Preset samples for Emails
const EMAIL_PRESETS = [
  {
    label: 'Bank Fraud Wire (BEC)',
    text: `From: Chase Security Desk <no-reply@chase-auth-alert.xyz>
To: target.user@company.com
Subject: [CRITICAL] Immediate Action: Unauthorized wire transfer of $2,840.00 initiated

Dear Customer,

An unauthorized wire transfer of $2,840.00 was detected from your checking account to an offshore account in Cyprus. 

Your account has been temporarily locked to prevent further loss. You must verify your credentials within 30 minutes to cancel this pending transaction:

Verification Portal: https://chase-security-verify882.xyz/login?account=auth

Failure to verify within 30 minutes will result in full transfer execution.

Chase Fraud Prevention Team`,
    type: 'danger',
  },
  {
    label: 'HR Workday Direct Deposit',
    text: `From: HR Payroll Portal <support@workday-payroll-online.xyz>
To: employee@organization.com
Subject: Urgent: Direct Deposit authorization expired - action needed

Attention Employee,

Your direct deposit account details could not be validated for the upcoming pay cycle on Friday. To avoid a missed payroll distribution, update your routing and bank account number immediately:

Update Banking Details: http://workday-payroll-online.xyz/auth/direct-deposit

HR Services & Employee Operations`,
    type: 'danger',
  },
  {
    label: 'Legitimate Security Advisory',
    text: `From: GitHub Security Notifications <notifications@github.com>
To: developer@domain.com
Subject: [GitHub] Security advisory GHSA-3x9q-87vm-9w73 published

A new security advisory has been published for an open-source package you follow.

Severity: Moderate
Package: express-session
Recommendation: Update to version 1.18.1 or higher.

View full advisory on GitHub: https://github.com/security/advisories/GHSA-3x9q-87vm-9w73

GitHub Security Team`,
    type: 'safe',
  },
];

// Preset samples for SMS / Messages
const TEXT_PRESETS = [
  {
    label: 'Chase Bank Smishing',
    text: PRESET_MESSAGES.bank.text,
    type: 'danger',
  },
  {
    label: 'USPS Customs Fee',
    text: PRESET_MESSAGES.package.text,
    type: 'danger',
  },
  {
    label: '2FA Code Intercept',
    text: 'Your security verification code is 492-108. If you did not request this, an unauthorized device is logging into your account. Call our emergency fraud hotline immediately: +1-800-555-0199 or click http://auth-reset.me/2fa',
    type: 'danger',
  },
  {
    label: 'Legitimate Appointment',
    text: 'Your appointment with Dr. Henderson is confirmed for tomorrow, Thursday at 2:30 PM. Please reply C to confirm or call 555-0142 to reschedule.',
    type: 'safe',
  },
];

// Helper for safe base64 encoding that works across unicode and ASCII
function toSafeBase64(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch {
    return '';
  }
}

// Sample SVG test assets
const SAMPLE_PHISHING_SCREENSHOT_DATA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340"><rect width="600" height="340" fill="%230f172a"/><rect x="20" y="20" width="560" height="300" rx="12" fill="%231e293b" stroke="%23ef4444" stroke-width="2"/><text x="40" y="60" fill="%23ef4444" font-family="monospace" font-weight="bold" font-size="16">[ALERT] CRITICAL BANK ALERT: SUSPICIOUS ACTIVITY</text><text x="40" y="100" fill="%23f8fafc" font-family="sans-serif" font-size="14">From: Chase Security Desk &lt;no-reply@chase-auth-alert.xyz&gt;</text><text x="40" y="130" fill="%2394a3b8" font-family="sans-serif" font-size="13">Immediate attention required: An unrecognized withdrawal of $1,420.00</text><text x="40" y="155" fill="%2394a3b8" font-family="sans-serif" font-size="13">was initiated on your checking account. Your account is locked.</text><rect x="40" y="190" width="220" height="40" rx="6" fill="%23ef4444"/><text x="65" y="215" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="14">VERIFY IDENTITY NOW</text><text x="40" y="270" fill="%23f59e0b" font-family="monospace" font-size="12">Failure to verify within 15 minutes results in permanent account suspension.</text></svg>`;

const SAMPLE_QR_CODE_DATA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23ffffff"/><rect x="30" y="30" width="70" height="70" fill="%23000000"/><rect x="40" y="40" width="50" height="50" fill="%23ffffff"/><rect x="50" y="50" width="30" height="30" fill="%23000000"/><rect x="200" y="30" width="70" height="70" fill="%23000000"/><rect x="210" y="40" width="50" height="50" fill="%23ffffff"/><rect x="220" y="50" width="30" height="30" fill="%23000000"/><rect x="30" y="200" width="70" height="70" fill="%23000000"/><rect x="40" y="210" width="50" height="50" fill="%23ffffff"/><rect x="50" y="220" width="30" height="30" fill="%23000000"/><rect x="130" y="30" width="20" height="20" fill="%23000000"/><rect x="160" y="50" width="20" height="20" fill="%23000000"/><rect x="120" y="100" width="60" height="60" fill="%23000000"/><rect x="140" y="120" width="20" height="20" fill="%23ffffff"/><rect x="120" y="180" width="20" height="40" fill="%23000000"/><rect x="160" y="200" width="30" height="30" fill="%23000000"/><rect x="200" y="130" width="70" height="20" fill="%23000000"/><rect x="220" y="170" width="50" height="30" fill="%23000000"/><rect x="230" y="220" width="40" height="50" fill="%23000000"/><text x="40" y="290" font-family="monospace" font-size="10" fill="%23ef4444">QUISHING TARGET: http://pay-fast.top/qr</text></svg>`;

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  onNavigate,
  onLogAnalysis,
  initialPayload,
  onClearInitialPayload,
}) => {
  // Primary Ingestion Mode: 'link_qr' | 'email' | 'text'
  const [activeMode, setActiveMode] = useState<UploadMode>('link_qr');

  // Sub-modes for each section
  const [linkQrSubMode, setLinkQrSubMode] = useState<'link' | 'qr'>('link');
  const [emailSubMode, setEmailSubMode] = useState<'paste' | 'upload'>('paste');
  const [textSubMode, setTextSubMode] = useState<'write' | 'upload'>('write');

  // Input states
  const [inputLink, setInputLink] = useState('https://chase-security-verify882.xyz/login?account=auth');
  const [inputEmailText, setInputEmailText] = useState(EMAIL_PRESETS[0].text);
  const [inputText, setInputText] = useState(TEXT_PRESETS[0].text);

  // File states for uploaded media & documents
  const [uploadedFile, setUploadedFile] = useState<{
    data: string;
    mimeType: string;
    fileName: string;
    previewUrl?: string;
    textContent?: string;
    isImage: boolean;
  } | null>(null);

  const [uploadedQr, setUploadedQr] = useState<{
    data: string;
    mimeType: string;
    fileName: string;
    previewUrl: string;
    rawTarget?: string;
  } | null>({
    data: toSafeBase64(SAMPLE_QR_CODE_DATA),
    mimeType: 'image/svg+xml',
    fileName: 'quishing_parking_meter.svg',
    previewUrl: SAMPLE_QR_CODE_DATA,
    rawTarget: 'http://pay-fast.top/qr-payment?spot=81',
  });

  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null);

  // Verification & Analysis states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [elapsedScanTime, setElapsedScanTime] = useState<number>(0);
  const [lastAnalysisDuration, setLastAnalysisDuration] = useState<number | null>(null);

  // Local heuristic fallback analysis for text/email
  const [heuristicAnalysis, setHeuristicAnalysis] = useState<AnalysisResult>(() =>
    analyzeMessage(TEXT_PRESETS[0].text)
  );

  // 3D Crystalline Aegis Shield State (Threat Monitor)
  const [shieldTheme, setShieldTheme] = useState<ShieldVerdictTheme>('scam');
  const [shieldBurstTrigger, setShieldBurstTrigger] = useState<number>(() => Date.now());
  const [isShieldShattered, setIsShieldShattered] = useState<boolean>(true);

  // Framer-Motion Crystal Aegis Burst Overlay State
  const [burstActivation, setBurstActivation] = useState<{
    id: number;
    type: ShieldVerdictTheme;
    title: string;
    subtitle: string;
  } | null>(null);

  // Auto-dismiss burst overlay after animation completes
  useEffect(() => {
    if (burstActivation) {
      const timer = setTimeout(() => {
        setBurstActivation(null);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [burstActivation]);

  // AI Verification Result
  const [aiResult, setAiResult] = useState<AIVerificationResult | null>({
    verdict: 'AVOID',
    shouldAvoid: true,
    riskScore: 97,
    riskLevel: 'critical',
    headline: 'High-Threat Credential Harvesting Link Mimicking Chase Bank',
    primaryReason:
      'This link uses a deceptive lookalike domain ("chase-security-verify882.xyz") with an unverified .xyz TLD designed to steal online banking credentials.',
    avoidReasoning:
      'Clicking this link directs you to an unauthorized login clone where usernames, passwords, or 2FA codes entered will be intercepted by malicious operators. Avoid clicking or opening this link under all circumstances.',
    threatCategory: 'Credential Harvesting Phishing Link',
    impersonatedEntity: 'Chase Bank',
    extractedTarget: 'https://chase-security-verify882.xyz/login?account=auth',
    detailedReasons: [
      'Deceptive domain name mimics Chase Bank without authoritative domain ownership.',
      'Uses high-risk .xyz top-level domain frequently utilized in automated smishing campaigns.',
      'Simulates emergency account verification to provoke impulsive credential entry.',
    ],
    indicators: [
      { label: 'Domain Authenticity', status: 'danger', explanation: 'Domain "chase-security-verify882.xyz" is not owned by JPMorgan Chase & Co.' },
      { label: 'Threat Vector', status: 'danger', explanation: 'Targets banking credentials and one-time two-factor authentication tokens.' },
      { label: 'Urgency Pressure', status: 'warning', explanation: 'Creates artificial panic regarding account lockouts to bypass skepticism.' },
      { label: 'SSL & Reputation', status: 'danger', explanation: 'Domain registered less than 48 hours ago with zero authoritative reputation.' },
    ],
    recommendedActions: [
      'Do not click, tap, or enter credentials on this link.',
      'Report the message or link to abuse@chase.com.',
      'If you already entered passwords, navigate directly to official chase.com and reset them immediately.',
      'Block the sender address or telephone number across your device.',
    ],
    source: 'google-ai-studio',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle incoming threat payload from Command Hub radar or live feed
  useEffect(() => {
    if (initialPayload) {
      if (initialPayload.startsWith('http://') || initialPayload.startsWith('https://')) {
        setActiveMode('link_qr');
        setLinkQrSubMode('link');
        setInputLink(initialPayload);
      } else {
        setActiveMode('text');
        setTextSubMode('write');
        setInputText(initialPayload);
      }
      soundFX.scan();
      const res = analyzeMessage(initialPayload);
      setHeuristicAnalysis(res);
      const isCritical = res.riskLevel === 'critical';
      const isSafe = res.riskLevel === 'safe';
      const initialTheme: ShieldVerdictTheme = isCritical ? 'scam' : isSafe ? 'legit' : 'warning';
      setShieldTheme(initialTheme);
      setShieldBurstTrigger(Date.now());
      setIsShieldShattered(isCritical);

      setBurstActivation({
        id: Date.now(),
        type: initialTheme,
        title: isCritical
          ? 'CRYSTAL AEGIS // SCAM BREACH DEFLECTED'
          : isSafe
          ? 'CRYSTAL AEGIS // VERIFIED SAFE DEFENSE'
          : 'CRYSTAL AEGIS // ELEVATED THREAT WARNING',
        subtitle: isCritical
          ? 'High-risk deception vector intercepted • Protective countermeasures engaged'
          : isSafe
          ? 'Authoritative security signatures verified • Safe to proceed'
          : 'Anomalous indicators detected • Exercise heightened scrutiny',
      });

      if (isCritical) {
        soundFX.scamThreatBurst();
      } else if (isSafe) {
        soundFX.legitShieldBurst();
      }
      onLogAnalysis?.(initialPayload, res);
      onClearInitialPayload?.();
    }
  }, [initialPayload]);

  // Clear inputs
  const handleClear = () => {
    setShieldTheme('neutral');
    setIsShieldShattered(false);
    if (activeMode === 'link_qr') {
      if (linkQrSubMode === 'link') {
        setInputLink('');
      } else {
        setUploadedQr(null);
      }
    } else if (activeMode === 'email') {
      if (emailSubMode === 'paste') {
        setInputEmailText('');
      } else {
        setUploadedFile(null);
      }
    } else {
      if (textSubMode === 'write') {
        setInputText('');
      } else {
        setUploadedFile(null);
      }
    }
    setVerificationError(null);
  };

  // Process uploaded files (both images and text files)
  const processUploadedFile = (file: File) => {
    const isImg = file.type.startsWith('image/');

    if (isImg) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const resultStr = event.target?.result as string;
        const base64Data = resultStr.split(',')[1] || '';

        const payloadObj = {
          data: base64Data,
          mimeType: file.type || 'image/png',
          fileName: file.name,
          previewUrl: resultStr,
          isImage: true,
        };

        if (activeMode === 'link_qr' && linkQrSubMode === 'qr') {
          setUploadedQr({
            data: base64Data,
            mimeType: file.type || 'image/png',
            fileName: file.name,
            previewUrl: resultStr,
          });
        } else {
          setUploadedFile(payloadObj);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Text, .eml, .msg, .json, .log
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
        setUploadedFile({
          data: toSafeBase64(textContent),
          mimeType: 'text/plain',
          fileName: file.name,
          textContent,
          isImage: false,
        });

        // Also populate the active text field for visual inspection
        if (activeMode === 'email') {
          setInputEmailText(textContent);
        } else if (activeMode === 'text') {
          setInputText(textContent);
        }
      };
      reader.readAsText(file);
    }
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Elapsed scan timer during verification
  useEffect(() => {
    if (!isVerifying) {
      setElapsedScanTime(0);
      return;
    }
    const t0 = performance.now();
    const timer = setInterval(() => {
      setElapsedScanTime(Math.round(performance.now() - t0));
    }, 100);
    return () => clearInterval(timer);
  }, [isVerifying]);

  // Execute verification against /api/verify
  const handleRunVerification = async () => {
    setIsVerifying(true);
    setVerificationError(null);
    const startScanTs = performance.now();

    let verifyType: string = 'text';
    let verifyPayload: any = '';
    let extraContext: string = '';

    if (activeMode === 'link_qr') {
      if (linkQrSubMode === 'link') {
        verifyType = 'link';
        verifyPayload = inputLink.trim();
        if (!verifyPayload) {
          setVerificationError('Please enter a valid link/URL to inspect.');
          setIsVerifying(false);
          return;
        }
      } else {
        verifyType = 'qr';
        if (!uploadedQr) {
          setVerificationError('Please upload or select a QR code first.');
          setIsVerifying(false);
          return;
        }
        verifyPayload = {
          mimeType: uploadedQr.mimeType,
          data: uploadedQr.data,
        };
        extraContext = uploadedQr.rawTarget ? `Decoded Target: ${uploadedQr.rawTarget}` : '';
      }
    } else if (activeMode === 'email') {
      verifyType = 'email';
      if (emailSubMode === 'paste') {
        verifyPayload = inputEmailText.trim();
        if (!verifyPayload) {
          setVerificationError('Please paste email headers, body, or verification link.');
          setIsVerifying(false);
          return;
        }
      } else {
        if (!uploadedFile) {
          setVerificationError('Please upload an email file (.eml, .txt) or screenshot.');
          setIsVerifying(false);
          return;
        }
        if (uploadedFile.isImage) {
          verifyType = 'image';
          verifyPayload = {
            mimeType: uploadedFile.mimeType,
            data: uploadedFile.data,
          };
          extraContext = `Email screenshot: ${uploadedFile.fileName}`;
        } else {
          verifyPayload = uploadedFile.textContent || inputEmailText;
          extraContext = `Email file: ${uploadedFile.fileName}`;
        }
      }
    } else {
      // Message / SMS mode
      verifyType = 'text';
      if (textSubMode === 'write') {
        verifyPayload = inputText.trim();
        if (!verifyPayload) {
          setVerificationError('Please enter message text to inspect.');
          setIsVerifying(false);
          return;
        }
        const localRes = analyzeMessage(inputText);
        setHeuristicAnalysis(localRes);
        if (onLogAnalysis && inputText.trim().length > 10) {
          onLogAnalysis(inputText, localRes);
        }
      } else {
        if (!uploadedFile) {
          setVerificationError('Please upload a message export or screenshot.');
          setIsVerifying(false);
          return;
        }
        if (uploadedFile.isImage) {
          verifyType = 'image';
          verifyPayload = {
            mimeType: uploadedFile.mimeType,
            data: uploadedFile.data,
          };
          extraContext = `Message screenshot: ${uploadedFile.fileName}`;
        } else {
          verifyPayload = uploadedFile.textContent || inputText;
          extraContext = `Message file: ${uploadedFile.fileName}`;
        }
      }
    }

    soundFX.shieldCharge();

    // AbortController with 25-second client deadline for deep AI analysis and large payloads
    const abortCtrl = new AbortController();
    const abortTimer = setTimeout(() => {
      abortCtrl.abort();
    }, 25000);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortCtrl.signal,
        body: JSON.stringify({
          type: verifyType,
          payload: verifyPayload,
          extraContext,
        }),
      });

      clearTimeout(abortTimer);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const durationMs = Math.round(performance.now() - startScanTs);
      setLastAnalysisDuration(durationMs);
      setAiResult(data);

      const isScamVerdict = Boolean(
        data.shouldAvoid ||
        data.riskScore >= 60 ||
        data.riskLevel === 'critical' ||
        String(data.verdict || '').toUpperCase().includes('AVOID')
      );
      const isLegitVerdict = Boolean(
        !data.shouldAvoid &&
        data.riskScore < 45 &&
        data.riskLevel === 'safe' &&
        String(data.verdict || '').toUpperCase().includes('SAFE')
      );

      const targetTheme: ShieldVerdictTheme = isScamVerdict
        ? 'scam'
        : isLegitVerdict
        ? 'legit'
        : 'warning';

      setShieldTheme(targetTheme);
      setShieldBurstTrigger(Date.now());
      setIsShieldShattered(isScamVerdict);

      // Trigger Framer-Motion Crystal Aegis burst overlay over the analyzer interface
      setBurstActivation({
        id: Date.now(),
        type: targetTheme,
        title: isScamVerdict
          ? 'CRYSTAL AEGIS // SCAM BREACH DEFLECTED'
          : isLegitVerdict
          ? 'CRYSTAL AEGIS // VERIFIED SAFE DEFENSE'
          : 'CRYSTAL AEGIS // ELEVATED THREAT WARNING',
        subtitle: isScamVerdict
          ? 'High-risk deception vector intercepted • Protective countermeasures engaged'
          : isLegitVerdict
          ? 'Authoritative security signatures verified • Safe to proceed'
          : 'Anomalous indicators detected • Exercise heightened scrutiny',
      });

      if (isScamVerdict) {
        soundFX.scamThreatBurst();
      } else if (isLegitVerdict) {
        soundFX.legitShieldBurst();
      } else {
        soundFX.warningBurst();
      }
    } catch (err: any) {
      clearTimeout(abortTimer);
      const durationMs = Math.round(performance.now() - startScanTs);
      setLastAnalysisDuration(durationMs);
      console.warn('Threat verification API warning, generating defensive verdict:', err);

      // Intelligent local evaluation engine fallback (ensures accurate verdicts on Netlify or offline)
      const fallbackVerdict = evaluatePayloadLocally(verifyType, verifyPayload, extraContext);
      fallbackVerdict.latencyMs = durationMs;
      setAiResult(fallbackVerdict);

      const isScamVerdict = Boolean(
        fallbackVerdict.shouldAvoid ||
        fallbackVerdict.riskScore >= 60 ||
        fallbackVerdict.riskLevel === 'critical' ||
        String(fallbackVerdict.verdict || '').toUpperCase().includes('AVOID')
      );
      const isLegitVerdict = Boolean(
        !fallbackVerdict.shouldAvoid &&
        fallbackVerdict.riskScore < 45 &&
        fallbackVerdict.riskLevel === 'safe' &&
        String(fallbackVerdict.verdict || '').toUpperCase().includes('SAFE')
      );

      const targetTheme: ShieldVerdictTheme = isScamVerdict
        ? 'scam'
        : isLegitVerdict
        ? 'legit'
        : 'warning';

      setShieldTheme(targetTheme);
      setShieldBurstTrigger(Date.now());
      setIsShieldShattered(isScamVerdict);

      setBurstActivation({
        id: Date.now(),
        type: targetTheme,
        title: isScamVerdict
          ? 'CRYSTAL AEGIS // SCAM BREACH DEFLECTED'
          : isLegitVerdict
          ? 'CRYSTAL AEGIS // VERIFIED SAFE DEFENSE'
          : 'CRYSTAL AEGIS // ELEVATED THREAT WARNING',
        subtitle: isScamVerdict
          ? 'High-risk deception vector intercepted • Protective countermeasures engaged'
          : isLegitVerdict
          ? 'Authoritative security signatures verified • Safe to proceed'
          : 'Anomalous indicators detected • Exercise heightened scrutiny',
      });

      if (isScamVerdict) {
        soundFX.scamThreatBurst();
      } else if (isLegitVerdict) {
        soundFX.legitShieldBurst();
      } else {
        soundFX.warningBurst();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const isAvoid = aiResult?.shouldAvoid ?? (heuristicAnalysis.riskLevel === 'critical');
  const riskScore = aiResult?.riskScore ?? heuristicAnalysis.score;
  const verdictText = aiResult?.verdict ?? (heuristicAnalysis.riskLevel === 'critical' ? 'AVOID' : 'SUSPICIOUS');

  return (
    <div className="w-full flex flex-col gap-6 relative">
      {/* Framer-Motion Crystal Aegis Color-Coded Burst Overlay */}
      <AnimatePresence>
        {burstActivation && (
          <motion.div
            key={burstActivation.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          >
            {/* 1. Full-screen Edge Flash & Vignette Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.85, 0] }}
              transition={{ duration: 2.5, times: [0, 0.08, 0.7, 1] }}
              className={`absolute inset-0 ${
                burstActivation.type === 'scam'
                  ? 'shadow-[inset_0_0_140px_rgba(239,68,68,0.6),0_0_90px_rgba(239,68,68,0.45)]'
                  : burstActivation.type === 'legit'
                  ? 'shadow-[inset_0_0_140px_rgba(16,185,129,0.6),0_0_90px_rgba(16,185,129,0.45)]'
                  : 'shadow-[inset_0_0_120px_rgba(245,158,11,0.5),0_0_70px_rgba(245,158,11,0.35)]'
              }`}
              style={{
                background:
                  burstActivation.type === 'scam'
                    ? 'radial-gradient(circle at 50% 32%, rgba(239, 68, 68, 0.38) 0%, rgba(185, 28, 28, 0.12) 50%, transparent 80%)'
                    : burstActivation.type === 'legit'
                    ? 'radial-gradient(circle at 50% 32%, rgba(16, 185, 129, 0.38) 0%, rgba(5, 150, 105, 0.12) 50%, transparent 80%)'
                    : 'radial-gradient(circle at 50% 32%, rgba(245, 158, 11, 0.32) 0%, rgba(180, 83, 9, 0.1) 50%, transparent 80%)',
              }}
            />

            {/* 2. Concentric Shockwave Ring 1 */}
            <motion.div
              initial={{ scale: 0.1, opacity: 1 }}
              animate={{ scale: [0.1, 2.3], opacity: [1, 0] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className={`absolute w-[440px] h-[440px] rounded-full border-2 ${
                burstActivation.type === 'scam'
                  ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.85)]'
                  : burstActivation.type === 'legit'
                  ? 'border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.85)]'
                  : 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.85)]'
              }`}
            />

            {/* 3. Concentric Shockwave Ring 2 (Dashed secondary harmonic) */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.85 }}
              animate={{ scale: [0.1, 2.9], opacity: [0.85, 0] }}
              transition={{ duration: 1.7, ease: 'easeOut', delay: 0.14 }}
              className={`absolute w-[440px] h-[440px] rounded-full border border-dashed ${
                burstActivation.type === 'scam'
                  ? 'border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.65)]'
                  : burstActivation.type === 'legit'
                  ? 'border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.65)]'
                  : 'border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.65)]'
              }`}
            />

            {/* 4. Radial Crystalline Shard Particles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const distance = 160 + (i % 3) * 60;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: tx,
                      y: ty,
                      scale: [0, 1.4, 0],
                      opacity: [1, 1, 0],
                      rotate: i * 45 + 90,
                    }}
                    transition={{ duration: 1.3, ease: 'easeOut', delay: 0.04 }}
                    className={`absolute w-3.5 h-3.5 ${
                      burstActivation.type === 'scam'
                        ? 'bg-red-400 shadow-[0_0_15px_#ef4444]'
                        : burstActivation.type === 'legit'
                        ? 'bg-emerald-400 shadow-[0_0_15px_#10b981]'
                        : 'bg-amber-400 shadow-[0_0_15px_#f59e0b]'
                    }`}
                    style={{
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    }}
                  />
                );
              })}
            </div>

            {/* 5. Central High-Tech Crystal Aegis Activation HUD Banner */}
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-30, 0, 0, -20],
                scale: [0.9, 1, 1, 0.96],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.12, 0.78, 1],
                ease: 'easeOut',
              }}
              className={`relative max-w-xl mx-4 p-5 rounded-2xl border backdrop-blur-xl shadow-2xl flex flex-col items-center text-center gap-2.5 ${
                burstActivation.type === 'scam'
                  ? 'bg-black/90 border-red-500/60 shadow-[0_0_55px_rgba(239,68,68,0.5)]'
                  : burstActivation.type === 'legit'
                  ? 'bg-black/90 border-emerald-500/60 shadow-[0_0_55px_rgba(16,185,129,0.5)]'
                  : 'bg-black/90 border-amber-500/60 shadow-[0_0_45px_rgba(245,158,11,0.45)]'
              }`}
            >
              {/* Corner Cyber Brackets */}
              <div
                className={`absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 ${
                  burstActivation.type === 'scam'
                    ? 'border-red-400'
                    : burstActivation.type === 'legit'
                    ? 'border-emerald-400'
                    : 'border-amber-400'
                }`}
              />
              <div
                className={`absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 ${
                  burstActivation.type === 'scam'
                    ? 'border-red-400'
                    : burstActivation.type === 'legit'
                    ? 'border-emerald-400'
                    : 'border-amber-400'
                }`}
              />
              <div
                className={`absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 ${
                  burstActivation.type === 'scam'
                    ? 'border-red-400'
                    : burstActivation.type === 'legit'
                    ? 'border-emerald-400'
                    : 'border-amber-400'
                }`}
              />
              <div
                className={`absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 ${
                  burstActivation.type === 'scam'
                    ? 'border-red-400'
                    : burstActivation.type === 'legit'
                    ? 'border-emerald-400'
                    : 'border-amber-400'
                }`}
              />

              {/* Status Header Badge */}
              <div className="flex items-center gap-2">
                {burstActivation.type === 'scam' ? (
                  <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                ) : burstActivation.type === 'legit' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
                )}
                <span
                  className={`font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-widest ${
                    burstActivation.type === 'scam'
                      ? 'text-red-400'
                      : burstActivation.type === 'legit'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {burstActivation.type === 'scam'
                    ? '🔴 RED BURST ACTIVATED'
                    : burstActivation.type === 'legit'
                    ? '🟢 GREEN BURST ACTIVATED'
                    : '🟡 AMBER BURST ACTIVATED'}
                </span>
              </div>

              {/* Headline */}
              <h2
                className={`font-['Space_Grotesk'] text-xl sm:text-2xl font-extrabold tracking-tight ${
                  burstActivation.type === 'scam'
                    ? 'text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                    : burstActivation.type === 'legit'
                    ? 'text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                    : 'text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                }`}
              >
                {burstActivation.title}
              </h2>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-neutral-300 font-['Inter'] leading-relaxed max-w-md">
                {burstActivation.subtitle}
              </p>

              {/* Audio & Energy Frequency Meters */}
              <div className="flex items-center gap-1 pt-1">
                {Array.from({ length: 9 }).map((_, barIdx) => (
                  <motion.span
                    key={barIdx}
                    animate={{ height: ['4px', `${12 + (barIdx % 4) * 6}px`, '4px'] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: barIdx * 0.06,
                    }}
                    className={`w-1 rounded-full ${
                      burstActivation.type === 'scam'
                        ? 'bg-red-400'
                        : burstActivation.type === 'legit'
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.eml,.msg,.txt,.json,.log"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Command Center Header HUD */}
      <section className="relative w-full">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E293B] text-[#4cd7f6] border border-[#06b6d4]/35 font-['JetBrains_Mono'] text-[11px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-ping" />
              CYBER THREAT DEFENSE ENGINE ACTIVE
            </span>
            <span className="text-[#64748B] font-['JetBrains_Mono'] text-[11px]">/ MULTI-VECTOR VERIFIER</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                Threat &amp; Phishing <span className="text-[#4cd7f6]">Verification Engine</span>
              </h1>
              <p className="text-sm md:text-[15px] text-[#94A3B8] max-w-3xl mt-1 leading-relaxed">
                Inspect suspicious <strong className="text-[#F8FAFC]">Links &amp; QR Codes</strong>,{' '}
                <strong className="text-[#F8FAFC]">Emails</strong>, or{' '}
                <strong className="text-[#F8FAFC]">Messages</strong>. Instant rule-based parsing and threat verification provide decisive reasons on whether to avoid or trust.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto bg-[#111827] px-3.5 py-2 rounded-lg border border-white/8 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#10B981] font-semibold tracking-wide">
                THREAT DEFENSE
              </span>
              <span className="text-[#869397] text-xs">|</span>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748B]">ONLINE (REAL-TIME SPEED)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 3 Sections Ingestion Navigation */}
      <div className="flex items-center gap-2 p-2 bg-[#111827] rounded-xl border border-white/8 overflow-x-auto">
        {/* Tab 1: Link & QR Code */}
        <button
          onClick={() => {
            setActiveMode('link_qr');
            setVerificationError(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-['Space_Grotesk'] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'link_qr'
              ? 'btn-3d-cyan'
              : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
          id="tabLinkQR"
        >
          <div className="flex items-center gap-1">
            <Link2 className="w-4 h-4" />
            <QrCode className="w-3.5 h-3.5" />
          </div>
          <span>Link &amp; QR Code</span>
        </button>

        {/* Tab 2: Email Inspector */}
        <button
          onClick={() => {
            setActiveMode('email');
            setVerificationError(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-['Space_Grotesk'] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'email'
              ? 'btn-3d-cyan'
              : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
          id="tabEmail"
        >
          <Mail className="w-4 h-4" />
          <span>Email Inspector</span>
        </button>

        {/* Tab 3: Message / SMS */}
        <button
          onClick={() => {
            setActiveMode('text');
            setVerificationError(null);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-['Space_Grotesk'] font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMode === 'text'
              ? 'btn-3d-cyan'
              : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
          id="tabMessage"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message / SMS</span>
        </button>
      </div>

      {/* Main Split Command Center: Ingestion Left vs Threat Inspector Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Ingestion Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative bg-[#111827]/90 backdrop-blur-md rounded-xl p-4 md:p-5 border border-white/8 shadow-xl flex flex-col gap-4">
            {/* Sub-mode Toggle Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              {/* Left: Mode Sub-Selectors */}
              <div className="flex items-center gap-1.5 p-1 bg-[#06090E] rounded-lg border border-white/10">
                {activeMode === 'link_qr' && (
                  <>
                    <button
                      onClick={() => setLinkQrSubMode('link')}
                      className={`px-3 py-1.5 rounded-md text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer ${
                        linkQrSubMode === 'link'
                          ? 'btn-3d-cyan !py-1'
                          : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Paste Link / URL
                    </button>
                    <button
                      onClick={() => setLinkQrSubMode('qr')}
                      className={`px-3 py-1.5 rounded-md text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        linkQrSubMode === 'qr'
                          ? 'btn-3d-cyan !py-1'
                          : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Scan / Upload QR
                    </button>
                  </>
                )}

                {activeMode === 'email' && (
                  <>
                    <button
                      onClick={() => setEmailSubMode('paste')}
                      className={`px-3 py-1.5 rounded-md text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer ${
                        emailSubMode === 'paste'
                          ? 'btn-3d-cyan !py-1'
                          : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Paste Email / Link
                    </button>
                    <button
                      onClick={() => setEmailSubMode('upload')}
                      className={`px-3 py-1.5 rounded-md text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        emailSubMode === 'upload'
                          ? 'btn-3d-cyan !py-1'
                          : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Email (.eml/Image)
                    </button>
                  </>
                )}

                {activeMode === 'text' && (
                  <>
                    <button
                      onClick={() => setTextSubMode('write')}
                      className={`px-3 py-1.5 rounded-md text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer ${
                        textSubMode === 'write'
                          ? 'btn-3d-cyan !py-1'
                          : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      Write / Paste Text
                    </button>
                    <button
                      onClick={() => setTextSubMode('upload')}
                      className={`px-3 py-1.5 rounded-md text-xs font-['Space_Grotesk'] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        textSubMode === 'upload'
                          ? 'btn-3d-cyan !py-1'
                          : 'keycap-3d text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Chat / Screenshot
                    </button>
                  </>
                )}
              </div>

              {/* Clear button */}
              <button
                onClick={handleClear}
                className="font-['JetBrains_Mono'] text-[11px] text-[#64748B] hover:text-[#EF4444] transition-colors flex items-center gap-1 cursor-pointer keycap-3d px-2.5 py-1 rounded"
                id="clearBtn"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>

            {/* 1. LINK & QR CODE SECTION */}
            {activeMode === 'link_qr' && linkQrSubMode === 'link' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#4cd7f6]" />
                    Enter Suspicious URL, Domain, or Tracking Link
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">Click text to select all</span>
                </div>
                <div className="relative">
                  <input
                    type="url"
                    value={inputLink}
                    onChange={(e) => {
                      setInputLink(e.target.value);
                      setVerificationError(null);
                    }}
                    onClick={(e) => e.currentTarget.select()}
                    onFocus={(e) => e.currentTarget.select()}
                    placeholder="https://suspicious-login-domain.xyz/auth"
                    className="w-full bg-[#06090E] border border-white/10 rounded-lg p-3 pr-10 text-sm font-['JetBrains_Mono'] text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#4cd7f6] input-3d-inset transition-colors"
                  />
                  {inputLink && (
                    <button
                      type="button"
                      onClick={() => setInputLink('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      title="Clear URL"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Link Presets */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[#64748B] uppercase">
                    Test Verified Samples:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {LINK_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputLink(preset.url);
                          setVerificationError(null);
                        }}
                        className={`keycap-3d text-left px-3 py-2 rounded-lg text-xs font-['JetBrains_Mono'] transition-all cursor-pointer truncate ${
                          inputLink === preset.url
                            ? 'keycap-3d-active text-[#003640]'
                            : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QR Scanner Mode */}
            {activeMode === 'link_qr' && linkQrSubMode === 'qr' && (
              <div className="flex flex-col gap-3">
                <label className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#4cd7f6]" />
                  Upload QR Code Image or Drag &amp; Drop
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-[#4cd7f6]/60 rounded-xl p-5 bg-[#06090E]/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                >
                  <QrCode className="w-8 h-8 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F8FAFC]">
                    Drop QR code image here or click to browse
                  </span>
                  <span className="text-[11px] text-[#64748B] font-['JetBrains_Mono']">
                    Supports PNG, JPG, SVG, WebP
                  </span>
                </div>

                {uploadedQr && (
                  <div className="p-3 rounded-lg bg-[#06090E] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={uploadedQr.previewUrl}
                        alt="QR Preview"
                        className="w-12 h-12 rounded object-cover border border-white/10 bg-white"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#F8FAFC]">
                          {uploadedQr.fileName}
                        </span>
                        {uploadedQr.rawTarget && (
                          <span className="text-[11px] font-mono text-[#ffb95f] truncate max-w-[220px]">
                            {uploadedQr.rawTarget}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedQr(null)}
                      className="text-xs text-[#EF4444] hover:underline font-mono"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setUploadedQr({
                        data: toSafeBase64(SAMPLE_QR_CODE_DATA),
                        mimeType: 'image/svg+xml',
                        fileName: 'quishing_parking_meter.svg',
                        previewUrl: SAMPLE_QR_CODE_DATA,
                        rawTarget: 'http://pay-fast.top/qr-payment?spot=81',
                      });
                    }}
                    className="text-xs text-[#4cd7f6] hover:underline font-['JetBrains_Mono']"
                  >
                    Load Sample Parking Quishing QR
                  </button>
                </div>
              </div>
            )}

            {/* 2. EMAIL INSPECTION SECTION */}
            {activeMode === 'email' && emailSubMode === 'paste' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#4cd7f6]" />
                    Paste Email Headers, Body, or Verification Link
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">Click text to select all</span>
                </div>

                <div className="relative">
                  <textarea
                    value={inputEmailText}
                    onChange={(e) => {
                      setInputEmailText(e.target.value);
                      setVerificationError(null);
                    }}
                    onClick={(e) => e.currentTarget.select()}
                    onFocus={(e) => e.currentTarget.select()}
                    rows={8}
                    placeholder="Paste From:, Subject:, email content, or sender verification link..."
                    className="w-full bg-[#06090E] border border-white/10 rounded-lg p-3 text-xs font-['JetBrains_Mono'] text-[#dfe2ee] placeholder:text-[#64748B] focus:outline-none focus:border-[#4cd7f6] input-3d-inset resize-y"
                  />
                  {inputEmailText && (
                    <button
                      type="button"
                      onClick={() => setInputEmailText('')}
                      className="absolute right-2 top-2 keycap-3d px-2 py-0.5 rounded text-slate-400 hover:text-red-400 text-[10px] font-mono cursor-pointer transition-colors"
                      title="Clear email text"
                    >
                      Clear text
                    </button>
                  )}
                </div>

                {/* Email Presets */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[#64748B] uppercase">
                    Test Sample Email Threats:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {EMAIL_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputEmailText(preset.text);
                          setVerificationError(null);
                        }}
                        className={`keycap-3d text-left px-3 py-2 rounded-lg text-xs font-['JetBrains_Mono'] transition-all cursor-pointer truncate ${
                          inputEmailText === preset.text
                            ? 'keycap-3d-active text-[#003640]'
                            : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email Upload Mode (.eml, .msg, .txt, or Screenshot) */}
            {activeMode === 'email' && emailSubMode === 'upload' && (
              <div className="flex flex-col gap-3">
                <label className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#4cd7f6]" />
                  Upload Email File (.eml, .msg, .txt) or Screenshot
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-[#4cd7f6]/60 rounded-xl p-6 bg-[#06090E]/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                >
                  <FileUp className="w-8 h-8 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F8FAFC]">
                    Drop .eml, .msg, .txt or email screenshot here
                  </span>
                  <span className="text-[11px] text-[#64748B] font-['JetBrains_Mono']">
                    Accepts raw email exports or PNG/JPG visual screenshots
                  </span>
                </div>

                {uploadedFile && (
                  <div className="p-3 rounded-lg bg-[#06090E] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {uploadedFile.isImage && uploadedFile.previewUrl ? (
                        <img
                          src={uploadedFile.previewUrl}
                          alt="Email Screenshot"
                          className="w-12 h-12 rounded object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#1E293B] flex items-center justify-center text-[#4cd7f6]">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#F8FAFC]">
                          {uploadedFile.fileName}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {uploadedFile.isImage ? 'Visual Email Capture' : 'Parsed Email Document'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-xs text-[#EF4444] hover:underline font-mono"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setUploadedFile({
                        data: toSafeBase64(SAMPLE_PHISHING_SCREENSHOT_DATA),
                        mimeType: 'image/svg+xml',
                        fileName: 'sample_email_alert.svg',
                        previewUrl: SAMPLE_PHISHING_SCREENSHOT_DATA,
                        isImage: true,
                      });
                    }}
                    className="text-xs text-[#4cd7f6] hover:underline font-['JetBrains_Mono']"
                  >
                    Load Sample Email Phish Screenshot
                  </button>
                </div>
              </div>
            )}

            {/* 3. MESSAGE / SMS SECTION */}
            {activeMode === 'text' && textSubMode === 'write' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#4cd7f6]" />
                    Write or Paste SMS / Chat Message Text
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">Click text to select all</span>
                </div>

                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      setVerificationError(null);
                    }}
                    onClick={(e) => e.currentTarget.select()}
                    onFocus={(e) => e.currentTarget.select()}
                    rows={6}
                    placeholder="Paste SMS text, WhatsApp message, or fraud notification..."
                    className="w-full bg-[#06090E] border border-white/10 rounded-lg p-3 text-xs font-['JetBrains_Mono'] text-[#dfe2ee] placeholder:text-[#64748B] focus:outline-none focus:border-[#4cd7f6] input-3d-inset resize-y"
                  />
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="absolute right-2 top-2 keycap-3d px-2 py-0.5 rounded text-slate-400 hover:text-red-400 text-[10px] font-mono cursor-pointer transition-colors"
                      title="Clear message text"
                    >
                      Clear text
                    </button>
                  )}
                </div>

                {/* SMS Presets */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] font-['JetBrains_Mono'] text-[#64748B] uppercase">
                    Test Sample Messages:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {TEXT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputText(preset.text);
                          setVerificationError(null);
                        }}
                        className={`keycap-3d text-left px-3 py-2 rounded-lg text-xs font-['JetBrains_Mono'] transition-all cursor-pointer truncate ${
                          inputText === preset.text
                            ? 'keycap-3d-active text-[#003640]'
                            : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Upload Mode (.txt, .json, .log, or Screenshot) */}
            {activeMode === 'text' && textSubMode === 'upload' && (
              <div className="flex flex-col gap-3">
                <label className="font-['JetBrains_Mono'] text-xs text-[#94A3B8] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#4cd7f6]" />
                  Upload Chat Export (.txt, .json, .log) or Mobile Screenshot
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 hover:border-[#4cd7f6]/60 rounded-xl p-6 bg-[#06090E]/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                >
                  <Camera className="w-8 h-8 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F8FAFC]">
                    Drop chat file or screenshot here
                  </span>
                  <span className="text-[11px] text-[#64748B] font-['JetBrains_Mono']">
                    Supports SMS screenshots, WhatsApp exports, and text logs
                  </span>
                </div>

                {uploadedFile && (
                  <div className="p-3 rounded-lg bg-[#06090E] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {uploadedFile.isImage && uploadedFile.previewUrl ? (
                        <img
                          src={uploadedFile.previewUrl}
                          alt="Screenshot"
                          className="w-12 h-12 rounded object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#1E293B] flex items-center justify-center text-[#4cd7f6]">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#F8FAFC]">
                          {uploadedFile.fileName}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {uploadedFile.isImage ? 'Visual Mobile Screenshot' : 'Message Export File'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-xs text-[#EF4444] hover:underline font-mono"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setUploadedFile({
                        data: toSafeBase64(SAMPLE_PHISHING_SCREENSHOT_DATA),
                        mimeType: 'image/svg+xml',
                        fileName: 'smishing_alert.svg',
                        previewUrl: SAMPLE_PHISHING_SCREENSHOT_DATA,
                        isImage: true,
                      });
                    }}
                    className="text-xs text-[#4cd7f6] hover:underline font-['JetBrains_Mono']"
                  >
                    Load Sample Smishing Screenshot
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {verificationError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            {/* Run Verification Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleRunVerification}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 rounded-xl btn-3d-cyan font-['Space_Grotesk'] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                id="runVerificationBtn"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Analyzing Threat Vector...</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 text-cyan-300">
                      {(elapsedScanTime / 1000).toFixed(1)}s
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-cyan-300" />
                    <span>Verify with Threat Defense Engine</span>
                    {lastAnalysisDuration !== null && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/30 text-emerald-400 font-normal">
                        ⚡ {(lastAnalysisDuration / 1000).toFixed(2)}s
                      </span>
                    )}
                  </>
                )}
              </button>

              <div className="flex items-center justify-between px-1 text-[#64748B] font-['JetBrains_Mono'] text-xs">
                <div className="flex items-center gap-1.5 text-[#10B981]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Zero-Telemetry Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Turbo Scan Engine Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Defense Engine Intelligence Specs */}
          <div className="bg-[#181c24]/70 rounded-xl p-4 border border-white/8 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[#94A3B8]">
              <span className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-[#64748B] font-semibold">
                Threat Defense Specs
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[#10B981] font-['JetBrains_Mono'] text-[10px] font-semibold">
                CORE v4.8 ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every link, QR quishing code, email, or message is scrutinized for lookalike domains, credential harvesters, cognitive urgency hooks, and financial redirection vectors.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Threat Inspector HUD (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 3D CRYSTALLINE AEGIS VERIFICATION CORE & THREAT MONITOR */}
          <div
            className={`relative rounded-2xl border transition-all duration-700 overflow-hidden shadow-2xl ${
              shieldTheme === 'scam'
                ? 'bg-gradient-to-b from-[#1a080d] via-[#100609] to-[#070305] border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)]'
                : shieldTheme === 'legit'
                ? 'bg-gradient-to-b from-[#061812] via-[#04100c] to-[#030806] border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                : shieldTheme === 'warning'
                ? 'bg-gradient-to-b from-[#191106] via-[#110c04] to-[#080502] border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.25)]'
                : 'bg-gradient-to-b from-[#0b101c] via-[#070b14] to-[#04060b] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            }`}
          >
            <div className="h-[250px] sm:h-[280px] w-full relative">
              <CrystallineShield3D
                className="w-full h-full"
                verdictTheme={shieldTheme}
                isScanning={isVerifying}
                isShattered={isShieldShattered}
                burstTrigger={shieldBurstTrigger}
                showControls={true}
                badgeLabel={
                  shieldTheme === 'scam'
                    ? '3D AEGIS: RED BURST DEFLECTION'
                    : shieldTheme === 'legit'
                    ? '3D AEGIS: GREEN BURST HARDENED'
                    : shieldTheme === 'warning'
                    ? '3D AEGIS: AMBER CAUTION PULSE'
                    : '3D AEGIS THREAT MONITOR'
                }
                onClick={() => {
                  if (shieldTheme === 'scam') {
                    soundFX.scamThreatBurst();
                  } else if (shieldTheme === 'legit') {
                    soundFX.legitShieldBurst();
                  } else {
                    soundFX.scan();
                  }
                }}
              />
            </div>
          </div>

          {/* 1. DECISIVE VERDICT BANNER ("SHOULD AVOID OR NOT") */}
          <TiltCard3D
            maxTilt={5}
            scale={1.01}
            id="verdictBanner"
            className={`rounded-xl p-5 border shadow-xl flex flex-col gap-4 relative overflow-hidden transition-all card-3d-bevel ${
              isAvoid
                ? 'bg-[#181014] border-[#EF4444]/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
                : 'bg-[#0a1815] border-[#10B981]/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
            }`}
          >
            {/* Top Bar: Source badge and score */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider ${
                    isAvoid
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                      : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-ping ${isAvoid ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                  />
                  VERDICT: {verdictText}
                </span>

                {/* Source Badge as explicitly requested */}
                <span className="px-2.5 py-1 rounded bg-[#06b6d4]/10 text-[#4cd7f6] border border-[#06b6d4]/30 font-['JetBrains_Mono'] text-xs font-semibold">
                  Source: Google AI Studio
                </span>

                {(aiResult?.latencyMs !== undefined || lastAnalysisDuration !== null) && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-['JetBrains_Mono'] text-[11px]">
                    <span className="text-cyan-400">⚡</span>
                    {((aiResult?.latencyMs ?? lastAnalysisDuration ?? 0) / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-['JetBrains_Mono'] text-xs text-[#64748B]">RISK INDEX:</span>
                <span
                  className={`font-['Space_Grotesk'] text-xl font-bold ${
                    isAvoid ? 'text-[#EF4444]' : 'text-[#10B981]'
                  }`}
                >
                  {riskScore}/100
                </span>
              </div>
            </div>

            {/* Main Decision Callout */}
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  isAvoid ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'
                }`}
              >
                {isAvoid ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-['Space_Grotesk'] text-lg md:text-xl font-bold ${
                      isAvoid ? 'text-[#EF4444]' : 'text-[#10B981]'
                    }`}
                  >
                    {isAvoid ? 'SHOULD AVOID (DO NOT PROCEED)' : 'SAFE TO PROCEED (VERIFIED)'}
                  </span>
                </div>
                <h3 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#F8FAFC]">
                  {aiResult?.headline || 'Threat Analysis Completed'}
                </h3>
                {aiResult?.threatCategory && (
                  <span className="font-['JetBrains_Mono'] text-xs text-[#ffb95f]">
                    Category: {aiResult.threatCategory}
                  </span>
                )}
              </div>
            </div>

            {/* "THIS COULD BE THE REASON" High-Contrast Callout Box */}
            <div className="p-4 rounded-lg bg-[#06090E]/90 border border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#ffb95f] font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                <span>Primary Reason &amp; Vector:</span>
              </div>
              <p className="text-sm font-['JetBrains_Mono'] text-[#dfe2ee] leading-relaxed">
                {aiResult?.primaryReason ||
                  'Analysis shows strong psychological coercion and deceptive signatures. Treat with extreme caution.'}
              </p>
            </div>

            {/* "WHY YOU SHOULD AVOID" Deep Dive */}
            {isAvoid && aiResult?.avoidReasoning && (
              <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/25 flex flex-col gap-1.5">
                <div className="text-xs font-['JetBrains_Mono'] font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Why You Should Avoid:</span>
                </div>
                <p className="text-xs md:text-sm text-[#F8FAFC] leading-relaxed">
                  {aiResult.avoidReasoning}
                </p>
              </div>
            )}
          </TiltCard3D>

          {/* 2. SPECIFIC INDICATORS & TECHNICAL RED FLAGS */}
          <div className="bg-[#111827] rounded-xl p-4 md:p-5 border border-white/8 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#4cd7f6]" />
                <h3 className="font-['Space_Grotesk'] text-sm md:text-base font-bold text-[#F8FAFC]">
                  Security Checks &amp; Detection Breakdown
                </h3>
              </div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748B]">
                {aiResult?.indicators?.length || 4} Checks Evaluated
              </span>
            </div>

            {/* Indicators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {aiResult?.indicators && aiResult.indicators.length > 0 ? (
                aiResult.indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#06090E] border border-white/5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-['Space_Grotesk'] text-xs font-bold text-[#F8FAFC]">
                        {ind.label}
                      </span>
                      <span
                        className={`font-['JetBrains_Mono'] text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          ind.status === 'danger'
                            ? 'bg-[#EF4444]/20 text-[#EF4444]'
                            : ind.status === 'warning'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                            : 'bg-[#10B981]/20 text-[#10B981]'
                        }`}
                      >
                        {ind.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed">{ind.explanation}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-xs text-[#64748B]">No custom indicators detected.</div>
              )}
            </div>

            {/* Detailed Reasons Bullet List */}
            {aiResult?.detailedReasons && aiResult.detailedReasons.length > 0 && (
              <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-2">
                <span className="text-xs font-['JetBrains_Mono'] text-[#4cd7f6] uppercase font-semibold">
                  Detailed Findings:
                </span>
                <ul className="space-y-1.5 text-xs text-[#dfe2ee]">
                  {aiResult.detailedReasons.map((reason, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-[#ffb95f] mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 3. DEFENSIVE ACTION PROTOCOL PLAYBOOK */}
          <div className="bg-[#1c2028]/90 rounded-xl p-4 md:p-5 border border-white/8 relative overflow-hidden flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <h3 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-[#F8FAFC]">
                  Safe Action Protocol: What To Do
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] font-['JetBrains_Mono'] text-[11px] border border-[#10B981]/30 font-semibold">
                RECOMMENDED STEPS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {(aiResult?.recommendedActions || [
                'Do not scan, click, or open the payload.',
                'Verify claims independently through official channels.',
                'Report the smishing/phishing payload to your carrier or security team.',
                'Quarantine and block sender communications.',
              ]).map((act, aIdx) => (
                <div key={aIdx} className="flex items-start gap-2.5 p-3 rounded bg-[#06090E]/60 border border-white/5">
                  <div className="w-6 h-6 rounded bg-[#10B981]/20 text-[#10B981] font-['JetBrains_Mono'] text-xs flex items-center justify-center shrink-0 font-bold">
                    0{aIdx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#F8FAFC]">{act}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation CTA to Phishing Simulator */}
            {onNavigate && (
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 text-xs text-[#94A3B8]">
                <span>Want to practice catching similar lookalike scams?</span>
                <button
                  onClick={() => onNavigate('simulator')}
                  className="inline-flex items-center gap-1 text-[#4cd7f6] hover:underline font-['JetBrains_Mono'] font-semibold cursor-pointer"
                >
                  Launch Simulator Arena
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
