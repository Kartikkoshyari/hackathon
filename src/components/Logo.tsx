import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const ScamShieldLogo: React.FC<LogoProps> = ({ className = 'h-8 w-auto', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ScamShield Logo"
    >
      <defs>
        <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a1520" />
          <stop offset="100%" stopColor="#06090e" />
        </linearGradient>
        <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="checkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4edea3" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle App Icon Container */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="26"
        fill="url(#shieldBg)"
        stroke="url(#shieldBorder)"
        strokeWidth="3.5"
      />

      {/* Inner Shield Contour */}
      <path
        d="M50 16 L78 28 C78 52 66 72 50 84 C34 72 22 52 22 28 Z"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Centered Top Dot Indicator */}
      <circle cx="50" cy="35" r="4.5" fill="#22D3EE" />

      {/* Verified Core Checkmark */}
      <path
        d="M36 49 L46 59 L64 41"
        fill="none"
        stroke="url(#checkGlow)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
