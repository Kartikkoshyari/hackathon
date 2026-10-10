import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { NavigationTab, RiskLevel } from '../types';
import { soundFX } from '../utils/soundEffects';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  ExternalLink,
  Zap,
  Activity,
  Layers,
  Info,
  Maximize2,
  Play,
  Pause,
  X,
} from 'lucide-react';

export interface ThreatNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'root' | 'hub' | 'threat';
  riskLevel?: RiskLevel;
  score?: number;
  category?: string;
  channel?: 'Link' | 'QR' | 'Email' | 'SMS' | 'Web' | 'Social';
  target?: string;
  tactic?: string;
  details?: string;
  radius: number;
  color: string;
}

export interface ThreatLink extends d3.SimulationLinkDatum<ThreatNode> {
  source: string | ThreatNode;
  target: string | ThreatNode;
  strength?: number;
  isCrossLink?: boolean;
}

interface ThreatNetworkMapProps {
  onNavigate?: (tab: NavigationTab, payload?: string) => void;
  className?: string;
}

// Curated comprehensive threat dataset with categorical hubs
const BASE_NODES: ThreatNode[] = [
  // Root Central Hub
  {
    id: 'root-matrix',
    label: 'ScamShield Defense Matrix',
    type: 'root',
    radius: 28,
    color: '#38bdf8',
    details: 'Central heuristic evaluation and real-time packet telemetry engine.',
  },

  // Category Hub 1: Critical (Tier 1)
  {
    id: 'hub-critical',
    label: 'Critical Threats (Tier 1)',
    type: 'hub',
    riskLevel: 'critical',
    score: 95,
    radius: 20,
    color: '#ef4444',
    category: 'Active Exploit & Credential Theft',
    details: 'High-severity vectors designed for immediate financial loss or account takeover.',
  },

  // Category Hub 2: Suspicious (Tier 2)
  {
    id: 'hub-warning',
    label: 'Suspicious Vectors (Tier 2)',
    type: 'hub',
    riskLevel: 'warning',
    score: 65,
    radius: 18,
    color: '#f59e0b',
    category: 'Urgency & Micro-Charge Baits',
    details: 'Elevated risk payloads requiring heightened skepticism and secondary channel validation.',
  },

  // Category Hub 3: Safe / Benign (Tier 3)
  {
    id: 'hub-safe',
    label: 'Verified Benign (Tier 3)',
    type: 'hub',
    riskLevel: 'safe',
    score: 5,
    radius: 17,
    color: '#10b981',
    category: 'Cryptographically Verified Safe',
    details: 'Authentic communications from validated domain authorities with legitimate signatures.',
  },

  // Leaf Threats: Critical
  {
    id: 't-chase',
    label: 'Chase Banking Phish',
    type: 'threat',
    riskLevel: 'critical',
    score: 98,
    channel: 'SMS',
    category: 'Credential Harvesting',
    target: 'chase-security-verify882.xyz/login',
    tactic: 'Domain Spoofing & Urgent Lockout',
    radius: 13,
    color: '#ef4444',
    details: 'Lookalike homograph domain hosted on unencrypted infrastructure harvesting Chase usernames.',
  },
  {
    id: 't-quish',
    label: 'Parking Meter Quishing',
    type: 'threat',
    riskLevel: 'critical',
    score: 96,
    channel: 'QR',
    category: 'Physical Skimming Trap',
    target: 'http://pay-fast.top/qr-meter?p=89',
    tactic: 'Physical Sticker Overlay',
    radius: 13,
    color: '#ef4444',
    details: 'Deceptive QR code affixed over legitimate public parking meters routing to payment skimmers.',
  },
  {
    id: 't-payroll',
    label: 'Workday BEC Payroll',
    type: 'threat',
    riskLevel: 'critical',
    score: 94,
    channel: 'Email',
    category: 'Executive Impersonation (BEC)',
    target: 'payroll-update@workday-secure8.com',
    tactic: 'Direct Deposit Redirection',
    radius: 12,
    color: '#ef4444',
    details: 'Spoofed HR communication attempting to redirect employee direct deposit accounts.',
  },
  {
    id: 't-netflix',
    label: 'Netflix Account Smish',
    type: 'threat',
    riskLevel: 'critical',
    score: 92,
    channel: 'SMS',
    category: 'Recurring Billing Decoy',
    target: 'netflix-auth-update-bill.cc/card',
    tactic: 'Fabricated Payment Failure',
    radius: 12,
    color: '#ef4444',
    details: 'Fake subscription suspension SMS baiting credit card numbers and security CVVs.',
  },
  {
    id: 't-onedrive',
    label: 'OneDrive Credential Trap',
    type: 'threat',
    riskLevel: 'critical',
    score: 95,
    channel: 'Link',
    category: 'OAuth Token Theft',
    target: 'https://microsoft-onedrive-share.online/doc',
    tactic: 'Fake Encrypted Document',
    radius: 12,
    color: '#ef4444',
    details: 'Simulated corporate file share requesting Microsoft 365 credentials to unlock viewer.',
  },
  {
    id: 't-bec-wire',
    label: 'CEO Wire Transfer Bait',
    type: 'threat',
    riskLevel: 'critical',
    score: 99,
    channel: 'Email',
    category: 'Executive Impersonation',
    target: 'ceo-desk@board-urgent-wire.net',
    tactic: 'High-Pressure Financial Coercion',
    radius: 13,
    color: '#ef4444',
    details: 'Urgent acquisition settlement instruction targeted at finance teams to bypass audit approval.',
  },
  {
    id: 't-paypal',
    label: 'PayPal Resolution Phish',
    type: 'threat',
    riskLevel: 'critical',
    score: 97,
    channel: 'Link',
    category: 'Account Limitation Trap',
    target: 'paypal-auth-resolution.cc/secure',
    tactic: 'Identity Document Skimming',
    radius: 12,
    color: '#ef4444',
    details: 'Phishing clone requesting passport and driver license photos under false verification pretext.',
  },

  // Leaf Threats: Warning / Suspicious
  {
    id: 't-usps',
    label: 'USPS Parcel Micro-Fee',
    type: 'threat',
    riskLevel: 'warning',
    score: 65,
    channel: 'SMS',
    category: 'Micro-Charge Smishing',
    target: 'post-parcel-verify.info',
    tactic: 'Low Resistance $1.85 Charge',
    radius: 11,
    color: '#f59e0b',
    details: 'Incomplete address lure demanding a trivial $1.85 fee to harvest debit card numbers.',
  },
  {
    id: 't-dhl',
    label: 'DHL Express Redirection',
    type: 'threat',
    riskLevel: 'warning',
    score: 72,
    channel: 'Link',
    category: 'Delivery Impersonation',
    target: 'dhl-tracking-express8.top/reschedule',
    tactic: 'Free .top Domain Anomaly',
    radius: 11,
    color: '#f59e0b',
    details: 'Lookalike package delivery status tracking hosted on free ephemeral top-level domain.',
  },
  {
    id: 't-invoice-pdf',
    label: 'Fake GeekSquad Invoice',
    type: 'threat',
    riskLevel: 'warning',
    score: 68,
    channel: 'Email',
    category: 'Refund Callback Trap',
    target: 'invoice-billing-autorenew49.pdf',
    tactic: 'Urgent 800 Call-Center Bait',
    radius: 11,
    color: '#f59e0b',
    details: 'Fabricated $499 auto-renewal invoice instructing user to dial fraudulent support desk.',
  },
  {
    id: 't-shortener',
    label: 'Obfuscated Bitly Lure',
    type: 'threat',
    riskLevel: 'warning',
    score: 60,
    channel: 'Link',
    category: 'Link Shortener Masking',
    target: 'bit.ly/claim-promo-winner9',
    tactic: 'Double Redirect Evasion',
    radius: 10,
    color: '#f59e0b',
    details: 'Shortened link that bounces through 3 intermediate ad trackers before terminal destination.',
  },
  {
    id: 't-airdrop',
    label: 'Crypto Airdrop Bot',
    type: 'threat',
    riskLevel: 'warning',
    score: 74,
    channel: 'Social',
    category: 'Wallet Drainer Web3 Trap',
    target: 'eth-airdrop-bonus.org/connect',
    tactic: 'Smart Contract Signature Exploit',
    radius: 11,
    color: '#f59e0b',
    details: 'Simulated token giveaway prompting blind signature to drain ERC-20 token permissions.',
  },
  {
    id: 't-urgent-doc',
    label: 'DocuSign Sign Request',
    type: 'threat',
    riskLevel: 'warning',
    score: 63,
    channel: 'Email',
    category: 'Unverified Signature Link',
    target: 'docusign-envelope-review.net/view',
    tactic: 'Confidentiality Pressure',
    radius: 10,
    color: '#f59e0b',
    details: 'Urgent contract signature request originating from non-DocuSign mail exchange servers.',
  },

  // Leaf Threats: Safe / Verified
  {
    id: 't-gcloud',
    label: 'Google Cloud Security',
    type: 'threat',
    riskLevel: 'safe',
    score: 0,
    channel: 'Web',
    category: 'Official Infrastructure Portal',
    target: 'https://cloud.google.com/security',
    tactic: 'Cryptographic Authenticity',
    radius: 11,
    color: '#10b981',
    details: 'Official, certificate-pinned Google Cloud documentation and security advisory portal.',
  },
  {
    id: 't-chase-legit',
    label: 'Chase Bank Official',
    type: 'threat',
    riskLevel: 'safe',
    score: 2,
    channel: 'Web',
    category: 'Authoritative Financial Host',
    target: 'https://chase.com',
    tactic: 'EV SSL Validated',
    radius: 11,
    color: '#10b981',
    details: 'Genuine JPMorgan Chase web portal protected by multi-factor hardware security tokens.',
  },
  {
    id: 't-workday-legit',
    label: 'Workday Corporate SSO',
    type: 'threat',
    riskLevel: 'safe',
    score: 4,
    channel: 'Web',
    category: 'Enterprise SAML Portal',
    target: 'https://workday.com',
    tactic: 'Trusted IdP Authenticated',
    radius: 11,
    color: '#10b981',
    details: 'Authoritative Workday cloud application matching organization federation metadata.',
  },
  {
    id: 't-usps-legit',
    label: 'USPS Genuine Tracking',
    type: 'threat',
    riskLevel: 'safe',
    score: 1,
    channel: 'Web',
    category: 'Federal Postal Service Host',
    target: 'https://tools.usps.com/go/TrackConfirmAction',
    tactic: 'Official .gov/.com Domain',
    radius: 10,
    color: '#10b981',
    details: 'Official United States Postal Service package tracking tool with no micro-charge prompts.',
  },
  {
    id: 't-github-advisory',
    label: 'GitHub Security Advisories',
    type: 'threat',
    riskLevel: 'safe',
    score: 0,
    channel: 'Web',
    category: 'Public Vulnerability Database',
    target: 'https://github.com/advisories',
    tactic: 'Verified Community Database',
    radius: 10,
    color: '#10b981',
    details: 'Authoritative Open Source CVE and dependency audit repository managed by GitHub.',
  },
];

const BASE_LINKS: ThreatLink[] = [
  // Root to Hubs
  { source: 'root-matrix', target: 'hub-critical', strength: 0.9 },
  { source: 'root-matrix', target: 'hub-warning', strength: 0.9 },
  { source: 'root-matrix', target: 'hub-safe', strength: 0.9 },

  // Critical Hub to Leaves
  { source: 'hub-critical', target: 't-chase' },
  { source: 'hub-critical', target: 't-quish' },
  { source: 'hub-critical', target: 't-payroll' },
  { source: 'hub-critical', target: 't-netflix' },
  { source: 'hub-critical', target: 't-onedrive' },
  { source: 'hub-critical', target: 't-bec-wire' },
  { source: 'hub-critical', target: 't-paypal' },

  // Warning Hub to Leaves
  { source: 'hub-warning', target: 't-usps' },
  { source: 'hub-warning', target: 't-dhl' },
  { source: 'hub-warning', target: 't-invoice-pdf' },
  { source: 'hub-warning', target: 't-shortener' },
  { source: 'hub-warning', target: 't-airdrop' },
  { source: 'hub-warning', target: 't-urgent-doc' },

  // Safe Hub to Leaves
  { source: 'hub-safe', target: 't-gcloud' },
  { source: 'hub-safe', target: 't-chase-legit' },
  { source: 'hub-safe', target: 't-workday-legit' },
  { source: 'hub-safe', target: 't-usps-legit' },
  { source: 'hub-safe', target: 't-github-advisory' },

  // Cross-Cluster Campaign Correlations
  { source: 't-chase', target: 't-paypal', isCrossLink: true },
  { source: 't-payroll', target: 't-bec-wire', isCrossLink: true },
  { source: 't-usps', target: 't-dhl', isCrossLink: true },
  { source: 't-chase', target: 't-chase-legit', isCrossLink: true },
  { source: 't-usps', target: 't-usps-legit', isCrossLink: true },
];

export const ThreatNetworkMap: React.FC<ThreatNetworkMapProps> = ({
  onNavigate,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [filterRisk, setFilterRisk] = useState<'ALL' | RiskLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<ThreatNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ThreatNode | null>(null);
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);

  // Filtered dataset
  const { filteredNodes, filteredLinks } = useMemo(() => {
    let nodes = [...BASE_NODES];

    if (filterRisk !== 'ALL') {
      nodes = nodes.filter(
        (n) => n.type === 'root' || n.riskLevel === filterRisk
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.type === 'root' ||
          n.type === 'hub' ||
          n.label.toLowerCase().includes(q) ||
          (n.target && n.target.toLowerCase().includes(q)) ||
          (n.category && n.category.toLowerCase().includes(q))
      );
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = BASE_LINKS.filter(
      (l) =>
        nodeIds.has(typeof l.source === 'string' ? l.source : l.source.id) &&
        nodeIds.has(typeof l.target === 'string' ? l.target : l.target.id)
    );

    return { filteredNodes: nodes, filteredLinks: links };
  }, [filterRisk, searchQuery]);

  // D3 force simulation setup
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!svg.node() || !container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    svg.selectAll('*').remove();

    // Defs for glowing drop-shadows & gradients
    const defs = svg.append('defs');

    // Glow filters
    const createGlowFilter = (id: string, color: string, stdDev: number = 3.5) => {
      const filter = defs.append('filter').attr('id', id).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      filter.append('feGaussianBlur').attr('stdDeviation', stdDev).attr('result', 'coloredBlur');
      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    };

    createGlowFilter('glow-root', '#38bdf8', 5);
    createGlowFilter('glow-critical', '#ef4444', 4.5);
    createGlowFilter('glow-warning', '#f59e0b', 4);
    createGlowFilter('glow-safe', '#10b981', 3.5);

    // Zoom container
    const g = svg.append('g').attr('class', 'network-canvas');

    // Setup D3 Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    svg.on('click', () => {
      setSelectedNode(null);
    });

    // Initial transform: centered
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9)
    );

    // Clone data for simulation
    const nodesData: ThreatNode[] = filteredNodes.map((d) => ({ ...d }));
    const linksData: ThreatLink[] = filteredLinks.map((d) => ({ ...d }));

    // Force simulation
    const simulation = d3
      .forceSimulation<ThreatNode>(nodesData)
      .force(
        'link',
        d3
          .forceLink<ThreatNode, ThreatLink>(linksData)
          .id((d) => d.id)
          .distance((d) => {
            const isRootLink =
              (typeof d.source === 'object' && d.source.type === 'root') ||
              (typeof d.target === 'object' && d.target.type === 'root');
            if (isRootLink) return 130;
            if (d.isCrossLink) return 170;
            return 80;
          })
          .strength((d) => (d.isCrossLink ? 0.2 : 0.85))
      )
      .force('charge', d3.forceManyBody().strength((d: any) => (d.type === 'root' ? -550 : d.type === 'hub' ? -380 : -160)))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 18).iterations(2))
      .force('center', d3.forceCenter(0, 0).strength(0.06))
      .alphaDecay(0.025);

    if (isSimulationPaused) {
      simulation.stop();
    }

    // Render Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.isCrossLink) return 'rgba(255, 255, 255, 0.25)';
        const targetNode = nodesData.find((n) => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
        if (targetNode?.riskLevel === 'critical') return 'rgba(239, 68, 68, 0.45)';
        if (targetNode?.riskLevel === 'warning') return 'rgba(245, 158, 11, 0.45)';
        if (targetNode?.riskLevel === 'safe') return 'rgba(16, 185, 129, 0.45)';
        return 'rgba(56, 189, 248, 0.45)';
      })
      .attr('stroke-width', (d) => (d.isCrossLink ? 1.2 : 1.8))
      .attr('stroke-dasharray', (d) => (d.isCrossLink ? '4,4' : 'none'))
      .attr('stroke-linecap', 'round');

    // Drag behavior for nodes
    const drag = d3
      .drag<SVGGElement, ThreatNode>()
      .on('start', (event, d) => {
        if (!event.active && !isSimulationPaused) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && !isSimulationPaused) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Render Nodes
    const nodeGroup = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer')
      .call(drag as any)
      .on('click', (event, d) => {
        event.stopPropagation();
        soundFX.click();
        setSelectedNode(d);
      })
      .on('mouseenter', (_event, d) => {
        setHoveredNode(d);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      });

    // Pulsing aura ring for Critical Hub and Root
    nodeGroup
      .filter((d) => d.type === 'root' || d.riskLevel === 'critical')
      .append('circle')
      .attr('r', (d) => d.radius + 8)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)
      .attr('class', 'animate-pulse');

    // Main Circle Shape
    nodeGroup
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (d.type === 'root') return '#0284c7';
        if (d.type === 'hub') return d.color;
        return '#090d16';
      })
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.type === 'threat' ? 2.2 : 3))
      .attr('filter', (d) => {
        if (d.type === 'root') return 'url(#glow-root)';
        if (d.riskLevel === 'critical') return 'url(#glow-critical)';
        if (d.riskLevel === 'warning') return 'url(#glow-warning)';
        return 'url(#glow-safe)';
      });

    // Node glyphs / channel icons
    nodeGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#ffffff')
      .attr('font-size', (d) => (d.type === 'root' ? '12px' : d.type === 'hub' ? '10px' : '9px'))
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .text((d) => {
        if (d.type === 'root') return 'CORE';
        if (d.type === 'hub') {
          return d.riskLevel === 'critical' ? 'T1' : d.riskLevel === 'warning' ? 'T2' : 'T3';
        }
        return d.channel || '●';
      });

    // Node Text Labels
    nodeGroup
      .append('text')
      .attr('dy', (d) => d.radius + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', (d) => (d.type === 'root' ? '12px' : d.type === 'hub' ? '11px' : '9.5px'))
      .attr('font-family', 'Space Grotesk, sans-serif')
      .attr('font-weight', (d) => (d.type === 'threat' ? '500' : '700'))
      .attr('pointer-events', 'none')
      .text((d) => d.label);

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, isSimulationPaused]);

  // Zoom Actions
  const handleZoom = (factor: number) => {
    soundFX.click();
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, factor);
  };

  const handleResetZoom = () => {
    soundFX.click();
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    svg
      .transition()
      .duration(450)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9)
      );
  };

  const activeFocusNode = selectedNode || hoveredNode;

  return (
    <div
      className={`relative w-full rounded-2xl bg-gradient-to-b from-[#0e1322] via-[#090d16] to-[#05070c] border border-white/10 shadow-2xl overflow-hidden flex flex-col ${className}`}
    >
      {/* TOP CONTROL DECK */}
      <div className="p-4 md:px-6 md:py-4 border-b border-white/10 bg-[#080c14]/90 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-['Space_Grotesk'] text-base md:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Interactive D3.js Threat Network Map
            </h3>
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-['JetBrains_Mono'] text-[10px] border border-cyan-500/30">
              FORCE-DIRECTED
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Topology map clustering active threat payloads by risk classification and attack channels. Drag nodes to inspect relationships.
          </p>
        </div>

        {/* Filter Pills & Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1 bg-[#05070a] p-1 rounded-lg border border-white/10 text-xs font-['JetBrains_Mono']">
            <button
              type="button"
              onClick={() => {
                soundFX.click();
                setFilterRisk('ALL');
              }}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                filterRisk === 'ALL'
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All ({BASE_NODES.filter((n) => n.type === 'threat').length})
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.click();
                setFilterRisk('critical');
              }}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                filterRisk === 'critical'
                  ? 'bg-red-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'text-red-400 hover:bg-red-950/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Critical
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.click();
                setFilterRisk('warning');
              }}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                filterRisk === 'warning'
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Suspicious
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.click();
                setFilterRisk('safe');
              }}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                filterRisk === 'safe'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Safe
            </button>
          </div>

          {/* Canvas Navigation Buttons */}
          <div className="flex items-center gap-1 bg-[#05070a] p-1 rounded-lg border border-white/10 text-neutral-300">
            <button
              type="button"
              onClick={() => handleZoom(1.3)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(0.75)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.click();
                setIsSimulationPaused(!isSimulationPaused);
              }}
              className="p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title={isSimulationPaused ? 'Resume Physics' : 'Freeze Physics'}
            >
              {isSimulationPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* D3 SVG VISUALIZATION CANVAS */}
      <div
        ref={containerRef}
        className="w-full h-[520px] relative select-none cursor-grab active:cursor-grabbing overflow-hidden"
      >
        {/* Ambient Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg ref={svgRef} className="w-full h-full block" />

        {/* Legend Overlay at Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-[11px] font-['JetBrains_Mono'] flex flex-col gap-1.5 pointer-events-none z-10 shadow-lg">
          <span className="text-neutral-400 uppercase tracking-wider text-[9px] font-bold">
            Risk Tier Classification
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              Critical (7)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              Suspicious (6)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Verified (5)
            </span>
          </div>
        </div>

        {/* Tactical Search Filter Input at Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/10 text-xs focus-within:border-cyan-500/50 shadow-lg">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threat node..."
              className="bg-transparent text-white placeholder:text-neutral-500 text-xs font-mono focus:outline-none w-32 sm:w-44"
            />
          </div>
        </div>

        {/* Interactive Node Telemetry Card Drawer at Bottom Right */}
        {activeFocusNode && (
          <div className="absolute top-3 right-3 max-w-sm w-full bg-black/90 backdrop-blur-xl p-4 rounded-xl border border-white/15 shadow-2xl z-20 animate-in fade-in slide-in-from-right-2 text-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-ping"
                  style={{ backgroundColor: activeFocusNode.color }}
                />
                <span
                  className="font-['JetBrains_Mono'] font-bold uppercase tracking-wider text-[11px]"
                  style={{ color: activeFocusNode.color }}
                >
                  {activeFocusNode.riskLevel
                    ? `${activeFocusNode.riskLevel.toUpperCase()} RISK`
                    : activeFocusNode.type.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeFocusNode.score !== undefined && (
                  <span className="font-['Space_Grotesk'] font-bold text-sm text-white">
                    Score: {activeFocusNode.score}/100
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.click();
                    setSelectedNode(null);
                    setHoveredNode(null);
                  }}
                  className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-['Space_Grotesk'] text-base font-bold text-white">
                {activeFocusNode.label}
              </h4>
              {activeFocusNode.category && (
                <span className="text-[11px] font-mono text-cyan-400">
                  Category: {activeFocusNode.category}
                </span>
              )}
            </div>

            {activeFocusNode.target && (
              <div className="p-2 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-neutral-300 break-all select-all">
                Payload: {activeFocusNode.target}
              </div>
            )}

            {activeFocusNode.details && (
              <p className="text-[11px] text-neutral-300 leading-relaxed font-['Inter']">
                {activeFocusNode.details}
              </p>
            )}

            {activeFocusNode.tactic && (
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                <span className="text-amber-400 font-bold">Vector:</span>
                <span>{activeFocusNode.tactic}</span>
              </div>
            )}

            {activeFocusNode.type === 'threat' && onNavigate && (
              <button
                type="button"
                onClick={() => {
                  soundFX.click();
                  onNavigate('analyzer', activeFocusNode.target || activeFocusNode.label);
                }}
                className="mt-1 w-full py-2 rounded-lg bg-white text-black hover:bg-neutral-200 font-['Space_Grotesk'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Verify Payload in Threat Engine</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
