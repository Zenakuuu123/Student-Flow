import { createClient } from '@/lib/supabase/client';
import type { Expense, ExpenseCategory } from '@/types';

const supabase = createClient();

export const expenseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*, course:courses(*)')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as Expense[];
  },

  async create(expense: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    course_id?: string | null;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id })
      .select('*, course:courses(*)')
      .single();
    if (error) throw error;
    return data as Expense;
  },

  async update(id: string, updates: Partial<Expense>) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select('*, course:courses(*)')
      .single();
    if (error) throw error;
    return data as Expense;
  },

  async delete(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  async getMonthlySummary(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from('expenses')
      .select('amount, category')
      .gte('date', startDate)
      .lt('date', endDate);

    if (error) throw error;

    const total = data.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = data.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return { total, byCategory };
  },
};
