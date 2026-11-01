-- SAI CHETHANA DIWALI CELEBRATION 2026
-- Run in Supabase SQL Editor or via supabase db push.
-- Service-role key is used only from Next.js server routes.
-- Public clients must never SELECT private registration rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_at timestamptz not null,
  venue text not null,
  organizer text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- Registrations
-- ---------------------------------------------------------------------------
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  flat_number text not null,
  flat_number_display text not null,
  resident_name text,
  head_count integer not null
    check (head_count >= 1 and head_count <= 30),
  edit_token_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint flat_number_nonempty check (char_length(trim(flat_number)) > 0)
);

create index if not exists registrations_event_id_idx
  on public.registrations (event_id);

create index if not exists registrations_flat_number_idx
  on public.registrations (event_id, flat_number);

-- One active registration per normalized flat + event
create unique index if not exists registrations_unique_active_flat
  on public.registrations (event_id, flat_number)
  where is_active = true;

-- ---------------------------------------------------------------------------
-- Admin authorization profiles (linked to Supabase Auth users)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin'
    check (role in ('admin', 'superadmin')),
  display_name text,
  created_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
before update on public.registrations
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Public aggregate stats (SECURITY DEFINER — no private row exposure)
-- ---------------------------------------------------------------------------
create or replace function public.get_registration_stats(p_event_id uuid)
returns table (
  total_flats bigint,
  total_participants bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total_flats,
    coalesce(sum(head_count), 0)::bigint as total_participants
  from public.registrations
  where event_id = p_event_id
    and is_active = true;
$$;

revoke all on function public.get_registration_stats(uuid) from public;
grant execute on function public.get_registration_stats(uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security — deny public direct access to private data
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.admin_profiles enable row level security;

-- Events: public read of the celebration metadata only
drop policy if exists "Public can read events" on public.events;
create policy "Public can read events"
  on public.events
  for select
  to anon, authenticated
  using (true);

-- Registrations: NO public policies (service role bypasses RLS)
drop policy if exists "Admins can read registrations" on public.registrations;
create policy "Admins can read registrations"
  on public.registrations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_profiles ap
      where ap.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update registrations" on public.registrations;
create policy "Admins can update registrations"
  on public.registrations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.admin_profiles ap
      where ap.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_profiles ap
      where ap.user_id = auth.uid()
    )
  );

-- Admin profiles: users can read their own row only
drop policy if exists "Admins can read own profile" on public.admin_profiles;
create policy "Admins can read own profile"
  on public.admin_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Seed Diwali 2026 event
-- ---------------------------------------------------------------------------
insert into public.events (slug, title, event_at, venue, organizer)
values (
  'diwali-2026',
  'SAI CHETHANA DIWALI CELEBRATION 2026',
  '2026-11-04T19:00:00+05:30',
  'Sai Chethana Apartment Premises',
  'Saichethana Apartment Welfare Association'
)
on conflict (slug) do update
set
  title = excluded.title,
  event_at = excluded.event_at,
  venue = excluded.venue,
  organizer = excluded.organizer;

-- After running this migration, copy the event id into EVENT_ID:
--   select id from public.events where slug = 'diwali-2026';
