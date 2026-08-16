'use client';

import React, { useState, useEffect } from 'react';

export function HeroSpline() {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#072B52] via-[#0867E8] to-[#071A2F] p-6 shadow-2xl border border-[#CFE1F1]/30 flex items-center justify-center">
      {/* Abstract Isometric Civic Accessibility Network (Static/Animated Fallback) */}
      <svg
        className={`w-full h-full max-w-lg ${!reducedMotion ? 'animate-pulse' : ''}`}
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Low-poly Isometric Grid */}
        <path d="M250 40 L450 140 L250 240 L50 140 Z" fill="#0867E8" fillOpacity="0.25" stroke="#24B9F3" strokeWidth="1.5" />
        <path d="M250 100 L400 175 L250 250 L100 175 Z" fill="#24B9F3" fillOpacity="0.15" stroke="#DCEEFF" strokeWidth="1" />
        
        {/* Accessible Route Ribbon */}
        <path d="M120 165 C 180 200, 220 180, 280 220 C 330 250, 380 210, 420 230" stroke="#24B9F3" strokeWidth="6" strokeLinecap="round" />
        <path d="M120 165 C 180 200, 220 180, 280 220 C 330 250, 380 210, 420 230" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />

        {/* Spatial Accessibility Nodes */}
        <circle cx="120" cy="165" r="10" fill="#16835D" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="280" cy="220" r="12" fill="#0867E8" stroke="#24B9F3" strokeWidth="3" />
        <circle cx="420" cy="230" r="10" fill="#16835D" stroke="#FFFFFF" strokeWidth="3" />
        
        {/* Construction Obstacle Indicator */}
        <circle cx="230" cy="130" r="8" fill="#BE3942" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M230 126 L230 134 M226 130 L234 130" stroke="#FFFFFF" strokeWidth="2" />

        {/* Floating Labels */}
        <rect x="250" y="190" width="120" height="32" rx="16" fill="#071A2F" fillOpacity="0.85" stroke="#24B9F3" strokeWidth="1" />
        <text x="310" y="211" fill="#FFFFFF" fontSize="12" fontWeight="700" textAnchor="middle">BAIE Score: 92</text>

        <rect x="80" y="130" width="110" height="28" rx="14" fill="#16835D" fillOpacity="0.9" />
        <text x="135" y="148" fill="#FFFFFF" fontSize="11" fontWeight="600" textAnchor="middle">Curb Ramp Verified</text>
      </svg>

      {/* Decorative overlay watermark */}
      <div className="absolute bottom-4 right-4 text-xs text-[#24B9F3]/80 font-mono tracking-widest uppercase pointer-events-none">
        Blue Civic Futurism • NYC Spatial Network
      </div>
    </div>
  );
}
