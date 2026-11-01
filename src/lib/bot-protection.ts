import "server-only";

const MIN_FILL_MS = 1_800;
const MAX_FILL_MS = 1000 * 60 * 60 * 6; // 6 hours

export function assertHumanSubmission(input: {
  website?: string;
  formOpenedAt?: number;
}): { ok: true } | { ok: false; reason: string } {
  if (input.website && input.website.length > 0) {
    return { ok: false, reason: "Bot submission detected" };
  }

  if (typeof input.formOpenedAt === "number") {
    const elapsed = Date.now() - input.formOpenedAt;
    if (elapsed < MIN_FILL_MS) {
      return { ok: false, reason: "Please take a moment to complete the form" };
    }
    if (elapsed > MAX_FILL_MS) {
      return { ok: false, reason: "Form expired — please refresh and try again" };
    }
  }

  return { ok: true };
}

/**
 * Optional Cloudflare Turnstile verification when TURNSTILE_SECRET_KEY is set.
 */
export async function verifyTurnstileIfConfigured(
  token: string | undefined | null,
  ip: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };

  if (!token) {
    return { ok: false, reason: "Please complete the security check" };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    },
  );

  if (!res.ok) {
    return { ok: false, reason: "Security verification failed" };
  }

  const data = (await res.json()) as { success?: boolean };
  if (!data.success) {
    return { ok: false, reason: "Security verification failed" };
  }

  return { ok: true };
}
