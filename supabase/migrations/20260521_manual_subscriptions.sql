create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'standard', 'premium')),
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists subscriptions_email_idx on public.subscriptions(email);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_admin_read" on public.subscriptions;
create policy "subscriptions_admin_read"
on public.subscriptions
for select
using (public.is_admin(auth.uid()));

drop policy if exists "subscriptions_admin_write" on public.subscriptions;
create policy "subscriptions_admin_write"
on public.subscriptions
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "subscriptions_own_read" on public.subscriptions;
create policy "subscriptions_own_read"
on public.subscriptions
for select
using (auth.uid() = user_id);
