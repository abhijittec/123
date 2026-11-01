# Sai Chethana Diwali Celebration 2026

Premium, mobile-first Diwali invitation and resident registration web app for **SAI CHETHANA APARTMENT**, organized by **Sai Chethana Apartment Welfare Association**.

**Event:** Friday, 6 November 2026 · 7:00 PM onwards · Sai Chethana Apartment Premises  
**Tagline:** One Community, One Celebration, A Thousand Lights

## Project structure

```text
src/
  app/
    page.tsx                 # Invitation landing page
    layout.tsx               # Fonts, SEO, theme
    loading.tsx              # Festive loading state
    opengraph-image.tsx      # WhatsApp / OG preview image
    edit/[token]/page.tsx    # Private registration edit link
    admin/                   # Protected committee dashboard
    api/
      register/              # Create + secure edit APIs
      stats/                 # Public aggregate counters only
      admin/                 # AuthZ-gated list/edit/export/stats
  components/
    festive/                 # Diyas, rangoli, lanterns, particles
    sections/                # Hero, form, counters, share, footer
    admin/                   # Login + dashboard UI
    ui/                      # shadcn/ui primitives
  lib/
    supabase/                # Browser / server / service-role clients
    registrations.ts         # Server-side registration domain logic
    auth.ts                  # Admin role checks via admin_profiles
    rate-limit.ts            # IP rate limiting
    bot-protection.ts        # Honeypot + timing + optional Turnstile
    validations.ts           # Zod schemas
supabase/
  migrations/001_initial_schema.sql
  seed.sql
config/sample.env.local
.env.example
```

## Tech stack

Next.js App Router · React · TypeScript · Tailwind CSS · shadcn/ui · Lucide · Framer Motion · Supabase PostgreSQL · Vercel-ready

## Features

- Luxurious Diwali invitation experience (mobile-first, WhatsApp-friendly)
- Live Asia/Kolkata countdown to 4 Nov 2026, 7:00 PM
- Simple family registration (flat number, head count, optional name)
- Duplicate prevention for the same normalized flat + event
- Private edit links (token hashed server-side; no public SELECT of resident data)
- Aggregate-only community counters
- Protected `/admin` dashboard with search, edit, soft-delete, charts, CSV export
- Rate limiting + honeypot/timing bot protection (+ optional Cloudflare Turnstile)
- SEO / Open Graph metadata for rich WhatsApp previews

## 1. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`.
3. Copy the event id:

```sql
select id from public.events where slug = 'diwali-2026';
```

4. Create committee Auth users (**Authentication → Users → Add user**).
5. Promote each admin:

```sql
insert into public.admin_profiles (user_id, role, display_name)
values ('AUTH_USER_UUID', 'admin', 'Committee Member');
```

6. Confirm RLS is enabled on `registrations` and that there is **no** public SELECT policy exposing resident rows. Public clients may only call `get_registration_stats(event_id)`.

## 2. Environment variables

Copy `.env.example` to `.env.local` (see also `config/sample.env.local`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for OG/share |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged key |
| `EVENT_ID` | UUID of the Diwali 2026 event row |
| `EDIT_TOKEN_PEPPER` | Secret pepper for edit-token hashes |
| `NEXT_PUBLIC_MAX_HEAD_COUNT` | Optional max head count (default 30) |
| `TURNSTILE_*` | Optional Cloudflare Turnstile keys |

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `EDIT_TOKEN_PEPPER` to the browser.

## 3. Local development

```bash
npm install
cp .env.example .env.local
# fill .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Invitation: `/`
- Private edit: `/edit/<token-from-registration-response>`
- Admin: `/admin` → `/admin/login`

## 4. Deploy to Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Framework preset: **Next.js**.
4. Add all environment variables from `.env.example` (Production + Preview as needed).
5. Set `NEXT_PUBLIC_SITE_URL` to your production domain (for WhatsApp previews).
6. Deploy.
7. Smoke-test:
   - Register a sample flat
   - Confirm counters update
   - Open the private edit link and update head count
   - Sign in to `/admin`, search, edit, export CSV
8. (Recommended) Enable Cloudflare Turnstile and set the Turnstile env vars.

### Vercel notes

- Server routes use the service-role key only on the server.
- In-memory rate limits are per serverless instance (still useful). For stronger global limits, add Upstash Redis later.
- Auth cookies for `/admin` are refreshed in `src/proxy.ts` (Next.js 16 proxy convention).

## Security model

- Resident registrations are written/read through Next.js API routes with the service role.
- Public `/api/stats` returns **only** aggregate totals.
- Edit access requires an unguessable token; only the SHA-256(+pepper) hash is stored.
- Admin APIs require a Supabase Auth session **and** a matching `admin_profiles` row.
- Duplicate active flats are blocked with a partial unique index.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```

## Accessibility & motion

- Keyboard-friendly controls and skip link
- High-contrast gold-on-navy palette
- Honours `prefers-reduced-motion` for particles, fireworks, and scroll behavior

Made with love for the Sai Chethana Apartment Community.
