import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { adminRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { getCommunityStats, listRegistrationsForAdmin } from "@/lib/registrations";
import { isSupabaseConfigured } from "@/lib/supabase/admin";


export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limited = adminRateLimit(ip);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [stats, registrations] = await Promise.all([
      getCommunityStats(),
      listRegistrationsForAdmin(),
    ]);

    const active = registrations.filter((r) => r.is_active);
    const inactive = registrations.filter((r) => !r.is_active);

    const byDayMap = new Map<string, number>();
    for (const row of active) {
      const day = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(row.created_at));
      byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1);
    }

    const byDay = [...byDayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const headCountBuckets = [
      { label: "1", min: 1, max: 1 },
      { label: "2–3", min: 2, max: 3 },
      { label: "4–5", min: 4, max: 5 },
      { label: "6+", min: 6, max: 999 },
    ].map((bucket) => ({
      label: bucket.label,
      count: active.filter(
        (r) => r.head_count >= bucket.min && r.head_count <= bucket.max,
      ).length,
    }));

    return NextResponse.json({
      stats,
      totals: {
        activeFlats: active.length,
        inactiveFlats: inactive.length,
        totalKidsUnder10: active.reduce(
          (sum, r) => sum + (r.kids_under_10 ?? 0),
          0,
        ),
        averageHeadCount:
          active.length === 0
            ? 0
            : Number(
                (
                  active.reduce((sum, r) => sum + r.head_count, 0) / active.length
                ).toFixed(2),
              ),
      },
      byDay,
      headCountBuckets,
      admin: {
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("admin stats error", error);
    return NextResponse.json({ error: "Unable to load admin stats" }, { status: 500 });
  }
}
