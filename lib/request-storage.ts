import { getStore, type Store } from "@netlify/blobs";
import { CommunityError } from "./community-rules";
import type { TrackedRequest, DeletedRequest } from "./request-types";

export function openRequestStore(name: string | undefined): Store {
  if (!name || !/^workauto-requests(?:-[a-f0-9]{16})?$/.test(name)) throw new CommunityError("의뢰 조회 연결을 준비 중입니다. 잠시 후 다시 이용해 주세요.", 503, "unavailable");
  try { return getStore({ name, consistency: "strong" }); }
  catch { throw new CommunityError("의뢰 조회 연결이 원활하지 않습니다. 잠시 후 다시 이용해 주세요.", 503, "unavailable"); }
}
export async function scanRequests(store: Store, now = Date.now()): Promise<TrackedRequest[]> {
  const records: TrackedRequest[] = [];
  let scanned = 0;
  for await (const page of store.list({ prefix: "requests/", paginate: true })) {
    scanned += page.blobs.length;
    if (scanned > 2000) throw new CommunityError("의뢰 목록을 불러오지 못했습니다. 운영자에게 문의해 주세요.", 503, "capacity_reached");
    for (let i = 0; i < page.blobs.length; i += 20) {
      const items = await Promise.all(page.blobs.slice(i, i + 20).map(async ({ key }) => {
        const item = await store.get(key, { type: "json" }) as TrackedRequest | DeletedRequest | null;
        if (item && Date.parse(item.expiresAt) <= now) { await store.delete(key); return null; }
        if (item && "deleted" in item) return null;
        return item;
      }));
      records.push(...items.filter((item): item is TrackedRequest => Boolean(item)));
    }
  }
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}
export async function ingestRequest(store: Store, record: TrackedRequest): Promise<void> {
  // A redelivered event must never erase an operator's progress update.
  await store.setJSON(`requests/${record.id}`, record, { onlyIfNew: true });
}
