import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function generateEditToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashEditToken(token: string): string {
  const pepper = process.env.EDIT_TOKEN_PEPPER || "sai-chethana-diwali-dev-pepper";
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

export function verifyEditToken(token: string, hash: string): boolean {
  const computed = hashEditToken(token);
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
