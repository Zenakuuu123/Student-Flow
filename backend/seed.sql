-- ============================================
-- StudyFlow — Seed Data (for development)
-- Run AFTER schema.sql
-- Note: These require a valid user_id.
-- Replace the UUID below with your actual user ID from auth.users
-- ============================================

-- To find your user ID after signup:
-- SELECT id FROM auth.users WHERE email = 'your@email.com';

-- Example seed (uncomment and replace USER_ID_HERE):

/*
-- Sample Courses
INSERT INTO public.courses (name, color, icon, user_id) VALUES
  ('Mathematics',      '#2563eb', '📐', 'USER_ID_HERE'),
  ('Computer Science', '#7c3aed', '💻', 'USER_ID_HERE'),
  ('Physics',          '#059669', '🔬', 'USER_ID_HERE'),
  ('English',          '#dc2626', '📖', 'USER_ID_HERE'),
  ('History',          '#d97706', '🏛️', 'USER_ID_HERE');

-- Sample Tasks (use course IDs from above inserts)
INSERT INTO public.tasks (title, description, status, priority, due_date, user_id) VALUES
  ('Calculus Problem Set 5',    'Complete exercises 1-20 from Chapter 5',  'todo',        'high',   now() + interval '2 days',  'USER_ID_HERE'),
  ('CS Project: Database Design', 'Design ERD for student management system', 'in_progress', 'urgent', now() + interval '1 day',   'USER_ID_HERE'),
  ('Physics Lab Report',        'Write up results from pendulum experiment', 'todo',        'medium', now() + interval '5 days',  'USER_ID_HERE'),
  ('Essay: Shakespeare Analysis', 'Compare themes in Hamlet and Macbeth',   'review',      'high',   now() + interval '3 days',  'USER_ID_HERE'),
  ('History Reading Chapter 12', 'World War II - Pacific Theater',          'done',        'low',    now() - interval '1 day',   'USER_ID_HERE'),
  ('Algorithm Assignment',       'Implement BFS and DFS in Python',         'todo',        'medium', now() + interval '4 days',  'USER_ID_HERE'),
  ('Math Quiz Preparation',     'Review integration techniques',            'in_progress', 'high',   now() + interval '1 day',   'USER_ID_HERE');

-- Sample Notes
INSERT INTO public.notes (title, content, user_id) VALUES
  ('Meeting Notes - Group Project', 'Discussed project timeline. Assigned roles: John (frontend), Jane (backend), Me (database).', 'USER_ID_HERE'),
  ('Calculus Formulas',             'Integration by parts: ∫u dv = uv - ∫v du\nChain rule: d/dx[f(g(x))] = f''(g(x)) · g''(x)', 'USER_ID_HERE'),
  ('CS Lecture Notes - Week 5',     'Topics covered: Normalization (1NF, 2NF, 3NF), BCNF, Denormalization trade-offs',          'USER_ID_HERE');

-- Sample Expenses
INSERT INTO public.expenses (description, amount, category, date, user_id) VALUES
  ('Calculus Textbook',         45.99,  'textbooks',  CURRENT_DATE - interval '30 days', 'USER_ID_HERE'),
  ('Notebook and Pens',          8.50,  'supplies',   CURRENT_DATE - interval '25 days', 'USER_ID_HERE'),
  ('JetBrains Student License',  0.00,  'software',   CURRENT_DATE - interval '20 days', 'USER_ID_HERE'),
  ('Campus Lunch',               7.25,  'food',       CURRENT_DATE - interval '2 days',  'USER_ID_HERE'),
  ('Bus Pass (Monthly)',        35.00,  'transport',  CURRENT_DATE - interval '1 day',   'USER_ID_HERE'),
  ('Lab Equipment',             12.99,  'supplies',   CURRENT_DATE - interval '15 days', 'USER_ID_HERE'),
  ('Coffee (Study Session)',     4.50,  'food',       CURRENT_DATE,                       'USER_ID_HERE');

-- Sample Pomodoro Sessions
INSERT INTO public.pomodoro_sessions (duration, user_id, completed_at) VALUES
  (1500, 'USER_ID_HERE', now() - interval '2 hours'),
  (1500, 'USER_ID_HERE', now() - interval '1 hour 30 minutes'),
  (1500, 'USER_ID_HERE', now() - interval '1 hour'),
  (1500, 'USER_ID_HERE', now() - interval '30 minutes');
*/
