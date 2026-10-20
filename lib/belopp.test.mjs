// Spärr: inga hårdkodade belopp i sidtext. Alla belopp ska komma från
// data/cost-data.json (via lib/costs.ts och components/Belopp.tsx).
// Medvetna undantag står i lib/belopp-vitlista.json, med motivering.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIRS = ["app", "content", "components"];
const AMOUNT = /\d[\d\s ]*\s?(kr|kronor|SEK|EUR|€)(?![a-zåäö])/g;
const vitlista = JSON.parse(readFileSync(join(ROOT, "lib/belopp-vitlista.json"), "utf8")).undantag;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(tsx?|mdx)$/.test(name) ? [p] : [];
  });
}

test("inga hårdkodade belopp utanför datafilen", () => {
  const fynd = [];
  for (const dir of DIRS) {
    for (const file of files(join(ROOT, dir))) {
      const rel = relative(ROOT, file);
      readFileSync(file, "utf8").split("\n").forEach((rad, i) => {
        for (const m of rad.matchAll(AMOUNT)) {
          const hit = m[0].trim();
          const tillåten = vitlista.some(
            (u) => u.fil === rel && (hit.includes(u.text) || u.text.includes(hit))
          );
          if (!tillåten) fynd.push(`${rel}:${i + 1}: ${m[0].trim()}`);
        }
      });
    }
  }
  assert.deepEqual(fynd, [], `Hårdkodade belopp hittades – flytta till data/cost-data.json:\n${fynd.join("\n")}`);
});

test("varje undantag i vitlistan har en motivering", () => {
  for (const u of vitlista) assert.ok(u.motivering && u.motivering.length > 20, u.text);
});
