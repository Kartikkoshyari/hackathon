import React, { useRef, useState } from 'react';
import { soundFX } from '../utils/soundEffects';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  onClick?: () => void;
  id?: string;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  maxTilt = 7,
  scale = 1.015,
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [glareStyle, setGlareStyle] = useState<{ opacity: number; x: number; y: number }>({
    opacity: 0,
    x: 50,
    y: 50,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    setGlareStyle({
      opacity: 0.18,
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={() => {
        soundFX.click();
        onClick?.();
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{
        transform: transformStyle,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Specular Glare Reflection */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-10 overflow-hidden"
        style={{
          opacity: glareStyle.opacity,
          background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.06) 40%, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};
