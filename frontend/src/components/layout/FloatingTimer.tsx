'use client';

import { useTimer } from '@/providers/TimerProvider';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, Pause, Maximize2, RotateCcw, Brain, Coffee, Zap } from 'lucide-react';

export function FloatingTimer() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    mode,
    timeLeft,
    isRunning,
    customDurations,
    toggleTimer,
    resetTimer,
  } = useTimer();

  // Don't show if we are already on the /timer page
  if (pathname === '/timer') return null;

  // Don't show if the timer hasn't started yet (fully reset) and is not running
  const isStarted = timeLeft < customDurations[mode];
  if (!isRunning && !isStarted) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / customDurations[mode];
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - progress);

  const getModeColor = () => {
    if (mode === 'focus') return 'text-blue-400 border-blue-500/20';
    if (mode === 'short_break') return 'text-emerald-400 border-emerald-500/20';
    return 'text-purple-400 border-purple-500/20';
  };

  const getModeIcon = () => {
    if (mode === 'focus') return <Brain className="w-3.5 h-3.5" />;
    if (mode === 'short_break') return <Coffee className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-3 rounded-2xl bg-card/85 backdrop-blur-md border border-border/80 shadow-2xl transition-all duration-300 hover:border-primary/30 group animate-fade-in ${isRunning ? 'animate-pulse-glow' : ''} max-w-[280px]`}>
      {/* Circle Progress Indicator */}
      <div className="relative w-12 h-12 shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="text-muted/10"
          />
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke="url(#floatingTimerGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="floatingTimerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={mode === 'focus' ? '#2563eb' : mode === 'short_break' ? '#059669' : '#7c3aed'} />
              <stop offset="100%" stopColor={mode === 'focus' ? '#3b82f6' : mode === 'short_break' ? '#10b981' : '#8b5cf6'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-400">
          {getModeIcon()}
        </div>
      </div>

      {/* Info & Controls */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-sm font-bold font-mono tracking-wider">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </p>
        <p className="text-[10px] text-muted-foreground capitalize mt-0.5 truncate flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${mode === 'focus' ? 'bg-blue-400' : mode === 'short_break' ? 'bg-emerald-400' : 'bg-purple-400'}`} />
          {mode.replace('_', ' ')}
        </p>
      </div>

      {/* Controls Container */}
      <div className="flex items-center gap-1 border-l border-border/40 pl-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={toggleTimer}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
          onClick={resetTimer}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full text-primary hover:text-primary-foreground hover:bg-primary"
          onClick={() => router.push('/timer')}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
