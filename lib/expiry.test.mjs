import { test } from "node:test";
import assert from "node:assert/strict";
import { isExpired } from "./expiry.ts";

test("bevakningsrutan visas till och med 12 november och döljs 13 november", () => {
  const item = { expiresAt: "2026-11-13" };
  assert.equal(isExpired(item, new Date("2026-11-12T22:00:00+01:00")), false);
  assert.equal(isExpired(item, new Date("2026-11-13T00:00:00+01:00")), true);
});

test("post utan expiresAt går aldrig ut", () => {
  assert.equal(isExpired({}, new Date("2099-01-01")), false);
});
