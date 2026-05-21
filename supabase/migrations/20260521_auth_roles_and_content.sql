create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  period text not null,
  movement text not null,
  biography text not null,
  themes text[] not null default '{}',
  access_level text not null default 'free' check (access_level in ('free', 'standard', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author_id uuid not null references public.authors(id) on delete cascade,
  genre text not null,
  summary text not null,
  themes text[] not null default '{}',
  characters text[] not null default '{}',
  symbols text[] not null default '{}',
  exam_tips text[] not null default '{}',
  access_level text not null default 'free' check (access_level in ('free', 'standard', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  title text not null,
  body text not null,
  access_level text not null default 'free' check (access_level in ('free', 'standard', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  material_type text not null,
  url text not null,
  author_id uuid references public.authors(id) on delete set null,
  work_id uuid references public.works(id) on delete set null,
  access_level text not null default 'free' check (access_level in ('free', 'standard', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists authors_set_updated_at on public.authors;
create trigger authors_set_updated_at before update on public.authors for each row execute function public.set_updated_at();

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at before update on public.works for each row execute function public.set_updated_at();

drop trigger if exists summaries_set_updated_at on public.summaries;
create trigger summaries_set_updated_at before update on public.summaries for each row execute function public.set_updated_at();

drop trigger if exists study_materials_set_updated_at on public.study_materials;
create trigger study_materials_set_updated_at before update on public.study_materials for each row execute function public.set_updated_at();

create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_user_id
      and (role = 'admin' or email = 'giorgijavakhishvili75@gmail.com')
  );
$$;

alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.works enable row level security;
alter table public.summaries enable row level security;
alter table public.study_materials enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "authors_public_read" on public.authors;
create policy "authors_public_read" on public.authors for select using (true);

drop policy if exists "works_public_read" on public.works;
create policy "works_public_read" on public.works for select using (true);

drop policy if exists "summaries_public_read" on public.summaries;
create policy "summaries_public_read" on public.summaries for select using (true);

drop policy if exists "study_materials_public_read" on public.study_materials;
create policy "study_materials_public_read" on public.study_materials for select using (true);

drop policy if exists "authors_admin_write" on public.authors;
create policy "authors_admin_write"
on public.authors
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "works_admin_write" on public.works;
create policy "works_admin_write"
on public.works
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "summaries_admin_write" on public.summaries;
create policy "summaries_admin_write"
on public.summaries
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "study_materials_admin_write" on public.study_materials;
create policy "study_materials_admin_write"
on public.study_materials
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
