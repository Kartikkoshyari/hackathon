import React, { useEffect, useRef, useState } from 'react';
import { soundFX } from '../utils/soundEffects';

export interface ThreatPin {
  lat: number;
  lon: number;
  label: string;
  threatType: string;
  risk: number;
  color: string;
  target?: string;
  vector?: string;
}

export const GLOBAL_THREAT_PINS: ThreatPin[] = [
  { lat: 37.77, lon: -122.42, label: 'San Francisco', threatType: 'Quishing QR Skim', risk: 96, color: '#ef4444', target: 'http://pay-fast.top/qr-payment?spot=81', vector: 'QR Quishing' },
  { lat: 40.71, lon: -74.01, label: 'New York', threatType: 'Chase Bank Spoof', risk: 98, color: '#ef4444', target: 'https://chase-security-verify882.xyz/login', vector: 'Credential Phishing' },
  { lat: 51.51, lon: -0.13, label: 'London', threatType: 'HMRC Tax Refund Trap', risk: 92, color: '#f59e0b', target: 'https://hmrc-tax-refund-gov.co/claim', vector: 'Tax Smishing' },
  { lat: 50.11, lon: 8.68, label: 'Frankfurt', threatType: 'Workday BEC Redirection', risk: 95, color: '#ef4444', target: 'https://workday-sso-auth99.net/portal', vector: 'Corporate BEC' },
  { lat: 35.68, lon: 139.69, label: 'Tokyo', threatType: 'Amazon Account Lockout', risk: 91, color: '#ffffff', target: 'https://amazon-jp-security.club/re-auth', vector: 'Account Takeover' },
  { lat: 1.35, lon: 103.82, label: 'Singapore', threatType: 'Telegram Session Stealer', risk: 94, color: '#f59e0b', target: 'https://t-me-login-security.info', vector: 'Session Hijack' },
  { lat: -33.87, lon: 151.21, label: 'Sydney', threatType: 'MyGov Smishing Vector', risk: 93, color: '#10b981', target: 'https://mygov-au-portal.link', vector: 'Gov Impersonation' },
  { lat: 19.43, lon: -99.13, label: 'Mexico City', threatType: 'WhatsApp Impersonation', risk: 89, color: '#f59e0b', target: 'https://wa-verify-chat.site', vector: 'Social Smishing' },
  { lat: 28.61, lon: 77.21, label: 'New Delhi', threatType: 'Electricity Bill Smishing', risk: 97, color: '#ef4444', target: 'https://power-bill-payment.biz', vector: 'Utility Fraud' },
  { lat: 25.20, lon: 55.27, label: 'Dubai', threatType: 'Courier Fee Micro-Charge', risk: 90, color: '#ffffff', target: 'https://emirates-post-track.online', vector: 'Delivery Phish' },
];

// Major continental bounding regions for dense 3D particle generation
const CONTINENT_ZONES = [
  // North America
  { minLat: 15, maxLat: 70, minLon: -165, maxLon: -55, density: 440 },
  // South America
  { minLat: -55, maxLat: 12, minLon: -80, maxLon: -35, density: 260 },
  // Europe
  { minLat: 36, maxLat: 71, minLon: -10, maxLon: 45, density: 360 },
  // Asia
  { minLat: 5, maxLat: 72, minLon: 45, maxLon: 145, density: 600 },
  // Africa
  { minLat: -35, maxLat: 37, minLon: -18, maxLon: 52, density: 380 },
  // Australia / Oceania
  { minLat: -44, maxLat: -10, minLon: 112, maxLon: 154, density: 200 },
];

interface Point3D {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  isLand: boolean;
  baseColor: string;
}

export const CyberGlobe3D: React.FC<{
  className?: string;
  height?: number;
  interactive?: boolean;
  onSelectThreat?: (threat: ThreatPin) => void;
}> = ({ className = '', height = 480, interactive = true, onSelectThreat }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activePin, setActivePin] = useState<ThreatPin | null>(GLOBAL_THREAT_PINS[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(true);

  // Rotation state stored in refs for 60fps loop
  const rotRef = useRef({
    x: 0.25, // tilt angle (pitch)
    y: -0.6, // rotation angle (yaw)
    targetX: 0.25,
    targetY: -0.6,
    vx: 0,
    vy: 0.003, // constant gentle rotation
    lastMouseX: 0,
    lastMouseY: 0,
    isInteracting: false,
    hasTarget: false,
  });

  const focusRegion = (region: 'americas' | 'europe' | 'apac' | 'free') => {
    soundFX.click();
    const rot = rotRef.current;
    if (region === 'free') {
      setIsAutoSpin(true);
      rot.hasTarget = false;
      return;
    }
    setIsAutoSpin(false);
    rot.hasTarget = true;
    if (region === 'americas') {
      rot.targetX = 0.35;
      rot.targetY = 1.65;
      setActivePin(GLOBAL_THREAT_PINS[0]);
    } else if (region === 'europe') {
      rot.targetX = 0.45;
      rot.targetY = -0.15;
      setActivePin(GLOBAL_THREAT_PINS[2]);
    } else if (region === 'apac') {
      rot.targetX = 0.3;
      rot.targetY = -2.25;
      setActivePin(GLOBAL_THREAT_PINS[4]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let heightPx = (canvas.height = height);

    // Retina support
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = heightPx * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${heightPx}px`;
    ctx.scale(dpr, dpr);

    const radius = Math.min(width, heightPx) * 0.42;

    // Generate globe surface points
    const points: Point3D[] = [];

    // 1. Continental landmass points
    CONTINENT_ZONES.forEach((zone) => {
      for (let i = 0; i < zone.density; i++) {
        // Random lat/lon within continent bounds with clustering
        const lat = zone.minLat + Math.random() * (zone.maxLat - zone.minLat);
        const lon = zone.minLon + Math.random() * (zone.maxLon - zone.minLon);

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // Jitter slightly for natural depth
        const jitter = 0.98 + Math.random() * 0.04;
        points.push({
          x: x * jitter,
          y: y * jitter,
          z: z * jitter,
          size: Math.random() > 0.85 ? 2.2 : 1.3,
          alpha: 0.45 + Math.random() * 0.55,
          isLand: true,
          baseColor: Math.random() > 0.88 ? '#4cd7f6' : '#ffffff',
        });
      }
    });

    // 2. Uniform ambient grid points (spherical lattice)
    const latLines = 24;
    const lonLines = 48;
    for (let i = 0; i < latLines; i++) {
      const lat = -80 + (160 / latLines) * i;
      const phi = (90 - lat) * (Math.PI / 180);
      for (let j = 0; j < lonLines; j++) {
        const lon = -180 + (360 / lonLines) * j;
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        if (Math.random() > 0.6) {
          points.push({
            x,
            y,
            z,
            size: 0.9,
            alpha: 0.18,
            isLand: false,
            baseColor: '#64748b',
          });
        }
      }
    }

    // Convert threat pins to 3D points
    const threatPointData = GLOBAL_THREAT_PINS.map((pin) => {
      const phi = (90 - pin.lat) * (Math.PI / 180);
      const theta = (pin.lon + 180) * (Math.PI / 180);
      return {
        ...pin,
        x: -radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
      };
    });

    // Threat connection trajectories (Arcs)
    const arcs = [
      { from: 0, to: 1, progress: 0.2, speed: 0.008, color: '#ef4444' }, // SF -> NY
      { from: 1, to: 3, progress: 0.6, speed: 0.006, color: '#ef4444' }, // NY -> Frankfurt
      { from: 3, to: 2, progress: 0.8, speed: 0.007, color: '#f59e0b' }, // Frankfurt -> London
      { from: 4, to: 0, progress: 0.1, speed: 0.005, color: '#06b6d4' }, // Tokyo -> SF
      { from: 5, to: 6, progress: 0.4, speed: 0.009, color: '#10b981' }, // Singapore -> Sydney
      { from: 8, to: 9, progress: 0.5, speed: 0.008, color: '#ef4444' }, // Delhi -> Dubai
    ];

    let pulseTime = 0;

    // Resize observer
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      heightPx = height;
      canvas.width = width * dpr;
      canvas.height = heightPx * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${heightPx}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Render loop
    const render = () => {
      pulseTime += 0.03;
      const rot = rotRef.current;

      // Auto rotation when not dragging
      if (!rot.isInteracting) {
        if (rot.hasTarget) {
          rot.x += (rot.targetX - rot.x) * 0.08;
          rot.y += (rot.targetY - rot.y) * 0.08;
          if (Math.abs(rot.targetX - rot.x) < 0.005 && Math.abs(rot.targetY - rot.y) < 0.005) {
            rot.hasTarget = false;
          }
        } else if (isAutoSpin) {
          rot.y += rot.vy;
          rot.vx *= 0.94;
          rot.x += rot.vx;
          // Clamp pitch so globe doesn't invert
          rot.x = Math.max(-0.8, Math.min(0.8, rot.x));
        }
      }

      ctx.clearRect(0, 0, width, heightPx);

      const cx = width / 2;
      const cy = heightPx / 2;

      // 1. Draw atmospheric outer rim aura (Monochromatic frost styling)
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius * 1.35);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.025)');
      grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.008)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric outer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.02, 0, Math.PI * 2);
      ctx.stroke();

      // Precalculate trigonometry
      const cosX = Math.cos(rot.x);
      const sinX = Math.sin(rot.x);
      const cosY = Math.cos(rot.y);
      const sinY = Math.sin(rot.y);

      // Helper function for 3D rotation
      const project = (x: number, y: number, z: number) => {
        // Yaw (around Y axis)
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Pitch (around X axis)
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective factor
        const scale = 800 / (800 + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // 2. Draw Latitude / Orbit rings (like v1.png cyber rings)
      const ringLatitudes = [-30, 0, 30];
      ringLatitudes.forEach((lat) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const ringR = radius * Math.sin(phi);
        const ringY = radius * Math.cos(phi);

        ctx.beginPath();
        let first = true;
        for (let a = 0; a <= 64; a++) {
          const theta = (a / 64) * Math.PI * 2;
          const rx = ringR * Math.cos(theta);
          const rz = ringR * Math.sin(theta);
          const p = project(rx, ringY, rz);

          if (first) {
            ctx.moveTo(p.px, p.py);
            first = false;
          } else {
            ctx.lineTo(p.px, p.py);
          }
        }
        ctx.strokeStyle = lat === 0 ? 'rgba(76, 215, 246, 0.18)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = lat === 0 ? 1.2 : 0.8;
        ctx.stroke();
      });

      // 3. Project and sort all particles for depth
      interface RenderableDot {
        px: number;
        py: number;
        pz: number;
        size: number;
        alpha: number;
        color: string;
      }
      const dotsToRender: RenderableDot[] = [];

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const proj = project(pt.x, pt.y, pt.z);

        // Depth attenuation: points on back of globe are dimmer or culled
        if (proj.pz > -radius * 0.3) {
          const depthFactor = (proj.pz + radius) / (radius * 2);
          const finalAlpha = pt.alpha * Math.max(0.1, depthFactor);
          dotsToRender.push({
            px: proj.px,
            py: proj.py,
            pz: proj.pz,
            size: pt.size * proj.scale,
            alpha: finalAlpha,
            color: pt.baseColor,
          });
        }
      }

      // Render dots
      for (let i = 0; i < dotsToRender.length; i++) {
        const dot = dotsToRender[i];
        ctx.fillStyle = dot.color === '#ffffff' 
          ? `rgba(255, 255, 255, ${dot.alpha})`
          : `rgba(76, 215, 246, ${dot.alpha})`;
        ctx.beginPath();
        ctx.arc(dot.px, dot.py, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Render 3D Threat Arcs
      arcs.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1;
        const p1 = threatPointData[arc.from];
        const p2 = threatPointData[arc.to];

        const proj1 = project(p1.x, p1.y, p1.z);
        const proj2 = project(p2.x, p2.y, p2.z);

        // If either point is in visible front hemisphere
        if (proj1.pz > -50 || proj2.pz > -50) {
          // Midpoint elevated in 3D for spherical arc curve
          const midX = (p1.x + p2.x) * 0.5 * 1.32;
          const midY = (p1.y + p2.y) * 0.5 * 1.32;
          const midZ = (p1.z + p2.z) * 0.5 * 1.32;
          const projMid = project(midX, midY, midZ);

          // Draw spline arc
          ctx.beginPath();
          ctx.moveTo(proj1.px, proj1.py);
          ctx.quadraticCurveTo(projMid.px, projMid.py, proj2.px, proj2.py);
          ctx.strokeStyle = `${arc.color}33`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Pulse particle traversing the arc (Bézier formula)
          const t = arc.progress;
          const pulseX = (1 - t) * (1 - t) * proj1.px + 2 * (1 - t) * t * projMid.px + t * t * proj2.px;
          const pulseY = (1 - t) * (1 - t) * proj1.py + 2 * (1 - t) * t * projMid.py + t * t * proj2.py;

          ctx.fillStyle = arc.color;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 5. Render Threat Origin Pins & Radar Pings
      threatPointData.forEach((pin, idx) => {
        const proj = project(pin.x, pin.y, pin.z);

        // Only draw when visible in front hemisphere
        if (proj.pz > -radius * 0.15) {
          const depthRatio = (proj.pz + radius) / (radius * 2);
          const pinAlpha = Math.min(1, Math.max(0.2, depthRatio));

          // Animated pulse ring around pin
          const pingRadius = 3 + ((pulseTime * 8 + idx * 4) % 18);
          const pingAlpha = Math.max(0, 1 - pingRadius / 18) * pinAlpha;

          ctx.strokeStyle = pin.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, pingRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Pin Core Node
          ctx.fillStyle = pin.color;
          ctx.shadowColor = pin.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Pin Label for key threats in view
          if (proj.pz > 40 && depthRatio > 0.6) {
            ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.fillText(pin.label, proj.px + 8, proj.py - 2);

            ctx.fillStyle = pin.color;
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillText(`${pin.threatType} (${pin.risk}%)`, proj.px + 8, proj.py + 9);
          }
        }
      });

      // 6. Coordinates & Radar Sweep overlay (Tactical SOC aesthetic)
      ctx.fillStyle = 'rgba(76, 215, 246, 0.4)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`GEO-ORBIT: LAT ${(rot.x * 57.3).toFixed(1)}° | LON ${((rot.y * 57.3) % 360).toFixed(1)}°`, 16, heightPx - 16);
      ctx.fillText('3D THREAT RADAR // ACTIVE', width - 170, heightPx - 16);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [height]);

  // Pointer drag controls for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    rotRef.current.isInteracting = true;
    rotRef.current.lastMouseX = e.clientX;
    rotRef.current.lastMouseY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDragging) return;
    const dx = e.clientX - rotRef.current.lastMouseX;
    const dy = e.clientY - rotRef.current.lastMouseY;

    rotRef.current.y += dx * 0.007;
    rotRef.current.x += dy * 0.005;
    rotRef.current.vx = dy * 0.002;

    rotRef.current.lastMouseX = e.clientX;
    rotRef.current.lastMouseY = e.clientY;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    rotRef.current.isInteracting = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Floating 3D Control HUD Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-black/80 border border-white/15 text-white font-mono text-[10px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>3D SPHERICAL RADAR</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 font-mono text-[10px] flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span>LIVE THREAT MATRIX</span>
        </div>
      </div>

      {/* Region Fast Focus Selector Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
        {/* Active Pin Details Strip */}
        {activePin && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activePin.color }} />
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] font-bold text-white tracking-tight">
                  {activePin.label} <span className="text-neutral-400 font-normal text-[11px]">— {activePin.threatType}</span>
                </span>
                <span className="font-mono text-[9px] text-neutral-400">
                  RISK SCORE: <strong className="text-red-400">{activePin.risk}%</strong> | LATENCY: 0.4ms
                </span>
              </div>
            </div>

            {onSelectThreat && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.click();
                  onSelectThreat(activePin);
                }}
                className="px-2.5 py-1 rounded-full bg-white text-black font-semibold text-[11px] hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
              >
                Inspect Payload
              </button>
            )}
          </div>
        )}

        {/* Region Orbit Buttons */}
        <div className="flex items-center justify-between gap-1 p-1 rounded-full bg-[#080b12]/90 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusRegion('americas');
              }}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Americas
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusRegion('europe');
              }}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Europe
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                focusRegion('apac');
              }}
              className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Asia-Pac
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              focusRegion('free');
            }}
            className="px-2.5 py-1 rounded-full text-[10px] font-mono text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoSpin ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
            <span>{isAutoSpin ? 'Auto-Spin' : 'Free Orbit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
