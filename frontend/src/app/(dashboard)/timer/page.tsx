'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { pomodoroService } from '@/services/pomodoro.service';
import type { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Zap, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTimer } from '@/providers/TimerProvider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type TimerMode = 'focus' | 'short_break' | 'long_break';

const MODES: { id: TimerMode; label: string; duration: number; icon: React.ElementType; color: string }[] = [
  { id: 'focus', label: 'Focus', duration: 25 * 60, icon: Brain, color: 'text-blue-400' },
  { id: 'short_break', label: 'Short Break', duration: 5 * 60, icon: Coffee, color: 'text-emerald-400' },
  { id: 'long_break', label: 'Long Break', duration: 15 * 60, icon: Zap, color: 'text-purple-400' },
];

export default function TimerPage() {
  const {
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
  } = useTimer();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusInput, setFocusInput] = useState(String(customDurations.focus / 60));
  const [shortInput, setShortInput] = useState(String(customDurations.short_break / 60));
  const [longInput, setLongInput] = useState(String(customDurations.long_break / 60));

  // Sync inputs when customDurations updates
  useEffect(() => {
    setFocusInput(String(customDurations.focus / 60));
    setShortInput(String(customDurations.short_break / 60));
    setLongInput(String(customDurations.long_break / 60));
  }, [customDurations]);

  const currentMode = MODES.find((m) => m.id === mode)!;

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSaveSettings = () => {
    const f = parseInt(focusInput);
    const s = parseInt(shortInput);
    const l = parseInt(longInput);

    if (isNaN(f) || isNaN(s) || isNaN(l) || f <= 0 || s <= 0 || l <= 0) {
      toast.error('Please enter valid positive minutes');
      return;
    }

    updateDuration('focus', f);
    updateDuration('short_break', s);
    updateDuration('long_break', l);
    setSettingsOpen(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / customDurations[mode];
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Timer className="w-6 h-6 text-primary" />
          Pomodoro Timer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Stay focused and productive</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardContent className="p-8">
            {/* Mode Tabs */}
            <div className="flex justify-center gap-2 mb-8">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <Button
                    key={m.id}
                    variant={mode === m.id ? 'default' : 'ghost'}
                    onClick={() => switchMode(m.id)}
                    className={`gap-2 ${mode === m.id ? '' : 'text-muted-foreground'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {m.label}
                  </Button>
                );
              })}
            </div>

            {/* Timer Ring */}
            <div className="flex justify-center mb-8">
              <div className={`relative w-80 h-80 rounded-full ${isRunning ? 'animate-pulse-glow' : ''}`}>
                <svg className="w-80 h-80 -rotate-90" viewBox="0 0 320 320">
                  {/* Background circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="url(#timerGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={mode === 'focus' ? '#2563eb' : mode === 'short_break' ? '#059669' : '#7c3aed'} />
                      <stop offset="100%" stopColor={mode === 'focus' ? '#3b82f6' : mode === 'short_break' ? '#10b981' : '#8b5cf6'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold font-mono tracking-wider">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-medium mt-2 ${currentMode.color}`}>
                    {currentMode.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-3">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={resetTimer} title="Reset Timer">
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="h-12 px-8 rounded-full gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-md"
                onClick={toggleTimer}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Start
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => setSettingsOpen(true)} title="Edit Timer Durations" disabled={isRunning}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Session Counter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i <= (sessions % 4 || (sessions > 0 ? 4 : 0))
                        ? 'bg-primary text-primary-foreground glow-blue'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {sessions} session{sessions !== 1 ? 's' : ''} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Today&apos;s Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sessions</span>
                <span className="font-semibold">{stats.todaySessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="font-semibold">{stats.todayMinutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Week Total</span>
                <span className="font-semibold">{stats.weekHours} hrs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Duration Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Edit Timer Durations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="focus-min">Focus Duration (minutes)</Label>
              <Input
                id="focus-min"
                type="number"
                min={1}
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="short-min">Short Break (minutes)</Label>
              <Input
                id="short-min"
                type="number"
                min={1}
                value={shortInput}
                onChange={(e) => setShortInput(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="long-min">Long Break (minutes)</Label>
              <Input
                id="long-min"
                type="number"
                min={1}
                value={longInput}
                onChange={(e) => setLongInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
