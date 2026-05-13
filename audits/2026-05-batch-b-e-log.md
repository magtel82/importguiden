# Batch B + E-light session 2026-05-14

Källa för Magnus-verifierade fakta:
- Skyltavgift: 2×62 kr skyltar + 74 kr vägtrafikregisteravgift = 198 kr (Transportstyrelsens prislista 2026, kontrollerad 2026-05-14)
- ADAC Pannenstatistik 2026: Ducato 27,9–39,1 per 1 000 (årgångar 2016–2021 och 2023), publicerad april 2026, verifierad 2026-05-14

---

## Batch B – Skyltavgift konsoliderad till 198 kr

**Status:** KLAR – commit `46e17ac`, push 2026-05-14

### Filer ändrade

1. `data/cost-data.json` – `skyltavgift.amount` 90 → 198, note med breakdown, `_updated` 2026-05-14
2. `app/importera-bil/[slug]/page.tsx` – FAQ: "skyltavgift 500 kr" → 198 kr, total 4 440 → 3 140 kr
3. `app/importera-husbil/[slug]/page.tsx` – FAQ: "skyltavgift 500 kr" → 198 kr, total 6 240 → 4 440–6 440 kr
4. `content/guider/hur-lang-tid-tar-bilimport.mdx` – 130 kr → 198 kr med breakdown-parentes
5. `datasets/pages_manifest.json` – lastEvaluated för guider-hur-lang-tid-tar-bilimport → 2026-05-14

### Build-status

✓ `npm run build` lyckades. 67 statiska sidor genererade.

---

## Batch E-light – ADAC Pannenstatistik 2025 → 2026

**Status:** KLAR – commit `aa85672`, push 2026-05-14

### Filer ändrade

1. `data/motorhome-brands-import.json` – alla 5 märken (Hymer, Dethleffs, Bürstner, Knaus, Hobby):
   - `_source` och `_updated` uppdaterade
   - intro-texter: "49 pannen per 1 000 fordon" → "27,9–39,1 pannen per 1 000 fordon (årgångar 2016–2021 och 2023)"
   - `chassisWarningText` för alla 5: samma ändring
   - `adacSource` för alla 5: "2025" → "2026"
2. `app/importera-husbil/[slug]/page.tsx` – FAQ rad 100 (Hymer-pålitlighet) + meta description
3. `content/guider/besikta-husbil.mdx` – Ducato-varningstext uppdaterad
4. `datasets/pages_manifest.json` – lastEvaluated för guider-besikta-husbil → 2026-05-14

### Vad som INTE ändrades
- `data/car-brands-import.json` – bil-ADAC-data (BMW, Mercedes etc.) är separat statistik
- Tesla-sidan – explicit undantag per prompt
- `app/importera-bil/[slug]/page.tsx` rad 282 – bilmärkens meta description, ej Ducato-relaterat

### Build-status

✓ `npm run build` lyckades. 67 statiska sidor genererade.

---

## Sammanfattning

- **2 commits + push till main, båda med grön build.**
- **Batch B (46e17ac):** 5 filer – skyltavgift nu enhetligt 198 kr i hela kodbasen.
- **Batch E-light (aa85672):** 4 filer – Ducato-statistik uppdaterad till ADAC 2026-data.
- **Inga regressioner.** Tesla ej rörd. Bil-ADAC-data (BMW/Mercedes etc.) ej rörd.
- Vercel deployar automatiskt via GitHub-integration.
