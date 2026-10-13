import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { encodeNetlifyConsultation, getNetlifyFormsUrl, NETLIFY_FORM_ACTION, NETLIFY_FORM_NAME } from "../lib/netlify-form.ts";
import { validateInquiry } from "../lib/inquiry-validation.ts";
import { POST as retiredInquiryPost } from "../app/api/inquiries/route.ts";

const now = 1791700000000;
const valid = {
  name: " 홍길동 ", email: "HELLO@EXAMPLE.COM", company: "샘플 & 파트너스",
  service: "AI 도입 진단", budget: "협의 후 결정",
  message: "문의 내용에는 & = + 등의 문자가 있어도 정확하게 전달되어야 합니다.",
  consent: true, website: "", startedAt: now - 10000,
  requestId: "2cb7e410-cfa9-4efe-9142-3a65b3d57744",
};

test("Netlify payload preserves Korean and reserved characters and exactly matches the static declaration", async () => {
  const input = validateInquiry(valid, now);
  const body = new URLSearchParams(encodeNetlifyConsultation(input, valid.startedAt));
  assert.equal(body.get("form-name"), NETLIFY_FORM_NAME);
  assert.equal(NETLIFY_FORM_ACTION, "/__forms.html");
  assert.equal(body.get("name"), "홍길동");
  assert.equal(body.get("email"), "hello@example.com");
  assert.equal(body.get("company"), valid.company);
  assert.equal(body.get("message"), valid.message);
  assert.equal(body.get("consent"), "true");
  assert.equal(body.get("website"), "");
  assert.equal(body.get("requestId"), valid.requestId);
  const skeleton = await readFile(new URL("../public/__forms.html", import.meta.url), "utf8");
  const registered = [...skeleton.matchAll(/<(?:input|textarea)\b[^>]*\bname="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual([...body.keys()].sort(), registered.sort());
  assert.match(skeleton, /data-netlify="true"/);
  assert.match(skeleton, /data-netlify-honeypot="website"/);
});

test("AI education learning goals reach the existing Netlify form without extra fields", () => {
  const message = "목표: 문서 작성 & 자료 정리\n현재 수준: 처음 사용\n참여 인원: 1명\n희망 일정: 평일 저녁";
  const input = validateInquiry({ ...valid, company: "", service: "AI 활용 교육", message }, now);
  const body = new URLSearchParams(encodeNetlifyConsultation(input, valid.startedAt));
  const existing = new URLSearchParams(encodeNetlifyConsultation(validateInquiry(valid, now), valid.startedAt));
  assert.equal(body.get("form-name"), NETLIFY_FORM_NAME);
  assert.equal(body.get("service"), "AI 활용 교육");
  assert.equal(body.get("budget"), "협의 후 결정");
  assert.equal(body.get("company"), "");
  assert.equal(body.get("message"), message);
  assert.deepEqual([...body.keys()].sort(), [...existing.keys()].sort());
});

test("dashboard destinations remain on Netlify for malicious or malformed environment values", () => {
  assert.equal(getNetlifyFormsUrl("agent-fde"), "https://app.netlify.com/projects/agent-fde/forms");
  assert.equal(getNetlifyFormsUrl(undefined, "https://agent-fde.netlify.app/"), "https://app.netlify.com/projects/agent-fde/forms");
  for (const url of ["https://agent-fde.netlify.app.evil.test", "https://evil.test", "javascript:alert(1)", "http://agent-fde.netlify.app", "https://user:pass@agent-fde.netlify.app", "https://agent-fde.netlify.app:444", "https://nested.agent-fde.netlify.app"]) {
    assert.equal(getNetlifyFormsUrl("../../evil", url), "https://app.netlify.com/projects");
  }
  assert.equal(getNetlifyFormsUrl(), "https://app.netlify.com/projects");
});

// Existing bookmarked clients must not receive a false success from the retired API.
test("retired inquiry API rejects writes with an explicit migration response", async () => {
  const response = await retiredInquiryPost();
  assert.equal(response.status, 410);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.consultationUrl, "/consultation");
  assert.equal(typeof body.error, "string");
  assert.equal("ok" in body, false);
});
