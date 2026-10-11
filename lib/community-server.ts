import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getStore, type Store } from "@netlify/blobs";
import { getUser } from "@netlify/identity";
import type { CommunityComment, CommunityPost, CommunityPostDetail, CommunityPostList, CommunityReport, CommunityUser } from "./community-types";
import { advanceRateWindow, assertCommunityAdmin, assertPostOwner, communityId, CommunityError, requireCommunityUser, validateCommunityComment, validateCommunityPost, validateCommunityReport, validateModeration, verifiedCommunityUser, type CommunityRateWindow } from "./community-rules";

const PAGE_SIZE = 20;
const MAX_SCAN = 2000;

function openStore(): Store | null {
  try {
    // Preview submissions must never become production community content.
    const context = process.env.CONTEXT;
    const suffix = context && context !== "production" ? `-${createHash("sha256").update(process.env.BRANCH || context).digest("hex").slice(0, 12)}` : "";
    return getStore({ name: `workauto-community${suffix}`, consistency: "strong" });
  } catch (error) {
    if (error instanceof Error && error.name === "MissingBlobsEnvironmentError" && !process.env.NETLIFY) return null;
    throw error;
  }
}

function requireStore(): Store {
  const store = openStore();
  if (!store) throw new CommunityError("커뮤니티 연결을 준비 중입니다. 잠시 후 다시 이용해 주세요.", 503, "unavailable");
  return store;
}

async function scan<T>(store: Store, prefix: string): Promise<T[]> {
  const result: T[] = [];
  let count = 0;
  for await (const page of store.list({ prefix, paginate: true })) {
    count += page.blobs.length;
    if (count > MAX_SCAN) throw new CommunityError("게시판을 불러오지 못했습니다. 잠시 후 다시 이용해 주세요.", 503, "capacity_reached");
    for (let offset = 0; offset < page.blobs.length; offset += 12) {
      const entries = await Promise.all(page.blobs.slice(offset, offset + 12).map(({ key }) => store.get(key, { type: "json" }) as Promise<T | null>));
      for (const entry of entries) if (entry) result.push(entry);
    }
  }
  return result;
}

function newest<T extends { createdAt: string; id: string }>(a: T, b: T): number {
  return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
}

function pageCursor(post: CommunityPost): string {
  return Buffer.from(JSON.stringify({ createdAt: post.createdAt, id: post.id })).toString("base64url");
}

function afterCursor(post: CommunityPost, cursor: string): boolean {
  try {
    if (cursor.length > 256 || !/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error("cursor");
    const item = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    communityId(item.id);
    if (typeof item.createdAt !== "string" || !Number.isFinite(Date.parse(item.createdAt))) throw new Error("cursor");
    return newest(post, item) > 0;
  } catch { throw new CommunityError("목록 주소를 확인해 주세요.", 400, "invalid_cursor"); }
}

export async function getCommunityUser(): Promise<CommunityUser | null> {
  return verifiedCommunityUser(await getUser());
}

export async function listPublicPosts(options: { kind?: string; industry?: string; cursor?: string; q?: string } = {}): Promise<CommunityPostList> {
  const store = openStore();
  if (!store) return { posts: [], available: false, nextCursor: null };
  const all = await scan<CommunityPost>(store, "posts/");
  const query = (options.q ?? "").trim().slice(0, 100).toLocaleLowerCase("ko");
  const matching = all.filter(post => post.status === "published" && (!options.kind || post.kind === options.kind) && (!options.industry || post.industry === options.industry) && (!query || `${post.title} ${post.body}`.toLocaleLowerCase("ko").includes(query))).sort(newest);
  const remaining = options.cursor ? matching.filter(post => afterCursor(post, options.cursor!)) : matching;
  const posts = remaining.slice(0, PAGE_SIZE);
  return { posts, available: true, nextCursor: remaining.length > PAGE_SIZE ? pageCursor(posts[posts.length - 1]) : null };
}

export async function listPublicPostSitemapEntries(): Promise<{ id: string; updatedAt: string }[]> {
  const store = openStore();
  if (!store) return [];
  return (await scan<CommunityPost>(store, "posts/")).filter(post => post.status === "published").map(({ id, updatedAt }) => ({ id, updatedAt }));
}

export async function getPublicPost(id: string): Promise<CommunityPostDetail> {
  try { communityId(id); }
  catch { return { post: null, comments: [], available: true }; }
  const store = openStore();
  if (!store) return { post: null, comments: [], available: false };
  const post = await store.get(`posts/${id}`, { type: "json" }) as CommunityPost | null;
  if (!post || post.status !== "published") return { post: null, comments: [], available: true };
  const comments = (await scan<CommunityComment>(store, `comments/${id}/`)).filter(comment => comment.status === "published").sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return { post, comments, available: true };
}

export async function getMyCommunityPosts(user: CommunityUser): Promise<CommunityPost[]> {
  const store = requireStore();
  return (await scan<CommunityPost>(store, "posts/")).filter(post => post.authorId === user.id && post.status !== "deleted").sort(newest);
}

async function rateLimit(store: Store, user: CommunityUser, action: string, maximum: number, cooldown: number): Promise<void> {
  const key = `rates/${createHash("sha256").update(`${user.id}:${action}`).digest("hex")}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await store.getWithMetadata(key, { type: "json" });
    const next = advanceRateWindow(existing?.data as CommunityRateWindow | null, Date.now(), maximum, cooldown);
    if (existing && !existing.etag) throw new CommunityError("요청을 처리할 수 없습니다. 다시 시도해 주세요.", 503, "unavailable");
    const saved = await store.setJSON(key, next, existing ? { onlyIfMatch: existing.etag! } : { onlyIfNew: true });
    if (saved.modified) return;
  }
  throw new CommunityError("요청이 겹쳤습니다. 잠시 후 다시 이용해 주세요.", 429, "rate_limited");
}

export async function createCommunityPost(value: unknown): Promise<CommunityPost> {
  const input = validateCommunityPost(value);
  const user = requireCommunityUser(await getCommunityUser());
  const store = requireStore();
  await rateLimit(store, user, "post", 5, 30000);
  const now = new Date().toISOString();
  const post: CommunityPost = { ...input, id: randomUUID(), authorId: user.id, authorName: user.name, createdAt: now, updatedAt: now, status: "published" };
  const saved = await store.setJSON(`posts/${post.id}`, post, { onlyIfNew: true });
  if (!saved.modified) throw new CommunityError("글을 저장하지 못했습니다. 다시 시도해 주세요.", 409, "conflict");
  return post;
}

export async function deleteCommunityPost(id: string): Promise<void> {
  communityId(id);
  const user = requireCommunityUser(await getCommunityUser());
  const store = requireStore();
  const key = `posts/${id}`;
  const existing = await store.getWithMetadata(key, { type: "json" });
  if (!existing?.data) throw new CommunityError("게시물을 찾을 수 없습니다.", 404, "not_found");
  const post = existing.data as CommunityPost;
  assertPostOwner(post, user);
  if (post.status === "deleted") return;
  if (!existing.etag) throw new CommunityError("글을 처리할 수 없습니다.", 503, "unavailable");
  const saved = await store.setJSON(key, { ...post, title: "삭제된 글", body: "", status: "deleted", updatedAt: new Date().toISOString() }, { onlyIfMatch: existing.etag });
  if (!saved.modified) throw new CommunityError("글 상태가 변경됐습니다. 새로고침 후 다시 시도해 주세요.", 409, "conflict");
}

export async function createCommunityComment(postId: string, value: unknown): Promise<CommunityComment> {
  communityId(postId);
  const input = validateCommunityComment(value);
  const user = requireCommunityUser(await getCommunityUser());
  const store = requireStore();
  const post = await store.get(`posts/${postId}`, { type: "json" }) as CommunityPost | null;
  if (!post || post.status !== "published") throw new CommunityError("댓글을 작성할 수 없는 글입니다.", 404, "not_found");
  await rateLimit(store, user, "comment", 30, 5000);
  const comment: CommunityComment = { ...input, id: randomUUID(), postId, authorId: user.id, authorName: user.name, createdAt: new Date().toISOString(), status: "published" };
  const saved = await store.setJSON(`comments/${postId}/${comment.id}`, comment, { onlyIfNew: true });
  if (!saved.modified) throw new CommunityError("댓글을 저장하지 못했습니다. 다시 시도해 주세요.", 409, "conflict");
  return comment;
}

export async function reportCommunityContent(value: unknown): Promise<void> {
  const input = validateCommunityReport(value);
  const user = requireCommunityUser(await getCommunityUser());
  const store = requireStore();
  const key = input.targetType === "post" ? `posts/${input.targetId}` : `comments/${input.postId}/${input.targetId}`;
  if (input.targetType === "post" && input.targetId !== input.postId) throw new CommunityError("신고 대상을 확인해 주세요.");
  const target = await store.get(key, { type: "json" }) as CommunityPost | CommunityComment | null;
  const parent = input.targetType === "post" ? target : await store.get(`posts/${input.postId}`, { type: "json" }) as CommunityPost | null;
  if (!target || target.status !== "published" || !parent || parent.status !== "published") throw new CommunityError("신고 대상을 찾을 수 없습니다.", 404, "not_found");
  await rateLimit(store, user, "report", 10, 5000);
  const report: CommunityReport = { ...input, id: randomUUID(), reporterId: user.id, createdAt: new Date().toISOString(), resolvedAt: null };
  const reportKey = `reports/${createHash("sha256").update(`${user.id}:${input.targetType}:${input.targetId}`).digest("hex")}`;
  const saved = await store.setJSON(reportKey, report, { onlyIfNew: true });
  if (!saved.modified) throw new CommunityError("이미 신고한 게시물입니다.", 409, "already_reported");
}

export async function getCommunityModeration() {
  assertCommunityAdmin(await getCommunityUser());
  const store = requireStore();
  const [reports, posts, comments] = await Promise.all([scan<CommunityReport>(store, "reports/"), scan<CommunityPost>(store, "posts/"), scan<CommunityComment>(store, "comments/")]);
  return { reports: reports.filter(report => !report.resolvedAt).sort(newest), posts: posts.filter(post => post.status !== "deleted").sort(newest), comments: comments.filter(comment => comment.status !== "deleted").sort(newest) };
}

export async function moderateCommunityContent(value: unknown): Promise<void> {
  const input = validateModeration(value);
  const user = assertCommunityAdmin(await getCommunityUser());
  const store = requireStore();
  await rateLimit(store, user, "moderate", 120, 0);
  if (input.targetType === "post" && input.targetId !== input.postId) throw new CommunityError("관리 대상을 확인해 주세요.");
  const key = input.targetType === "post" ? `posts/${input.targetId}` : `comments/${input.postId}/${input.targetId}`;
  const existing = await store.getWithMetadata(key, { type: "json" });
  if (!existing?.data || existing.data.status === "deleted") throw new CommunityError("게시물을 찾을 수 없습니다.", 404, "not_found");
  if (!existing.etag) throw new CommunityError("게시물을 처리할 수 없습니다.", 503, "unavailable");
  const saved = await store.setJSON(key, { ...existing.data, status: input.action === "hide" ? "hidden" : "published", updatedAt: new Date().toISOString() }, { onlyIfMatch: existing.etag });
  if (!saved.modified) throw new CommunityError("게시물 상태가 변경됐습니다. 다시 확인해 주세요.", 409, "conflict");
}
