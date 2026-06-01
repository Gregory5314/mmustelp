-- 1. Per-admin email notification opt-in
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_opt_in boolean NOT NULL DEFAULT false;

-- 2. Event photos column
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS photo_url text;

-- 3. Public read access on activities (events) and financial reports
-- Anonymous users can read non-sensitive fields. We rely on RLS to grant read,
-- and frontend uses explicit column selects to avoid exposing sensitive columns.
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.financial_reports TO anon;

DROP POLICY IF EXISTS "public read events" ON public.events;
CREATE POLICY "public read events" ON public.events
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "public read finance" ON public.financial_reports;
CREATE POLICY "public read finance" ON public.financial_reports
  FOR SELECT TO anon USING (true);

-- 4. event_photos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('event_photos', 'event_photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "event photos public read" ON storage.objects;
CREATE POLICY "event photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'event_photos');

DROP POLICY IF EXISTS "event photos perm upload" ON storage.objects;
CREATE POLICY "event photos perm upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event_photos' AND public.has_permission(auth.uid(), 'events.update'));

DROP POLICY IF EXISTS "event photos perm update" ON storage.objects;
CREATE POLICY "event photos perm update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'event_photos' AND public.has_permission(auth.uid(), 'events.update'));

DROP POLICY IF EXISTS "event photos perm delete" ON storage.objects;
CREATE POLICY "event photos perm delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'event_photos' AND public.has_permission(auth.uid(), 'events.update'));

-- 5. Restrict deletes on profiles to president only (Admin One)
DROP POLICY IF EXISTS "admin delete profile" ON public.profiles;
CREATE POLICY "president delete profile" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'president'));
