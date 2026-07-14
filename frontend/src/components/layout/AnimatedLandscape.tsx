'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

export function AnimatedLandscape() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fireflies, setFireflies] = useState<{ id: number; left: number; top: number; delay: number; duration: number }[]>([]);
  const [stars, setStars] = useState<{ id: number; left: number; top: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    setMounted(true);

    // Generate random stars for dark mode
    const generatedStars = [];
    for (let i = 0; i < 30; i++) {
      generatedStars.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 70,
        size: 1 + Math.random() * 1.5,
        delay: Math.random() * 4,
      });
    }
    setStars(generatedStars);

    // Generate random fireflies for dark mode
    const generatedFireflies = [];
    for (let i = 0; i < 8; i++) {
      generatedFireflies.push({
        id: i,
        left: 10 + Math.random() * 80,
        top: 60 + Math.random() * 30,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 4,
      });
    }
    setFireflies(generatedFireflies);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-slate-900/50" />;
  }

  const isDark = theme === 'dark';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden transition-all duration-1000 ease-in-out cursor-default rounded-xl select-none"
      style={{
        background: isDark
          ? 'linear-gradient(to bottom, #030712, #0f172a, #1e293b)'
          : 'linear-gradient(to bottom, #38bdf8, #bae6fd, #fed7aa)',
        pointerEvents: 'auto',
      }}
    >
      {/* ===== SKY LAYER ===== */}
      
      {/* Stars (twinkling, dark mode only) */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              opacity: 0.6 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Sun (Day mode) */}
      <div
        className="absolute w-8 h-8 rounded-full bg-amber-300 transition-all duration-1000 ease-in-out pointer-events-none shadow-[0_0_20px_#f59e0b] flex items-center justify-center"
        style={{
          left: '50%',
          top: isDark ? '120%' : '18%',
          transform: 'translate(-50%, -50%)',
          opacity: isDark ? 0 : 1,
        }}
      >
        {/* Sun Flare details */}
        <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-2 rounded-full bg-amber-100" />
      </div>

      {/* Moon (Dark mode) */}
      <div
        className="absolute w-7 h-7 rounded-full bg-slate-100 transition-all duration-1000 ease-in-out pointer-events-none shadow-[0_0_25px_#f8fafc] flex items-center justify-center overflow-hidden"
        style={{
          left: '50%',
          top: isDark ? '18%' : '120%',
          transform: 'translate(-50%, -50%)',
          opacity: isDark ? 1 : 0,
        }}
      >
        {/* Moon shadow/crescent cutout */}
        <div className="absolute w-7 h-7 rounded-full bg-slate-100" />
        <div className="absolute w-5 h-5 rounded-full bg-slate-300/40 -top-1 -right-1" />
        {/* Soft breathing pulse */}
        <div className="absolute inset-0 rounded-full border border-slate-200/20 animate-pulse" />
      </div>

      {/* Clouds (Drifting across, changes color with theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud 1 */}
        <div
          className={`absolute w-12 h-4 rounded-full transition-all duration-1000 ${
            isDark ? 'bg-slate-700/20' : 'bg-white/80'
          }`}
          style={{
            top: '15%',
            left: '-15%',
            animation: 'drift-slow 35s linear infinite',
          }}
        />
        {/* Cloud 2 */}
        <div
          className={`absolute w-16 h-5 rounded-full transition-all duration-1000 ${
            isDark ? 'bg-slate-600/10' : 'bg-white/60'
          }`}
          style={{
            top: '35%',
            left: '-20%',
            animation: 'drift-fast 25s linear infinite',
            animationDelay: '7s',
          }}
        />
      </div>

      {/* ===== BACKGROUND LAYER (MOUNTAINS) ===== */}
      <svg
        className="absolute bottom-0 left-0 w-full h-12 transition-colors duration-1000 pointer-events-none"
        style={{
          color: isDark ? '#1e293b' : '#93c5fd',
        }}
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 L0 30 L40 18 L110 38 L160 22 L220 40 L280 15 L340 32 L400 12 L400 60 Z"
          fill="currentColor"
        />
      </svg>

      {/* ===== MIDDLE LAYER (TREES) ===== */}
      <div
        className="absolute bottom-0 left-0 w-full h-10 pointer-events-none flex justify-around items-end px-4"
      >
        {/* Tree 1 */}
        <svg
          className="w-5 h-8 transition-colors duration-1000 origin-bottom animate-[sway_4s_ease-in-out_infinite]"
          style={{
            color: isDark ? '#0f172a' : '#10b981',
          }}
          viewBox="0 0 20 30"
        >
          <path d="M10 0 L18 18 L14 18 L17 24 L3 24 L6 18 L2 18 Z" fill="currentColor" />
          <rect x="9" y="24" width="2" height="6" fill="#78350f" />
        </svg>

        {/* Tree 2 */}
        <svg
          className="w-4 h-6 transition-colors duration-1000 origin-bottom animate-[sway_3s_ease-in-out_infinite]"
          style={{
            color: isDark ? '#020617' : '#059669',
            animationDelay: '1s',
          }}
          viewBox="0 0 20 30"
        >
          <path d="M10 2 L17 16 L13 16 L16 22 L4 22 L7 16 L3 16 Z" fill="currentColor" />
          <rect x="9" y="22" width="2" height="8" fill="#78350f" />
        </svg>

        {/* Tree 3 */}
        <svg
          className="w-5 h-7 transition-colors duration-1000 origin-bottom animate-[sway_5s_ease-in-out_infinite]"
          style={{
            color: isDark ? '#0f172a' : '#059669',
            animationDelay: '0.5s',
          }}
          viewBox="0 0 20 30"
        >
          <path d="M10 0 L18 18 L14 18 L17 24 L3 24 L6 18 L2 18 Z" fill="currentColor" />
          <rect x="9" y="24" width="2" height="6" fill="#78350f" />
        </svg>
      </div>

      {/* ===== FOREGROUND LAYER (GRASS / FLOWERS) ===== */}
      <div
        className="absolute bottom-0 left-0 w-full h-5 pointer-events-none flex justify-between items-end"
      >
        {/* Grass elements */}
        <svg
          className="w-full h-5 transition-colors duration-1000"
          style={{
            color: isDark ? '#020617' : '#15803d',
          }}
          viewBox="0 0 400 15"
          preserveAspectRatio="none"
        >
          <path
            d="M0 15 L0 10 L5 6 L10 11 L15 5 L20 12 L25 7 L30 10 L35 4 L40 11 L45 5 L50 9 L55 6 L60 11 L65 5 L70 10 L75 4 L80 12 L85 6 L90 10 L95 4 L100 11 L105 5 L110 9 L115 6 L120 12 L125 5 L130 10 L135 4 L140 11 L145 6 L150 10 L155 4 L160 12 L165 5 L170 9 L175 6 L180 11 L185 5 L190 10 L195 4 L200 12 L205 6 L210 10 L215 4 L220 11 L225 5 L230 9 L235 6 L240 12 L245 5 L250 10 L255 4 L260 11 L265 6 L270 10 L275 4 L280 12 L285 5 L290 9 L295 6 L300 11 L305 5 L310 10 L315 4 L320 12 L325 6 L330 10 L335 4 L340 11 L345 5 L350 9 L355 6 L360 12 L365 5 L370 10 L375 4 L380 11 L385 6 L390 10 L395 4 L400 10 L400 15 Z"
            fill="currentColor"
          />
        </svg>

        {/* Small swaying flowers (light mode) */}
        {!isDark && (
          <div className="absolute inset-x-0 bottom-1.5 flex justify-around px-8">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '1.1s' }} />
          </div>
        )}
      </div>

      {/* Fireflies (Dark mode only) */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
          isDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {fireflies.map((fly) => (
          <div
            key={fly.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-200/80 shadow-[0_0_6px_#fef08a] animate-[float-firefly_6s_ease-in-out_infinite]"
            style={{
              left: `${fly.left}%`,
              top: `${fly.top}%`,
              animationDelay: `${fly.delay}s`,
              animationDuration: `${fly.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes drift-slow {
          0% { left: -20%; }
          100% { left: 120%; }
        }
        @keyframes drift-fast {
          0% { left: -25%; }
          100% { left: 125%; }
        }
        @keyframes sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes float-firefly {
          0%, 100% {
            transform: translate(0px, 0px) scale(0.8);
            opacity: 0.2;
          }
          50% {
            transform: translate(25px, -15px) scale(1.2);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse, .animate-bounce, [style*="animation"] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
