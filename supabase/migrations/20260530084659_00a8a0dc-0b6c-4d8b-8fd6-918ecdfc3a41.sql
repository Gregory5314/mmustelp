create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid not null,
  subject text not null,
  category text not null,
  details text not null,
  status text not null default 'new',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.complaints to authenticated;
grant all on public.complaints to service_role;

alter table public.complaints enable row level security;

create policy "members insert own complaints" on public.complaints
  for insert to authenticated
  with check (submitter_id = auth.uid());

create policy "submitter or admin read complaints" on public.complaints
  for select to authenticated
  using (submitter_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "admin update complaints" on public.complaints
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admin delete complaints" on public.complaints
  for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create index complaints_created_at_idx on public.complaints (created_at desc);