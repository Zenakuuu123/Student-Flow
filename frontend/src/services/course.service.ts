import { createClient } from '@/lib/supabase/client';
import type { Course } from '@/types';

const supabase = createClient();

export const courseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Course[];
  },

  async create(course: { name: string; color: string; icon: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('courses')
      .insert({ ...course, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  },

  async update(id: string, updates: Partial<Course>) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  },

  async delete(id: string) {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },
};
