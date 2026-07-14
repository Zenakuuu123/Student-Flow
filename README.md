# StudyFlow 🎓

A student-friendly project management web application built with Next.js and Supabase.

## Features

- 📊 **Dashboard** — Overview with stats, progress ring, upcoming deadlines
- ✅ **Task Manager** — Create, filter, sort, and manage tasks with priorities
- 📋 **Kanban Board** — Drag-and-drop task columns (To Do → In Progress → Review → Done)
- 📅 **Calendar** — Monthly calendar view with task dots
- 📝 **Notes** — Rich text editor with auto-save
- ⏱️ **Pomodoro Timer** — Focus timer with session tracking
- 💰 **Expenses Tracker** — Budget tracking with category breakdown and CSV export
- 📚 **Courses** — Organize everything by course/subject
- 🔐 **Authentication** — Email/password signup and login via Supabase Auth

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + TypeScript |
| UI | shadcn/ui + Lucide React |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (PostgreSQL) |
| Deployment | Vercel + Supabase Cloud |

## Getting Started

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `backend/schema.sql`
3. Enable Email auth in Authentication → Providers
4. Copy your Project URL and anon key from Settings → API

### 2. Configure Environment

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

### 3. Install & Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Vercel

1. Push to GitHub
2. Import in Vercel → set root directory to `frontend`
3. Add environment variables
4. Deploy! 🚀

## Project Structure

```
studyflow/
├── frontend/          Next.js application
│   ├── src/
│   │   ├── app/       Pages (App Router)
│   │   ├── components/ Reusable UI components
│   │   ├── hooks/     Custom React hooks
│   │   ├── lib/       Utilities + Supabase clients
│   │   ├── providers/ React Context providers
│   │   ├── services/  Data access layer
│   │   └── types/     TypeScript definitions
│   └── package.json
├── backend/           Database configuration
│   ├── schema.sql     Full database schema + RLS
│   ├── seed.sql       Sample data
│   └── README.md      Setup instructions
└── README.md
```
