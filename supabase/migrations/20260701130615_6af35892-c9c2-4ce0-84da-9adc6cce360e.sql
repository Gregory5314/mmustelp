
-- ============================================================
-- 1) profiles: hide email & phone from other members
-- ============================================================
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, scholar_code, full_name, course, mentoring_school, avatar_url, created_at, updated_at, year, email_opt_in)
  ON public.profiles TO authenticated;
GRANT UPDATE, INSERT, DELETE ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- ============================================================
-- 2) chapter_profile: hide contact_email/phone from members
-- ============================================================
REVOKE SELECT ON public.chapter_profile FROM authenticated;
GRANT SELECT (id, name, motto, about, logo_url, updated_by, updated_at)
  ON public.chapter_profile TO authenticated;
GRANT UPDATE ON public.chapter_profile TO authenticated;

CREATE OR REPLACE FUNCTION public.get_chapter_admin()
RETURNS public.chapter_profile
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.chapter_profile;
BEGIN
  IF NOT public.has_permission(auth.uid(), 'profile.chapter.edit') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT * INTO r FROM public.chapter_profile LIMIT 1;
  RETURN r;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_chapter_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_chapter_admin() TO authenticated;

-- ============================================================
-- 3) alumni: restrict SELECT to authorized roles
-- ============================================================
DROP POLICY IF EXISTS "auth read alumni" ON public.alumni;
CREATE POLICY "alumni read for managers" ON public.alumni
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'alumni.manage'));

-- ============================================================
-- 4) subscriptions: self OR subscriptions.update permission
-- ============================================================
DROP POLICY IF EXISTS "auth read subs" ON public.subscriptions;
CREATE POLICY "subs self or managers read" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_permission(auth.uid(), 'subscriptions.update'));

-- ============================================================
-- 5) Lock down SECURITY DEFINER helpers not meant for API calls
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.notify_all_members(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_users_with_permission(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_alumni_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_complaint_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_complaint_resolve() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_event_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_finance_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_mentorship_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_subscription_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Keep executable but only for signed-in users (not anon)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_permissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_permissions() TO authenticated;

-- ============================================================
-- 6) Storage: remove broad list policies (public URLs still work via CDN)
-- ============================================================
DROP POLICY IF EXISTS "avatars read individual" ON storage.objects;
DROP POLICY IF EXISTS "event photos public read" ON storage.objects;
