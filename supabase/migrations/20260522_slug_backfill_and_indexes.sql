alter table public.authors add column if not exists slug text;
alter table public.works add column if not exists slug text;

create or replace function public.slugify_ka(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    regexp_replace(
      regexp_replace(lower(coalesce(value, '')), '[''"`´]+', '', 'g'),
      '[^a-z0-9ა-ჰ\s-]+',
      ' ',
      'g'
    ),
    '\s+|-+',
    '-',
    'g'
  ));
$$;

with normalized as (
  select
    id,
    coalesce(nullif(public.slugify_ka(slug), ''), nullif(public.slugify_ka(name), ''), 'author-' || left(id::text, 8)) as base_slug
  from public.authors
),
deduped as (
  select
    id,
    case
      when row_number() over (partition by base_slug order by id) = 1 then base_slug
      else base_slug || '-' || row_number() over (partition by base_slug order by id)
    end as final_slug
  from normalized
)
update public.authors a
set slug = d.final_slug
from deduped d
where a.id = d.id
  and coalesce(a.slug, '') <> d.final_slug;

with normalized as (
  select
    id,
    coalesce(nullif(public.slugify_ka(slug), ''), nullif(public.slugify_ka(title), ''), 'work-' || left(id::text, 8)) as base_slug
  from public.works
),
deduped as (
  select
    id,
    case
      when row_number() over (partition by base_slug order by id) = 1 then base_slug
      else base_slug || '-' || row_number() over (partition by base_slug order by id)
    end as final_slug
  from normalized
)
update public.works w
set slug = d.final_slug
from deduped d
where w.id = d.id
  and coalesce(w.slug, '') <> d.final_slug;

alter table public.authors alter column slug set not null;
alter table public.works alter column slug set not null;

create unique index if not exists authors_slug_key on public.authors (slug);
create unique index if not exists works_slug_key on public.works (slug);
