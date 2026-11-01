export const EVENT = {
  idEnvKey: "EVENT_ID",
  slug: "diwali-2026",
  title: "SAI CHETHANA DIWALI CELEBRATION 2026",
  shortTitle: "Happy Diwali 2026",
  apartment: "SAI CHETHANA APARTMENT",
  tagline: "✨ ONE COMMUNITY. ONE SPARK! ✨",
  taglineSupport: "Together We Shine, Together We Celebrate.",
  /** Event start in Asia/Kolkata */
  dateISO: "2026-11-06T19:00:00+05:30",
  dateLabel: "6 November 2026",
  weekday: "Friday",
  timeLabel: "7:00 PM onwards",
  venue: "Sai Chethana Apartment Premises",
  organizer: "Sai Chethana Apartment Welfare Association",
  timezone: "Asia/Kolkata",
  invitation:
    "With the glow of diyas and the warmth of togetherness, we cordially invite all Sai Chethana Apartment residents and their families to join our Diwali Celebration 2026. Let us come together for an evening filled with festive joy, laughter, community bonding, and beautiful memories.",
  closing: "With warm regards,",
} as const;

export const REGISTRATION = {
  minHeadCount: 1,
  maxHeadCount: Number(process.env.NEXT_PUBLIC_MAX_HEAD_COUNT ?? 30),
  minKidsUnder10: 0,
  flatNumberMaxLength: 20,
  residentNameMaxLength: 80,
} as const;

export const RATE_LIMIT = {
  registerWindowMs: 60_000,
  registerMax: 8,
  statsWindowMs: 10_000,
  statsMax: 40,
  adminWindowMs: 60_000,
  adminMax: 120,
} as const;

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

export function getEventId() {
  const id = process.env.EVENT_ID?.trim();
  if (!id) {
    throw new Error(
      "EVENT_ID is not configured. Set it after seeding the Supabase events table.",
    );
  }
  return id;
}
