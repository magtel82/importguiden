# GO / NO-GO Checklist – Importguiden MVP
# Senast uppdaterad: 2026-03-14

Gå igenom varje punkt innan publicering. Alla punkter måste vara gröna för GO.

---

## TEKNIK

- [x] `npm run build` passerar utan errors eller TypeScript-varningar
- [x] `npm run dev` – alla routes svarar (inga 404 på kända paths)
- [x] `/sitemap.xml` genereras korrekt och innehåller inga `indexable=false`-sidor
- [x] `/robots.txt` är korrekt (allow `/`, disallow `/api/`)
- [x] Mobilvy fungerar på alla sidtyper (startsida, guide, kalkylator)
- [x] Kalkylator ger korrekt output vid testinmatning (personbil, 200 000 kr, 36 mån, 60 000 km)
- [x] Canonical-URL på alla sidor pekar på production-domänen (ej localhost)
- [x] `SITE_URL` är satt i Vercel till produktionsdomänen
- [x] `CRON_SECRET` är satt i Vercel (minst 32 tecken)
- [x] Vercel cron visas under "Cron Jobs" i dashboarden

---

## SEO – TEKNISKT

- [x] Varje sida har unik `<title>` (via generateMetadata på alla routes)
- [x] Varje sida har `<meta name="description">` (ej tom)
- [x] H1 finns på varje indexerbar sida, matchar primärt sökord
- [x] `<link rel="canonical">` pekar på korrekt URL på alla sidor (getCanonicalUrl)
- [x] BreadcrumbList JSON-LD genereras på alla sidor med djup > 1
- [x] Sidor med `indexable=false` har `<meta name="robots" content="noindex,follow">` (via getRobotsForPath)
- [x] Sidor med `indexable=true` har INTE noindex
- [x] Inga 301/302-kedjor på interna länkar (alla Next.js Link-komponenter)
- [x] `<html lang="sv">` är satt i layout

---

## SEO – INNEHÅLL

- [x] `/importera-bil/tyskland` – 1 181 ord ✓
- [x] `/importera-bil/kostnad` – ~900 ord med faktakällor ✓
- [x] `/guider/registreringsbesiktning` – 826 ord ✓
- [x] `/guider/coc-intyg` – 868 ord ✓
- [x] `/guider/ursprungskontroll` – 707 ord ✓
- [x] `/guider/moms-vid-bilimport` – 894 ord ✓
- [x] Alla faktapåståenden om kostnader/regler har källa ELLER är tydligt märkta som uppskattningar
- [x] Inga "AI-fraser" som "Sammanfattningsvis kan vi konstatera att..." i indexerat innehåll
- [x] Internlänkar finns från guider till kalkylator och vice versa
- [x] Märkessidorna (`/importera-bil/bmw` etc.) är `noindex` tills unikt innehåll tillkommit

---

## MANIFEST & AUTOMATION

- [x] `datasets/pages_manifest.json` – version är `2.0.0` (_version-fält)
- [x] Alla sidor med `isThin=true` har `indexable=false`
- [x] Sidor utan källa men med unikt verktyg (kalkylator) har `notes` som förklarar undantaget
- [x] `lastEvaluated` är satt på alla poster
- [x] `sitemap.ts` läser bara `indexable=true`-poster via getIndexablePages()
- [x] Cron-endpoint returnerar 401 vid anrop utan korrekt `Authorization: Bearer`-header
- [x] Cron-endpoint returnerar 200 med pipeline-resultat vid korrekt header

---

## JURIDIK / TRANSPARENS

- [x] `/om-oss` finns och är publik
- [x] Affiliate-disclaimer finns i sidfoten (synlig på alla sidor)
- [x] Affiliate-länkar är märkta med `(annonslänk)` och har `rel="nofollow sponsored"`
- [x] Ansvarsfriskrivning finns på `/om-oss`
- [x] Cookie-/GDPR-hantering är på plats (cookie-banner med localStorage)
- [x] Ingen persondata samlas in utan samtycke

---

## GO / NO-GO

| Kategori | Status |
|---|---|
| Teknik | ✅ |
| SEO – Tekniskt | ✅ |
| SEO – Innehåll | ✅ |
| Manifest & Automation | ✅ |
| Juridik / Transparens | ✅ |
| **TOTALT** | **✅ GO** |
