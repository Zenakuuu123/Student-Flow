'use client';

import { useEffect, useState, useCallback } from 'react';
import { expenseService } from '@/services/expense.service';
import { courseService } from '@/services/course.service';
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('studyflow-budget') || '500');
    }
    return 500;
  });

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'other' as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    course_id: '',
  });

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
    EXPENSE_CATEGORIES.find((c) => c.value === cat) || { label: cat, icon: '📦' };

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
              {EXPENSE_CATEGORIES.map((cat) => {
                const amount = categoryTotals[cat.value] || 0;
                const percent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                return (
                  <div key={cat.value} className="flex items-center gap-2.5 p-2 rounded-lg bg-background/30">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[cat.value] }}
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
                        {expense.course ? `${expense.course.icon} ${expense.course.name}` : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">₱{Number(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <Select value={form.category} onValueChange={(v) => v && setForm({ ...form, category: v as ExpenseCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={form.course_id || 'none'} onValueChange={(v) => setForm({ ...form, course_id: !v || v === 'none' ? '' : v })}>
                  <SelectTrigger>
                    {form.course_id ? (
                      (() => {
                        const course = courses.find((c) => c.id === form.course_id);
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
    </div>
  );
}
