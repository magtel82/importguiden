// Spärr: inga hårdkodade belopp eller procentuppgifter i sidtext. Belopp ska
// komma från data/cost-data.json (via lib/costs.ts och components/Belopp.tsx).
// Procenttal godkänns bara om de är en officiell sats i cost-data.json
// (procentsatser) eller står i lib/belopp-vitlista.json med motivering.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIRS = ["app", "content", "components"];
// Sidinnehåll som ligger som data men renderas som text på märkessidorna.
const CONTENT_DATA = ["data/car-brands-import.json", "data/motorhome-brands-import.json"];
const AMOUNT = /\d[\d\s ]*\s?(kr|kronor|SEK|EUR|€)(?![a-zåäö])/g;
const PERCENT = /\d+[,.]?\d*\s?%/g;

const vitlista = JSON.parse(readFileSync(join(ROOT, "lib/belopp-vitlista.json"), "utf8")).undantag;
const costData = JSON.parse(readFileSync(join(ROOT, "data/cost-data.json"), "utf8"));
const tillåtnaProcent = new Set(
  Object.entries(costData.procentsatser)
    .filter(([k]) => !k.startsWith("_"))
    .flatMap(([, v]) => [`${v.value} %`, `${v.value}%`])
);

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(tsx?|mdx)$/.test(name) ? [p] : [];
  });
}

function allFiles() {
  return [...DIRS.flatMap((d) => files(join(ROOT, d))), ...CONTENT_DATA.map((f) => join(ROOT, f))];
}

function vitlistad(rel, hit) {
  return vitlista.some((u) => u.fil === rel && (hit.includes(u.text) || u.text.includes(hit)));
}

function scan(re, ok) {
  const fynd = [];
  for (const file of allFiles()) {
    const rel = relative(ROOT, file);
    readFileSync(file, "utf8").split("\n").forEach((rad, i) => {
      for (const m of rad.matchAll(re)) {
        const hit = m[0].trim();
        if (!ok(hit) && !vitlistad(rel, hit)) fynd.push(`${rel}:${i + 1}: ${hit}`);
      }
    });
  }
  return fynd;
}

test("inga hårdkodade belopp utanför datafilen", () => {
  const fynd = scan(AMOUNT, () => false);
  assert.deepEqual(fynd, [], `Hårdkodade belopp – flytta till data/cost-data.json:\n${fynd.join("\n")}`);
});

test("procent bara som officiell sats ur datafilen eller vitlistad", () => {
  const fynd = scan(PERCENT, (hit) => tillåtnaProcent.has(hit.replace(/\s+/g, " ")));
  assert.deepEqual(fynd, [], `Procentuppgift utan källa:\n${fynd.join("\n")}`);
});

test("varje undantag i vitlistan har en motivering", () => {
  for (const u of vitlista) assert.ok(u.motivering && u.motivering.length > 20, u.text);
});
