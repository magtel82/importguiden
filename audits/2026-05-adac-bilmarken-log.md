# ADAC-sweep bilmärken – 2026-05-14

## Träffar hittade

**data/car-brands-import.json** (15 × "Pannenstatistik 2025" + 1 × "ADAC 2025"):
- rad 4: `_source` header
- rad 10: BMW intro
- rad 15: BMW 3-serie model notes
- rad 29: BMW knownIssues – "ADAC 2025" (utan "Pannenstatistik")
- rad 45: BMW adacSource
- rad 54: Mercedes intro
- rad 59: Mercedes A-klass model notes
- rad 68: Mercedes Citan knownIssues
- rad 94: Mercedes adacSource
- rad 103: VW intro
- rad 138: VW adacSource
- rad 147: Audi intro
- rad 153: Audi A4 model notes
- rad 188: Audi adacSource
- rad 197: Porsche intro
- rad 238: Porsche adacSource

**app/importera-bil/[slug]/page.tsx** (1 × "Pannenstatistik 2025"):
- rad 282: fallback meta description

**app/guider/GuiderContent.tsx** (1 × "ADAC.*2025"):
- rad 159: Audi tagline "A3, A4, Q3 – ADAC bäst i klass 2025"

**datasets/pages_manifest.json**:
- rad 43: BMW description hade "Pannenstatistik 2025"

## Filer ändrade
1. `data/car-brands-import.json` – 16 förekomster bytta (replace_all + BMW 12V-not)
2. `app/importera-bil/[slug]/page.tsx` – rad 282
3. `app/guider/GuiderContent.tsx` – rad 159 (Audi tagline)
4. `datasets/pages_manifest.json` – BMW description + lastEvaluated för BMW, Mercedes, Audi, VW, Porsche (→ 2026-05-14)

## Förekomster bytta
18 totalt (16 i car-brands-import.json + 1 i page.tsx + 1 i GuiderContent.tsx)

## Verifiering
```
grep "Pannenstatistik 2025" app/ content/ data/ → 0 träffar
grep "ADAC 2025" app/ content/ data/ → 0 träffar
```

## Build & deployment
- Build: OK – 67 statiska sidor
- Commit: `749b113`
- Push: main – 2026-05-14

## Verifierat OFÖRÄNDRAT (med skäl)
- `data/motorhome-brands-import.json` – redan 2026 (Batch E-light)
- Tesla-sektionen i car-brands-import.json – redan 2026 (ADAC highlights)
- Historiska datumreferenser ("lagändring februari 2025" etc.) – korrekta fakta, inte källår
- Audit-loggar under `audits/` – inte ändrade
