create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  plan text not null check (plan in ('standard', 'premium')),
  amount numeric not null,
  receipt_url text not null,
  comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists payment_requests_user_id_idx on public.payment_requests(user_id);
create index if not exists payment_requests_email_idx on public.payment_requests(email);
create index if not exists payment_requests_status_idx on public.payment_requests(status);

alter table public.payment_requests enable row level security;

drop policy if exists "payment_requests_admin_read" on public.payment_requests;
create policy "payment_requests_admin_read"
on public.payment_requests
for select
using (public.is_admin(auth.uid()));

drop policy if exists "payment_requests_admin_write" on public.payment_requests;
create policy "payment_requests_admin_write"
on public.payment_requests
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "payment_requests_own_read" on public.payment_requests;
create policy "payment_requests_own_read"
on public.payment_requests
for select
using (auth.uid() = user_id);

drop policy if exists "payment_requests_own_insert" on public.payment_requests;
create policy "payment_requests_own_insert"
on public.payment_requests
for insert
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

drop policy if exists "payment_receipts_admin_read" on storage.objects;
create policy "payment_receipts_admin_read"
on storage.objects
for select
using (bucket_id = 'payment-receipts' and public.is_admin(auth.uid()));

drop policy if exists "payment_receipts_user_insert" on storage.objects;
create policy "payment_receipts_user_insert"
on storage.objects
for insert
with check (bucket_id = 'payment-receipts' and auth.role() = 'authenticated');
