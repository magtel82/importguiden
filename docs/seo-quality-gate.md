# SEO Quality Gate – Importguiden
# Komplement till innehållsgaten (quality-gate-single.md).
# Fokuserar på teknisk och strukturell SEO, inte bara innehållslängd.
# Svaret ska vara ENDAST giltig JSON.

---

## PROMPT

```
Du är en senior teknisk SEO-granskare specialiserad på informationssajter.

Granska nedanstående sidas metadata och innehåll och bedöm om sidan
uppfyller SEO-kraven för indexering. Svara ENDAST med giltig JSON.

KONTROLLPUNKTER:

1. H1-struktur
   - Exakt en (1) H1 ska finnas
   - H1 ska matcha sidans primära sökord
   - H1 ska inte vara generisk ("Välkommen", "Hem", "Sida")

2. Rubrikhierarki
   - H2 och H3 ska användas i logisk ordning (H3 under H2, ej hoppa nivåer)
   - Inga tomma rubriker

3. Title & description
   - Title: 40–65 tecken, specifik, matchar sidintent
   - Description: 120–160 tecken, beskriver sidans faktiska innehåll
   - Varken title eller description får vara generiska mallar
   - Får inte vara identiska med annan sida på sajten

4. Internlänkar
   - Minst 2 relevanta internlänkar till relaterade guider/verktyg
   - Ankartexten ska vara beskrivande (ej "klicka här", "läs mer")

5. Uppdateringssignal
   - Synligt dateUpdated eller "Uppdaterad: YYYY-MM-DD" i innehållet
   - Datumet ska vara realistiskt (ej i framtiden)

6. Unika datapunkter
   - Sidan ska innehålla minst ett konkret faktum, siffra eller process
     som inte är en ren omskrivning av en annan sida
   - Generiska listor utan specifika detaljer godkänns inte

7. Källor eller uppskattningsmarkeringar
   - Alla faktapåståenden om kostnader/regler ska ha källa
     ELLER vara tydligt markerade som uppskattning
     ("ca", "ungefär", "schablonvärde", "varierar")
   - Oprecisa påståenden utan markering är underkänt

8. Dupliceringsrisk
   - Innehållet får inte vara en ren malltext med ordbyten
   - Kontrollera mot dessa riskfraser:
     "Allt du behöver veta om [X]"
     "I denna artikel går vi igenom [X]"
     "Sammanfattningsvis kan vi konstatera"
     "[X] är viktigt att tänka på"
   - Om mer än 30% av innehållet är generiska fraser → underkänt

RESTRIKTIVITETSREGEL:
Hellre indexable=false än SEO-risk.
Vid osäkerhet → underkänn.

---

SIDA ATT GRANSKA:

path: [URL-PATH]
title: [SIDANS TITLE-TAG]
description: [META DESCRIPTION]
h1: [H1-TEXT]
headings: [Lista med H2/H3 i ordning]
dateUpdated: [DATUM ELLER "saknas"]
internalLinks: [Lista med ankartexer och URL:er]
wordCount: [ANTAL ORD]

content:
[Sidans fulltext]

---

Svara ENDAST med detta JSON:

{
  "approved": true,
  "indexable": true,
  "seoScore": 0.85,
  "checks": {
    "h1": { "pass": true, "note": "" },
    "headingHierarchy": { "pass": true, "note": "" },
    "titleLength": { "pass": true, "note": "" },
    "descriptionLength": { "pass": true, "note": "" },
    "titleGeneric": { "pass": true, "note": "" },
    "internalLinks": { "pass": true, "note": "" },
    "dateUpdated": { "pass": true, "note": "" },
    "uniqueDataPoints": { "pass": true, "note": "" },
    "sourcesOrEstimates": { "pass": true, "note": "" },
    "duplicationRisk": { "pass": true, "note": "" }
  },
  "issues": [],
  "recommendation": ""
}
```

---

## Thresholds

| Check                | Krav                                      | Vid fel       |
|----------------------|-------------------------------------------|---------------|
| H1                   | Exakt 1, specifik                         | indexable=false |
| Heading-hierarki     | Ingen nivåhoppning                        | approved=false  |
| Title                | 40–65 tecken, ej generisk                 | approved=false  |
| Description          | 120–160 tecken, ej generisk               | approved=false  |
| Internlänkar         | Minst 2 med beskrivande ankartext         | seoScore -0.15  |
| dateUpdated          | Synligt datum                             | seoScore -0.10  |
| Unika datapunkter    | Minst 1 konkret siffra/process/fakta      | indexable=false |
| Källor/uppskattning  | Alla faktapåståenden täckta               | indexable=false |
| Dupliceringsrisk     | < 30% generiska fraser                    | indexable=false |

## seoScore-tolkning

| Score   | Åtgärd                                      |
|---------|---------------------------------------------|
| < 0.60  | Skriv om – indexera inte                    |
| 0.60–0.74 | Kan publiceras noindex, förbättra aktivt  |
| 0.75–0.89 | Godkänd för indexering                    |
| ≥ 0.90  | Prioritera för internlänkning och promotion |
