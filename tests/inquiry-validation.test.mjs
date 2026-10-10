import assert from "node:assert/strict";
import test from "node:test";
import { assertSameOrigin, InquiryError, isAdminEmail, MAX_REQUEST_BYTES, readBoundedJson, validateInquiry } from "../lib/inquiry-validation.ts";

import { CONSULTATION_SERVICES } from "../lib/service-catalog.ts";

const now = 1791700000000;
const valid = () => ({ name: "홍길동", email: "hello@example.com", company: "", service: "AI 도입 진단", budget: "협의 후 결정", message: "사내 문서를 검색하고 답변하는 서비스를 만들고 싶습니다.", consent: true, website: "", startedAt: now - 10000, requestId: "2cb7e410-cfa9-4efe-9142-3a65b3d57744" });

test("valid inquiries normalize fields without retaining bot-detection data", () => {
  const input = validateInquiry({ ...valid(), name: " 홍길동 ", email: "HELLO@EXAMPLE.COM" }, now);
  assert.equal(input.name, "홍길동");
  assert.equal(input.email, "hello@example.com");
  assert.equal("startedAt" in input, false);
  assert.equal("website" in input, false);
});

test("validation rejects malformed or oversized data, unsupported choices and missing consent", () => {
  for (const mutation of [{ name: "김" }, { name: "a".repeat(81) }, { email: "bad" }, { email: "x@y.com\nBcc:person@example.com" }, { company: "a".repeat(101) }, { message: "짧음" }, { message: "a".repeat(5001) }, { service: "invented" }, { budget: "anything" }, { consent: false }, { consent: "true" }, { requestId: "not-a-uuid" }, { message: "hello\u0000this is an invalid input" }]) {
    assert.throws(() => validateInquiry({ ...valid(), ...mutation }, now), InquiryError);
  }
  for (const bad of [null, [], 42, "text"]) assert.throws(() => validateInquiry(bad, now), InquiryError);
});

test("bot fields require a human-length session and an empty honeypot", () => {
  for (const mutation of [{ website: "https://spam.invalid" }, { website: 0 }, { startedAt: now }, { startedAt: now + 1 }, { startedAt: 0 }, { startedAt: "yesterday" }, { startedAt: NaN }]) {
    assert.throws(() => validateInquiry({ ...valid(), ...mutation }, now), InquiryError);
  }
});

test("admin allowlist fails closed and does not accept suffix or comma-separated addresses", () => {
  assert.equal(isAdminEmail(" OWNER@EXAMPLE.COM ", "owner@example.com"), true);
  for (const [email, owner] of [["owner@example.com", undefined], ["owner@example.com", ""], [null, "owner@example.com"], ["attacker@example.com", "owner@example.com"], ["owner@example.com.evil.test", "owner@example.com"], ["owner@example.com", "owner@example.com,other@example.com"]]) assert.equal(isAdminEmail(email, owner), false);
});

test("origin checks reject cross-site writes, including null origins", () => {
  for (const headers of [{ origin: "https://evil.test" }, { origin: "null" }, { "sec-fetch-site": "cross-site" }]) assert.throws(() => assertSameOrigin(new Request("https://forward.test/api/inquiries", { headers })), (error) => error.status === 403);
  assert.doesNotThrow(() => assertSameOrigin(new Request("https://forward.test/api/inquiries", { headers: { origin: "https://forward.test" } })));
  assert.doesNotThrow(() => assertSameOrigin(new Request("https://forward.test/api/inquiries")));
});

test("JSON reader enforces size from actual bytes, not only Content-Length", async () => {
  const request = (body, headers = {}) => new Request("https://forward.test/api/inquiries", { method: "POST", headers: { "content-type": "application/json", ...headers }, body });
  assert.deepEqual(await readBoundedJson(request(JSON.stringify(valid()))), valid());
  await assert.rejects(readBoundedJson(request("not json")), InquiryError);
  await assert.rejects(readBoundedJson(request("{}", { "content-type": "text/plain" })), (error) => error.status === 415);
  await assert.rejects(readBoundedJson(request("a".repeat(MAX_REQUEST_BYTES + 1), { "content-length": "1" })), (error) => error.status === 413);
  await assert.rejects(readBoundedJson(request("{}", { "content-length": String(MAX_REQUEST_BYTES + 1) })), (error) => error.status === 413);
  // Korean characters occupy more than one byte, so a character-count limit is insufficient.
  await assert.rejects(readBoundedJson(request(JSON.stringify({ message: "한".repeat(9000) }))), (error) => error.status === 413);
});

test("every selectable consultation service is accepted by the inquiry API validator", () => {
  for (const service of CONSULTATION_SERVICES) {
    assert.equal(validateInquiry({ ...valid(), service }, now).service, service);
  }
});
