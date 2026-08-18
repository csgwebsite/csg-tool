-- ==============================================================================
-- Cóc Task - Hoàn thiện cấu trúc bảng Supabase (Đầy đủ tất cả các cột)
-- Chạy đoạn mã này trong Supabase SQL Editor để bổ sung các cột còn thiếu
-- ==============================================================================

-- 1. Bổ sung các cột cho bảng PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    color TEXT DEFAULT '#f59e0b',
    status TEXT DEFAULT 'active',
    logo TEXT,
    milestones JSONB DEFAULT '[]'::jsonb,
    links JSONB DEFAULT '[]'::jsonb,
    "memberIds" JSONB DEFAULT '[]'::jsonb,
    "leaderId" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isFrozen" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Thêm các cột nếu bảng projects đã tồn tại từ trước
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "memberIds" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "leaderId" TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "startDate" TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "endDate" TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS "isFrozen" BOOLEAN DEFAULT false;

-- 2. Bổ sung các cột cho bảng TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    code TEXT,
    title TEXT NOT NULL,
    description TEXT,
    "projectId" TEXT,
    priority TEXT DEFAULT 'medium',
    "assigneeId" TEXT,
    "assignerId" TEXT,
    "reviewerId" TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'todo',
    tags JSONB DEFAULT '[]'::jsonb,
    "createdBy" TEXT,
    comments JSONB DEFAULT '[]'::jsonb,
    "approvedBy" TEXT,
    "fileLink" TEXT,
    "usesAI" BOOLEAN DEFAULT false,
    links JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Thêm các cột nếu bảng tasks đã tồn tại từ trước
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "assigneeId" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "assignerId" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "reviewerId" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "fileLink" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "usesAI" BOOLEAN DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- 3. Bổ sung các cột cho bảng MEMBERS
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
    "isMaster" BOOLEAN DEFAULT false,
    avatar TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    "projectRoles" JSONB DEFAULT '{}'::jsonb,
    facebook TEXT,
    tiktok TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "bankBranch" TEXT,
    "accessHistory" JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Thêm các cột nếu bảng members đã tồn tại từ trước
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS "isMaster" BOOLEAN DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS "projectRoles" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS "bankAccount" TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS "bankBranch" TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 4. Bổ sung bảng NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'info',
    "linkId" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "linkId" TEXT;

-- 5. Cấp quyền RLS công khai cho tất cả bảng
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('members', 'projects', 'tasks', 'data_items', 'tags', 'notifications')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access for %I" ON public.%I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access for %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
