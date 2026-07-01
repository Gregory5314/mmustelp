CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, scholar_code, full_name, email, phone, course, mentoring_school, year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'scholar_code', new.email),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'contact_email', new.email),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'course',
    new.raw_user_meta_data->>'mentoring_school',
    nullif(new.raw_user_meta_data->>'year','')::int
  )
  on conflict (id) do nothing;
  return new;
end $function$;