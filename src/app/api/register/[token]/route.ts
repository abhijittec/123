import { NextResponse } from "next/server";
import { assertHumanSubmission } from "@/lib/bot-protection";
import { clientIpFromHeaders, registerRateLimit } from "@/lib/rate-limit";
import {
  getRegistrationByEditToken,
  updateRegistrationByEditToken,
} from "@/lib/registrations";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { registrationUpdateSchema } from "@/lib/validations";


type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Not configured", code: "NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const { token } = await context.params;
  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Invalid edit link" }, { status: 400 });
  }

  try {
    const registration = await getRegistrationByEditToken(token);
    if (!registration) {
      return NextResponse.json(
        { error: "This edit link is invalid or expired." },
        { status: 404 },
      );
    }
    return NextResponse.json({ registration });
  } catch (error) {
    console.error("edit get error", error);
    return NextResponse.json({ error: "Unable to load registration" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const ip = clientIpFromHeaders(request.headers);
  const limited = registerRateLimit(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a minute." },
      { status: 429 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Not configured", code: "NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const { token } = await context.params;
  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Invalid edit link" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registrationUpdateSchema.safeParse({
    ...(typeof json === "object" && json ? json : {}),
    website: "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the form fields",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const formOpenedAt =
    typeof json === "object" &&
    json &&
    "formOpenedAt" in json &&
    typeof (json as { formOpenedAt?: unknown }).formOpenedAt === "number"
      ? (json as { formOpenedAt: number }).formOpenedAt
      : undefined;

  const human = assertHumanSubmission({ website: "", formOpenedAt });
  if (!human.ok) {
    return NextResponse.json({ error: human.reason }, { status: 400 });
  }

  try {
    const registration = await updateRegistrationByEditToken(token, {
      flatNumber: parsed.data.flatNumber,
      headCount: parsed.data.headCount,
      kidsUnder10: parsed.data.kidsUnder10 ?? 0,
      residentName: parsed.data.residentName ?? null,
    });

    return NextResponse.json({
      ok: true,
      message: "Your registration has been updated successfully.",
      registration,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "NOT_FOUND") {
      return NextResponse.json(
        { error: "This edit link is invalid or expired." },
        { status: 404 },
      );
    }
    if (message === "FLAT_CONFLICT") {
      return NextResponse.json(
        {
          error:
            "Another active registration already exists for that flat number.",
        },
        { status: 409 },
      );
    }
    console.error("edit patch error", error);
    return NextResponse.json(
      { error: "Unable to update registration" },
      { status: 500 },
    );
  }
}
