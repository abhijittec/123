import { NextResponse } from "next/server";
import { assertHumanSubmission, verifyTurnstileIfConfigured } from "@/lib/bot-protection";
import { clientIpFromHeaders, registerRateLimit } from "@/lib/rate-limit";
import { createRegistration } from "@/lib/registrations";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { registrationSchema } from "@/lib/validations";


export async function POST(request: Request) {
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
      {
        error:
          "Registration is not configured yet. Please add Supabase environment variables.",
        code: "NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the form fields",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const human = assertHumanSubmission({
    website: parsed.data.website,
    formOpenedAt: parsed.data.formOpenedAt,
  });
  if (!human.ok) {
    return NextResponse.json({ error: human.reason }, { status: 400 });
  }

  const turnstileToken =
    typeof json === "object" && json && "turnstileToken" in json
      ? String((json as { turnstileToken?: string }).turnstileToken ?? "")
      : undefined;

  const turnstile = await verifyTurnstileIfConfigured(turnstileToken, ip);
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.reason }, { status: 400 });
  }

  try {
    const result = await createRegistration({
      flatNumber: parsed.data.flatNumber,
      headCount: parsed.data.headCount,
      residentName: parsed.data.residentName ?? null,
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Thank you! Your family's participation has been confirmed. We look forward to celebrating Diwali together at Sai Chethana Apartment!",
        registration: result.registration,
        editToken: result.editToken,
        editPath: `/edit/${result.editToken}`,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "ALREADY_REGISTERED") {
      return NextResponse.json(
        {
          error:
            "This flat is already registered. Use your private edit link to update your response.",
          code: "ALREADY_REGISTERED",
          alreadyRegistered: true,
        },
        { status: 409 },
      );
    }

    console.error("register error", error);
    return NextResponse.json(
      { error: "Unable to save your registration. Please try again." },
      { status: 500 },
    );
  }
}
