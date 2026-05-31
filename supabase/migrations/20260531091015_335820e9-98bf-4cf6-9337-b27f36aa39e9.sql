
REVOKE EXECUTE ON FUNCTION public.notify_users_with_permission(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_all_members(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_event_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_finance_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_subscription_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_complaint_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_complaint_resolve() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_alumni_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_mentorship_insert() FROM PUBLIC, anon, authenticated;
