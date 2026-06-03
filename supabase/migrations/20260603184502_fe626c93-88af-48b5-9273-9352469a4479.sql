
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_name text NOT NULL,
  quote_text text NOT NULL,
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quotes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "perm manage quotes insert" ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'quotes.manage'));
CREATE POLICY "perm manage quotes update" ON public.quotes FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'quotes.manage'));
CREATE POLICY "perm manage quotes delete" ON public.quotes FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'quotes.manage'));
CREATE TRIGGER quotes_set_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.scholar_recognition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scholar_name text NOT NULL,
  recognition_type text NOT NULL DEFAULT 'Scholar of the Month',
  description text,
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scholar_recognition TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scholar_recognition TO authenticated;
GRANT ALL ON public.scholar_recognition TO service_role;
ALTER TABLE public.scholar_recognition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read recognition" ON public.scholar_recognition FOR SELECT USING (true);
CREATE POLICY "perm manage rec insert" ON public.scholar_recognition FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'recognition.manage'));
CREATE POLICY "perm manage rec update" ON public.scholar_recognition FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'recognition.manage'));
CREATE POLICY "perm manage rec delete" ON public.scholar_recognition FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'recognition.manage'));
CREATE TRIGGER rec_set_updated_at BEFORE UPDATE ON public.scholar_recognition
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Grant quote/recognition perms to leadership roles
INSERT INTO public.role_permissions (role, permission) VALUES
  ('president'::app_role, 'quotes.manage'),
  ('vice_president'::app_role, 'quotes.manage'),
  ('secretary_general'::app_role, 'quotes.manage'),
  ('comm_officer_y1'::app_role, 'quotes.manage'),
  ('comm_officer_y2'::app_role, 'quotes.manage'),
  ('comm_officer_y3'::app_role, 'quotes.manage'),
  ('comm_officer_y4'::app_role, 'quotes.manage'),
  ('president'::app_role, 'recognition.manage'),
  ('vice_president'::app_role, 'recognition.manage'),
  ('mentorship_coordinator'::app_role, 'recognition.manage'),
  ('secretary_general'::app_role, 'recognition.manage')
ON CONFLICT DO NOTHING;
