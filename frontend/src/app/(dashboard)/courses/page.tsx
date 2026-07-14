'use client';

import { useEffect, useState, useCallback } from 'react';
import { courseService } from '@/services/course.service';
import { taskService } from '@/services/task.service';
import { noteService } from '@/services/note.service';
import { expenseService } from '@/services/expense.service';
import type { Course } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
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
  GraduationCap,
  Plus,
  Trash2,
  Pencil,
  CheckSquare,
  FileText,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const COURSE_ICONS = ['📚', '📐', '💻', '🔬', '📖', '🏛️', '🎨', '🎵', '🌍', '🧮', '⚗️', '🏋️', '📊', '🗣️', '🔧'];
const COURSE_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706',
  '#0891b2', '#be185d', '#4f46e5', '#15803d', '#c2410c',
  '#7e22ce', '#0d9488', '#b91c1c', '#ca8a04', '#6366f1',
];

interface CourseStats {
  tasks: number;
  notes: number;
  expenses: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStats, setCourseStats] = useState<Record<string, CourseStats>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    color: '#2563eb',
    icon: '📚',
  });

  const loadData = useCallback(async () => {
    try {
      const [c, tasks, notes, expenses] = await Promise.all([
        courseService.getAll(),
        taskService.getAll(),
        noteService.getAll(),
        expenseService.getAll(),
      ]);
      setCourses(c);

      // Calculate stats per course
      const stats: Record<string, CourseStats> = {};
      c.forEach((course) => {
        stats[course.id] = {
          tasks: tasks.filter((t) => t.course_id === course.id).length,
          notes: notes.filter((n) => n.course_id === course.id).length,
          expenses: expenses
            .filter((e) => e.course_id === course.id)
            .reduce((sum, e) => sum + Number(e.amount), 0),
        };
      });
      setCourseStats(stats);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ name: '', color: '#2563eb', icon: '📚' });
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ name: course.name, color: course.color, icon: course.icon });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Course name is required');
      return;
    }
    setSaving(true);
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, form);
        toast.success('Course updated');
      } else {
        await courseService.create(form);
        toast.success('Course created');
      }
      setDialogOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await courseService.delete(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course. Remove linked items first.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 rounded-lg bg-muted/50 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Courses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* Course Cards */}
      {courses.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No courses yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Add your courses to organize tasks, notes, and expenses</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const stats = courseStats[course.id] || { tasks: 0, notes: 0, expenses: 0 };
            return (
              <Card
                key={course.id}
                className="bg-card/50 border-border/50 hover:border-primary/20 transition-all group overflow-hidden"
              >
                {/* Color accent top border */}
                <div className="h-1.5" style={{ backgroundColor: course.color }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${course.color}15` }}
                      >
                        {course.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{course.name}</h3>
                        <div
                          className="w-3 h-3 rounded-full mt-1"
                          style={{ backgroundColor: course.color }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(course)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <CheckSquare className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                      <p className="text-lg font-bold">{stats.tasks}</p>
                      <p className="text-[10px] text-muted-foreground">Tasks</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <FileText className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                      <p className="text-lg font-bold">{stats.notes}</p>
                      <p className="text-[10px] text-muted-foreground">Notes</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                      <DollarSign className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                      <p className="text-lg font-bold">₱{stats.expenses.toFixed(0)}</p>
                      <p className="text-[10px] text-muted-foreground">Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mathematics, Computer Science..."
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {COURSE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                      form.icon === icon
                        ? 'bg-primary/20 ring-2 ring-primary scale-110'
                        : 'bg-muted/50 hover:bg-accent'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COURSE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      form.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${form.color}15` }}
                >
                  {form.icon}
                </div>
                <span className="font-semibold">{form.name || 'Course Name'}</span>
                <div className="w-3 h-3 rounded-full ml-auto" style={{ backgroundColor: form.color }} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
