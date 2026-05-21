create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists authors_set_updated_at on public.authors;
create trigger authors_set_updated_at
before update on public.authors
for each row
execute function public.set_updated_at();

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
before update on public.works
for each row
execute function public.set_updated_at();

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
    where id = check_user_id and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.works enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "authors_public_read" on public.authors;
create policy "authors_public_read"
on public.authors
for select
using (true);

drop policy if exists "works_public_read" on public.works;
create policy "works_public_read"
on public.works
for select
using (true);

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
