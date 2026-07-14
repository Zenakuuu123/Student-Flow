# StudyFlow — Backend (Database)

This folder contains all database-related files for the StudyFlow application.

## Files

| File | Description |
|---|---|
| `schema.sql` | Complete database schema — tables, RLS policies, triggers |
| `seed.sql` | Sample data for development (uncomment and add your user ID) |
| `migrations/` | Individual migration files (for version control) |

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Wait for the project to finish setting up

### 2. Run Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the contents of `schema.sql`
3. Click **Run** to create all tables, policies, and triggers

### 3. Enable Authentication
1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. (Optional) Disable email confirmation for development:
   - Go to **Authentication** → **Settings**
   - Toggle off "Enable email confirmations"

### 4. Get API Keys
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Add these to `frontend/.env.local`

### 5. (Optional) Seed Data
1. Sign up through the app first (to create a user)
2. Find your user ID: `SELECT id FROM auth.users WHERE email = 'your@email.com';`
3. Replace `USER_ID_HERE` in `seed.sql` with your actual user ID
4. Run the seed SQL in the SQL Editor
