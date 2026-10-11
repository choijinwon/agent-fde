import type { CommunityKind, CommunityPost, CommunityReport, CommunityUser } from "./community-types";

const INDUSTRIES = new Set(["academy", "hospital", "manufacturing", "excel-accounting", "commerce", "logistics", "store", "office", "custom"]);
export const COMMUNITY_MAX_BYTES = 32 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CommunityError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(message: string, status = 400, code = "invalid_input") {
    super(message);
    this.name = "CommunityError";
    this.status = status;
    this.code = code;
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CommunityError("입력 내용을 확인해 주세요.");
  return value as Record<string, unknown>;
}

export function communityText(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string") throw new CommunityError(`${label}을(를) 입력해 주세요.`);
  const text = value.trim();
  if (text.length < min || text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    throw new CommunityError(`${label}은(는) ${min}~${max}자로 입력해 주세요.`);
  }
  return text;
}

function honeypot(data: Record<string, unknown>) {
  if (data.website !== undefined && data.website !== "") throw new CommunityError("요청을 확인할 수 없습니다.");
}

export function communityId(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) throw new CommunityError("게시물을 찾을 수 없습니다.", 404, "not_found");
  return value.toLowerCase();
}

export function validateCommunityPost(value: unknown) {
  const data = object(value);
  honeypot(data);
  if (data.kind !== "question" && data.kind !== "case") throw new CommunityError("글 종류를 선택해 주세요.");
  if (typeof data.industry !== "string" || !INDUSTRIES.has(data.industry)) throw new CommunityError("업종을 선택해 주세요.");
  if (data.consent !== true) throw new CommunityError("공개 게시와 커뮤니티 이용 안내를 확인해 주세요.");
  return { kind: data.kind as CommunityKind, industry: data.industry, title: communityText(data.title, "제목", 5, 120), body: communityText(data.body, "내용", 20, 8000) };
}

export function validateCommunityComment(value: unknown) {
  const data = object(value);
  honeypot(data);
  return { body: communityText(data.body, "댓글", 2, 2000) };
}

export function validateCommunityReport(value: unknown) {
  const data = object(value);
  if (data.targetType !== "post" && data.targetType !== "comment") throw new CommunityError("신고 대상을 확인해 주세요.");
  if (!["spam", "abuse", "privacy", "other"].includes(String(data.reason))) throw new CommunityError("신고 사유를 선택해 주세요.");
  return {
    targetType: data.targetType as CommunityReport["targetType"], targetId: communityId(data.targetId), postId: communityId(data.postId),
    reason: data.reason as CommunityReport["reason"], details: communityText(data.details ?? "", "상세 사유", 0, 1000),
  };
}

export function validateModeration(value: unknown) {
  const data = object(value);
  if (data.targetType !== "post" && data.targetType !== "comment") throw new CommunityError("관리 대상을 확인해 주세요.");
  if (data.action !== "hide" && data.action !== "restore") throw new CommunityError("처리 방식을 확인해 주세요.");
  return { targetType: data.targetType, targetId: communityId(data.targetId), postId: communityId(data.postId), action: data.action };
}

// Only a user returned by the server-side Identity verifier may enter this function.
// Profile metadata is deliberately excluded from administrator authorization.
export function verifiedCommunityUser(value: unknown): CommunityUser | null {
  if (!value || typeof value !== "object") return null;
  const user = value as Record<string, unknown>;
  if (typeof user.id !== "string" || !user.id || typeof user.email !== "string" || !user.email || typeof user.confirmedAt !== "string" || !Number.isFinite(Date.parse(user.confirmedAt))) return null;
  const metadata = user.appMetadata as Record<string, unknown> | undefined;
  const isAdmin = Boolean(metadata && Array.isArray(metadata.roles) && metadata.roles.includes("admin"));
  const name = typeof user.name === "string" ? user.name.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 40) : "";
  return { id: user.id, email: user.email, name: name || "워크오토 회원", isAdmin };
}

export function requireCommunityUser(user: CommunityUser | null): CommunityUser {
  if (!user) throw new CommunityError("이메일 인증 후 로그인해 주세요.", 401, "authentication_required");
  return user;
}

export function assertCommunityAdmin(user: CommunityUser | null): CommunityUser {
  const member = requireCommunityUser(user);
  if (!member.isAdmin) throw new CommunityError("관리자만 이용할 수 있습니다.", 403, "forbidden");
  return member;
}

export function assertPostOwner(post: Pick<CommunityPost, "authorId">, user: CommunityUser | null): void {
  if (post.authorId !== requireCommunityUser(user).id) throw new CommunityError("본인이 작성한 글만 삭제할 수 있습니다.", 403, "forbidden");
}

export function assertCommunityOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  let localDevelopmentOrigin = false;
  // Next's local development server canonicalizes Request.url to localhost even
  // when bound to 127.0.0.1. Accept only that literal loopback alias, using the
  // actual Host header and matching scheme/port. Hosted requests stay exact-match.
  if (origin && process.env.NODE_ENV !== "production" && !process.env.NETLIFY) {
    try {
      const source = new URL(origin);
      const loopback = new Set(["localhost", "127.0.0.1"]);
      localDevelopmentOrigin = origin === source.origin && loopback.has(requestUrl.hostname) && loopback.has(source.hostname)
        && source.protocol === requestUrl.protocol && source.port === requestUrl.port && source.host === request.headers.get("host");
    } catch { /* Invalid origins fail the strict check below. */ }
  }
  if (!origin || origin !== requestUrl.origin && !localDevelopmentOrigin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new CommunityError("허용되지 않은 요청입니다.", 403, "invalid_origin");
  }
}

export async function readCommunityJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new CommunityError("JSON 형식으로 보내 주세요.", 415);
  if (Number(request.headers.get("content-length")) > COMMUNITY_MAX_BYTES) throw new CommunityError("입력 내용이 너무 깁니다.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CommunityError("입력 내용이 없습니다.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > COMMUNITY_MAX_BYTES) {
        await reader.cancel();
        throw new CommunityError("입력 내용이 너무 깁니다.", 413);
      }
      chunks.push(result.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new CommunityError("입력 내용을 읽을 수 없습니다."); }
}

export interface CommunityRateWindow { startsAt: number; count: number; lastAt: number }
export function advanceRateWindow(previous: CommunityRateWindow | null, now: number, maximum: number, cooldown: number): CommunityRateWindow {
  const active = previous && now - previous.startsAt < 60 * 60 * 1000;
  if (previous && now - previous.lastAt < cooldown || active && previous.count >= maximum) {
    throw new CommunityError("너무 빠르게 요청하고 있습니다. 잠시 후 다시 이용해 주세요.", 429, "rate_limited");
  }
  return { startsAt: active ? previous.startsAt : now, count: active ? previous.count + 1 : 1, lastAt: now };
}
