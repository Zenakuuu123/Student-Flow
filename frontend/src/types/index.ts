// ===== Database Types =====
export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  school?: string | null;
}

export interface Course {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  course_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  course?: Course | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  course_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  course?: Course | null;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  course_id: string | null;
  user_id: string;
  created_at: string;
  course?: Course | null;
}

export interface PomodoroSession {
  id: string;
  duration: number;
  task_id: string | null;
  user_id: string;
  completed_at: string;
  task?: Task | null;
}

// ===== Enums =====
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ExpenseCategory = 'textbooks' | 'supplies' | 'software' | 'food' | 'transport' | 'other';

// ===== UI Types =====
export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  focusHours: number;
}

// ===== Constants =====
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'textbooks', label: 'Textbooks', icon: '📚' },
  { value: 'supplies', label: 'Supplies', icon: '✏️' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'food', label: 'Food', icon: '🍔' },
  { value: 'transport', label: 'Transport', icon: '🚌' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  textbooks: '#2563eb',
  supplies: '#7c3aed',
  software: '#059669',
  food: '#d97706',
  transport: '#dc2626',
  other: '#6b7280',
};
