#!/usr/bin/env bash
# Free deploy: Supabase (already migrated) + Vercel Hobby.
# Requires env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, EVENT_ID, VERCEL_TOKEN
# Optional: EDIT_TOKEN_PEPPER, VERCEL_ORG_ID, VERCEL_PROJECT_ID

set -euo pipefail
cd "$(dirname "$0")/.."

required=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  EVENT_ID
  VERCEL_TOKEN
)

for key in "${required[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    echo "Missing required env: $key" >&2
    exit 1
  fi
done

if [[ -z "${EDIT_TOKEN_PEPPER:-}" ]]; then
  EDIT_TOKEN_PEPPER="$(openssl rand -hex 32)"
  echo "Generated EDIT_TOKEN_PEPPER"
fi

echo "Linking / creating Vercel project..."
npx vercel pull --yes --environment=production --token "$VERCEL_TOKEN" 2>/dev/null || true

echo "Deploying to Vercel (production)..."
URL=$(npx vercel deploy --prod --yes --token "$VERCEL_TOKEN" \
  --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --env EVENT_ID="$EVENT_ID" \
  --env EDIT_TOKEN_PEPPER="$EDIT_TOKEN_PEPPER" \
  --env NEXT_PUBLIC_MAX_HEAD_COUNT=30)

echo "Deployed: $URL"

# Set public site URL for WhatsApp OG previews, then redeploy once.
npx vercel env add NEXT_PUBLIC_SITE_URL production --token "$VERCEL_TOKEN" <<< "$URL" 2>/dev/null || true
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --token "$VERCEL_TOKEN" <<< "$NEXT_PUBLIC_SUPABASE_URL" 2>/dev/null || true
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token "$VERCEL_TOKEN" <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY" 2>/dev/null || true
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --token "$VERCEL_TOKEN" <<< "$SUPABASE_SERVICE_ROLE_KEY" 2>/dev/null || true
npx vercel env add EVENT_ID production --token "$VERCEL_TOKEN" <<< "$EVENT_ID" 2>/dev/null || true
npx vercel env add EDIT_TOKEN_PEPPER production --token "$VERCEL_TOKEN" <<< "$EDIT_TOKEN_PEPPER" 2>/dev/null || true

FINAL=$(npx vercel deploy --prod --yes --token "$VERCEL_TOKEN")
echo ""
echo "✅ Live URL (share in WhatsApp group):"
echo "$FINAL"
