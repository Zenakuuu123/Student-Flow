'use client';

import { useEffect, useState, useCallback } from 'react';
import { taskService } from '@/services/task.service';
import { courseService } from '@/services/course.service';
import type { Task, Course, TaskStatus, TaskPriority } from '@/types';
import { parseDescriptionAndRange, formatDescriptionWithRange, formatDueDateRange, parseCourseName } from '@/lib/utils';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from '@/types';
import { CourseIcon } from '@/components/ui/course-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Clock,
  CheckSquare,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    start_date: '',
    due_date: '',
    course_id: '',
  });

  const loadData = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([taskService.getAll(), courseService.getAll()]);
      setTasks(t);
      setCourses(c);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterCourse !== 'all' && t.course_id !== filterCourse) return false;
    return true;
  });

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', start_date: '', due_date: '', course_id: '' });
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    const { cleanDescription, range } = parseDescriptionAndRange(task.description);
    const courseExists = courses.some((c) => c.id === task.course_id);
    setForm({
      title: task.title,
      description: cleanDescription,
      status: task.status,
      priority: task.priority,
      start_date: range ? range.start : '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      course_id: courseExists ? (task.course_id || '') : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const finalDescription = formatDescriptionWithRange(
        form.description,
        form.start_date && form.due_date ? { start: form.start_date, end: form.due_date } : null
      );

      const payload = {
        title: form.title,
        description: finalDescription || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
        course_id: form.course_id || null,
      };

      if (editingTask) {
        await taskService.update(editingTask.id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await taskService.delete(id);
      toast.success('Task deleted');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  const toggleDone = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await taskService.update(task.id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTaskDate = (task: Task) => {
    return formatDueDateRange(task.due_date, task.description);
  };

  const isOverdue = (d: string) => new Date(d) < new Date();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 rounded-lg bg-muted/50 w-64" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v || 'all')}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v || 'all')}>
              <SelectTrigger className="w-[140px] bg-background/50">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCourse} onValueChange={(v) => setFilterCourse(v || 'all')}>
              <SelectTrigger className="w-[160px] bg-background/50">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No tasks found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {tasks.length === 0 ? 'Create your first task to get started!' : 'Try adjusting your filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`bg-card/50 border-border/50 hover:border-primary/20 transition-all group ${
                task.status === 'done' ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDone(task)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                      task.status === 'done'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-muted-foreground/30 hover:border-primary'
                    }`}
                  >
                    {task.status === 'done' && <CheckSquare className="w-3 h-3" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {parseDescriptionAndRange(task.description).cleanDescription}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[task.status]}`}>
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                      {task.course && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                          style={{ backgroundColor: `${task.course.color}20`, color: task.course.color }}
                        >
                          <CourseIcon icon={task.course.icon} className="w-3.5 h-3.5" /> {parseCourseName(task.course.name)}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue(task.due_date) && task.status !== 'done' ? 'text-red-400' : 'text-muted-foreground'}`}>
                          <Clock className="w-3 h-3" />
                          {formatTaskDate(task)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as TaskStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => v && setForm({ ...form, priority: v as TaskPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Date (From)</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date (To)</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={form.course_id || 'none'} onValueChange={(v) => setForm({ ...form, course_id: !v || v === 'none' ? '' : v })}>
                <SelectTrigger className="flex items-center gap-1.5">
                  {form.course_id ? (
                    (() => {
                      const course = courses.find((c) => c.id === form.course_id);
                      return course ? (
                        <span className="flex items-center gap-1.5">
                          <CourseIcon icon={course.icon} className="w-4 h-4" />
                          <span>{parseCourseName(course.name)}</span>
                        </span>
                      ) : 'None';
                    })()
                  ) : (
                    <SelectValue placeholder="None" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Course</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-1.5">
                        <CourseIcon icon={c.icon} className="w-4 h-4" />
                        <span>{parseCourseName(c.name)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
