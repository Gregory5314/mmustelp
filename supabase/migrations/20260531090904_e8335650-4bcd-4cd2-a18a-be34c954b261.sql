
-- role_permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read role_permissions"
  ON public.role_permissions FOR SELECT TO authenticated USING (true);

-- has_permission function (security definer)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id
      AND rp.permission = _permission
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

-- get_my_permissions: for the frontend
CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS SETOF text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT rp.permission
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_permissions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_permissions() TO authenticated, service_role;

-- Seed the permissions map
INSERT INTO public.role_permissions (role, permission) VALUES
  -- President: full control
  ('president', 'profile.chapter.edit'),
  ('president', 'admins.manage'),
  ('president', 'members.add.any'),
  ('president', 'subscriptions.update'),
  ('president', 'finance.upload'),
  ('president', 'events.update'),
  ('president', 'events.complete'),
  ('president', 'meetings.upload'),
  ('president', 'alumni.manage'),
  ('president', 'mentorship.update'),
  ('president', 'mentorship.assign'),
  ('president', 'complaints.view'),
  ('president', 'complaints.resolve'),
  -- Vice President: all except chapter edit and admins.manage
  ('vice_president', 'members.add.any'),
  ('vice_president', 'subscriptions.update'),
  ('vice_president', 'finance.upload'),
  ('vice_president', 'events.update'),
  ('vice_president', 'events.complete'),
  ('vice_president', 'meetings.upload'),
  ('vice_president', 'alumni.manage'),
  ('vice_president', 'mentorship.update'),
  ('vice_president', 'mentorship.assign'),
  ('vice_president', 'complaints.view'),
  ('vice_president', 'complaints.resolve'),
  -- Treasurer
  ('treasurer', 'subscriptions.update'),
  ('treasurer', 'finance.upload'),
  -- Event Manager
  ('event_manager', 'events.update'),
  ('event_manager', 'events.complete'),
  -- Communication Officers (year-scoped)
  ('comm_officer_y1', 'members.add.y1'),
  ('comm_officer_y2', 'members.add.y2'),
  ('comm_officer_y3', 'members.add.y3'),
  ('comm_officer_y4', 'members.add.y4'),
  -- Secretary General / Assistant
  ('secretary_general', 'subscriptions.update'),
  ('secretary_general', 'meetings.upload'),
  ('assistant_secretary', 'subscriptions.update'),
  ('assistant_secretary', 'meetings.upload'),
  -- Alumni Manager
  ('alumni_manager', 'alumni.manage'),
  -- Mentorship Coordinator
  ('mentorship_coordinator', 'mentorship.update'),
  ('mentorship_coordinator', 'mentorship.assign'),
  -- Welfare Coordinator
  ('welfare_coordinator', 'complaints.view'),
  ('welfare_coordinator', 'complaints.resolve'),
  -- Legacy admin: keep equivalent of president for backwards compat
  ('admin', 'profile.chapter.edit'),
  ('admin', 'admins.manage'),
  ('admin', 'members.add.any'),
  ('admin', 'subscriptions.update'),
  ('admin', 'finance.upload'),
  ('admin', 'events.update'),
  ('admin', 'events.complete'),
  ('admin', 'meetings.upload'),
  ('admin', 'alumni.manage'),
  ('admin', 'mentorship.update'),
  ('admin', 'mentorship.assign'),
  ('admin', 'complaints.view'),
  ('admin', 'complaints.resolve')
ON CONFLICT (role, permission) DO NOTHING;

-- Promote any existing admin to also have 'president' role
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'president'::app_role FROM public.user_roles WHERE role = 'admin'
ON CONFLICT DO NOTHING;

-- Allow president to manage user_roles (insert/update/delete)
CREATE POLICY "president manage user_roles insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_permission(auth.uid(), 'admins.manage'));

CREATE POLICY "president manage user_roles delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'admins.manage'));

CREATE POLICY "president manage user_roles update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'admins.manage'));
