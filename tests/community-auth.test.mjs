import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/community-auth.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.signature";
const providerUser = () => ({ id: "3148d9d1-af26-4f2c-9361-2ab439895db9", email: "member@example.test", confirmed_at: "2026-10-11T00:00:00Z", user_metadata: { full_name: "자동화 회원" }, app_metadata: { roles: [] } });

function harness({ cookie = token, fetcher = async () => Response.json(providerUser()) } = {}) {
  const loaded = { exports: {} };
  const load = name => {
    if (name === "server-only") return {};
    if (name === "next/headers") return { cookies: async () => ({ get: name => name === "nf_jwt" && cookie ? { name, value: cookie } : undefined }) };
    if (name === "./seo") return { SITE_URL: "https://workauto.co.kr" };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function("require", "module", "exports", "fetch", compiled)(load, loaded, loaded.exports, fetcher);
  return loaded.exports;
}

test("valid Next cookie is checked at the fixed trusted provider without Netlify runtime globals", async () => {
  const requests = [];
  const auth = harness({ fetcher: async (url, options) => { requests.push({ url, options }); return Response.json(providerUser()); } });
  const user = await auth.getVerifiedCommunityIdentity();
  assert.equal(user.id, providerUser().id);
  assert.equal(user.confirmedAt, providerUser().confirmed_at);
  assert.equal(user.name, "자동화 회원");
  assert.deepEqual(user.appMetadata, { roles: [] });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://workauto.co.kr/.netlify/identity/user");
  assert.equal(requests[0].options.headers.Authorization, `Bearer ${token}`);
  assert.equal(requests[0].options.redirect, "manual");
  assert.equal(requests[0].options.cache, "no-store");
  assert.equal(requests[0].options.credentials, "omit");
  assert.ok(requests[0].options.signal instanceof AbortSignal);
});

test("absent, oversized and malformed cookies do not invoke the provider", async () => {
  let requests = 0;
  for (const cookie of [undefined, "", "not-a-token", "a.b.c\r\nAuthorization: bad", "a".repeat(8193) + ".b.c"]) {
    const auth = harness({ cookie: cookie ?? "", fetcher: async () => { requests++; throw new Error("Must not fetch"); } });
    assert.equal(await auth.getVerifiedCommunityIdentity(), null);
  }
  assert.equal(requests, 0);
});

test("forged JWT claims never authenticate without a successful verified provider response", async () => {
  const forged = `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ sub: providerUser().id, email: "owner@example.test", app_metadata: { roles: ["admin"] }, confirmed_at: "2026-10-11" })).toString("base64url")}.fake`;
  for (const status of [301, 302, 401, 403, 404, 500]) {
    const auth = harness({ cookie: forged, fetcher: async () => new Response("{}", { status, headers: { "content-type": "application/json", location: "https://attacker.invalid/collect" } }) });
    assert.equal(await auth.getVerifiedCommunityIdentity(), null);
  }
});

test("provider failures and malformed or unconfirmed user data fail closed", async () => {
  const invalidBodies = [null, [], {}, { ...providerUser(), id: "" }, { ...providerUser(), email: "bad" }, { ...providerUser(), confirmed_at: null }, { ...providerUser(), confirmed_at: "invalid" }];
  for (const body of invalidBodies) assert.equal(await harness({ fetcher: async () => Response.json(body) }).getVerifiedCommunityIdentity(), null);
  for (const fetcher of [async () => { throw new Error("network"); }, async () => { throw new DOMException("expired", "TimeoutError"); }, async () => new Response("<html>Not found</html>", { headers: { "content-type": "text/html" } }), async () => new Response("{broken", { headers: { "content-type": "application/json" } })]) {
    assert.equal(await harness({ fetcher }).getVerifiedCommunityIdentity(), null);
  }
});

test("administrator roles come only from the verified provider's app_metadata", async () => {
  const body = { ...providerUser(), roles: ["admin"], user_metadata: { full_name: "관리자라고 주장", roles: ["admin"], app_metadata: { roles: ["admin"] } } };
  let user = await harness({ fetcher: async () => Response.json(body) }).getVerifiedCommunityIdentity();
  assert.deepEqual(user.appMetadata.roles, []);
  user = await harness({ fetcher: async () => Response.json({ ...body, app_metadata: { roles: ["admin", 7, null, "x".repeat(65)] } }) }).getVerifiedCommunityIdentity();
  assert.deepEqual(user.appMetadata.roles, ["admin"]);
  assert.equal("userMetadata" in user, false);
});
