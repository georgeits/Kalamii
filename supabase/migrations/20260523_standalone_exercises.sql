create table if not exists public.standalone_exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('multiple_choice', 'text_correction', 'reading_comprehension')),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  description text,
  content jsonb not null default '{}'::jsonb,
  access_level text not null default 'premium' check (access_level in ('free', 'standard', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists standalone_exercises_set_updated_at on public.standalone_exercises;
create trigger standalone_exercises_set_updated_at before update on public.standalone_exercises for each row execute function public.set_updated_at();

alter table public.standalone_exercises enable row level security;

drop policy if exists "standalone_exercises_public_read" on public.standalone_exercises;
create policy "standalone_exercises_public_read"
on public.standalone_exercises
for select
using (true);

drop policy if exists "standalone_exercises_admin_write" on public.standalone_exercises;
create policy "standalone_exercises_admin_write"
on public.standalone_exercises
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
