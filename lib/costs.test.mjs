import { test } from "node:test";
import assert from "node:assert/strict";
import { formatSats, formatCost, feeTotal, sekRange } from "./costs.ts";

test("skattesatser får rätt enhet", () => {
  assert.equal(formatSats("dieselBransletillaggPerGram", 13.52), "13,52 kr");
  assert.equal(formatSats("co2RatePerGram", 22), "22 kr");
  assert.equal(formatSats("co2ThresholdGram", 111), "111 g/km");
  assert.equal(formatSats("dieselBranslefaktorPre2018", 2.37), "2,37");
});

test("EUR-belopp räknas om med kursen i datafilen", () => {
  assert.match(formatCost("exportforsakring_15d"), /^79 EUR \(ca \d[\d ]* kr\)$/);
  assert.equal(sekRange("exportforsakring_15d").min % 10, 0);
});

test("fasta avgifter för bil = summan av raderna", () => {
  const t = feeTotal("bil");
  assert.ok(t.min <= t.max && t.min > 0);
});
