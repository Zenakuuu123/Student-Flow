'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashLoaderProps {
  /** Optional message to display below the title */
  message?: string;
  /** Whether the loader should show — when false, plays exit animation then unmounts */
  loading?: boolean;
  /** Callback after exit animation completes */
  onFinished?: () => void;
}

export function SplashLoader({ 
  message = 'Loading your workspace...', 
  loading = true,
  onFinished 
}: SplashLoaderProps) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [dots, setDots] = useState('');

  // Animate the dots: . → .. → ... → (repeat)
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // When loading becomes false, trigger exit animation
  useEffect(() => {
    if (!loading && !exiting) {
      setExiting(true);
      const timer = setTimeout(() => {
        setMounted(false);
        onFinished?.();
      }, 600); // matches CSS exit animation duration
      return () => clearTimeout(timer);
    }
  }, [loading, exiting, onFinished]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-navy-900 transition-all
        ${exiting ? 'splash-exit' : 'splash-enter'}`}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-blue-600/20 to-transparent blur-3xl animate-gradient" />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-tl from-blue-800/20 to-transparent blur-3xl animate-gradient"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37, 99, 235, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo with glow pulse */}
        <div className="splash-logo-container">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 splash-logo-glow">
            <Sparkles className="w-10 h-10 text-white splash-icon-float" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent splash-text-appear">
          StudyFlow
        </h1>

        {/* Message */}
        <p className="text-sm text-blue-300/70 splash-text-appear" style={{ animationDelay: '0.2s' }}>
          {message}{dots}
        </p>

        {/* Progress bar */}
        <div className="w-56 h-1 rounded-full bg-blue-950/50 overflow-hidden splash-text-appear" style={{ animationDelay: '0.4s' }}>
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
