create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  featured_author_id uuid references public.authors(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
on public.site_settings
for select
using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
on public.site_settings
for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

insert into public.site_settings (id, featured_author_id)
values (1, null)
on conflict (id) do nothing;
