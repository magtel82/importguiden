// Enhetstester för fordonsskatteberäkningen. Kör: npm test
// Facit räknat för hand ur Skatteverkets fordonsskattetabeller (2026-02-01).
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateMalus, malusAmountFor } from "./malus-calculator.ts";

test("malussatser: 107 kr/g för 76–125 g/km, 132 kr/g däröver", () => {
  assert.equal(malusAmountFor(75), 0);
  assert.equal(malusAmountFor(76), 107);
  assert.equal(malusAmountFor(125), 50 * 107);
  assert.equal(malusAmountFor(126), 50 * 107 + 132);
});

test("husbil diesel 200 g/km, fordonsår 2018+ (tabell 63) ≈ 5 272 kr", () => {
  // 360 + 22 × (200 − 111) + 250 + 13,52 × 200 = 360 + 1 958 + 250 + 2 704
  const r = calculateMalus(200, "diesel", 0, "husbil");
  assert.equal(r.annualTax, 5272);
  assert.equal(r.hasMalus, false);
});

test("husbil diesel 200 g/km, skattepliktig före 1 juli 2018 (tabell 62) ≈ 5 744 kr", () => {
  // (360 + 22 × 89) × 2,37 + 250 = 2 318 × 2,37 + 250 = 5 743,66
  const r = calculateMalus(200, "diesel", 0, "husbil", { firstTaxedBeforeJuly2018: true });
  assert.equal(r.annualTax, 5744);
});

test("personbil bensin 165 g/km: malus år 1–3, ordinarie från år 4", () => {
  // År 1–3: 360 + 50 × 107 + 40 × 132 = 10 990. Från år 4: 360 + 22 × 54 = 1 548.
  assert.equal(calculateMalus(165, "bensin", 0, "personbil").annualTax, 10990);
  assert.equal(calculateMalus(165, "bensin", 0, "personbil").annualTaxAfterMalus, 1548);
  assert.equal(calculateMalus(165, "bensin", 36, "personbil").annualTax, 1548);
});

test("personbil diesel 127 g/km (tabell 63) med malus", () => {
  // 360 + 50 × 107 + 2 × 132 + 250 + round(13,52 × 127) = 360 + 5 350 + 264 + 250 + 1 717
  assert.equal(calculateMalus(127, "diesel", 0, "personbil").annualTax, 7941);
});

test("elbil betalar grundbeloppet 360 kr", () => {
  assert.equal(calculateMalus(0, "elbil", 0, "personbil").annualTax, 360);
});

test("husbil har aldrig malus", () => {
  assert.equal(calculateMalus(280, "bensin", 0, "husbil").hasMalus, false);
});
