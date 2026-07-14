'use client';

import { useEffect, useState, useCallback } from 'react';
import { taskService } from '@/services/task.service';
import { courseService } from '@/services/course.service';
import type { Task, Course, TaskStatus, TaskPriority } from '@/types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, PRIORITY_COLORS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Columns3, Plus, Clock, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: '📋 To Do', color: 'border-t-slate-500' },
  { id: 'in_progress', title: '🔄 In Progress', color: 'border-t-blue-500' },
  { id: 'review', title: '👀 Review', color: 'border-t-purple-500' },
  { id: 'done', title: '✅ Done', color: 'border-t-emerald-500' },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addToColumn, setAddToColumn] = useState<TaskStatus>('todo');
  const [saving, setSaving] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskCourse, setNewTaskCourse] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([taskService.getAll(), courseService.getAll()]);
      setTasks(t);
      setCourses(c);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    el.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('dragging');
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTask || draggedTask.status === status) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === draggedTask.id ? { ...t, status } : t))
    );

    try {
      await taskService.update(draggedTask.id, { status });
      toast.success(`Moved to ${TASK_STATUS_LABELS[status]}`);
      
      // Confetti celebration when moved to Done!
      if (status === 'done') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch {
      loadData(); // Revert on failure
      toast.error('Failed to move task');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      await taskService.create({
        title: newTaskTitle,
        status: addToColumn,
        priority: newTaskPriority,
        course_id: newTaskCourse || null,
        due_date: newTaskDueDate || null,
      });
      toast.success('Task created');
      setDialogOpen(false);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskCourse('');
      setNewTaskDueDate('');
      
      // Confetti celebration if added directly to Done
      if (addToColumn === 'done') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      loadData();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const openAddDialog = (column: TaskStatus) => {
    setAddToColumn(column);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCourse('');
    setNewTaskDueDate('');
    setDialogOpen(true);
  };

  const formatDueDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex gap-4 h-full animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 rounded-xl bg-muted/50 h-[400px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Columns3 className="w-6 h-6 text-primary" />
          Kanban Board
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drag and drop tasks between columns
        </p>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {COLUMNS.map((col) => {
          const columnTasks = getColumnTasks(col.id);
          const isDragOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border ${col.color} border-t-2 border-border/50 bg-card/30 transition-colors ${
                isDragOver ? 'drag-over' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="font-semibold text-sm">{col.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openAddDialog(col.id)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 pt-0 space-y-2 overflow-y-auto min-h-[200px]">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className="bg-card/80 border-border/50 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{task.title}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[task.priority]}`}>
                              {TASK_PRIORITY_LABELS[task.priority]}
                            </Badge>
                            {task.course && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${task.course.color}20`, color: task.course.color }}
                              >
                                {task.course.icon}
                              </span>
                            )}
                            {task.due_date && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDueDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add to {TASK_STATUS_LABELS[addToColumn]}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newTaskPriority} onValueChange={(v) => v && setNewTaskPriority(v as TaskPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={newTaskCourse || 'none'} onValueChange={(v) => setNewTaskCourse(!v || v === 'none' ? '' : v)}>
                <SelectTrigger>
                  {newTaskCourse ? (
                    (() => {
                      const course = courses.find((c) => c.id === newTaskCourse);
                      return course ? `${course.icon} ${course.name}` : 'None';
                    })()
                  ) : (
                    <SelectValue placeholder="None" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Course</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
