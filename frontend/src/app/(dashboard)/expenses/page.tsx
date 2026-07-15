'use client';

import { useEffect, useState, useCallback } from 'react';
import { expenseService } from '@/services/expense.service';
import { courseService } from '@/services/course.service';
import { parseCourseName } from '@/lib/utils';
import { CourseIcon } from '@/components/ui/course-icon';
import type { Expense, Course, ExpenseCategory } from '@/types';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Plus,
  Trash2,
  Pencil,
  Download,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_CATEGORIES = [
  { value: 'textbooks', label: 'Textbooks', icon: '📚', color: '#2563eb' },
  { value: 'supplies', label: 'Supplies', icon: '✏️', color: '#7c3aed' },
  { value: 'software', label: 'Software', icon: '💻', color: '#059669' },
  { value: 'food', label: 'Food', icon: '🍔', color: '#d97706' },
  { value: 'transport', label: 'Transport', icon: '🚌', color: '#dc2626' },
  { value: 'other', label: 'Other', icon: '📦', color: '#6b7280' },
];

const CATEGORY_ICONS = ['📚', '✏️', '💻', '🍔', '🚌', '🏠', '🎁', '🩺', '🎬', '☕', '👗', '🔌', '📦', '💸', '🎫', '🛒', '🔑', '💡'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [customCategories, setCustomCategories] = useState<{ value: string; label: string; icon: string; color: string }[]>([]);
  const [disabledCategories, setDisabledCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Custom category form state
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  const [budget, setBudget] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('studyflow-budget') || '500');
    }
    return 500;
  });

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'other' as string,
    date: new Date().toISOString().split('T')[0],
    course_id: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('studyflow-custom-categories');
      if (stored) {
        try {
          setCustomCategories(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
      const storedDisabled = localStorage.getItem('studyflow-disabled-categories');
      if (storedDisabled) {
        try {
          setDisabledCategories(JSON.parse(storedDisabled));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const allCategories = [
    ...DEFAULT_CATEGORIES,
    ...customCategories,
  ].filter((cat) => !disabledCategories.includes(cat.value));

  const toggleCategoryDisabled = (val: string) => {
    let updated: string[];
    if (disabledCategories.includes(val)) {
      updated = disabledCategories.filter((x) => x !== val);
      toast.success('Category enabled');
    } else {
      updated = [...disabledCategories, val];
      toast.success('Category disabled');
    }
    setDisabledCategories(updated);
    localStorage.setItem('studyflow-disabled-categories', JSON.stringify(updated));
  };

  const addCustomCategory = () => {
    if (!newCatLabel.trim()) {
      toast.error('Category name is required');
      return;
    }
    const val = newCatLabel.trim().toLowerCase().replace(/\s+/g, '-');
    if (allCategories.some((c) => c.value === val)) {
      toast.error('Category already exists');
      return;
    }
    const updated = [...customCategories, { value: val, label: newCatLabel.trim(), icon: newCatIcon, color: newCatColor }];
    setCustomCategories(updated);
    localStorage.setItem('studyflow-custom-categories', JSON.stringify(updated));
    setNewCatLabel('');
    toast.success('Category added');
  };

  const deleteCustomCategory = (val: string) => {
    const updated = customCategories.filter((c) => c.value !== val);
    setCustomCategories(updated);
    localStorage.setItem('studyflow-custom-categories', JSON.stringify(updated));
    toast.success('Category deleted');
  };

  const loadData = useCallback(async () => {
    try {
      const [e, c] = await Promise.all([expenseService.getAll(), courseService.getAll()]);
      setExpenses(e);
      setCourses(c);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Current month expenses
  const now = new Date();
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budgetPercent = Math.min((totalSpent / budget) * 100, 100);

  // Category breakdown
  const categoryTotals = currentMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const openCreate = () => {
    setEditingExpense(null);
    setForm({ description: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], course_id: '' });
    setDialogOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date.split('T')[0],
      course_id: expense.course_id || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error('Description and amount are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category as ExpenseCategory,
        date: form.date,
        course_id: form.course_id || null,
      };

      if (editingExpense) {
        await expenseService.update(editingExpense.id, payload);
        toast.success('Expense updated');
      } else {
        await expenseService.create(payload);
        toast.success('Expense added');
      }
      setDialogOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await expenseService.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  const handleBudgetChange = (value: string) => {
    const num = Number(value);
    if (num >= 0) {
      setBudget(num);
      localStorage.setItem('studyflow-budget', String(num));
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = expenses.map((e) => [
      e.date.split('T')[0],
      e.description,
      e.category,
      e.amount,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-expenses-${now.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const getCategoryInfo = (cat: string) =>
    allCategories.find((c) => c.value === cat) || { label: cat, icon: '📦', color: '#6b7280' };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-40 rounded-xl bg-muted/50" />
          <div className="h-40 rounded-xl bg-muted/50 lg:col-span-2" />
        </div>
        <div className="h-64 rounded-xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track your student spending</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoriesDialogOpen(true)} className="gap-2">
            <span>⚙️ Categories</span>
          </Button>
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget Card */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Monthly Budget</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₱{totalSpent.toFixed(2)}
              <span className="text-sm text-muted-foreground font-normal"> / ₱{budget}</span>
            </div>
            <Progress
              value={budgetPercent}
              className="mt-3 h-2"
            />
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
              <span className="text-xs text-muted-foreground font-medium">{budgetPercent.toFixed(0)}% used</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Set Limit:</span>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-[10px] text-muted-foreground font-bold">₱</span>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    className="w-20 h-7 pl-5 pr-1.5 text-xs bg-navy-950/40 border-border/40 focus-visible:ring-1 focus-visible:ring-primary rounded-md font-semibold"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-2 bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allCategories.map((cat) => {
                const amount = categoryTotals[cat.value] || 0;
                const percent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                return (
                  <div key={cat.value} className="flex items-center gap-2.5 p-2 rounded-lg bg-background/30">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{cat.icon} {cat.label}</p>
                      <p className="text-xs text-muted-foreground">
                        ₱{amount.toFixed(2)} ({percent.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Table */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <DollarSign className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No expenses yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Start tracking your spending!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const catInfo = getCategoryInfo(expense.category);
                  return (
                    <TableRow key={expense.id} className="group">
                      <TableCell className="text-sm">
                        {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full" style={{
                          backgroundColor: `${CATEGORY_COLORS[expense.category]}20`,
                          color: CATEGORY_COLORS[expense.category],
                        }}>
                          {catInfo.icon} {catInfo.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {expense.course ? (
                          <span className="inline-flex items-center gap-1">
                            <CourseIcon icon={expense.course.icon} className="w-3.5 h-3.5" />
                            <span>{parseCourseName(expense.course.name)}</span>
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">₱{Number(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(expense)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What did you spend on?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount (₱)</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => v && setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    {(() => {
                      const cat = allCategories.find((c) => c.value === form.category);
                      return cat ? `${cat.icon} ${cat.label}` : 'Select Category';
                    })()}
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <Dialog open={categoriesDialogOpen} onOpenChange={setCategoriesDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Add Custom Category Form */}
            <div className="p-3.5 rounded-xl border border-border/50 bg-background/50 space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Add Custom Category</Label>
              <div className="flex gap-2">
                <Input
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="e.g. Rent, Subscriptions..."
                  className="flex-1"
                />
                <Input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer rounded-lg bg-navy-950 border border-border/40 shrink-0"
                />
              </div>

              {/* Icon selection */}
              <div className="space-y-1">
                <Label className="text-xs">Select Icon</Label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-navy-950/20 border border-border/20 rounded-lg">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewCatIcon(icon)}
                      className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-accent transition-colors ${
                        newCatIcon === icon ? 'bg-primary/20 ring-1 ring-primary' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={addCustomCategory} className="w-full gap-1.5 h-9 mt-1" size="sm">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>

            {/* List of default Categories */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Default Categories</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isDisabled = disabledCategories.includes(cat.value);
                  return (
                    <div key={cat.value} className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isDisabled ? 'bg-background/10 border-border/20 opacity-50' : 'bg-background/30 border-border/10'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className={`text-xs font-medium ${isDisabled ? 'line-through text-muted-foreground' : ''}`}>{cat.icon} {cat.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-2 text-[10px] font-bold ${
                          isDisabled ? 'text-primary hover:bg-primary/10' : 'text-destructive hover:bg-destructive/10'
                        }`}
                        onClick={() => toggleCategoryDisabled(cat.value)}
                      >
                        {isDisabled ? 'Show' : 'Hide'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of custom Categories */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Custom Categories</Label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {customCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-3 text-center bg-background/20 rounded-lg border border-dashed border-border/30">No custom categories added yet</p>
                ) : (
                  customCategories.map((cat) => (
                    <div key={cat.value} className="flex items-center justify-between p-2 rounded-lg bg-background/30 border border-border/10">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium">{cat.icon} {cat.label}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteCustomCategory(cat.value)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCategoriesDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
