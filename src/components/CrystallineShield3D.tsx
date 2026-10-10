import React, { useEffect, useRef, useState } from 'react';
import { soundFX } from '../utils/soundEffects';

export type ShieldVerdictTheme = 'neutral' | 'scam' | 'legit' | 'warning';

export interface CrystallineShield3DProps {
  className?: string;
  isShattered?: boolean;
  verdictTheme?: ShieldVerdictTheme;
  isScanning?: boolean;
  burstTrigger?: number;
  showControls?: boolean;
  badgeLabel?: string;
  onShatterComplete?: () => void;
  onClick?: () => void;
}

interface Vertex3D {
  x: number;
  y: number;
  z: number;
}

interface Facet3D {
  indices: [number, number, number];
  color: string;
  alpha: number;
  specular: number;
  // Shatter kinematics
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
}

interface FloatingShard3D {
  x: number;
  y: number;
  z: number;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  orbitInclination: number;
  rotSpeed: number;
  rot: number;
  alpha: number;
}

export const CrystallineShield3D: React.FC<CrystallineShield3DProps> = ({
  className = '',
  isShattered = false,
  verdictTheme = 'neutral',
  isScanning = false,
  burstTrigger,
  showControls = true,
  badgeLabel,
  onShatterComplete,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shattered, setShattered] = useState(isShattered);

  // 3D Rotation and Mouse state
  const mouseState = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    lightX: 0,
    lightY: 0,
  });

  const shatterState = useRef({
    triggered: isShattered,
    progress: isShattered ? 1 : 0,
  });

  const impactPulseRef = useRef<{
    active: boolean;
    radius: number;
    maxRadius: number;
    alpha: number;
    color: string;
    secondaryColor: string;
  }>({
    active: false,
    radius: 0,
    maxRadius: 280,
    alpha: 0,
    color: 'rgba(255, 255, 255, 0.9)',
    secondaryColor: 'rgba(255, 255, 255, 0.5)',
  });

  const triggerImpact = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundFX.scan();
    const isRed = verdictTheme === 'scam';
    const isGreen = verdictTheme === 'legit';
    const isAmber = verdictTheme === 'warning';

    const pColor = isRed
      ? 'rgba(239, 68, 68, 0.95)'
      : isGreen
      ? 'rgba(16, 185, 129, 0.95)'
      : isAmber
      ? 'rgba(245, 158, 11, 0.95)'
      : 'rgba(255, 255, 255, 0.95)';

    const sColor = isRed
      ? 'rgba(239, 68, 68, 0.5)'
      : isGreen
      ? 'rgba(16, 185, 129, 0.5)'
      : isAmber
      ? 'rgba(245, 158, 11, 0.5)'
      : 'rgba(255, 255, 255, 0.5)';

    impactPulseRef.current = {
      active: true,
      radius: 5,
      maxRadius: 300,
      alpha: 0.95,
      color: pColor,
      secondaryColor: sColor,
    };
  };

  const toggleShatter = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!shatterState.current.triggered) {
      if (verdictTheme === 'scam') {
        soundFX.scamThreatBurst();
      } else {
        soundFX.shatter();
      }
      shatterState.current.triggered = true;
      setShattered(true);
    } else {
      if (verdictTheme === 'legit') {
        soundFX.legitShieldBurst();
      } else {
        soundFX.success();
      }
      shatterState.current.triggered = false;
      shatterState.current.progress = 0;
      setShattered(false);
    }
  };

  // Sync external shatter state
  useEffect(() => {
    if (isShattered !== shatterState.current.triggered) {
      if (isShattered) {
        shatterState.current.triggered = true;
        setShattered(true);
      } else {
        shatterState.current.triggered = false;
        shatterState.current.progress = 0;
        setShattered(false);
      }
    }
  }, [isShattered]);

  // Handle active burst triggers (e.g. when verification verdict arrives)
  useEffect(() => {
    if (burstTrigger !== undefined && burstTrigger > 0) {
      const isRed = verdictTheme === 'scam';
      const isGreen = verdictTheme === 'legit';
      const isAmber = verdictTheme === 'warning';

      impactPulseRef.current = {
        active: true,
        radius: 10,
        maxRadius: 360,
        alpha: 1,
        color: isRed
          ? 'rgba(239, 68, 68, 0.95)'
          : isGreen
          ? 'rgba(16, 185, 129, 0.95)'
          : isAmber
          ? 'rgba(245, 158, 11, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        secondaryColor: isRed
          ? 'rgba(239, 68, 68, 0.6)'
          : isGreen
          ? 'rgba(16, 185, 129, 0.6)'
          : isAmber
          ? 'rgba(245, 158, 11, 0.6)'
          : 'rgba(255, 255, 255, 0.6)',
      };

      if (isRed) {
        // Red Scam Burst: explode outward!
        shatterState.current.triggered = true;
        shatterState.current.progress = 0;
        setShattered(true);
      } else if (isGreen) {
        // Green Legit Burst: protective harmonic reconstruction pulse!
        shatterState.current.triggered = false;
        shatterState.current.progress = 0;
        setShattered(false);
      } else {
        // Warning or neutral
        shatterState.current.progress = 0;
      }
    }
  }, [burstTrigger, verdictTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 340);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Define 3D Faceted Diamond Shield geometry (Scale normalized)
    const baseScale = Math.min(width, height) * 0.38;

    const baseVertices: Vertex3D[] = [
      { x: 0, y: -baseScale * 1.05, z: baseScale * 0.2 }, // 0: Top Crown
      { x: -baseScale * 0.9, y: -baseScale * 0.6, z: baseScale * 0.05 }, // 1: Upper Left Crest
      { x: baseScale * 0.9, y: -baseScale * 0.6, z: baseScale * 0.05 }, // 2: Upper Right Crest
      { x: -baseScale * 0.95, y: baseScale * 0.05, z: 0 }, // 3: Mid Left Wing
      { x: baseScale * 0.95, y: baseScale * 0.05, z: 0 }, // 4: Mid Right Wing
      { x: -baseScale * 0.55, y: baseScale * 0.75, z: -baseScale * 0.05 }, // 5: Lower Left Flank
      { x: baseScale * 0.55, y: baseScale * 0.75, z: -baseScale * 0.05 }, // 6: Lower Right Flank
      { x: 0, y: baseScale * 1.25, z: 0 }, // 7: Bottom Spear Tip
      { x: 0, y: -baseScale * 0.25, z: baseScale * 0.45 }, // 8: Center High Prism Bevel
      { x: 0, y: baseScale * 0.35, z: baseScale * 0.4 }, // 9: Center Lower Prism Bevel
      { x: -baseScale * 0.42, y: -baseScale * 0.15, z: baseScale * 0.22 }, // 10: Mid Inner Left
      { x: baseScale * 0.42, y: -baseScale * 0.15, z: baseScale * 0.22 }, // 11: Mid Inner Right
    ];

    // Define triangles (facets) connecting vertices
    const facetIndices: [number, number, number][] = [
      [0, 1, 10],
      [0, 10, 8],
      [0, 8, 11],
      [0, 11, 2],
      [1, 3, 10],
      [2, 11, 4],
      [8, 10, 9],
      [8, 9, 11],
      [3, 5, 10],
      [4, 11, 6],
      [10, 5, 9],
      [11, 9, 6],
      [9, 5, 7],
      [9, 7, 6],
    ];

    const facets: Facet3D[] = facetIndices.map(([i1, i2, i3]) => {
      // Geometric center for radial explosion
      const p1 = baseVertices[i1];
      const p2 = baseVertices[i2];
      const p3 = baseVertices[i3];
      const cx = (p1.x + p2.x + p3.x) / 3;
      const cy = (p1.y + p2.y + p3.y) / 3;
      const cz = (p1.z + p2.z + p3.z) / 3;
      const dist = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1;

      return {
        indices: [i1, i2, i3],
        color: '#ffffff',
        alpha: 0.85,
        specular: 0.9,
        vx: (cx / dist) * (5 + Math.random() * 9) + (Math.random() - 0.5) * 4,
        vy: (cy / dist) * (5 + Math.random() * 9) + (Math.random() - 0.5) * 4,
        vz: (cz / dist) * 7 + Math.random() * 11,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        vRotX: (Math.random() - 0.5) * 0.14,
        vRotY: (Math.random() - 0.5) * 0.14,
        vRotZ: (Math.random() - 0.5) * 0.14,
      };
    });

    // Generate orbiting 3D crystal shards
    const shardCount = 26;
    const shards: FloatingShard3D[] = [];
    for (let i = 0; i < shardCount; i++) {
      shards.push({
        x: 0,
        y: 0,
        z: 0,
        size: Math.random() * 5 + 3,
        orbitRadius: baseScale * (1.1 + Math.random() * 0.8),
        orbitSpeed: (Math.random() * 0.014 + 0.007) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: Math.random() * Math.PI * 2,
        orbitInclination: (Math.random() - 0.5) * 0.85,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        rot: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.35,
      });
    }

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const ms = mouseState.current;
      const ss = shatterState.current;

      // Color Palette resolution based on verdictTheme
      let r = 240;
      let g = 245;
      let b = 255;
      let rHigh = 255;
      let gHigh = 255;
      let bHigh = 255;

      if (verdictTheme === 'scam') {
        // Red Burst (Scam / Threat)
        r = 239;
        g = 68;
        b = 68;
        rHigh = 254;
        gHigh = 160;
        bHigh = 160;
      } else if (verdictTheme === 'legit') {
        // Green Burst (Legit / Safe)
        r = 16;
        g = 185;
        b = 129;
        rHigh = 167;
        gHigh = 243;
        bHigh = 208;
      } else if (verdictTheme === 'warning') {
        // Amber Burst (Suspicious)
        r = 245;
        g = 158;
        b = 11;
        rHigh = 253;
        gHigh = 230;
        bHigh = 138;
      }

      // Smooth mouse interpolation
      ms.currentX += (ms.targetX - ms.currentX) * 0.08;
      ms.currentY += (ms.targetY - ms.currentY) * 0.08;

      // Scanning rapid rotation booster
      const scanSpeed = isScanning ? 0.08 : 0.02;

      // Handle shatter progress
      if (ss.triggered) {
        ss.progress += 0.025;
        if (ss.progress >= 1 && onShatterComplete) {
          onShatterComplete();
        }
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // 3D rotation angles from mouse + scan spin
      const rotY = ms.currentX * 0.55 + Math.sin(frameCount * scanSpeed) * 0.12;
      const rotX = -ms.currentY * 0.45 + Math.cos(frameCount * scanSpeed) * 0.08;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D Projection Helper
      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;
        const fov = 750;
        const scale = fov / (fov + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // 1. Render Orbiting 3D Shards
      shards.forEach((s) => {
        s.orbitAngle += s.orbitSpeed * (isScanning ? 2.5 : 1);
        s.rot += s.rotSpeed;

        const rawX = Math.cos(s.orbitAngle) * s.orbitRadius;
        const rawZ = Math.sin(s.orbitAngle) * s.orbitRadius;
        const rawY = Math.sin(s.orbitAngle * 2 + s.orbitInclination) * (s.orbitRadius * 0.35);

        const p = project(rawX, rawY, rawZ);

        if (ss.triggered) {
          s.orbitRadius += 7;
          s.alpha = Math.max(0, s.alpha - 0.028);
        }

        if (s.alpha > 0.01) {
          ctx.save();
          ctx.translate(p.px, p.py);
          ctx.rotate(s.rot);
          ctx.fillStyle = `rgba(${rHigh}, ${gHigh}, ${bHigh}, ${s.alpha * (p.pz > 0 ? 1 : 0.45)})`;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${s.alpha * 0.85})`;
          ctx.lineWidth = 0.9;

          // Diamond shard polygon
          ctx.beginPath();
          ctx.moveTo(0, -s.size * p.scale);
          ctx.lineTo(s.size * 0.55 * p.scale, 0);
          ctx.lineTo(0, s.size * p.scale);
          ctx.lineTo(-s.size * 0.55 * p.scale, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      });

      // 2. Render Faceted 3D Shield
      interface RenderableFacet {
        p1: { px: number; py: number; pz: number };
        p2: { px: number; py: number; pz: number };
        p3: { px: number; py: number; pz: number };
        avgZ: number;
        normalZ: number;
        lightIntensity: number;
        alpha: number;
      }

      const projectedFacets: RenderableFacet[] = [];

      facets.forEach((f) => {
        let v1 = { ...baseVertices[f.indices[0]] };
        let v2 = { ...baseVertices[f.indices[1]] };
        let v3 = { ...baseVertices[f.indices[2]] };

        // Apply shattering kinematics if active
        if (ss.triggered) {
          const t = ss.progress * 22;
          v1.x += f.vx * t;
          v1.y += f.vy * t;
          v1.z += f.vz * t;
          v2.x += f.vx * t;
          v2.y += f.vy * t;
          v2.z += f.vz * t;
          v3.x += f.vx * t;
          v3.y += f.vy * t;
          v3.z += f.vz * t;
          f.alpha = Math.max(0, 0.95 - ss.progress * 1.15);
        }

        const p1 = project(v1.x, v1.y, v1.z);
        const p2 = project(v2.x, v2.y, v2.z);
        const p3 = project(v3.x, v3.y, v3.z);

        const edge1X = p2.px - p1.px;
        const edge1Y = p2.py - p1.py;
        const edge2X = p3.px - p1.px;
        const edge2Y = p3.py - p1.py;
        const normalZ = edge1X * edge2Y - edge1Y * edge2X;

        const centerPX = (p1.px + p2.px + p3.px) / 3;
        const centerPY = (p1.py + p2.py + p3.py) / 3;
        const lightDist = Math.hypot(centerPX - (cx + ms.lightX * 160), centerPY - (cy + ms.lightY * 160));
        const lightIntensity = Math.max(0.1, 1 - lightDist / (baseScale * 2.2));

        projectedFacets.push({
          p1,
          p2,
          p3,
          avgZ: (p1.pz + p2.pz + p3.pz) / 3,
          normalZ,
          lightIntensity,
          alpha: f.alpha,
        });
      });

      // Sort facets back-to-front (Painter's Algorithm)
      projectedFacets.sort((a, b) => a.avgZ - b.avgZ);

      // Draw each facet with crystalline refractive gradient
      projectedFacets.forEach((f) => {
        if (f.alpha <= 0.01) return;

        const isFacingFront = f.normalZ > 0;
        const baseAlpha = isFacingFront ? f.alpha : f.alpha * 0.35;

        ctx.beginPath();
        ctx.moveTo(f.p1.px, f.p1.py);
        ctx.lineTo(f.p2.px, f.p2.py);
        ctx.lineTo(f.p3.px, f.p3.py);
        ctx.closePath();

        // Shading: calculate crystalline tone in theme color
        const shadeFactor = 0.55 + f.lightIntensity * 0.45;
        const fillR = Math.min(255, Math.floor(r * shadeFactor));
        const fillG = Math.min(255, Math.floor(g * shadeFactor));
        const fillB = Math.min(255, Math.floor(b * shadeFactor));
        const fillAlpha = Math.min(0.88, baseAlpha * (0.25 + f.lightIntensity * 0.45));

        ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, ${fillAlpha})`;
        ctx.fill();

        // Crystalline Wireframe Edge
        ctx.strokeStyle = `rgba(${rHigh}, ${gHigh}, ${bHigh}, ${baseAlpha * (0.45 + f.lightIntensity * 0.5)})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Center specular flare
        if (f.lightIntensity > 0.72 && isFacingFront) {
          ctx.fillStyle = `rgba(${rHigh}, ${gHigh}, ${bHigh}, ${(f.lightIntensity - 0.72) * 1.6 * baseAlpha})`;
          ctx.fill();
        }
      });

      // 3. Central Aegis Insignia (Laser etched on shield)
      if (!ss.triggered) {
        const centerP = project(0, -baseScale * 0.1, baseScale * 0.42);
        ctx.save();
        ctx.translate(centerP.px, centerP.py);
        ctx.scale(centerP.scale, centerP.scale);
        ctx.strokeStyle = `rgba(${rHigh}, ${gHigh}, ${bHigh}, 0.85)`;
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();

        if (verdictTheme === 'scam') {
          // Warning Exclamation rune
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(0, 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 7, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${rHigh}, ${gHigh}, ${bHigh})`;
          ctx.fill();
        } else if (verdictTheme === 'legit') {
          // Shield Checkmark rune
          ctx.beginPath();
          ctx.moveTo(-6, 0);
          ctx.lineTo(-1, 5);
          ctx.lineTo(7, -5);
          ctx.stroke();
        } else {
          // Crosshair target
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(0, 10);
          ctx.moveTo(-10, 0);
          ctx.lineTo(10, 0);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Defensive Impact / Burst Deflection Shockwave
      const ip = impactPulseRef.current;
      if (ip.active) {
        ip.radius += 8;
        ip.alpha = Math.max(0, ip.alpha - 0.022);
        const centerP = project(0, -baseScale * 0.1, baseScale * 0.42);

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerP.px, centerP.py, ip.radius * centerP.scale, 0, Math.PI * 2);
        ctx.strokeStyle = ip.color.replace('0.95', `${ip.alpha}`);
        ctx.lineWidth = 3.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerP.px, centerP.py, ip.radius * 0.65 * centerP.scale, 0, Math.PI * 2);
        ctx.strokeStyle = ip.secondaryColor.replace('0.6', `${ip.alpha * 0.65}`);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        if (ip.alpha <= 0.02) {
          ip.active = false;
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Mouse tracking handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseState.current.targetX = Math.max(-1, Math.min(1, nx));
      mouseState.current.targetY = Math.max(-1, Math.min(1, ny));
      mouseState.current.lightX = nx;
      mouseState.current.lightY = ny;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, [verdictTheme, isScanning, onShatterComplete]);

  // Derived styling for HUD badges and atmospheric ambient blur
  const isScam = verdictTheme === 'scam';
  const isLegit = verdictTheme === 'legit';
  const isWarning = verdictTheme === 'warning';

  const glowStyle = isScam
    ? 'bg-red-500/[0.12] blur-[80px]'
    : isLegit
    ? 'bg-emerald-500/[0.14] blur-[80px]'
    : isWarning
    ? 'bg-amber-500/[0.12] blur-[80px]'
    : 'bg-cyan-500/[0.04] blur-[70px]';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden transition-all duration-500 ${className}`}
      onClick={() => {
        soundFX.click();
        onClick?.();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

      {/* Floating Tactical Specular Glare */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-full transition-all duration-700 ${glowStyle} ${
          isHovered ? 'opacity-90' : 'opacity-40'
        }`}
      />

      {/* Top Left HUD Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
        <div className="px-2.5 py-1 rounded-full bg-black/85 border border-white/15 text-white font-mono text-[10px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-ping ${
              isScam ? 'bg-red-400' : isLegit ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-white'
            }`}
          />
          <span>{badgeLabel || '3D AEGIS CORE'}</span>
        </div>
      </div>

      {/* Top Right State Telemetry */}
      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none z-10">
        <div
          className={`px-2.5 py-1 rounded-full font-mono text-[10px] flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-colors ${
            isScam
              ? 'bg-red-950/85 border-red-500/50 text-red-300'
              : isLegit
              ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-300'
              : isWarning
              ? 'bg-amber-950/85 border-amber-500/50 text-amber-300'
              : 'bg-black/80 border-white/15 text-neutral-300'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isScam ? 'bg-red-400' : isLegit ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
          />
          <span>
            {isScanning
              ? 'SCANNING...'
              : isScam
              ? '💥 RED BURST: SCAM DETECTED'
              : isLegit
              ? '🛡️ GREEN BURST: SAFE / LEGIT'
              : isWarning
              ? '⚠️ AMBER BURST: SUSPICIOUS'
              : shattered
              ? 'CORE DISPERSED'
              : 'HARDENED SHIELD'}
          </span>
        </div>
      </div>

      {/* Bottom Interactive Trigger Dock (only when showControls = true) */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md shadow-2xl z-10">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={triggerImpact}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Trigger Deflection Shockwave"
            >
              <span>⚡ Deflect Shockwave</span>
            </button>

            <button
              type="button"
              onClick={toggleShatter}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm ${
                isScam
                  ? 'bg-red-500 hover:bg-red-400 text-white'
                  : isLegit
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              <span>{shattered ? '🛡️ Reconstruct Core' : '💥 Burst / Disperse'}</span>
            </button>
          </div>

          <span className="hidden sm:inline font-mono text-[9px] text-neutral-400 px-2">
            SPECULAR LIGHT FOLLOWS CURSOR
          </span>
        </div>
      )}
    </div>
  );
};
