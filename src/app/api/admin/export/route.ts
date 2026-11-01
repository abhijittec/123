import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { adminRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { listRegistrationsForAdmin } from "@/lib/registrations";
import { isSupabaseConfigured } from "@/lib/supabase/admin";


function csvEscape(value: string | number | boolean | null | undefined) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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
    const registrations = await listRegistrationsForAdmin();
    const header = [
      "flat_number",
      "resident_name",
      "head_count",
      "is_active",
      "created_at",
      "updated_at",
      "id",
    ];

    const rows = registrations.map((row) =>
      [
        row.flat_number_display,
        row.resident_name ?? "",
        row.head_count,
        row.is_active,
        row.created_at,
        row.updated_at,
        row.id,
      ]
        .map(csvEscape)
        .join(","),
    );

    const csv = [header.join(","), ...rows].join("\n");
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sai-chethana-diwali-registrations-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("admin export error", error);
    return NextResponse.json({ error: "Unable to export CSV" }, { status: 500 });
  }
}
