alter table public.authors
add column if not exists image_url text;

alter table public.works
add column if not exists plan text,
add column if not exists analysis text,
add column if not exists quiz_data jsonb not null default '[]'::jsonb;
