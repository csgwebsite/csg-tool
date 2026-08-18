-- ==============================================================================
-- Cóc Task - Supabase Database Schema & Storage Setup
-- Copy and paste this script into Supabase SQL Editor to initialize all tables
-- ==============================================================================

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    phone TEXT,
    "emailFE" TEXT,
    "emailFPT" TEXT,
    gmail TEXT,
    location TEXT,
    position TEXT,
    school TEXT,
    generation TEXT,
    cccd TEXT,
    mst TEXT,
    dob TEXT,
    "startDate" TEXT,
    "isAdmin" BOOLEAN DEFAULT false,
    "accessHistory" JSONB DEFAULT '[]'::jsonb,
    avatar TEXT,
    note TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#f59e0b',
    status TEXT DEFAULT 'active',
    "memberIds" JSONB DEFAULT '[]'::jsonb,
    "leaderId" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isFrozen" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "projectId" TEXT,
    "assigneeIds" JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    "dueDate" TEXT,
    "tagIds" JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    "subtasks" JSONB DEFAULT '[]'::jsonb,
    "comments" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Data Items (Storage for internal documents, links, settings)
CREATE TABLE IF NOT EXISTS public.data_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    url TEXT,
    description TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Tags Table
CREATE TABLE IF NOT EXISTS public.tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#f59e0b',
    type TEXT DEFAULT 'general',
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    "isRead" BOOLEAN DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- Row Level Security (RLS) & Policies
-- ==============================================================================
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access with anon key (customizable as needed)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('members', 'projects', 'tasks', 'data_items', 'tags', 'notifications')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access for %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access for %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- Storage Bucket Setup for 'uploads'
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access for uploads bucket" ON storage.objects;
CREATE POLICY "Public access for uploads bucket"
ON storage.objects FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.members, public.projects, public.tasks, public.data_items, public.tags, public.notifications;
