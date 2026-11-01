-- Add kids under 10 field and update Diwali 2026 event to Friday, 6 November 2026.

alter table public.registrations
  add column if not exists kids_under_10 integer not null default 0;

alter table public.registrations
  drop constraint if exists registrations_kids_under_10_check;

alter table public.registrations
  add constraint registrations_kids_under_10_check
  check (kids_under_10 >= 0 and kids_under_10 <= 30);

alter table public.registrations
  drop constraint if exists registrations_kids_lte_head_count;

alter table public.registrations
  add constraint registrations_kids_lte_head_count
  check (kids_under_10 <= head_count);

-- Aggregate kids for admin / optional future public stats
-- Must drop first: Postgres cannot change OUT/return row type with CREATE OR REPLACE
drop function if exists public.get_registration_stats(uuid);

create function public.get_registration_stats(p_event_id uuid)
returns table (
  total_flats bigint,
  total_participants bigint,
  total_kids_under_10 bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total_flats,
    coalesce(sum(head_count), 0)::bigint as total_participants,
    coalesce(sum(kids_under_10), 0)::bigint as total_kids_under_10
  from public.registrations
  where event_id = p_event_id
    and is_active = true;
$$;

revoke all on function public.get_registration_stats(uuid) from public;
grant execute on function public.get_registration_stats(uuid) to anon, authenticated, service_role;

update public.events
set
  event_at = '2026-11-06T19:00:00+05:30',
  organizer = 'Sai Chethana Apartment Welfare Association',
  venue = 'Sai Chethana Apartment Premises',
  title = 'SAI CHETHANA DIWALI CELEBRATION 2026'
where slug = 'diwali-2026';
