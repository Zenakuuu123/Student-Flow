'use client';

import { useEffect, useState, useCallback } from 'react';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types';
import { TASK_PRIORITY_LABELS, PRIORITY_COLORS, TASK_STATUS_LABELS, STATUS_COLORS } from '@/types';
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
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch {
      console.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  useEffect(() => { loadTasks(); }, [loadTasks]);

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

  const selectedTasks = selectedDate
    ? tasks.filter((t) => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="h-[600px] rounded-xl bg-muted/50 animate-pulse" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">View your tasks by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{monthName}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToday}>
                  Today
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {days.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayTasks = getTasksForDay(day);
                const isSelected =
                  selectedDate &&
                  day === selectedDate.getDate() &&
                  month === selectedDate.getMonth() &&
                  year === selectedDate.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start text-sm transition-all hover:bg-accent relative ${
                      isToday(day)
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                        : ''
                    } ${isSelected ? 'bg-primary/10 border border-primary/30' : ''}`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isToday(day) ? 'text-primary font-bold' : ''
                      }`}
                    >
                      {day}
                    </span>
                    {/* Task dots */}
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: task.course?.color || '#2563eb' }}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] text-muted-foreground">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Detail */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Click on a date to see tasks due that day.
              </p>
            ) : selectedTasks.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">No tasks due this day</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-background/50 border border-border/30 cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                      {task.course && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${task.course.color}20`,
                            color: task.course.color,
                          }}
                        >
                          {task.course.icon} {task.course.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
