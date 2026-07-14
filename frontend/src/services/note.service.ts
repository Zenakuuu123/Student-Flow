import { createClient } from '@/lib/supabase/client';
import type { Note } from '@/types';

const supabase = createClient();

export const noteService = {
  async getAll() {
    const { data, error } = await supabase
      .from('notes')
      .select('*, course:courses(*)')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as Note[];
  },

  async create(note: { title: string; content?: string; course_id?: string | null }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, user_id: user.id })
      .select('*, course:courses(*)')
      .single();
    if (error) throw error;
    return data as Note;
  },

  async update(id: string, updates: Partial<Note>) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select('*, course:courses(*)')
      .single();
    if (error) throw error;
    return data as Note;
  },

  async delete(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },
};
