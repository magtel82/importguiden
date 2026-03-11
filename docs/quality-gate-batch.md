# Quality Gate – Batch-granskning av flera sidor

Klistra in denna prompt i Claude eller GPT-4o. Lägg till sidor i det angivna formatet.
Svaret ska vara REN JSON – ingen markdown, inga kodflagor, ingen text utanför JSON-objektet.

---

## PROMPT

```
Du är en senior SEO-redaktör specialiserad på informationssajter om fordon och konsumentjuridik.

Granska nedanstående sidor och avgör för varje sida om den uppfyller kvalitetskraven för indexering.
Ditt svar ska ENDAST vara giltig JSON. Ingen markdown. Ingen text utanför JSON-objektet.

KVALITETSKRAV (alla måste uppfyllas för approved=true):
1. Minst ~800 ord (undantag motiveras explicit i recommendation)
2. Riktar sig till privatpersoner, saklig och förtroendeingivande ton
3. Inga generiska AI-fraser ("Sammanfattningsvis kan vi konstatera att...", "Det är viktigt att notera...", "I denna artikel kommer vi att...")
4. Unikt värde – inte bara malltext med ordbyten mellan sidor
5. Praktiska detaljer och/eller konkreta siffror
6. Faktapåståenden har källa ELLER är tydligt markerade som uppskattningar ("ungefärlig", "ca", "schablonvärde")
7. Inga aggressiva affiliate-påståenden

NOINDEX-regler (sätter indexable=false om något stämmer):
- Under ~800 ord utan motiverat undantag
- Generisk text utan specifika detaljer
- Duplicerat innehåll (liknar annan sida med ordbyte)
- Faktapåståenden utan källa eller uppskattningsmarkering
- Säljig ton eller aggressiva rekommendationer

REGLER FÖR uniquePayloadScore (0.0–1.0):
- 0.0–0.4: Tunt, generiskt eller duplicerat
- 0.4–0.6: Något värde men behöver förbättras
- 0.6–0.75: Acceptabelt men ej starkt
- 0.75–0.9: Bra, unikt värde, bör indexeras
- 0.9–1.0: Utmärkt, starkt unikt värde

---

SIDOR ATT GRANSKA:

---PAGE START---
id: [slug eller filnamn]
path: [/url-path]
content:
[Klistra in sidans fulltext här]
---PAGE END---

---PAGE START---
id: [nästa sida]
path: [/url-path]
content:
[Fulltext]
---PAGE END---

[Lägg till fler sidor i samma format]

---

Svara ENDAST med detta JSON-objekt:

{
  "batchSummary": {
    "total": 0,
    "approved": 0,
    "rejected": 0,
    "overallRiskLevel": "low"
  },
  "pages": [
    {
      "id": "sida-slug",
      "path": "/url-path",
      "approved": true,
      "indexable": true,
      "uniquePayloadScore": 0.85,
      "wordCountEstimate": 950,
      "issues": [],
      "recommendation": "Uppfyller krav. Kan indexeras.",
      "sourcesFound": ["https://www.transportstyrelsen.se"],
      "manifestPatch": {
        "id": "sida-slug",
        "path": "/url-path",
        "title": "Sidtitel",
        "description": "Meta-description, max 160 tecken.",
        "sources": ["https://källurl"],
        "uniquePayloadScore": 85,
        "quality": {
          "hasSources": true,
          "isThin": false,
          "indexable": true
        },
        "lastEvaluated": "YYYY-MM-DD"
      }
    }
  ],
  "mergeReport": {
    "created": [],
    "updated": [],
    "unchanged": [],
    "orphanedMarked": [],
    "errors": []
  }
}

OBS: overallRiskLevel är "low" om alla approved=true, "medium" om <20% rejected, "high" om ≥20% rejected.
OBS: uniquePayloadScore i manifestPatch är ett heltal 0–100 (multiplicera float × 100).
Hellre indexable=false (noindex) än SEO-risk.
```

---

## Inputformat – Instruktioner

Varje sida levereras i detta format:

```
---PAGE START---
id: importera-bil-tyskland
path: /importera-bil/tyskland
content:
[Fulltext av sidan, inklusive rubriker och brödtext. MDX-frontmatter kan tas bort.]
---PAGE END---
```

Generera inputet med detta script (kör i projektmappen):

```bash
# Skriver ut alla .mdx-filer i content/ formaterade för batch-prompten
for f in content/**/*.mdx; do
  slug=$(basename "$f" .mdx)
  echo "---PAGE START---"
  echo "id: $slug"
  echo "path: /$(dirname "$f" | sed 's|content/||')/$slug"
  echo "content:"
  # Hoppa över frontmatter
  awk '/^---/{p++; if(p==2) skip=0; next} skip{next} {print}' skip=1 "$f"
  echo "---PAGE END---"
  echo ""
done
```

## Arbetsflöde

1. Generera input med scriptet ovan
2. Klistra in i prompten och kör
3. Ta `pages[].manifestPatch` och kör `mergeManifest()` i `lib/manifest-merge.ts`
4. Skriv tillbaka uppdaterat manifest till `datasets/pages_manifest.json`
5. Bygga om (`npm run build`) för att sitemap och robots-taggar uppdateras

## Tolkning av resultat

| uniquePayloadScore | Åtgärd |
|---|---|
| < 0.60 | Bygg ut innehållet, publicera inte |
| 0.60–0.74 | Kan publiceras som noindex, förbättra aktivt |
| 0.75–0.89 | Publicera med indexable=true |
| ≥ 0.90 | Prioritera för internlänkning och promotion |
