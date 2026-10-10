import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, inquiryRateLimits } from "@/db/schema";
import { assertSameOrigin, InquiryError, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, readBoundedJson, validateInquiry } from "@/lib/inquiry-validation";
import { clearExpiredInquiries, hashValue, rateLimitKey } from "@/lib/inquiry-server";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const now = Date.now();
    const input = validateInquiry(await readBoundedJson(request), now);
    const db = getDb();
    await clearExpiredInquiries(now);
    const payloadHash = await hashValue(JSON.stringify(input));
    const [existing] = await db.select({ reference: inquiries.reference, payloadHash: inquiries.payloadHash }).from(inquiries).where(eq(inquiries.id, input.requestId)).limit(1);
    if (existing) {
      if (existing.payloadHash !== payloadHash) return json({ error: "같은 접수 번호의 내용이 변경되었습니다. 새로고침 후 다시 보내 주세요." }, 409);
      return json({ ok: true, reference: existing.reference });
    }
    const window = Math.floor(now / RATE_LIMIT_WINDOW_MS);
    const key = await rateLimitKey(request, window);
    const [allowance] = await db.insert(inquiryRateLimits).values({ key, attempts: 1, expiresAt: (window + 1) * RATE_LIMIT_WINDOW_MS }).onConflictDoUpdate({
      target: inquiryRateLimits.key,
      set: { attempts: sql`${inquiryRateLimits.attempts} + 1` },
      setWhere: lt(inquiryRateLimits.attempts, RATE_LIMIT_MAX),
    }).returning({ attempts: inquiryRateLimits.attempts });
    if (!allowance) return json({ error: "짧은 시간에 여러 문의가 접수되었습니다. 잠시 후 다시 시도해 주세요." }, 429, { "Retry-After": String(Math.ceil(((window + 1) * RATE_LIMIT_WINDOW_MS - now) / 1000)) });
    const reference = `FWD-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const [saved] = await db.insert(inquiries).values({
      id: input.requestId, reference, payloadHash,
      name: input.name, email: input.email, company: input.company,
      service: input.service, budget: input.budget, message: input.message,
      createdAt: now,
    }).onConflictDoNothing({ target: inquiries.id }).returning({ reference: inquiries.reference });
    if (saved) return json({ ok: true, reference: saved.reference }, 201);
    // A concurrent retry can win the unique insert; return only its receipt after matching content.
    const [retry] = await db.select({ reference: inquiries.reference, payloadHash: inquiries.payloadHash }).from(inquiries).where(eq(inquiries.id, input.requestId)).limit(1);
    if (retry?.payloadHash === payloadHash) return json({ ok: true, reference: retry.reference });
    return json({ error: "접수 번호가 중복되었습니다. 새로고침 후 다시 보내 주세요." }, 409);
  } catch (error) {
    if (error instanceof InquiryError) return json({ error: error.message }, error.status);
    // Do not log request bodies, contact details, database errors, or internal configuration.
    console.error("Inquiry persistence failed");
    return json({ error: "지금은 문의를 저장할 수 없습니다. 입력한 내용을 보관한 뒤 잠시 후 다시 시도해 주세요." }, 503);
  }
}
