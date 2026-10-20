// Regressionstest för felet som en läsare anmälde 30 sep 2026: momsen på
// fordonet räknades in i "själv" men inte i "firma". Moms och tull får aldrig
// påverka differensen, och bara poster som firmans källa täcker jämförs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { compareSelfVsFirm, comparisonFromBreakdown } from "./import-comparison.ts";

const TÄCKER = ["transport", "registreringsbesiktning", "ursprungskontroll"];
const poster = { ursprungskontroll: 1240, registreringsbesiktning: 3500, transport: 3237 };
const övrigt = { skyltavgift: 198, importforsakring: 2500 };

test("läsarens exempel: att göra det själv är billigare, inte 228 583 kr dyrare", () => {
  const r = compareSelfVsFirm(poster, 37375, TÄCKER);
  assert.equal(r.self, 7977);
  assert.equal(r.diff, 37375 - 7977);
  assert.ok(r.diff > 0);
});

test("moms och tull påverkar aldrig differensen", () => {
  const vehiclePriceSEK = 1020960;
  const begagnat = comparisonFromBreakdown({ ...poster, ...övrigt, vehiclePriceSEK, moms: 0, tull: 0 }, 37375, TÄCKER);
  const nytt = comparisonFromBreakdown({ ...poster, ...övrigt, vehiclePriceSEK, moms: 255240, tull: 0 }, 37375, TÄCKER);
  assert.deepEqual(nytt, begagnat);
  assert.notEqual(nytt.diff, -228583);
});

test("poster firman inte täcker läggs på firmans sida", () => {
  const r = compareSelfVsFirm(poster, 24875, ["ursprungskontroll"]);
  assert.equal(r.firm, 24875 + 3500 + 3237);
});
