import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { adminRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { listRegistrationsForAdmin } from "@/lib/registrations";
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

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;

  try {
    const registrations = await listRegistrationsForAdmin(search);
    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("admin list error", error);
    return NextResponse.json(
      { error: "Unable to load registrations" },
      { status: 500 },
    );
  }
}
