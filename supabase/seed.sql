-- Optional helper seed notes.
-- 1) Create an Auth user in Supabase Dashboard (Authentication → Users).
-- 2) Promote that user to admin:

-- insert into public.admin_profiles (user_id, role, display_name)
-- values ('YOUR-AUTH-USER-UUID', 'admin', 'Committee Member')
-- on conflict (user_id) do update
-- set role = excluded.role, display_name = excluded.display_name;

-- 3) Copy event id into Vercel / .env.local:
-- select id::text as event_id from public.events where slug = 'diwali-2026';
