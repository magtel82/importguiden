import { test } from "node:test";
import assert from "node:assert/strict";
import { ageInDays, isStale } from "./staleness.ts";

test("ködatum äldre än 14 dagar räknas som inaktuellt", () => {
  const now = new Date("2026-11-04T12:00:00+01:00");
  assert.equal(ageInDays("2026-10-20", now), 15);
  assert.equal(isStale("2026-10-20", 14, now), true);
  assert.equal(isStale("2026-10-21", 14, now), false);
});
