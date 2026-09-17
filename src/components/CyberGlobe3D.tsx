import React, { useEffect, useRef, useState } from 'react';

interface ThreatPin {
  lat: number;
  lon: number;
  label: string;
  threatType: string;
  risk: number;
  color: string;
}

const GLOBAL_THREAT_PINS: ThreatPin[] = [
  { lat: 37.77, lon: -122.42, label: 'San Francisco', threatType: 'Quishing QR Skim', risk: 96, color: '#ef4444' },
  { lat: 40.71, lon: -74.01, label: 'New York', threatType: 'Chase Bank Spoof', risk: 98, color: '#ef4444' },
  { lat: 51.51, lon: -0.13, label: 'London', threatType: 'HMRC Tax Refund Trap', risk: 92, color: '#f59e0b' },
  { lat: 50.11, lon: 8.68, label: 'Frankfurt', threatType: 'Workday BEC Redirection', risk: 95, color: '#ef4444' },
  { lat: 35.68, lon: 139.69, label: 'Tokyo', threatType: 'Amazon Account Lockout', risk: 91, color: '#06b6d4' },
  { lat: 1.35, lon: 103.82, label: 'Singapore', threatType: 'Telegram Credential Stealer', risk: 94, color: '#f59e0b' },
  { lat: -33.87, lon: 151.21, label: 'Sydney', threatType: 'MyGov Smishing Vector', risk: 93, color: '#10b981' },
  { lat: 19.43, lon: -99.13, label: 'Mexico City', threatType: 'WhatsApp Impersonation', risk: 89, color: '#f59e0b' },
  { lat: 28.61, lon: 77.21, label: 'New Delhi', threatType: 'Electricity Bill Smishing', risk: 97, color: '#ef4444' },
  { lat: 25.20, lon: 55.27, label: 'Dubai', threatType: 'Courier Fee Micro-Charge', risk: 90, color: '#06b6d4' },
];

// Major continental bounding regions for dense 3D particle generation
const CONTINENT_ZONES = [
  // North America
  { minLat: 15, maxLat: 70, minLon: -165, maxLon: -55, density: 420 },
  // South America
  { minLat: -55, maxLat: 12, minLon: -80, maxLon: -35, density: 250 },
  // Europe
  { minLat: 36, maxLat: 71, minLon: -10, maxLon: 45, density: 340 },
  // Asia
  { minLat: 5, maxLat: 72, minLon: 45, maxLon: 145, density: 560 },
  // Africa
  { minLat: -35, maxLat: 37, minLon: -18, maxLon: 52, density: 360 },
  // Australia / Oceania
  { minLat: -44, maxLat: -10, minLon: 112, maxLon: 154, density: 190 },
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
}> = ({ className = '', height = 480, interactive = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activePin, setActivePin] = useState<ThreatPin | null>(GLOBAL_THREAT_PINS[0]);
  const [isDragging, setIsDragging] = useState(false);

  // Rotation state stored in refs for 60fps loop
  const rotRef = useRef({
    x: 0.25, // tilt angle (pitch)
    y: -0.6, // rotation angle (yaw)
    vx: 0,
    vy: 0.0035, // constant gentle rotation
    lastMouseX: 0,
    lastMouseY: 0,
    isInteracting: false,
  });

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
        rot.y += rot.vy;
        rot.vx *= 0.94;
        rot.x += rot.vx;
        // Clamp pitch so globe doesn't invert
        rot.x = Math.max(-0.8, Math.min(0.8, rot.x));
      }

      ctx.clearRect(0, 0, width, heightPx);

      const cx = width / 2;
      const cy = heightPx / 2;

      // 1. Draw atmospheric outer rim aura (v1.png style)
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius * 1.35);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.015)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric outer ring
      ctx.strokeStyle = 'rgba(76, 215, 246, 0.15)';
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
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-[#0b111e]/90 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>3D SPHERICAL TELEMETRY</span>
        </div>
        <div className="hidden sm:flex px-2 py-1 rounded-md bg-[#0b111e]/80 border border-white/10 text-slate-400 font-mono text-[10px]">
          DRAG TO ROTATE
        </div>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-red-950/80 border border-red-500/40 text-red-400 font-mono text-[10px] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>INTERCEPT MATRIX ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
