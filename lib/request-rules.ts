import { createHash } from "node:crypto";
import { INQUIRY_BUDGETS, INQUIRY_SERVICES, RETENTION_MS } from "./inquiry-validation";
import { CommunityError } from "./community-rules";
import { REQUEST_STAGES, type TrackedRequest, type RequestStage, type CustomerRequest } from "./request-types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const REQUEST_RETENTION_MS = RETENTION_MS;
export function normalizeRequestEmail(email: string): string { return email.trim().toLowerCase(); }
export function requestId(value: string): string {
  if (!/^[a-f0-9]{64}$/.test(value)) throw new CommunityError("의뢰를 찾을 수 없습니다.", 404, "not_found");
  return value;
}
function object(value: unknown): Record<string, unknown> | null { return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; }
function text(value: unknown, max: number): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/.test(value); }

/** Call only from the platform-signed submission-created event, never a public route. */
export function verifiedSubmissionRecord(value: unknown, context: "production" | "preview", now = Date.now()): TrackedRequest | null {
  const payload = object(value);
  const data = object(payload?.data);
  if (!payload || !data || payload.form_name !== "automation-consultation" || data.trackingContext !== context) return null;
  if (!text(payload.id, 128) || !text(data.name, 80) || !text(data.email, 254) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email)) return null;
  if (typeof data.requestId !== "string" || !UUID.test(data.requestId) || data.consent !== "true" || (data.website !== undefined && data.website !== "")) return null;
  if (!INQUIRY_SERVICES.includes(data.service as never) || !INQUIRY_BUDGETS.includes(data.budget as never)) return null;
  const created = typeof payload.created_at === "string" ? Date.parse(payload.created_at) : NaN;
  if (!Number.isFinite(created) || created > now + 60_000 || created <= now - REQUEST_RETENTION_MS) return null;
  const createdAt = new Date(created).toISOString();
  // Provider ID, rather than the freely chosen form reference, is the deduplication key.
  const id = createHash("sha256").update(`submission:${payload.id}`).digest("hex");
  return { id, reference: data.requestId.toLowerCase(), name: data.name.trim(), email: normalizeRequestEmail(data.email), service: data.service as string, budget: data.budget as string, stage: "received", note: "상담 요청이 접수되었습니다. 내용을 확인한 뒤 이메일로 연락드립니다.", createdAt, updatedAt: createdAt, expiresAt: new Date(created + REQUEST_RETENTION_MS).toISOString(), history: [{ stage: "received", note: "상담 요청 접수", at: createdAt }] };
}

export function customerRequest(record: TrackedRequest): CustomerRequest {
  const { id, reference, service, budget, stage, note, createdAt, updatedAt, expiresAt, history } = record;
  return { id, reference, service, budget, stage, note, createdAt, updatedAt, expiresAt, history };
}
export function validateRequestUpdate(value: unknown): { stage: RequestStage; note: string; updatedAt: string } {
  const data = object(value);
  if (!data || !REQUEST_STAGES.some(stage => stage.value === data.stage)) throw new CommunityError("진행 단계를 선택해 주세요.");
  if (typeof data.note !== "string" || data.note.length > 1200 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data.note)) throw new CommunityError("고객 안내는 1,200자 이내로 입력해 주세요.");
  if (typeof data.updatedAt !== "string" || !Number.isFinite(Date.parse(data.updatedAt))) throw new CommunityError("새로고침 후 다시 수정해 주세요.", 409, "conflict");
  return { stage: data.stage as RequestStage, note: data.note.trim(), updatedAt: data.updatedAt };
}
