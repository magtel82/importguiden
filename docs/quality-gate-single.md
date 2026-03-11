# Quality Gate – Manuell granskning av en sida

Klistra in denna prompt i Claude, GPT-4o eller liknande. Byt ut innehållet i `[INNEHÅLL]`.

---

## PROMPT

```
Du är en senior SEO-redaktör specialiserad på informationssajter om fordon och konsumentjuridik.

Granska nedanstående sida och avgör om den uppfyller kvalitetskraven för att indexeras av Google.
Ditt svar ska ENDAST vara giltig JSON – ingen markdown, ingen text utanför JSON-blocket.

KVALITETSKRAV (alla måste uppfyllas för approved=true):
1. Minst ~800 ord (undantag motiveras explicit)
2. Riktar sig till privatpersoner, saklig och förtroendeingivande ton
3. Inga generiska AI-fraser ("Sammanfattningsvis kan vi konstatera att...", "Det är viktigt att notera...")
4. Unikt värde – inte bara malltext med ordbyten
5. Praktiska detaljer och/eller konkreta siffror
6. Faktapåståenden har källa ELLER är tydligt markerade som uppskattningar
7. Inga aggressiva affiliate-påståenden ("Bästa...", "Du måste...")

NOINDEX-regler (sätter indexable=false om något stämmer):
- Innehåll kortare än ~800 ord utan godtagbart undantag
- Tunt innehåll: generisk text utan specifika detaljer
- Duplicerat innehåll: liknar en annan sida med bara ordbyte
- Inga källor och inga uppskattningsmarkeringar på faktapåståenden

---

SIDA ATT GRANSKA:

path: [URL-PATH, t.ex. /importera-bil/tyskland]
title: [SIDANS TITEL]

[INNEHÅLL]

---

Svara ENDAST med detta JSON-format:

{
  "id": "[slug eller filnamn]",
  "path": "[url-path]",
  "approved": true,
  "indexable": true,
  "uniquePayloadScore": 0.85,
  "wordCountEstimate": 950,
  "issues": [],
  "recommendation": "Sidan uppfyller kvalitetskraven. Inga åtgärder krävs.",
  "sourcesFound": ["https://www.transportstyrelsen.se"],
  "manifestPatch": {
    "id": "[slug]",
    "path": "[url-path]",
    "title": "[titel]",
    "description": "[meta-description, max 160 tecken]",
    "sources": ["[url1]", "[url2]"],
    "uniquePayloadScore": 0.85,
    "quality": {
      "hasSources": true,
      "isThin": false,
      "indexable": true
    },
    "lastEvaluated": "[YYYY-MM-DD]"
  }
}

Om sidan INTE uppfyller kraven:
- approved: false
- indexable: false
- issues: lista konkreta problem (ej vaga)
- recommendation: specifik åtgärd för att höja kvaliteten

Hellre indexable=false (noindex) än SEO-risk.
```

---

## Användning

1. Ersätt `[URL-PATH]`, `[SIDANS TITEL]` och `[INNEHÅLL]` med faktiskt innehåll
2. Kör prompten
3. Ta JSON-svaret och uppdatera `datasets/pages_manifest.json` med `manifestPatch`-objektet
4. Kör `mergeManifest()` i `lib/manifest-merge.ts` eller gör manuell merge

## Tips

- Kör quality gate INNAN du sätter `indexable=true` i manifestet
- Om `uniquePayloadScore < 0.60` – skriv mer innehåll innan publicering
- Om `issues` innehåller "tunt innehåll" – bygg ut sidan, indexera inte
