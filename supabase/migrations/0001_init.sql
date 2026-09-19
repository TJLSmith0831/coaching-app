-- Coaching app MVP schema. Gamification state = one JSONB blob per child (child_progress.progress).
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  first_name text,
  timezone text,
  consent_version text,
  consented_at timestamptz,
  settings jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  nickname text not null,
  birth_month int,
  birth_year int,
  avatar jsonb not null default '{}',
  pin_hash text,
  pin_attempts int not null default 0,
  pin_attempt_at timestamptz,
  difficulty_cap int not null default 3,
  daily_goal_xp int not null default 40,
  settings jsonb not null default '{}',
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index children_parent_idx on public.children (parent_id);

create table public.child_sports (
  child_id uuid not null references public.children on delete cascade,
  sport_id text not null,
  level text,
  position_ids text[] not null default '{}',
  goal_track_ids text[] not null default '{}',
  is_focus boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (child_id, sport_id)
);

create table public.child_equipment (
  child_id uuid not null references public.children on delete cascade,
  equipment_type_id text not null,
  source text,
  created_at timestamptz not null default now(),
  primary key (child_id, equipment_type_id)
);

create table public.spots (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children on delete cascade,
  label text,
  surface text,
  space text,
  fixtures text[] not null default '{}',
  confidence numeric,
  photo_path text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);
create index spots_child_idx on public.spots (child_id);

create table public.availability (
  child_id uuid primary key references public.children on delete cascade,
  minutes_by_dow int[] not null default '{0,10,0,10,0,0,10}',
  reminder_time time not null default '17:30',
  created_at timestamptz not null default now()
);

create table public.child_progress (
  child_id uuid primary key references public.children on delete cascade,
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key,
  child_id uuid not null references public.children on delete cascade,
  sport_id text,
  unit int,
  level int,
  spot_id uuid references public.spots on delete set null,
  time_budget_sec int,
  planned_drill_ids text[] not null default '{}',
  results jsonb,
  xp_earned int,
  stars int,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index sessions_child_idx on public.sessions (child_id);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  child_id uuid references public.children on delete cascade,
  title text not null,
  cost_xp int,
  milestone jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index rewards_parent_idx on public.rewards (parent_id);

create table public.reward_claims (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards on delete cascade,
  child_id uuid not null references public.children on delete cascade,
  status text not null default 'pending',
  claimed_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index reward_claims_child_idx on public.reward_claims (child_id);

create table public.parent_checkins (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users on delete cascade,
  child_id uuid not null references public.children on delete cascade,
  kind text not null,
  day date not null,
  created_at timestamptz not null default now(),
  unique (child_id, day, kind)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.child_sports enable row level security;
alter table public.child_equipment enable row level security;
alter table public.spots enable row level security;
alter table public.availability enable row level security;
alter table public.child_progress enable row level security;
alter table public.sessions enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_claims enable row level security;
alter table public.parent_checkins enable row level security;

create policy "profiles self" on public.profiles for all
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "children owner" on public.children for all
  using ((select auth.uid()) = parent_id) with check ((select auth.uid()) = parent_id);

-- owns_child(): reused by every child_id table
create or replace function public.owns_child(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.children c where c.id = cid and c.parent_id = (select auth.uid()));
$$;
revoke all on function public.owns_child(uuid) from public;
grant execute on function public.owns_child(uuid) to authenticated;

create policy "child_sports owner" on public.child_sports for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "child_equipment owner" on public.child_equipment for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "spots owner" on public.spots for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "availability owner" on public.availability for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

-- select-only for clients; writes via service role in Edge Functions
create policy "child_progress read" on public.child_progress for select
  using (public.owns_child(child_id));
create policy "sessions read" on public.sessions for select
  using (public.owns_child(child_id));

create policy "rewards owner" on public.rewards for all
  using ((select auth.uid()) = parent_id) with check ((select auth.uid()) = parent_id);
create policy "reward_claims owner" on public.reward_claims for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));
create policy "parent_checkins owner" on public.parent_checkins for all
  using ((select auth.uid()) = parent_id) with check ((select auth.uid()) = parent_id and public.owns_child(child_id));

-- Storage: private scan photos, path {parent_id}/...
insert into storage.buckets (id, name, public) values ('scan-photos', 'scan-photos', false)
  on conflict (id) do nothing;
create policy "scan-photos owner" on storage.objects for all
  using (bucket_id = 'scan-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'scan-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
