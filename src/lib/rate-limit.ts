import "server-only";
import { RATE_LIMIT } from "@/lib/config";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function prune(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  prune(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);

  if (existing.count > limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function registerRateLimit(ip: string) {
  return rateLimit(
    `register:${ip}`,
    RATE_LIMIT.registerMax,
    RATE_LIMIT.registerWindowMs,
  );
}

export function statsRateLimit(ip: string) {
  return rateLimit(`stats:${ip}`, RATE_LIMIT.statsMax, RATE_LIMIT.statsWindowMs);
}

export function adminRateLimit(ip: string) {
  return rateLimit(`admin:${ip}`, RATE_LIMIT.adminMax, RATE_LIMIT.adminWindowMs);
}
