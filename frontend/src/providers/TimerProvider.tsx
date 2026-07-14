'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { pomodoroService } from '@/services/pomodoro.service';
import type { Task } from '@/types';
import { toast } from 'sonner';

export type TimerMode = 'focus' | 'short_break' | 'long_break';

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  selectedTaskId: string;
  sessions: number;
  customDurations: Record<TimerMode, number>;
  stats: { todaySessions: number; todayMinutes: number; weekHours: number };
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: TimerMode) => void;
  updateDuration: (mode: TimerMode, minutes: number) => void;
  setSelectedTaskId: (id: string) => void;
  loadStats: () => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [customDurations, setCustomDurations] = useState<Record<TimerMode, number>>({
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const [sessions, setSessions] = useState(0);
  const [stats, setStats] = useState({ todaySessions: 0, todayMinutes: 0, weekHours: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const s = await pomodoroService.getStats();
      setStats(s);
    } catch {
      console.error('Failed to load pomodoro stats');
    }
  }, []);


  // Load stats once on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Timer Tick Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimerComplete = async () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgkKqsi2Y/OV6IpaqPaUI8W4WkqpFtR0Bch6SpkW1HQFyHpKmRbUdAXIekqZFtR0Bcg6KnjWhDO1Z+n6SMZD00UHmboopgOzBOd5qhiV43Kkt0l5+HXjYoSXKWnYddNSdIcpadhl43KUlylp2HXjcqS3SXn4deOC1QeJuiimE7MlF5m6KKYTsyUXmboophOzJReZuiimE7MlB4m6GJ');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // Ignore audio errors
    }

    if (mode === 'focus') {
      try {
        await pomodoroService.logSession({
          duration: customDurations.focus,
          task_id: selectedTaskId !== 'none' ? selectedTaskId : null,
        });
        setSessions((prev) => prev + 1);
        loadStats();
        toast.success('Focus session completed! 🎉');
      } catch {
        toast.error('Failed to save session');
      }

      if ((sessions + 1) % 4 === 0) {
        switchMode('long_break');
      } else {
        switchMode('short_break');
      }
    } else {
      toast.success('Break over! Ready to focus? 💪');
      switchMode('focus');
    }
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customDurations[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(customDurations[newMode]);
  };

  const updateDuration = (targetMode: TimerMode, minutes: number) => {
    const newSeconds = minutes * 60;
    setCustomDurations((prev) => ({
      ...prev,
      [targetMode]: newSeconds,
    }));
    if (mode === targetMode && !isRunning) {
      setTimeLeft(newSeconds);
    }
    toast.success(`${targetMode === 'focus' ? 'Focus' : targetMode === 'short_break' ? 'Short Break' : 'Long Break'} time set to ${minutes} mins`);
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        isRunning,
        selectedTaskId,
        sessions,
        customDurations,
        stats,
        toggleTimer,
        resetTimer,
        switchMode,
        updateDuration,
        setSelectedTaskId,
        loadStats,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
