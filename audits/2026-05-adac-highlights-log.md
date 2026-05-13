# ADAC 2026-highlights – 2026-05-14

Källa: ADAC Pannenstatistik 2026 (publicerad april 2026, verifierad av Magnus 2026-05-14)

---

## Tesla-sidan (`data/car-brands-import.json` + `datasets/pages_manifest.json`)

- **Ändring 1a (årtalsbyten): KLAR**
  - `intro`: "ADAC Pannenstatistik 2025 rankar Tesla Model 3" → 2026
  - `recommendedModels[0].notes`: "Pannenstatistik 2025" → "Pannenstatistik 2026"
  - `adacSource`: "ADAC Pannenstatistik 2025" → "ADAC Pannenstatistik 2026"
  - Täcker alla tre renderingsplatser i page.tsx: header-källa, modell-tabell-källa, problemsektion-källa

- **Ändring 1b (elbil-statistik tillagd): KLAR**
  - Tillagd i Teslas `intro` direkt efter Model Y-meningen:
    "Elbilar generellt presterar starkt: enligt ADAC Pannenstatistik 2026 har 5-åriga elbilar ca 40% färre pannor än jämnåriga förbrännare (10,3 vs 17,4 per 1 000 fordon)."

- **Ändring 1c (Ioniq 5-parentes): SKIPPED – Ioniq 5 nämns ej på Tesla-sidan**

- **Ändring 1d (lastEvaluated): KLAR** – `importera-bil-tesla` → 2026-05-14

## Elbil-guiden (`content/guider/importera-elbil.mdx` + `datasets/pages_manifest.json`)

- **Ändring 2a (ADAC-stycke): KLAR**
  - Tillagd som ingress till modell-tabellen, direkt efter "## Populära modeller att importera":
    Elbilars generella tillförlitlighet, Tesla-validering, Ioniq 5 ICCU-info, 97% täckningsgrad.

- **Ändring 2b (Ioniq 5 i tabell): KLAR**
  - "Saker att kontrollera" för Ioniq 5 utökad: + "ICCU-garanti (15 år/300 000 km för årsmodell 2022–2023)"

- **Ändring 2c (FAQ-fråga): KLAR**
  - Tillagd efter "Kan jag importera en Tesla från USA?" och innan "## Läs mer":
    "Är Hyundai Ioniq 5 säker att importera trots ICCU-problemet?" med fullständigt svar.

- **Ändring 2d (lastEvaluated): KLAR** – `guider-importera-elbil` → 2026-05-14

- **Bonus**: ADAC-källa tillagd i MDX frontmatter sources[] + `dateUpdated` → 2026-05-14

## Build & deployment
- Build: OK – 67 statiska sidor
- Commit: `92b4c8f`
- Push: main – 2026-05-14

## Inte gjort (avsiktligt)
- Toyota-content: inga Toyota-specifika sidor finns på sajten
- Husbilar/Ducato: hanterades i Batch E-light (commit aa85672)
- Övriga bilmärken (BMW, Mercedes, VW, Audi, Porsche): deras adacSource/intro behåller "2025" – det är deras egna tillförlitlighetsdata, inte Ducato-statistik. Uppdateras när Magnus beslutar.
