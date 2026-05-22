alter table public.works
add column if not exists exercise_data jsonb not null default '[]'::jsonb;

update public.works
set exercise_data = jsonb_build_array(
  jsonb_build_object(
    'id', 'legacy-quiz',
    'title', 'არჩევითი სავარჯიშო',
    'type', 'multiple_choice',
    'difficulty', 'medium',
    'description', 'ძველი quiz სისტემიდან ავტომატურად გადმოტანილი სავარჯიშო.',
    'content', jsonb_build_object(
      'questions',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', coalesce(question ->> 'id', gen_random_uuid()::text),
              'prompt', coalesce(question ->> 'question', ''),
              'options', coalesce(question -> 'options', '[]'::jsonb),
              'explanation', ''
            )
          )
          from jsonb_array_elements(coalesce(public.works.quiz_data, '[]'::jsonb)) as question
        ),
        '[]'::jsonb
      )
    )
  )
)
where jsonb_array_length(coalesce(public.works.exercise_data, '[]'::jsonb)) = 0
  and jsonb_array_length(coalesce(public.works.quiz_data, '[]'::jsonb)) > 0;

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid not null references public.works(id) on delete cascade,
  exercise_id text not null,
  correct_answers integer not null default 0,
  total_questions integer not null default 0,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exercise_attempts_user_id_idx on public.exercise_attempts(user_id);
create index if not exists exercise_attempts_work_id_idx on public.exercise_attempts(work_id);

drop trigger if exists exercise_attempts_set_updated_at on public.exercise_attempts;
create trigger exercise_attempts_set_updated_at before update on public.exercise_attempts for each row execute function public.set_updated_at();

alter table public.exercise_attempts enable row level security;

drop policy if exists "exercise_attempts_user_read" on public.exercise_attempts;
create policy "exercise_attempts_user_read"
on public.exercise_attempts
for select
using (auth.uid() = user_id);

drop policy if exists "exercise_attempts_user_insert" on public.exercise_attempts;
create policy "exercise_attempts_user_insert"
on public.exercise_attempts
for insert
with check (auth.uid() = user_id);

drop policy if exists "exercise_attempts_user_update" on public.exercise_attempts;
create policy "exercise_attempts_user_update"
on public.exercise_attempts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "exercise_attempts_admin_all" on public.exercise_attempts;
create policy "exercise_attempts_admin_all"
on public.exercise_attempts
for all
using (exists (
  select 1
  from public.profiles
  where profiles.id = auth.uid()
    and profiles.role = 'admin'
))
with check (exists (
  select 1
  from public.profiles
  where profiles.id = auth.uid()
    and profiles.role = 'admin'
));
