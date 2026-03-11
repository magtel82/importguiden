# GO / NO-GO Checklist – Importguiden MVP

Gå igenom varje punkt innan publicering. Alla punkter måste vara gröna för GO.

---

## TEKNIK

- [ ] `npm run build` passerar utan errors eller TypeScript-varningar
- [ ] `npm run dev` – alla routes svarar (inga 404 på kända paths)
- [ ] `/sitemap.xml` genereras korrekt och innehåller inga `indexable=false`-sidor
- [ ] `/robots.txt` är korrekt (allow `/`, disallow `/api/`)
- [ ] Mobilvy fungerar på alla sidtyper (startsida, guide, kalkylator)
- [ ] Kalkylator ger korrekt output vid testinmatning (personbil, 200 000 kr, 36 mån, 60 000 km)
- [ ] Canonical-URL på alla sidor pekar på production-domänen (ej localhost)
- [ ] `SITE_URL` är satt i Vercel till produktionsdomänen
- [ ] `CRON_SECRET` är satt i Vercel (minst 32 tecken)
- [ ] Vercel cron visas under "Cron Jobs" i dashboarden

---

## SEO – TEKNISKT

- [ ] Varje sida har unik `<title>` (testat med browser DevTools)
- [ ] Varje sida har `<meta name="description">` (ej tom)
- [ ] H1 finns på varje indexerbar sida, matchar primärt sökord
- [ ] `<link rel="canonical">` pekar på korrekt URL på alla sidor
- [ ] BreadcrumbList JSON-LD genereras på alla sidor med djup > 1
- [ ] Sidor med `indexable=false` har `<meta name="robots" content="noindex,follow">`
- [ ] Sidor med `indexable=true` har INTE noindex
- [ ] Inga 301/302-kedjor på interna länkar
- [ ] `<html lang="sv">` är satt i layout

---

## SEO – INNEHÅLL

- [ ] `/importera-bil/tyskland` – minst 800 ord, verifierat med ordräkning
- [ ] `/importera-bil/kostnad` – minst 500 ord med faktakällor
- [ ] `/guider/registreringsbesiktning` – minst 600 ord
- [ ] `/guider/coc-intyg` – minst 400 ord
- [ ] `/guider/ursprungskontroll` – minst 400 ord
- [ ] `/guider/moms-vid-bilimport` – minst 400 ord
- [ ] Alla faktapåståenden om kostnader/regler har källa ELLER är tydligt märkta som uppskattningar
- [ ] Inga "AI-fraser" som "Sammanfattningsvis kan vi konstatera att..." i indexerat innehåll
- [ ] Internlänkar finns från guider till kalkylator och vice versa
- [ ] Märkessidorna (`/importera-bil/bmw` etc.) är `noindex` tills unikt innehåll tillkommit

---

## MANIFEST & AUTOMATION

- [ ] `datasets/pages_manifest.json` – version är `2.0.0`
- [ ] Alla sidor med `isThin=true` har `indexable=false`
- [ ] Sidor utan källa men med unikt verktyg (kalkylator) har `notes` som förklarar undantaget
- [ ] `lastEvaluated` är satt på alla poster
- [ ] `sitemap.ts` läser bara `indexable=true`-poster (bekräftat via `/sitemap.xml`)
- [ ] Cron-endpoint returnerar 401 vid anrop utan korrekt `Authorization: Bearer`-header
- [ ] Cron-endpoint returnerar 200 med pipeline-resultat vid korrekt header

---

## JURIDIK / TRANSPARENS

- [ ] `/om-oss` finns och är publik
- [ ] Affiliate-disclaimer finns i sidfoten (synlig på alla sidor)
- [ ] Affiliate-länkar är märkta med `(annonslänk)` och har `rel="nofollow sponsored"`
- [ ] Ansvarsfriskrivning finns på `/om-oss` (informationen är vägledande, ej juridiskt bindande råd)
- [ ] Cookie-/GDPR-hanterin är på plats (cookie-banner eller Plausible-liknande cookiefri analys)
- [ ] Ingen persondata samlas in utan samtycke

---

## GO / NO-GO

| Kategori | Status |
|---|---|
| Teknik | ⬜ |
| SEO – Tekniskt | ⬜ |
| SEO – Innehåll | ⬜ |
| Manifest & Automation | ⬜ |
| Juridik / Transparens | ⬜ |
| **TOTALT** | **⬜ NO-GO** |

Ändra ⬜ till ✅ när kategorin är klar. Publicera INTE förrän alla är ✅.
