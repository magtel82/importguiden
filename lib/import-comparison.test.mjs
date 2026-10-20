// Regressionstest för felet som en läsare anmälde 30 sep 2026: momsen på
// fordonet räknades in i "själv" men inte i "firma", så firman såg ut att
// vara 228 583 kr billigare. Moms är inte ens en parameter – testet låser
// fast att samma poster ger samma differens oavsett fordonets moms.
import { test } from "node:test";
import assert from "node:assert/strict";
import { compareSelfVsFirm, comparisonFromBreakdown } from "./import-comparison.ts";

// Läsarens exempel: husbil, arvode 37 375 kr. Posterna som skiljer.
const poster = {
  ursprungskontroll: 1240,
  registreringsbesiktning: 3500,
  skyltavgift: 198,
  importforsakring: 2500,
  transport: 3237,
};

test("läsarens exempel: själv är ca 26 700 kr billigare, inte 228 583 kr dyrare", () => {
  const r = compareSelfVsFirm(poster, 37375);
  assert.equal(r.self, 10675);
  assert.equal(r.diffMin, 26700); // firman täcker allt
  assert.ok(r.diffMin > 0, "att göra det själv ska vara billigare");
});

test("moms påverkar aldrig differensen – nytt fordon med moms och begagnat utan", () => {
  // Läsarens fordon: moms ca 255 240 kr när det räknas som nytt.
  const vehiclePriceSEK = 1020960;
  const begagnat = comparisonFromBreakdown({ ...poster, vehiclePriceSEK, moms: 0, tull: 0 }, 37375);
  const nytt = comparisonFromBreakdown({ ...poster, vehiclePriceSEK, moms: 255240, tull: 0 }, 37375);
  assert.deepEqual(nytt, begagnat);
  assert.equal(nytt.diffMin, 26700);
  assert.notEqual(nytt.diffMin, -228583);
});

test("intervallet: arvodet ensamt till arvodet plus alla poster", () => {
  const r = compareSelfVsFirm(poster, 24875);
  assert.equal(r.firmMin, 24875);
  assert.equal(r.firmMax, 24875 + 10675);
  assert.equal(r.diffMax, 24875);
});
