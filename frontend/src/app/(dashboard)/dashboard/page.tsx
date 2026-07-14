'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { taskService } from '@/services/task.service';
import { pomodoroService } from '@/services/pomodoro.service';
import type { Task } from '@/types';
import { PRIORITY_COLORS, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, STATUS_COLORS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Timer,
  TrendingUp,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface WeatherData {
  temp: number;
  desc: string;
  icon: string;
}

const getWeatherInfo = (code: number, temp: number): WeatherData => {
  let desc = 'Sunny';
  let icon = '☀️';

  if (code === 0) { desc = 'Clear'; icon = '☀️'; }
  else if (code >= 1 && code <= 3) { desc = 'Cloudy'; icon = '⛅'; }
  else if (code === 45 || code === 48) { desc = 'Foggy'; icon = '🌫️'; }
  else if (code >= 51 && code <= 55) { desc = 'Drizzle'; icon = '🌧️'; }
  else if (code >= 61 && code <= 65) { desc = 'Rainy'; icon = '🌧️'; }
  else if (code >= 80 && code <= 82) { desc = 'Showers'; icon = '🌦️'; }
  else if (code >= 95) { desc = 'Stormy'; icon = '⛈️'; }

  return { temp: Math.round(temp), desc, icon };
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, upcomingDeadlines: 0 });
  const [focusStats, setFocusStats] = useState({ weekHours: 0, todaySessions: 0, todayMinutes: 0 });
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateString(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadData();

    // Fetch weather client-side
    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=14.5995&longitude=120.9842&current=temperature_2m,weather_code');
        const data = await res.json();
        if (data && data.current) {
          const info = getWeatherInfo(data.current.weather_code, data.current.temperature_2m);
          setWeather(info);
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      }
    };
    fetchWeather();
  }, []);

  const loadData = async () => {
    try {
      const [taskStats, pomStats, allTasks] = await Promise.all([
        taskService.getStats(),
        pomodoroService.getStats(),
        taskService.getAll(),
      ]);
      setStats(taskStats);
      setFocusStats(pomStats);
      setTasks(allTasks);

      // Get upcoming tasks (due within 7 days, not done)
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = allTasks
        .filter(
          (t) =>
            t.due_date &&
            new Date(t.due_date) <= weekFromNow &&
            t.status !== 'done'
        )
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);
      setUpcomingTasks(upcoming);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getTasksForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => t.due_date && t.due_date.startsWith(dateStr));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const calendarDaysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const completionPercent =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `In ${days} days`;
  };

  const getDueDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'text-red-400';
    if (days === 0) return 'text-amber-400';
    if (days <= 2) return 'text-orange-400';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-xl bg-muted/50" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600/20 via-blue-700/10 to-blue-800/20 border border-blue-500/20 p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl font-bold">{profile?.name || 'Student'} 👋</h1>
            <p className="text-muted-foreground mt-1">
              {stats.upcomingDeadlines > 0
                ? `You have ${stats.upcomingDeadlines} upcoming deadline${stats.upcomingDeadlines > 1 ? 's' : ''} this week.`
                : 'No upcoming deadlines — keep up the great work!'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {timeString && dateString && (
              <div className="text-left md:text-right bg-navy-800/40 backdrop-blur-md border border-blue-500/10 rounded-xl px-4 py-3 shadow-md min-w-[180px] flex flex-col justify-center">
                <p className="text-lg font-bold font-mono text-blue-400 tracking-wide">{timeString}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{dateString}</p>
              </div>
            )}
            {weather && (
              <div className="text-left md:text-right bg-navy-800/40 backdrop-blur-md border border-blue-500/10 rounded-xl px-4 py-3 shadow-md flex items-center gap-3 animate-fade-in">
                <span className="text-3xl select-none">{weather.icon}</span>
                <div className="text-left">
                  <p className="text-lg font-bold text-blue-400">{weather.temp}°C</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{weather.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-blue-600/10 blur-xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50 hover:border-blue-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold mt-1">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats.completedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 hover:border-amber-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deadlines</p>
                <p className="text-3xl font-bold mt-1">{stats.upcomingDeadlines}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 hover:border-purple-500/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Focus Hours</p>
                <p className="text-3xl font-bold mt-1">{focusStats.weekHours}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Timer className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Ring */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Task Completion</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(completionPercent / 100) * 327} 327`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{completionPercent}%</span>
                <span className="text-sm text-muted-foreground">completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400/50" />
                <p className="text-sm">No upcoming deadlines!</p>
                <p className="text-xs">You&apos;re all caught up 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.course && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${task.course.color}20`,
                              color: task.course.color,
                            }}
                          >
                            {task.course.icon} {task.course.name}
                          </span>
                        )}
                        <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-3">
                      <Clock className={`w-3.5 h-3.5 ${getDueDateColor(task.due_date!)}`} />
                      <span className={`text-xs font-medium ${getDueDateColor(task.due_date!)}`}>
                        {formatDueDate(task.due_date!)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monthly Planner Calendar */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">Monthly Planner</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold mr-2">{monthName}</span>
            <Button variant="outline" size="sm" onClick={goToday} className="h-8">
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Headers */}
          <div className="grid grid-cols-7 mb-2 border-b border-border/20 pb-2">
            {calendarDaysHeader.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[140px] bg-navy-800/10 rounded-lg border border-border/10 opacity-30" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTasks = getTasksForDay(day);

              return (
                <div
                  key={day}
                  className={`min-h-[140px] rounded-lg p-2 flex flex-col items-stretch justify-start transition-all border ${
                    isToday(day)
                      ? 'ring-2 ring-primary ring-offset-1 ring-offset-background border-primary bg-navy-800/30'
                      : 'border-border/30 bg-navy-800/10 hover:bg-navy-800/20'
                  }`}
                >
                  <span
                    className={`text-xs font-extrabold self-end mb-1.5 ${
                      isToday(day) ? 'text-primary' : 'text-muted-foreground/80'
                    }`}
                  >
                    {day}
                  </span>
                  
                  {/* Tasks inside cell */}
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[102px] pr-0.5 scrollbar-thin">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="text-[10px] leading-tight px-1.5 py-0.5 rounded truncate font-semibold border text-left transition-all hover:brightness-110 flex items-center justify-between gap-1 cursor-pointer"
                        style={{
                          backgroundColor: `${task.course?.color || '#2563eb'}12`,
                          color: task.course?.color || '#3b82f6',
                          borderColor: `${task.course?.color || '#2563eb'}25`,
                        }}
                        title={`${task.title} (${TASK_STATUS_LABELS[task.status]})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        <div className="truncate flex items-center gap-0.5">
                          {task.course && <span className="shrink-0">{task.course.icon}</span>}
                          <span className={task.status === 'done' ? 'line-through opacity-60' : ''}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[8px] opacity-75 font-bold uppercase tracking-wider shrink-0 px-1 py-0.2 rounded-sm bg-navy-950/20">
                          {TASK_STATUS_LABELS[task.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl font-bold leading-snug">Task Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 py-3">
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <p className="text-base font-semibold mt-0.5">{selectedTask.title}</p>
              </div>

              {selectedTask.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm text-foreground/90 mt-0.5 bg-navy-800/10 p-2.5 rounded-lg border border-border/10 whitespace-pre-wrap">
                    {selectedTask.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${STATUS_COLORS[selectedTask.status]}`}>
                      {TASK_STATUS_LABELS[selectedTask.status]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 ${PRIORITY_COLORS[selectedTask.priority]}`}>
                      {TASK_PRIORITY_LABELS[selectedTask.priority]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p className="text-sm font-medium mt-1 text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {selectedTask.due_date
                      ? new Date(selectedTask.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'No due date'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Course</Label>
                  <div className="mt-1">
                    {selectedTask.course ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-semibold inline-block"
                        style={{
                          backgroundColor: `${selectedTask.course.color}20`,
                          color: selectedTask.course.color,
                        }}
                      >
                        {selectedTask.course.icon} {selectedTask.course.name}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No Course</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
