import "server-only";
import { getCommunityUser } from "./community-server";
import { assertCommunityAdmin, CommunityError, requireCommunityUser } from "./community-rules";
import { customerRequest, normalizeRequestEmail, requestId, validateRequestUpdate } from "./request-rules";
import { openRequestStore, scanRequests } from "./request-storage";
import type { TrackedRequest, DeletedRequest } from "./request-types";

function store() { return openRequestStore(process.env.WORKAUTO_REQUEST_STORE); }
export async function myRequests() {
  const user = requireCommunityUser(await getCommunityUser());
  const requests = (await scanRequests(store())).filter(item => item.email === normalizeRequestEmail(user.email)).map(customerRequest);
  return { requests, email: user.email, isAdmin: user.isAdmin };
}
export async function managedRequests() {
  assertCommunityAdmin(await getCommunityUser());
  return { requests: await scanRequests(store()) };
}
export async function updateRequest(id: string, value: unknown) {
  assertCommunityAdmin(await getCommunityUser());
  requestId(id);
  const input = validateRequestUpdate(value);
  const storage = store();
  const current = await storage.getWithMetadata(`requests/${id}`, { type: "json" });
  const record = current?.data as TrackedRequest | DeletedRequest | undefined;
  if (!record || "deleted" in record || Date.parse(record.expiresAt) <= Date.now()) throw new CommunityError("의뢰를 찾을 수 없습니다.", 404, "not_found");
  if (!current?.etag || record.updatedAt !== input.updatedAt) throw new CommunityError("다른 변경이 있습니다. 새로고침 후 다시 수정해 주세요.", 409, "conflict");
  if (record.stage === input.stage && record.note === input.note) return { request: record };
  if (record.history.length >= 200) throw new CommunityError("변경 기록이 많아 더 수정할 수 없습니다. 운영자에게 문의해 주세요.", 409, "history_limit");
  const now = new Date().toISOString();
  const updated: TrackedRequest = { ...record, stage: input.stage, note: input.note, updatedAt: now, history: [...record.history, { stage: input.stage, note: input.note, at: now }] };
  const saved = await storage.setJSON(`requests/${id}`, updated, { onlyIfMatch: current.etag });
  if (!saved.modified) throw new CommunityError("다른 변경이 있습니다. 새로고침 후 다시 수정해 주세요.", 409, "conflict");
  return { request: updated };
}
export async function deleteManagedRequest(id: string) {
  assertCommunityAdmin(await getCommunityUser());
  requestId(id);
  const storage = store();
  const current = await storage.getWithMetadata(`requests/${id}`, { type: "json" });
  const record = current?.data as TrackedRequest | DeletedRequest | undefined;
  if (!record || "deleted" in record) return { deleted: true };
  if (!current?.etag) throw new CommunityError("삭제하지 못했습니다. 새로고침 후 다시 이용해 주세요.", 409, "conflict");
  // Retain no customer information, but prevent delayed event delivery from
  // restoring erased personal data before the original retention deadline.
  const saved = await storage.setJSON(`requests/${id}`, { id, deleted: true, expiresAt: record.expiresAt } satisfies DeletedRequest, { onlyIfMatch: current.etag });
  if (!saved.modified) throw new CommunityError("다른 변경이 있습니다. 새로고침 후 다시 삭제해 주세요.", 409, "conflict");
  return { deleted: true };
}
