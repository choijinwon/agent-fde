import assert from "node:assert/strict";
import test from "node:test";
import { safeAccountDestination } from "../lib/auth-ui.ts";

test("account navigation never follows external or malformed next destinations", () => {
  for (const value of [undefined, null, "https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", "/community\\evil", "/community\n", "/accounting", "/api/private", "/%2f%2fevil.test"]) assert.equal(safeAccountDestination(value), "/account");
  assert.equal(safeAccountDestination("/community/new"), "/community/new");
  assert.equal(safeAccountDestination("/community?category=question"), "/community?category=question");
});
