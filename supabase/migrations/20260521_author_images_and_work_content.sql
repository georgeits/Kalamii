alter table public.authors
add column if not exists image_url text;

alter table public.study_materials
add column if not exists body text;

create table if not exists public.work_contents (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null unique references public.works(id) on delete cascade,
  study_material_body text,
  plan_body text,
  summary_body text,
  analysis_body text,
  quiz_questions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists work_contents_set_updated_at on public.work_contents;
create trigger work_contents_set_updated_at
before update on public.work_contents
for each row
execute function public.set_updated_at();

alter table public.work_contents enable row level security;

drop policy if exists "work_contents_public_read" on public.work_contents;
create policy "work_contents_public_read"
on public.work_contents
for select
using (true);

drop policy if exists "work_contents_admin_write" on public.work_contents;
create policy "work_contents_admin_write"
on public.work_contents
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
