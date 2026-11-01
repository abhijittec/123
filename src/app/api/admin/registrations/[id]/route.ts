import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { adminRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import {
  adminSoftDeleteRegistration,
  adminUpdateRegistration,
} from "@/lib/registrations";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { adminRegistrationUpdateSchema } from "@/lib/validations";


type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = adminRegistrationUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid update payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const registration = await adminUpdateRegistration(id, {
      flatNumber: parsed.data.flatNumber,
      headCount: parsed.data.headCount,
      residentName: parsed.data.residentName,
      isActive: parsed.data.isActive,
    });
    return NextResponse.json({ registration });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "FLAT_CONFLICT") {
      return NextResponse.json(
        { error: "Another active registration already uses that flat number." },
        { status: 409 },
      );
    }
    console.error("admin patch error", error);
    return NextResponse.json({ error: "Unable to update registration" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  try {
    const registration = await adminSoftDeleteRegistration(id);
    return NextResponse.json({ registration, ok: true });
  } catch (error) {
    console.error("admin delete error", error);
    return NextResponse.json({ error: "Unable to remove registration" }, { status: 500 });
  }
}
