import { NextResponse } from "next/server";
import { clientIpFromHeaders, statsRateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getCommunityStats } from "@/lib/registrations";


export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limited = statsRateLimit(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        totalFlats: 0,
        totalParticipants: 0,
        updatedAt: new Date().toISOString(),
        configured: false,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const stats = await getCommunityStats();
    return NextResponse.json(
      { ...stats, configured: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error("stats error", error);
    return NextResponse.json(
      { error: "Unable to load community totals right now." },
      { status: 500 },
    );
  }
}
