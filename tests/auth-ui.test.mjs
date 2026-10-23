import assert from "node:assert/strict";
import test from "node:test";
import { safeAccountDestination } from "../lib/auth-ui.ts";

test("account navigation never follows external or malformed next destinations", () => {
  for (const value of [undefined, null, "https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "/community\\evil", "/community\n", "/accounting", "/api/private", "/%2f%2fevil.test"]) assert.equal(safeAccountDestination(value), "/account");
  assert.equal(safeAccountDestination("/community/new"), "/community/new");
  assert.equal(safeAccountDestination("/community?category=question"), "/community?category=question");
});

test("consultation progress login links return to the selected request page", () => {
  for (const destination of ["/requests", "/requests/manage"]) {
    const loginUrl = new URL(`/account/login?next=${encodeURIComponent(destination)}`, "https://workauto.co.kr");
    assert.equal(safeAccountDestination(loginUrl.searchParams.get("next")), destination);
  }
});

test("request navigation allows only the two existing pages", () => {
  for (const destination of ["/request", "/requests-admin", "/requests/manage-other", "/requests/unknown", "/requests/../admin", "/requests/%2e%2e/admin", "/requests\\evil", "/requests\n", "https://evil.test/requests", "//evil.test/requests", "/%2f%2fevil.test/requests"]) {
    assert.equal(safeAccountDestination(destination), "/account", destination);
  }
});

test("repeated next query parameters fall back instead of crashing the login page", () => {
  for (const destinations of [["/requests", "/account"], ["/requests/manage", "/requests/manage"], ["/community/new", "https://evil.test"]]) {
    const query = new URLSearchParams(destinations.map(destination => ["next", destination]));
    assert.equal(safeAccountDestination(query.getAll("next")), "/account");
  }
});
