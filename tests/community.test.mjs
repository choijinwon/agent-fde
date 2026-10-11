import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import { advanceRateWindow, assertCommunityAdmin, assertCommunityOrigin, assertPostOwner, CommunityError, COMMUNITY_MAX_BYTES, readCommunityJson, validateCommunityComment, validateCommunityPost, validateCommunityReport, verifiedCommunityUser } from "../lib/community-rules.ts";

const require = createRequire(import.meta.url);
const source = await readFile(new URL("../lib/community-server.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const owner = { id: "owner-id", email: "owner@example.test", name: "운영 질문자", confirmedAt: "2026-10-11T00:00:00.000Z", appMetadata: { roles: [] } };
const admin = { ...owner, id: "admin-id", appMetadata: { roles: ["admin"] } };
const input = () => ({ kind: "question", industry: "academy", title: "수납 대조를 자동화하고 싶어요", body: "엑셀에 있는 학원 수납 내역과 은행 입금을 자동으로 비교할 수 있나요?", consent: true, website: "" });

function harness(initialUser = owner) {
  const records = new Map();
  let version = 0;
  let identity = initialUser;
  const clone = value => value === undefined ? undefined : structuredClone(value);
  const store = {
    async get(key) { return clone(records.get(key)?.data ?? null); },
    async getWithMetadata(key) { return clone(records.get(key) ?? null); },
    async setJSON(key, value, options = {}) {
      const previous = records.get(key);
      if (options.onlyIfNew && previous || options.onlyIfMatch && previous?.etag !== options.onlyIfMatch) return { modified: false };
      const etag = String(++version);
      records.set(key, { data: clone(value), etag, metadata: {} });
      return { modified: true, etag };
    },
    async *list({ prefix }) { yield { blobs: [...records.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key, etag: records.get(key).etag })), directories: [] }; },
  };
  const loadedModule = { exports: {} };
  // Exercise the real backend source with only its external platform boundaries replaced.
  const load = name => {
    if (name === "server-only") return {};
    if (name === "@netlify/blobs") return { getStore: () => store };
    if (name === "@netlify/identity") return { getUser: async () => clone(identity) };
    if (name === "./community-rules") return require("../lib/community-rules.ts");
    return require(name);
  };
  new Function("require", "module", "exports", compiled)(load, loadedModule, loadedModule.exports);
  return { api: loadedModule.exports, store, records, setUser: user => { identity = user; } };
}

test("post validation discards forged ownership/status and rejects malformed, oversized or nonconsenting input", () => {
  const clean = validateCommunityPost({ ...input(), authorId: "victim", status: "published", email: "private@example.test", isAdmin: true });
  assert.deepEqual(Object.keys(clean).sort(), ["body", "industry", "kind", "title"]);
  for (const mutation of [{ consent: false }, { consent: "true" }, { industry: "unlisted" }, { kind: "admin" }, { title: "짧음" }, { body: "a".repeat(8001) }, { body: "a".repeat(30) + "\u0000" }, { website: "spam" }]) assert.throws(() => validateCommunityPost({ ...input(), ...mutation }), CommunityError);
  for (const invalid of [null, [], "text", 5]) assert.throws(() => validateCommunityPost(invalid), CommunityError);
  assert.throws(() => validateCommunityComment({ body: "x" }), CommunityError);
  assert.throws(() => validateCommunityReport({ targetType: "post", targetId: "../../private", postId: "bad", reason: "spam" }), CommunityError);
});

test("verified email and server-controlled metadata are required, profile role/name cannot grant admin", () => {
  for (const mutation of [{ confirmedAt: undefined }, { confirmedAt: "invalid" }, { email: "" }, { id: "" }]) assert.equal(verifiedCommunityUser({ ...owner, ...mutation }), null);
  const spoof = verifiedCommunityUser({ ...owner, userMetadata: { roles: ["admin"] }, roles: ["admin"], name: "admin" });
  assert.equal(spoof.isAdmin, false);
  assert.throws(() => assertCommunityAdmin(spoof), error => error.status === 403);
  assert.equal(verifiedCommunityUser(admin).isAdmin, true);
  assert.throws(() => assertPostOwner({ authorId: "other" }, verifiedCommunityUser(owner)), error => error.status === 403);
  assert.throws(() => assertPostOwner({ authorId: "other" }, null), error => error.status === 401);
});

test("all cookie-authenticated mutations reject absent and cross-site Origin", () => {
  const url = "https://workauto.co.kr/api/community/posts";
  for (const headers of [{}, { origin: "null" }, { origin: "https://evil.example" }, { origin: "https://workauto.co.kr", "sec-fetch-site": "cross-site" }]) assert.throws(() => assertCommunityOrigin(new Request(url, { headers })), error => error.status === 403);
  assert.doesNotThrow(() => assertCommunityOrigin(new Request(url, { headers: { origin: "https://workauto.co.kr" } })));
});

test("Next localhost normalization permits only matching loopback Host during local development", () => {
  const previousMode = process.env.NODE_ENV;
  const previousNetlify = process.env.NETLIFY;
  const localRequest = headers => new Request("http://localhost:3000/api/community/posts", { headers });
  try {
    process.env.NODE_ENV = "development";
    delete process.env.NETLIFY;
    assert.doesNotThrow(() => assertCommunityOrigin(localRequest({ origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" })));
    for (const headers of [
      { origin: "http://127.0.0.1:3001", host: "127.0.0.1:3001" },
      { origin: "https://127.0.0.1:3000", host: "127.0.0.1:3000" },
      { origin: "http://evil.example:3000", host: "evil.example:3000" },
      { origin: "http://127.0.0.1:3000", "x-forwarded-host": "127.0.0.1:3000" },
      { origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000", "sec-fetch-site": "cross-site" },
    ]) assert.throws(() => assertCommunityOrigin(localRequest(headers)), error => error.status === 403);
    process.env.NODE_ENV = "production";
    assert.throws(() => assertCommunityOrigin(localRequest({ origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" })), error => error.status === 403);
    process.env.NODE_ENV = "development";
    process.env.NETLIFY = "true";
    assert.throws(() => assertCommunityOrigin(localRequest({ origin: "http://127.0.0.1:3000", host: "127.0.0.1:3000" })), error => error.status === 403);
    for (const origin of ["https://workauto.co.kr", "https://community-review--agent-fde.netlify.app"]) {
      assert.doesNotThrow(() => assertCommunityOrigin(new Request(`${origin}/api/community/posts`, { headers: { origin } })));
      assert.throws(() => assertCommunityOrigin(new Request(`${origin}/api/community/posts`, { headers: { origin: "https://attacker.example", host: "attacker.example", "x-forwarded-host": "attacker.example" } })), error => error.status === 403);
    }
  } finally {
    if (previousMode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousMode;
    if (previousNetlify === undefined) delete process.env.NETLIFY; else process.env.NETLIFY = previousNetlify;
  }
});

test("JSON body limit checks streamed bytes even if Content-Length lies", async () => {
  const request = (body, headers = {}) => new Request("https://workauto.co.kr/api/community/posts", { method: "POST", body, headers: { "content-type": "application/json", ...headers } });
  assert.deepEqual(await readCommunityJson(request(JSON.stringify(input()))), input());
  await assert.rejects(readCommunityJson(request("x".repeat(COMMUNITY_MAX_BYTES + 1), { "content-length": "1" })), error => error.status === 413);
  await assert.rejects(readCommunityJson(request(JSON.stringify({ body: "한".repeat(12000) }))), error => error.status === 413);
  await assert.rejects(readCommunityJson(request("{}", { "content-type": "text/plain" })), error => error.status === 415);
  await assert.rejects(readCommunityJson(request("{broken}")), CommunityError);
});

test("unverified and anonymous users cannot create, comment, report, delete or moderate", async () => {
  const { api, setUser } = harness();
  const post = await api.createCommunityPost(input());
  for (const user of [null, { ...owner, confirmedAt: undefined }]) {
    setUser(user);
    await assert.rejects(api.createCommunityPost(input()), error => error.status === 401);
    await assert.rejects(api.createCommunityComment(post.id, { body: "댓글입니다." }), error => error.status === 401);
    await assert.rejects(api.reportCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, reason: "spam" }), error => error.status === 401);
    await assert.rejects(api.deleteCommunityPost(post.id), error => error.status === 401);
    await assert.rejects(api.getCommunityModeration(), error => error.status === 401);
  }
});

test("concurrent post requests use atomic rate reservation; no lost increment or duplicated burst", async () => {
  const { api, records } = harness();
  const results = await Promise.allSettled([api.createCommunityPost(input()), api.createCommunityPost(input())]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(results.find(result => result.status === "rejected").reason.status, 429);
  assert.equal([...records.keys()].filter(key => key.startsWith("posts/")).length, 1);
  assert.equal([...records.values()].find(record => record.data.count)?.data.count, 1);
  assert.throws(() => advanceRateWindow({ startsAt: 1000, count: 5, lastAt: 1000 }, 90000, 5, 0), error => error.status === 429);
  assert.equal(advanceRateWindow({ startsAt: 1000, count: 5, lastAt: 1000 }, 3601001, 5, 0).count, 1);
});

test("author identity comes from the session; other members cannot delete or moderate", async () => {
  const { api, setUser } = harness();
  const post = await api.createCommunityPost({ ...input(), authorId: "victim", authorName: "관리자" });
  assert.equal(post.authorId, owner.id);
  assert.equal(post.authorName, owner.name);
  assert.equal("email" in post, false);
  setUser({ ...owner, id: "another-id", userMetadata: { roles: ["admin"] } });
  await assert.rejects(api.deleteCommunityPost(post.id), error => error.status === 403);
  await assert.rejects(api.moderateCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, action: "hide" }), error => error.status === 403);
  assert.equal((await api.getPublicPost(post.id)).post.id, post.id);
});

test("hidden content is excluded from detail, listing, comments and sitemap; author-deleted content cannot be restored", async () => {
  const { api, setUser } = harness();
  const post = await api.createCommunityPost(input());
  const comment = await api.createCommunityComment(post.id, { body: "입금자명 기준으로 정리할 수 있습니다." });
  setUser(admin);
  await api.moderateCommunityContent({ targetType: "comment", targetId: comment.id, postId: post.id, action: "hide" });
  assert.equal((await api.getPublicPost(post.id)).comments.length, 0);
  await api.moderateCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, action: "hide" });
  assert.equal((await api.getPublicPost(post.id)).post, null);
  assert.equal((await api.listPublicPosts()).posts.length, 0);
  assert.equal((await api.listPublicPostSitemapEntries()).length, 0);
  await assert.rejects(api.createCommunityComment(post.id, { body: "숨겨진 글 댓글" }), error => error.status === 404);
  setUser(owner);
  assert.equal((await api.getMyCommunityPosts(verifiedCommunityUser(owner))).length, 1);
  await api.deleteCommunityPost(post.id);
  setUser(admin);
  await assert.rejects(api.moderateCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, action: "restore" }), error => error.status === 404);
  assert.equal((await api.getPublicPost(post.id)).post, null);
});

test("reports are private, deduplicated and only target visible content", async () => {
  const { api, records, setUser } = harness();
  const post = await api.createCommunityPost(input());
  await api.reportCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, reason: "privacy", details: "개인정보 포함 여부를 확인해 주세요." });
  await assert.rejects(api.getCommunityModeration(), error => error.status === 403);
  for (const record of records.values()) if (typeof record.data.lastAt === "number") record.data.lastAt -= 10000;
  await assert.rejects(api.reportCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, reason: "spam" }), error => error.code === "already_reported");
  assert.equal("reports" in await api.getPublicPost(post.id), false);
  setUser(admin);
  const review = await api.getCommunityModeration();
  assert.equal(review.reports.length, 1);
  assert.equal(review.reports[0].details, "개인정보 포함 여부를 확인해 주세요.");
});

test("a concurrent author deletion and administrator change cannot overwrite a newer post version", async () => {
  const { api, store, setUser } = harness();
  const post = await api.createCommunityPost(input());
  const read = store.getWithMetadata.bind(store);
  let release;
  let reads = 0;
  const bothRead = new Promise(resolve => { release = resolve; });
  store.getWithMetadata = async key => {
    const snapshot = await read(key);
    if (key === `posts/${post.id}`) {
      reads++;
      if (reads === 2) release();
      await bothRead;
    }
    return snapshot;
  };
  const deletion = api.deleteCommunityPost(post.id);
  setUser(admin);
  const moderation = api.moderateCommunityContent({ targetType: "post", targetId: post.id, postId: post.id, action: "hide" });
  const results = await Promise.allSettled([deletion, moderation]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(results.find(result => result.status === "rejected").reason.status, 409);
  assert.equal((await api.getPublicPost(post.id)).post, null);
});

test("cursor pagination neither duplicates entries nor surfaces hidden matches", async () => {
  const { api, store } = harness();
  for (let index = 0; index < 24; index++) {
    const id = `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
    await store.setJSON(`posts/${id}`, { ...input(), id, authorId: owner.id, authorName: owner.name, createdAt: new Date(1791700000000 + index).toISOString(), updatedAt: new Date(1791700000000 + index).toISOString(), status: index === 23 ? "hidden" : "published" });
  }
  const first = await api.listPublicPosts({ q: "은행 입금", kind: "question" });
  const second = await api.listPublicPosts({ q: "은행 입금", kind: "question", cursor: first.nextCursor });
  assert.equal(first.posts.length, 20);
  assert.equal(second.posts.length, 3);
  assert.equal(new Set([...first.posts, ...second.posts].map(post => post.id)).size, 23);
  assert.equal(second.nextCursor, null);
  assert.equal((await api.listPublicPostSitemapEntries()).length, 23);
});
