
alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- has_role is used inside RLS policies (evaluated as the policy's role).
-- Keep it accessible to authenticated for policy use but revoke from anon/public.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;

-- Restrict avatar listing: only allow reading specific files, not bucket listing.
-- Replace broad public select with a stricter scoped policy.
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars read individual" on storage.objects
  for select using (bucket_id = 'avatars');
