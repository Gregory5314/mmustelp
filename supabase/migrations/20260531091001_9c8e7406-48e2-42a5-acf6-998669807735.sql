
-- ============================================
-- Migration B: Feature tables + notifications
-- ============================================

-- Add year column to profiles for year-scoped member adding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year integer;

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active','inactive')),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read subs" ON public.subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm update subs" ON public.subscriptions FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'subscriptions.update'));
CREATE POLICY "perm insert subs" ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'subscriptions.update'));

-- events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  location text,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','successful','cancelled')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm insert events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'events.update'));
CREATE POLICY "perm update events" ON public.events FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'events.update'));
CREATE POLICY "perm delete events" ON public.events FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'events.update'));

-- financial_reports
CREATE TABLE public.financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  period text,
  file_url text,
  notes text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.financial_reports TO authenticated;
GRANT ALL ON public.financial_reports TO service_role;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read finance" ON public.financial_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm insert finance" ON public.financial_reports FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'finance.upload'));
CREATE POLICY "perm delete finance" ON public.financial_reports FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.upload'));

-- meeting_reports
CREATE TABLE public.meeting_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  meeting_date date NOT NULL,
  file_url text,
  notes text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.meeting_reports TO authenticated;
GRANT ALL ON public.meeting_reports TO service_role;
ALTER TABLE public.meeting_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read meetings" ON public.meeting_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm insert meetings" ON public.meeting_reports FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'meetings.upload'));
CREATE POLICY "perm delete meetings" ON public.meeting_reports FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'meetings.upload'));

-- alumni
CREATE TABLE public.alumni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  graduation_year integer,
  contact text,
  notes text,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni TO authenticated;
GRANT ALL ON public.alumni TO service_role;
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read alumni" ON public.alumni FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm insert alumni" ON public.alumni FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'alumni.manage'));
CREATE POLICY "perm update alumni" ON public.alumni FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'alumni.manage'));
CREATE POLICY "perm delete alumni" ON public.alumni FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'alumni.manage'));

-- mentorship_activities
CREATE TABLE public.mentorship_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  activity_date date NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentorship_activities TO authenticated;
GRANT ALL ON public.mentorship_activities TO service_role;
ALTER TABLE public.mentorship_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read mentorship" ON public.mentorship_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm insert mentorship" ON public.mentorship_activities FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'mentorship.update'));
CREATE POLICY "perm update mentorship" ON public.mentorship_activities FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'mentorship.update'));
CREATE POLICY "perm delete mentorship" ON public.mentorship_activities FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'mentorship.update'));

-- mentor_assignments
CREATE TABLE public.mentor_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school text NOT NULL,
  assigned_until date,
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.mentor_assignments TO authenticated;
GRANT ALL ON public.mentor_assignments TO service_role;
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read assigns" ON public.mentor_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm insert assigns" ON public.mentor_assignments FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'mentorship.assign'));
CREATE POLICY "perm delete assigns" ON public.mentor_assignments FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'mentorship.assign'));

-- chapter_profile (singleton)
CREATE TABLE public.chapter_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'MMUST ELP Chapter',
  motto text,
  about text,
  logo_url text,
  contact_email text,
  contact_phone text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, INSERT ON public.chapter_profile TO authenticated;
GRANT ALL ON public.chapter_profile TO service_role;
ALTER TABLE public.chapter_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read chapter" ON public.chapter_profile FOR SELECT TO authenticated USING (true);
CREATE POLICY "perm update chapter" ON public.chapter_profile FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'profile.chapter.edit'));
INSERT INTO public.chapter_profile (name) VALUES ('MMUST ELP Chapter');

-- notifications (per-recipient)
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_recipient_created ON public.notifications(recipient_id, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self read notif" ON public.notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());
CREATE POLICY "self update notif" ON public.notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- Update complaints RLS: replace admin-only with complaints.view permission
DROP POLICY IF EXISTS "submitter or admin read complaints" ON public.complaints;
DROP POLICY IF EXISTS "admin update complaints" ON public.complaints;
DROP POLICY IF EXISTS "admin delete complaints" ON public.complaints;
CREATE POLICY "submitter or perm read complaints" ON public.complaints FOR SELECT TO authenticated
  USING (submitter_id = auth.uid() OR public.has_permission(auth.uid(), 'complaints.view'));
CREATE POLICY "perm update complaints" ON public.complaints FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'complaints.resolve'));
CREATE POLICY "perm delete complaints" ON public.complaints FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'complaints.resolve'));

-- ============================================
-- Notification helpers + triggers
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_users_with_permission(
  _permission text, _type text, _title text, _body text, _link text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, title, body, link)
  SELECT DISTINCT ur.user_id, _type, _title, _body, _link
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE rp.permission = _permission;
END $$;

CREATE OR REPLACE FUNCTION public.notify_all_members(
  _type text, _title text, _body text, _link text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, title, body, link)
  SELECT id, _type, _title, _body, _link FROM public.profiles;
END $$;

-- Event trigger
CREATE OR REPLACE FUNCTION public.on_event_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_all_members(
    'event', 'Upcoming event: ' || NEW.title,
    coalesce(NEW.description, '') || ' • ' || to_char(NEW.starts_at, 'Dy DD Mon YYYY HH24:MI'),
    '/activities'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_event_insert AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.on_event_insert();

-- Finance trigger
CREATE OR REPLACE FUNCTION public.on_finance_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_all_members(
    'finance', 'New financial report: ' || NEW.title, NEW.period, '/finance'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_finance_insert AFTER INSERT ON public.financial_reports
  FOR EACH ROW EXECUTE FUNCTION public.on_finance_insert();

-- Subscription change trigger
CREATE OR REPLACE FUNCTION public.on_subscription_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (recipient_id, type, title, body, link)
  VALUES (NEW.profile_id, 'subscription',
    'Membership status: ' || NEW.status,
    'Your membership subscription is now ' || NEW.status || '.',
    '/profile');
  RETURN NEW;
END $$;
CREATE TRIGGER trg_subscription_change AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.on_subscription_change();

-- Complaint triggers
CREATE OR REPLACE FUNCTION public.on_complaint_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE submitter_name text;
BEGIN
  SELECT full_name INTO submitter_name FROM public.profiles WHERE id = NEW.submitter_id;
  PERFORM public.notify_users_with_permission(
    'complaints.view', 'complaint',
    'New complaint: ' || NEW.subject,
    'From ' || coalesce(submitter_name, 'a member') || ' • ' || NEW.category,
    '/notifications'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_complaint_insert AFTER INSERT ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.on_complaint_insert();

CREATE OR REPLACE FUNCTION public.on_complaint_resolve() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'resolved' AND (OLD.status IS DISTINCT FROM 'resolved') THEN
    INSERT INTO public.notifications (recipient_id, type, title, body, link)
    VALUES (NEW.submitter_id, 'complaint_resolved',
      'Complaint resolved: ' || NEW.subject,
      'Your complaint has been marked as resolved.', '/notifications');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_complaint_resolve AFTER UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.on_complaint_resolve();

-- Alumni trigger
CREATE OR REPLACE FUNCTION public.on_alumni_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_all_members(
    'alumni', 'New alumni added: ' || NEW.full_name,
    coalesce(NEW.graduation_year::text || ' graduate', NULL), '/members'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_alumni_insert AFTER INSERT ON public.alumni
  FOR EACH ROW EXECUTE FUNCTION public.on_alumni_insert();

-- Mentorship trigger
CREATE OR REPLACE FUNCTION public.on_mentorship_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.notify_all_members(
    'mentorship', 'Mentorship update: ' || NEW.title,
    NEW.description, '/activities'
  );
  RETURN NEW;
END $$;
CREATE TRIGGER trg_mentorship_insert AFTER INSERT ON public.mentorship_activities
  FOR EACH ROW EXECUTE FUNCTION public.on_mentorship_insert();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Seed subscriptions for existing profiles
INSERT INTO public.subscriptions (profile_id, status)
SELECT id, 'inactive' FROM public.profiles
ON CONFLICT (profile_id) DO NOTHING;
