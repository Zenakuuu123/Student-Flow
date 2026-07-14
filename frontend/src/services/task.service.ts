import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const supabase = createClient();

export const taskService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, course:courses(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Task[];
  },

  async create(task: {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    due_date?: string | null;
    course_id?: string | null;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select('*, course:courses(*)')
      .single();
    if (error) throw error;
    return data as Task;
  },

  async update(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, course:courses(*)')
      .single();
    if (error) throw error;
    return data as Task;
  },

  async delete(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async getStats() {
    const { data: tasks, error } = await supabase.from('tasks').select('status, due_date');
    if (error) throw error;

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'done').length,
      upcomingDeadlines: tasks.filter(
        (t) => t.due_date && new Date(t.due_date) <= weekFromNow && t.status !== 'done'
      ).length,
    };
  },
};
