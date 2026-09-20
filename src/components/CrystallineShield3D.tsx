import React, { useEffect, useRef, useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface CrystallineShield3DProps {
  className?: string;
  isShattered?: boolean;
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

  const impactPulseRef = useRef<{ active: boolean; radius: number; maxRadius: number; alpha: number }>({
    active: false,
    radius: 0,
    maxRadius: 200,
    alpha: 0,
  });

  const triggerImpact = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundFX.scan();
    impactPulseRef.current = {
      active: true,
      radius: 5,
      maxRadius: 240,
      alpha: 0.95,
    };
  };

  const toggleShatter = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!shatterState.current.triggered) {
      soundFX.shatter();
      shatterState.current.triggered = true;
      setShattered(true);
    } else {
      soundFX.success();
      shatterState.current.triggered = false;
      shatterState.current.progress = 0;
      setShattered(false);
    }
  };

  useEffect(() => {
    if (isShattered !== shatterState.current.triggered) {
      if (isShattered) {
        soundFX.shatter();
        shatterState.current.triggered = true;
        setShattered(true);
      } else {
        shatterState.current.triggered = false;
        shatterState.current.progress = 0;
        setShattered(false);
      }
    }
  }, [isShattered]);

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

    const facets: Facet3D[] = facetIndices.map(([i1, i2, i3], fIdx) => {
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
        color: fIdx % 2 === 0 ? '#ffffff' : '#e2e8f0',
        alpha: 0.85,
        specular: 0.9,
        // Outward explosion vectors with rotational spin
        vx: (cx / dist) * (4 + Math.random() * 8) + (Math.random() - 0.5) * 4,
        vy: (cy / dist) * (4 + Math.random() * 8) + (Math.random() - 0.5) * 4,
        vz: (cz / dist) * 6 + Math.random() * 10,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        vRotX: (Math.random() - 0.5) * 0.12,
        vRotY: (Math.random() - 0.5) * 0.12,
        vRotZ: (Math.random() - 0.5) * 0.12,
      };
    });

    // Generate orbiting 3D crystal shards
    const shardCount = 22;
    const shards: FloatingShard3D[] = [];
    for (let i = 0; i < shardCount; i++) {
      shards.push({
        x: 0,
        y: 0,
        z: 0,
        size: Math.random() * 5 + 3,
        orbitRadius: baseScale * (1.1 + Math.random() * 0.8),
        orbitSpeed: (Math.random() * 0.012 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
        orbitAngle: Math.random() * Math.PI * 2,
        orbitInclination: (Math.random() - 0.5) * 0.8,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        rot: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    let frameCount = 0;

    const render = () => {
      frameCount++;
      const ms = mouseState.current;
      const ss = shatterState.current;

      // Smooth mouse interpolation (spring feel)
      ms.currentX += (ms.targetX - ms.currentX) * 0.08;
      ms.currentY += (ms.targetY - ms.currentY) * 0.08;

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

      // 3D rotation angles from mouse
      const rotY = ms.currentX * 0.55 + Math.sin(frameCount * 0.02) * 0.06;
      const rotX = -ms.currentY * 0.45 + Math.cos(frameCount * 0.02) * 0.04;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D Projection Helper
      const project = (x: number, y: number, z: number) => {
        // Yaw (around Y)
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        // Pitch (around X)
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;
        // Perspective
        const fov = 750;
        const scale = fov / (fov + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
        };
      };

      // 1. Render Orbiting 3D Shards (Back Hemisphere first)
      shards.forEach((s) => {
        s.orbitAngle += s.orbitSpeed;
        s.rot += s.rotSpeed;

        const rawX = Math.cos(s.orbitAngle) * s.orbitRadius;
        const rawZ = Math.sin(s.orbitAngle) * s.orbitRadius;
        const rawY = Math.sin(s.orbitAngle * 2 + s.orbitInclination) * (s.orbitRadius * 0.35);

        const p = project(rawX, rawY, rawZ);

        // Disperse if shattered
        if (ss.triggered) {
          s.orbitRadius += 6;
          s.alpha = Math.max(0, s.alpha - 0.03);
        }

        if (s.alpha > 0.01) {
          ctx.save();
          ctx.translate(p.px, p.py);
          ctx.rotate(s.rot);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * (p.pz > 0 ? 1 : 0.45)})`;
          ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.8})`;
          ctx.lineWidth = 0.8;

          // Diamond shard polygon
          ctx.beginPath();
          ctx.moveTo(0, -s.size * p.scale);
          ctx.lineTo(s.size * 0.5 * p.scale, 0);
          ctx.lineTo(0, s.size * p.scale);
          ctx.lineTo(-s.size * 0.5 * p.scale, 0);
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
          const t = ss.progress * 18;
          v1.x += f.vx * t;
          v1.y += f.vy * t;
          v1.z += f.vz * t;
          v2.x += f.vx * t;
          v2.y += f.vy * t;
          v2.z += f.vz * t;
          v3.x += f.vx * t;
          v3.y += f.vy * t;
          v3.z += f.vz * t;
          f.alpha = Math.max(0, 0.9 - ss.progress * 1.1);
        }

        const p1 = project(v1.x, v1.y, v1.z);
        const p2 = project(v2.x, v2.y, v2.z);
        const p3 = project(v3.x, v3.y, v3.z);

        // Calculate 2D Screen Normal for Face Culling & Lighting
        const edge1X = p2.px - p1.px;
        const edge1Y = p2.py - p1.py;
        const edge2X = p3.px - p1.px;
        const edge2Y = p3.py - p1.py;
        const normalZ = edge1X * edge2Y - edge1Y * edge2X;

        // Specular highlight relative to mouse light position
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

        // Front-facing vs back-facing transparency
        const isFacingFront = f.normalZ > 0;
        const baseAlpha = isFacingFront ? f.alpha : f.alpha * 0.35;

        ctx.beginPath();
        ctx.moveTo(f.p1.px, f.p1.py);
        ctx.lineTo(f.p2.px, f.p2.py);
        ctx.lineTo(f.p3.px, f.p3.py);
        ctx.closePath();

        // Shading: calculate crystalline tone
        const brightness = Math.min(255, Math.floor(180 + f.lightIntensity * 75));
        const fillAlpha = Math.min(0.85, baseAlpha * (0.2 + f.lightIntensity * 0.4));

        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${fillAlpha})`;
        ctx.fill();

        // Crystalline Wireframe Edge
        ctx.strokeStyle = `rgba(255, 255, 255, ${baseAlpha * (0.4 + f.lightIntensity * 0.5)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // High-reflectivity center specular flare
        if (f.lightIntensity > 0.75 && isFacingFront) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(f.lightIntensity - 0.75) * 1.5 * baseAlpha})`;
          ctx.fill();
        }
      });

      // 3. Central Aegis Insignia (Laser etched on shield)
      if (!ss.triggered) {
        const centerP = project(0, -baseScale * 0.1, baseScale * 0.42);
        ctx.save();
        ctx.translate(centerP.px, centerP.py);
        ctx.scale(centerP.scale, centerP.scale);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 10);
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Defensive Impact Deflection Shockwave
      const ip = impactPulseRef.current;
      if (ip.active) {
        ip.radius += 6;
        ip.alpha = Math.max(0, ip.alpha - 0.025);
        const centerP = project(0, -baseScale * 0.1, baseScale * 0.42);

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerP.px, centerP.py, ip.radius * centerP.scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ip.alpha * 0.85})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerP.px, centerP.py, ip.radius * 0.65 * centerP.scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${ip.alpha * 0.45})`;
        ctx.lineWidth = 1.2;
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
  }, [onShatterComplete]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}
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
        className={`pointer-events-none absolute inset-0 rounded-full bg-white/[0.03] blur-[70px] transition-opacity duration-500 ${
          isHovered ? 'opacity-80' : 'opacity-25'
        }`}
      />

      {/* Top HUD Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-black/80 border border-white/15 text-white font-mono text-[10px] flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>3D AEGIS DEFENSE CORE</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] flex items-center gap-1.5 backdrop-blur-md">
          <span className={`w-1.5 h-1.5 rounded-full ${shattered ? 'bg-red-400' : 'bg-emerald-400'} animate-pulse`} />
          <span>{shattered ? 'CORE DISPERSED' : 'HARDENED SHIELD'}</span>
        </div>
      </div>

      {/* Bottom Interactive Trigger Dock */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-1.5 rounded-xl bg-black/85 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={triggerImpact}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Simulate Phishing Impact Shockwave"
          >
            <span>⚡ Deflect Impact</span>
          </button>

          <button
            type="button"
            onClick={toggleShatter}
            className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span>{shattered ? '🛡️ Reconstruct Core' : '💥 Disperse / Shatter'}</span>
          </button>
        </div>

        <span className="hidden sm:inline font-mono text-[9px] text-neutral-400 px-2">
          CURSOR TRACKS SPECULAR LIGHT
        </span>
      </div>
    </div>
  );
};
