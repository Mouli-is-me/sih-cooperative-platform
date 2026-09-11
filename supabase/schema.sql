-- CO-OP OS: Intelligent Labour Cooperative OS
-- Supabase PostgreSQL Database Schema DDL & Initial Seed Data

-- 1. Create Workers Table
CREATE TABLE IF NOT EXISTS public.workers (
  id TEXT PRIMARY KEY,
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
  status TEXT DEFAULT 'AVAILABLE',
  skill_fit_percent INTEGER DEFAULT 90,
  verified_skill_level TEXT DEFAULT 'Advanced',
  experience_years INTEGER DEFAULT 5,
  jobs_completed_7days INTEGER DEFAULT 2,
  jobs_completed_30days INTEGER DEFAULT 10,
  earnings_7days NUMERIC(10,2) DEFAULT 1500.00,
  earnings_30days NUMERIC(10,2) DEFAULT 8000.00,
  cohort_opportunity_share TEXT DEFAULT '15%',
  opportunity_equity_score INTEGER DEFAULT 90,
  skills JSONB DEFAULT '[]'::jsonb,
  verifications JSONB DEFAULT '[]'::jsonb,
  bio TEXT,
  fair_match_reasons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Service Requests Table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id TEXT PRIMARY KEY,
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

-- 3. Create Cooperative Federation Analytics Table
CREATE TABLE IF NOT EXISTS public.cooperative_analytics (
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

-- 4. Enable Row Level Security (RLS) & Public Read/Write Policies for Prototype
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperative_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Workers" ON public.workers FOR ALL USING (true);

CREATE POLICY "Public Read Service Requests" ON public.service_requests FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Service Requests" ON public.service_requests FOR ALL USING (true);

CREATE POLICY "Public Read Analytics" ON public.cooperative_analytics FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Analytics" ON public.cooperative_analytics FOR ALL USING (true);

-- 5. Seed Initial Data
INSERT INTO public.workers (
  id, name, title, category, badge, cooperative, coop_id, avatar, rating, jobs_completed,
  on_time_rate, reliability_score, distance_km, workload_capacity, workload_status,
  availability, is_available, status, skill_fit_percent, verified_skill_level, experience_years,
  jobs_completed_7days, opportunity_equity_score, skills, verifications, bio
) VALUES 
(
  'w-kumar', 'Kumar M.', 'Plumbing Specialist', 'plumbing', 'Verified Cooperative Worker',
  'Madurai District Labour Co-op Federation', 'MDU-LAB-8941',
  'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
  4.80, 147, 94, 94, 1.70, 31, 'Low', 'Available Now', true, 'AVAILABLE', 96, 'Advanced', 6, 2, 92,
  '[{"name": "Pipe repair", "level": "Advanced", "confidence": 96}, {"name": "Tap installation", "level": "Advanced", "confidence": 94}]'::jsonb,
  '["Cooperative Membership Verified", "NSDC Level 4 Certified"]'::jsonb,
  'Master plumber with 6+ years field experience in residential pipe fittings and leak diagnostics.'
),
(
  'w-ravi', 'Ravi Chandran', 'Senior Master Plumber', 'plumbing', 'Master Cooperative Technician',
  'Madurai Central Worker Co-op Society', 'MDU-LAB-7102',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  4.90, 203, 98, 97, 1.10, 89, 'High', 'Busy (Finishing job in 45m)', false, 'BUSY', 98, 'Master', 10, 9, 35,
  '[{"name": "Leak diagnosis", "level": "Master", "confidence": 99}]'::jsonb,
  '["Cooperative Membership Verified", "Master Skill Trainer"]'::jsonb,
  'Experienced master technician specialized in commercial and high-pressure water system repairs.'
),
(
  'w-arjun', 'Arjun S.', 'Certified Electrician', 'electrical', 'Verified Cooperative Worker',
  'Madurai Electrical & Maintenance Guild', 'MDU-LAB-5519',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  4.70, 98, 92, 91, 2.40, 45, 'Moderate', 'Available Now', true, 'AVAILABLE', 94, 'Advanced', 4, 3, 88,
  '[{"name": "Wiring & Circuit Repair", "level": "Advanced", "confidence": 95}]'::jsonb,
  '["Cooperative Membership Verified", "Electrical Safety Board Certified"]'::jsonb,
  'Licensed electrician specializing in domestic wiring, DB box installs, and emergency fault isolation.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cooperative_analytics (
  id, active_workers, open_requests, completed_jobs, jobs_completed_month, opportunity_balance_index,
  demand_trends, workforce_gaps, workload_distribution
) VALUES (
  'current_analytics', 147, 326, 281, 281, 84,
  '[{"category": "Plumbing", "level": "High", "growth": "+24% this week", "color": "#4F46E5"}, {"category": "Electrical", "level": "Moderate", "growth": "+12% this week", "color": "#10B981"}, {"category": "Carpentry", "level": "Stable", "growth": "+5% this week", "color": "#F59E0B"}]'::jsonb,
  '[{"category": "Plumbing", "urgency": "URGENT", "region": "Madurai South / Anna Nagar", "recommendedRecruits": 12, "reason": "High residential demand exceeding current available cooperative technicians by 24%."}]'::jsonb,
  '[{"cohort": "Top 10% Rated Workers", "top10PctShare": "28%", "status": "Fair (Capped by FairMatch)"}, {"cohort": "Mid Tier Workers (60%)", "top10PctShare": "58%", "status": "Balanced Opportunity Distribution"}, {"cohort": "Newly Onboarded (30%)", "top10PctShare": "14%", "status": "Protected Base Allocation"}]'::jsonb
) ON CONFLICT (id) DO NOTHING;
