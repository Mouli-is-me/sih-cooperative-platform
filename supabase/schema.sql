-- CO-OP OS: Intelligent Labour Cooperative OS
-- Production PostgreSQL Database Schema DDL & Initial Seed Data

-- 1. Clean up any pre-existing conflicting tables to prevent type mismatch errors
DROP TABLE IF EXISTS public.cooperative_memberships CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.skill_assessments CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.service_requests CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.cooperatives CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.cooperative_analytics CASCADE;

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('worker', 'cooperative_member', 'cooperative_admin', 'platform_admin', 'customer')),
  profile_info JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Cooperatives Table
CREATE TABLE public.cooperatives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'VERIFIED' CHECK (status IN ('VERIFIED', 'PENDING', 'INACTIVE')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Cooperative Memberships Table
CREATE TABLE public.cooperative_memberships (
  id TEXT PRIMARY KEY,
  cooperative_id TEXT NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  membership_number TEXT,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'OFFICER', 'ADMIN')),
  status TEXT DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_coop_user UNIQUE (cooperative_id, user_id)
);

-- 5. Create Workers Table
CREATE TABLE public.workers (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  badge TEXT DEFAULT 'Verified Cooperative Worker',
  cooperative TEXT NOT NULL,
  coop_id TEXT NOT NULL,
  avatar TEXT,
  rating NUMERIC(3,2) DEFAULT 4.50,
  jobs_completed INTEGER DEFAULT 0,
  on_time_rate INTEGER DEFAULT 95,
  reliability_score INTEGER DEFAULT 95,
  distance_km NUMERIC(4,2) DEFAULT 2.00,
  workload_capacity INTEGER DEFAULT 30,
  workload_status TEXT DEFAULT 'Low',
  availability TEXT DEFAULT 'Available Now',
  is_available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BUSY', 'UNAVAILABLE')),
  skill_fit_percent INTEGER DEFAULT 90,
  verified_skill_level TEXT DEFAULT 'Advanced',
  experience_years INTEGER DEFAULT 5,
  jobs_completed_7days INTEGER DEFAULT 2,
  jobs_completed_30days INTEGER DEFAULT 10,
  earnings_7days NUMERIC(10,2) DEFAULT 1500.00,
  earnings_30days NUMERIC(10,2) DEFAULT 8000.00,
  cohort_opportunity_share TEXT DEFAULT '15%',
  opportunity_equity_score INTEGER DEFAULT 90,
  practical_verification_status TEXT DEFAULT 'VERIFIED',
  skills JSONB DEFAULT '[]'::jsonb,
  verifications JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  fair_match_reasons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Service Requests Table
CREATE TABLE public.service_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  customer_type TEXT DEFAULT 'Household',
  service_category TEXT NOT NULL,
  task_detail TEXT NOT NULL,
  urgency TEXT DEFAULT 'Standard',
  estimated_duration TEXT DEFAULT '45 min',
  location TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  status TEXT DEFAULT 'CREATED',
  assigned_worker_id TEXT REFERENCES public.workers(id) ON DELETE SET NULL,
  raw_text TEXT,
  transition_timestamps JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Jobs / Work Opportunities Table
CREATE TABLE public.jobs (
  id TEXT PRIMARY KEY,
  cooperative_id TEXT REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  created_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  required_skills JSONB DEFAULT '[]'::jsonb,
  location TEXT NOT NULL,
  wage NUMERIC(10,2) NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Applications Table
CREATE TABLE public.applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id TEXT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  CONSTRAINT unique_job_worker_app UNIQUE (job_id, worker_id)
);

-- 9. Create Attendance Records Table
CREATE TABLE public.attendance (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  hours_worked NUMERIC(4,2) DEFAULT 0,
  status TEXT DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'COMPLETED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create Payments Table
CREATE TABLE public.payments (
  id TEXT PRIMARY KEY,
  worker_id TEXT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  cooperative_id TEXT REFERENCES public.cooperatives(id) ON DELETE SET NULL,
  job_id TEXT REFERENCES public.jobs(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'COMPLETED' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  transaction_reference TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Create Notifications Table
CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT', 'APPLICATION')),
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Create Audit Logs Table
CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Create Skill Assessments Table
CREATE TABLE public.skill_assessments (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  status TEXT DEFAULT 'VERIFIED' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  evaluator TEXT DEFAULT 'SYSTEM_FAIRMATCH',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Create Cooperative Federation Analytics Table
CREATE TABLE public.cooperative_analytics (
  id TEXT PRIMARY KEY DEFAULT 'current_analytics',
  active_workers INTEGER DEFAULT 147,
  open_requests INTEGER DEFAULT 326,
  completed_jobs INTEGER DEFAULT 281,
  jobs_completed_month INTEGER DEFAULT 281,
  opportunity_balance_index INTEGER DEFAULT 84,
  demand_trends JSONB DEFAULT '[]'::jsonb,
  workforce_gaps JSONB DEFAULT '[]'::jsonb,
  workload_distribution JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Enable Row Level Security (RLS) & Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_analytics ENABLE ROW LEVEL SECURITY;

-- Default Permissive Policies for Application Server
CREATE POLICY "Allow server access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow server access to cooperatives" ON public.cooperatives FOR ALL USING (true);
CREATE POLICY "Allow server access to memberships" ON public.cooperative_memberships FOR ALL USING (true);
CREATE POLICY "Allow server access to workers" ON public.workers FOR ALL USING (true);
CREATE POLICY "Allow server access to service_requests" ON public.service_requests FOR ALL USING (true);
CREATE POLICY "Allow server access to jobs" ON public.jobs FOR ALL USING (true);
CREATE POLICY "Allow server access to applications" ON public.applications FOR ALL USING (true);
CREATE POLICY "Allow server access to attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow server access to payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow server access to notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow server access to audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Allow server access to skill_assessments" ON public.skill_assessments FOR ALL USING (true);
CREATE POLICY "Allow server access to analytics" ON public.cooperative_analytics FOR ALL USING (true);
