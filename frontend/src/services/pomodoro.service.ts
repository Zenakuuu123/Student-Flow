import { createClient } from '@/lib/supabase/client';
import type { PomodoroSession } from '@/types';

const supabase = createClient();

export const pomodoroService = {
  async logSession(session: { duration: number; task_id?: string | null }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({ ...session, user_id: user.id })
      .select('*, task:tasks(*)')
      .single();
    if (error) throw error;
    return data as PomodoroSession;
  },

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    ).toISOString();

    const { data: todaySessions, error: todayError } = await supabase
      .from('pomodoro_sessions')
      .select('duration')
      .gte('completed_at', startOfDay);

    const { data: weekSessions, error: weekError } = await supabase
      .from('pomodoro_sessions')
      .select('duration')
      .gte('completed_at', startOfWeek);

    if (todayError) throw todayError;
    if (weekError) throw weekError;

    const todayMinutes = (todaySessions || []).reduce((sum, s) => sum + s.duration, 0) / 60;
    const weekMinutes = (weekSessions || []).reduce((sum, s) => sum + s.duration, 0) / 60;

    return {
      todaySessions: todaySessions?.length || 0,
      todayMinutes: Math.round(todayMinutes),
      weekSessions: weekSessions?.length || 0,
      weekMinutes: Math.round(weekMinutes),
      weekHours: Math.round(weekMinutes / 60 * 10) / 10,
    };
  },

  async getRecent(limit = 10) {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*, task:tasks(title)')
      .order('completed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as PomodoroSession[];
  },
};
