
-- ============================================
-- Migration A: Roles + Permissions Map
-- ============================================

-- Expand app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'president';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'vice_president';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'treasurer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'event_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comm_officer_y1';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comm_officer_y2';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comm_officer_y3';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'comm_officer_y4';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'secretary_general';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistant_secretary';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'alumni_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentorship_coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'welfare_coordinator';
