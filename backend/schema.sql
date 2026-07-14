-- ============================================
-- StudyFlow — Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Profiles (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  school      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. Courses
-- ============================================
CREATE TABLE public.courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#2563eb',
  icon        TEXT NOT NULL DEFAULT '📚',
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. Tasks
-- ============================================
CREATE TABLE public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo',
  priority    TEXT NOT NULL DEFAULT 'medium',
  due_date    TIMESTAMPTZ,
  course_id   UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. Notes
-- ============================================
CREATE TABLE public.notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT DEFAULT '',
  course_id   UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. Expenses
-- ============================================
CREATE TABLE public.expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  category    TEXT NOT NULL,
  date        DATE NOT NULL,
  course_id   UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. Pomodoro Sessions
-- ============================================
CREATE TABLE public.pomodoro_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duration     INTEGER NOT NULL,
  task_id      UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 8. Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, school)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    NEW.raw_user_meta_data->>'school'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. Enable Row Level Security
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. RLS Policies
-- ============================================

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Courses
CREATE POLICY "Users can do everything with own courses"
  ON public.courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can do everything with own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notes
CREATE POLICY "Users can do everything with own notes"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Expenses
CREATE POLICY "Users can do everything with own expenses"
  ON public.expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pomodoro Sessions
CREATE POLICY "Users can do everything with own sessions"
  ON public.pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
