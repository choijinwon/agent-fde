import { env } from "cloudflare:workers";
import { lt } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, inquiryRateLimits } from "@/db/schema";
import { RETENTION_MS } from "@/lib/inquiry-validation";

export async function clearExpiredInquiries(now = Date.now()): Promise<void> {
  const db = getDb();
  await db.batch([
    db.delete(inquiries).where(lt(inquiries.createdAt, now - RETENTION_MS)),
    db.delete(inquiryRateLimits).where(lt(inquiryRateLimits.expiresAt, now)),
  ]);
}

export async function hashValue(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function rateLimitKey(request: Request, window: number): Promise<string> {
  const secret = env.INQUIRY_RATE_LIMIT_SECRET || env.ADMIN_EMAIL;
  if (!secret) throw new Error("Inquiry security configuration is missing");
  // The hosting edge supplies CF-Connecting-IP and authenticated identity headers.
  // Raw IP addresses and user identifiers are never stored.
  const source = request.headers.get("cf-connecting-ip") || request.headers.get("oai-authenticated-user-id") || "local-or-unidentified";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${window}:${source}`));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
