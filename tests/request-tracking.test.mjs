import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
const require = createRequire(import.meta.url);
const base = path.resolve(new URL("..", import.meta.url).pathname);
const now = Date.now();
const user = { id: "member", email: "person@example.test", isAdmin: false };
const admin = { id: "admin", email: "admin@example.test", isAdmin: true };
const payload = (changes = {}) => ({ id: "provider-submission-id", form_name: "automation-consultation", created_at: new Date(now - 10_000).toISOString(), data: { name: "의뢰 고객", email: "Person@Example.test", requestId: "3148d9d1-af26-4f2c-9361-2ab439895db9", consent: "true", service: "학원 운영 자동화", budget: "협의 후 결정", trackingContext: "production", ...changes } });
function harness(initialUser = user, env = { WORKAUTO_REQUEST_STORE: "workauto-requests" }) {
  const records = new Map();
  const names = [];
  let identity = initialUser;
  let version = 0;
  let conflicting = false;
  const store = {
    async get(key) { return structuredClone(records.get(key)?.data ?? null); },
    async getWithMetadata(key) { return structuredClone(records.get(key) ?? null); },
    async setJSON(key, value, options = {}) { const old = records.get(key); if (options.onlyIfNew && old || options.onlyIfMatch && (conflicting || old?.etag !== options.onlyIfMatch)) return { modified: false }; const etag = String(++version); records.set(key, { data: structuredClone(value), etag }); return { modified: true, etag }; },
    async delete(key) { records.delete(key); },
    async *list({ prefix }) { yield { blobs: [...records.keys()].filter(key => key.startsWith(prefix)).map(key => ({ key })) }; },
  };
  const cache = new Map();
  function load(name, from = base) {
    if (name === "server-only") return {};
    if (name === "@netlify/blobs") return { getStore: options => { names.push(options.name); return store; } };
    if (name === "./community-server") return { getCommunityUser: async () => structuredClone(identity) };
    if (!name.startsWith(".")) return require(name);
    let filename = path.resolve(from, name); if (!/\.[cm]?tsx?$/.test(filename)) filename += ".ts";
    if (cache.has(filename)) return cache.get(filename).exports;
    const loadedModule = { exports: {} }; cache.set(filename, loadedModule);
    const source = readFileSync(filename, "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("require", "module", "exports", "process", code)(id => load(id, path.dirname(filename)), loadedModule, loadedModule.exports, { env, cwd: () => base });
    return loadedModule.exports;
  }
  return { load, store, records, names, setUser: value => { identity = value; }, conflict: () => { conflicting = true; } };
}

test("verified form event creates minimal tracking and ignores forged stage, user ID and operator note", () => {
  const h = harness(); const rules = h.load("./lib/request-rules");
  const record = rules.verifiedSubmissionRecord(payload({ email: " Person@Example.test ", userId: "victim", stage: "completed", note: "forged", message: "Highly sensitive full inquiry" }), "production", now);
  // Spaces are invalid provider email input; the real form encoder trims them.
  assert.equal(record, null);
  const saved = rules.verifiedSubmissionRecord(payload({ userId: "victim", stage: "completed", note: "forged", message: "Highly sensitive full inquiry" }), "production", now);
  assert.equal(saved.email, user.email); assert.equal(saved.stage, "received"); assert.equal(saved.message, undefined); assert.equal(saved.userId, undefined); assert.notEqual(saved.note, "forged");
  assert.equal(Date.parse(saved.expiresAt) - Date.parse(saved.createdAt), 365 * 86400000);
  for (const change of [{ consent: "false" }, { requestId: "../../private" }, { website: "spam" }, { service: "invalid" }, { email: "invalid" }, { trackingContext: "preview" }]) assert.equal(rules.verifiedSubmissionRecord(payload(change), "production", now), null);
  assert.equal(rules.verifiedSubmissionRecord({ ...payload(), form_name: "another-form" }, "production", now), null);
  assert.equal(rules.verifiedSubmissionRecord({ ...payload(), created_at: "invalid" }, "production", now), null);
});

test("production and preview storage agree across build/native runtime and unknown context fails closed", () => {
  const h = harness(); const { requestStoreName } = h.load("./lib/request-store-name");
  assert.equal(requestStoreName("production"), "workauto-requests");
  assert.equal(requestStoreName("deploy-preview", "same-deploy"), requestStoreName("branch-deploy", "same-deploy"));
  assert.notEqual(requestStoreName("branch-deploy", "one"), requestStoreName("branch-deploy", "two"));
  for (const context of [undefined, "", "unknown"]) assert.equal(requestStoreName(context, "id"), "");
  assert.equal(requestStoreName("branch-deploy"), "");
  for (const env of [{ CONTEXT: "production" }, { CONTEXT: "deploy-preview", DEPLOY_ID: "one" }, { CONTEXT: "branch-deploy", DEPLOY_ID: "one" }, {}]) {
    const build = harness(user, env).load("./next.config").default;
    assert.equal(build.env.WORKAUTO_REQUEST_STORE, requestStoreName(env.CONTEXT, env.DEPLOY_ID));
  }
});

test("redelivered provider events cannot overwrite progress; a forged request reference cannot collide", async () => {
  const h = harness(); const { verifiedSubmissionRecord } = h.load("./lib/request-rules"); const { ingestRequest } = h.load("./lib/request-storage");
  const a = verifiedSubmissionRecord(payload(), "production", now);
  await ingestRequest(h.store, a);
  const changed = { ...a, stage: "estimate" }; await h.store.setJSON(`requests/${a.id}`, changed);
  await ingestRequest(h.store, a);
  assert.equal((await h.store.get(`requests/${a.id}`)).stage, "estimate");
  const b = verifiedSubmissionRecord({ ...payload(), id: "different-provider-id" }, "production", now);
  assert.notEqual(a.id, b.id);
});

test("only the same verified email sees records; anonymous and other members cannot manage", async () => {
  const h = harness(); const api = h.load("./lib/request-server"); const rules = h.load("./lib/request-rules");
  const record = rules.verifiedSubmissionRecord(payload(), "production", now); await h.store.setJSON(`requests/${record.id}`, record);
  const mine = await api.myRequests(); assert.equal(mine.requests.length, 1); assert.equal(mine.requests[0].email, undefined); assert.equal(mine.requests[0].name, undefined);
  h.setUser({ ...user, email: "someoneelse@example.test" }); assert.equal((await api.myRequests()).requests.length, 0);
  await assert.rejects(api.updateRequest(record.id, { stage: "completed", note: "forged", updatedAt: record.updatedAt }), error => error.status === 403);
  await assert.rejects(api.managedRequests(), error => error.status === 403);
  await assert.rejects(api.deleteManagedRequest(record.id), error => error.status === 403);
  h.setUser(null); await assert.rejects(api.myRequests(), error => error.status === 401);
});

test("admin transitions persist customer-visible history and stale writes lose without overwriting", async () => {
  const h = harness(admin); const api = h.load("./lib/request-server"); const rules = h.load("./lib/request-rules");
  const record = rules.verifiedSubmissionRecord(payload(), "production", now); await h.store.setJSON(`requests/${record.id}`, record);
  const updated = (await api.updateRequest(record.id, { stage: "consultation", note: "다음 주에 상담합니다.", updatedAt: record.updatedAt })).request;
  assert.equal(updated.stage, "consultation"); assert.equal(updated.history.length, 2); assert.equal(updated.history[1].note, "다음 주에 상담합니다."); assert.equal(updated.email, record.email);
  await assert.rejects(api.updateRequest(record.id, { stage: "completed", note: "stale", updatedAt: record.updatedAt }), error => error.status === 409);
  h.conflict(); await assert.rejects(api.updateRequest(record.id, { stage: "estimate", note: "racing", updatedAt: updated.updatedAt }), error => error.status === 409);
  assert.equal((await h.store.get(`requests/${record.id}`)).stage, "consultation");
});

test("expired tracking records are removed and never returned; unknown storage does not open production", async () => {
  const h = harness(); const api = h.load("./lib/request-server"); const rules = h.load("./lib/request-rules");
  const record = rules.verifiedSubmissionRecord(payload(), "production", now); await h.store.setJSON(`requests/${record.id}`, { ...record, expiresAt: new Date(now - 1).toISOString() });
  assert.equal((await api.myRequests()).requests.length, 0); assert.equal(h.records.size, 0);
  const unconfigured = harness(user, { CONTEXT: "production" }); await assert.rejects(unconfigured.load("./lib/request-server").myRequests(), error => error.status === 503); assert.deepEqual(unconfigured.names, []);
});

test("native function ignores mismatched preview form events and refuses unknown platform context", async () => {
  const h = harness(); const handler = h.load("./netlify/functions/submission-created").default;
  const req = value => new Request("https://workauto.co.kr/.netlify/functions/submission-created", { method: "POST", body: JSON.stringify({ payload: value }) });
  await assert.rejects(handler(req(payload()), { deploy: {} }), /context unavailable/);
  await handler(req(payload({ trackingContext: "preview" })), { deploy: { context: "production", id: "prod" } }); assert.equal(h.records.size, 0);
  await handler(req(payload()), { deploy: { context: "production", id: "prod" } }); assert.equal(h.records.size, 1);
  assert.deepEqual(h.names, ["workauto-requests"]);
});

test("deletion erases customer data and delayed form redelivery cannot resurrect it", async () => {
  const h = harness(admin); const api = h.load("./lib/request-server"); const rules = h.load("./lib/request-rules"); const storage = h.load("./lib/request-storage");
  const record = rules.verifiedSubmissionRecord(payload(), "production", now); await storage.ingestRequest(h.store, record);
  await api.deleteManagedRequest(record.id);
  const erased = await h.store.get(`requests/${record.id}`); assert.deepEqual(Object.keys(erased).sort(), ["deleted", "expiresAt", "id"]);
  await storage.ingestRequest(h.store, record); assert.equal((await api.managedRequests()).requests.length, 0);
  await assert.rejects(api.updateRequest(record.id, { stage: "completed", note: "restore", updatedAt: record.updatedAt }), error => error.status === 404);
});
