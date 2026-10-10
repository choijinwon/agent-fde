import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { writeFile } from "node:fs/promises";

// Run only against a migrated local preview: node tests/inquiry-api.integration.mjs
const base = process.env.INQUIRY_TEST_URL || "http://127.0.0.1:5173";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname)) throw new Error("Integration tests are restricted to loopback previews");
const testIp = "192.0.2.187";
const ids = [];
const window = Math.floor(Date.now() / 3600000);
const key = createHmac("sha256", "local-preview-only-rate-limit-secret").update(`${window}:${testIp}`).digest("hex");
const makeInput = () => {
  const requestId = randomUUID();
  ids.push(requestId);
  return { name: "테스트 담당자", email: "forward-test@example.com", company: "로컬 API 검증", service: "AI 도입 진단", budget: "협의 후 결정", message: "로컬 접수 기능 검증을 위한 테스트 문의입니다. 실제 프로젝트 문의가 아닙니다.", consent: true, website: "", startedAt: Date.now() - 10000, requestId };
};
const post = async (payload, headers = {}) => {
  const response = await fetch(`${base}/api/inquiries`, { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": testIp, origin: base, ...headers }, body: JSON.stringify(payload) });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { error: text }; }
  return { status: response.status, body, headers: response.headers };
};
try {
  const first = makeInput();
  const created = await post(first);
  assert.equal(created.status, 201, JSON.stringify(created));
  assert.equal(created.body.ok, true);
  assert.match(created.body.reference, /^FWD-[0-9A-F]{12}$/);
  assert.equal(created.headers.get("cache-control"), "no-store");
  const repeated = await post(first);
  assert.equal(repeated.status, 200);
  assert.deepEqual(repeated.body, created.body);
  const conflict = await post({ ...first, message: "다른 내용으로 같은 접수 번호를 재사용할 수 없는지 확인합니다." });
  assert.equal(conflict.status, 409);
  assert.equal((await post({ ...makeInput(), consent: false })).status, 400);
  assert.equal((await post(makeInput(), { origin: "https://attacker.invalid" })).status, 403);
  for (let i = 0; i < 4; i += 1) assert.equal((await post(makeInput())).status, 201);
  const limited = await post(makeInput());
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  // An earlier successful request can be retried even after the hourly quota is full.
  assert.deepEqual((await post(first)).body, created.body);
  const anonymous = await fetch(`${base}/admin`, { redirect: "manual" });
  assert.ok([302, 303, 307, 308].includes(anonymous.status));
  assert.match(anonymous.headers.get("location"), /signin-with-chatgpt/);
  const forged = await fetch(`${base}/admin`, { redirect: "manual", headers: { "oai-authenticated-user-id": "attacker", "oai-authenticated-user-email": "seedy@sites.test" } });
  assert.ok([302, 303, 307, 308].includes(forged.status));
  const owner = await fetch(`${base}/admin`, { headers: { cookie: "__sites_local_auth=1" } });
  const ownerPage = await owner.text();
  assert.equal(owner.status, 200);
  assert.ok(ownerPage.includes(created.body.reference), "Owner can see the saved receipt");
  assert.ok(ownerPage.includes("로컬 API 검증"), "Persisted inquiry is shown in the owner inbox");
  console.log("PASS: persisted receipt, idempotent retry, conflict, consent, origin, rate limit, anonymous/forged identity rejection, owner inbox read");
} finally {
  const cleanup = `DELETE FROM inquiries WHERE id IN (${ids.map((id) => `'${id}'`).join(", ")});\nDELETE FROM inquiry_rate_limits WHERE key = '${key}';\n`;
  await writeFile("../inquiry-test-cleanup.sql", cleanup);
  console.log("Targeted local cleanup SQL saved outside the source project: ../inquiry-test-cleanup.sql");
}
