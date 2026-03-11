# MEMORY.md – Importguiden
# Senast uppdaterad: 2026-03-11
# Syfte: Snabbstart inför nästa session

# ==========================================================
# NULÄGE
# ==========================================================

Projektet är scaffoldat, bygger utan errors och är deployat på Vercel.
GitHub: https://github.com/magtel82/importguiden
Vercel: Importerat, miljövariabler satta, domän tillagd

# ==========================================================
# DNS-STATUS – ÅTGÄRD KRÄVS
# ==========================================================

Vercel rekommenderade nyare DNS-records.
Status: OKLART – troligen EJ uppdaterat ännu.

Kontrollera i Vercel → Settings → Domains:
- Grön bock på importguiden.se?    → Klart
- Gul/röd varning?                  → Uppdatera DNS på One.com

Rätt DNS-records (One.com):
  A      @    216.198.79.1
  CNAME  www  8de1a82f57f10916.vercel-dns-017.com.

Gör Redeploy efter att DNS är grönt:
  Vercel → Deployments → senaste → Redeploy

# ==========================================================
# VAD SOM ÄR BYGGT
# ==========================================================

INFRASTRUKTUR:
  ✅ Next.js 16 App Router, TypeScript, Tailwind CSS
  ✅ Alla routes scaffoldade (bil, husbil, guider, kalkylator, jamfor, om-oss)
  ✅ pages_manifest.json v2 (single source of truth)
  ✅ robots + sitemap kopplade till manifest
  ✅ Cron-endpoint /api/cron/daily (säkrad med CRON_SECRET)
  ✅ Importkalkylator (client-side)
  ✅ Breadcrumbs med JSON-LD på alla sidor
  ✅ AffiliateLink-komponent

INNEHÅLL:
  ✅ content/importera-bil/tyskland.mdx (~900 ord, källbelagd)
  ✅ 4 guider inline (registreringsbesiktning, coc-intyg, ursprungskontroll, moms)
  ✅ Startsida, om-oss, kostnad-sidor

KVALITETSSYSTEM:
  ✅ docs/mvp-checklist.md (GO/NO-GO, 48 punkter)
  ✅ docs/quality-gate-single.md (manuell innehållsgranskning)
  ✅ docs/quality-gate-batch.md (batch-granskning)
  ✅ docs/seo-quality-gate.md (teknisk SEO, 10 checkpunkter)
  ✅ docs/design-quality-gate.md (WCAG 2.1 AA, förbjudna element)
  ✅ docs/ai-self-review.md (18 JA/NEJ-frågor)
  ✅ docs/ci-spec.json (maskinläsbar spec, kontrakt, thresholds)
  ✅ docs/compliance-gate.md (GDPR/cookie-gate)
  ✅ lib/manifest-merge.ts (merge-logik med mergeReport)

# ==========================================================
# NÄSTA STEG (PRIORITERAT)
# ==========================================================

1. VERIFIERA DEPLOY
   - Kontrollera grön DNS i Vercel
   - Gör Redeploy om DNS är nyss uppdaterat
   - Testa: importguiden.se, /sitemap.xml, /robots.txt

2. COMPLIANCE – MÅSTE GÖRAS INNAN TRAFIK
   - Implementera cookie-banner (rekommenderat: Klaro eller Cookiebot)
   - Skapa /integritetspolicy-sida
   - Consent-gate analytics och affiliate-scripts
   - Lägg till länk till integritetspolicy i Footer

3. INNEHÅLL – NÄSTA PRIORITET
   - Märkessidor är noindex – tre alternativ:
     A) Skriv unikt innehåll för BMW, Mercedes, Audi (höst SEO-potential)
     B) Ta bort märkessidorna tills innehåll finns
     C) Låt dem ligga som noindex (nuvarande läge, ofarligt)
   - /jamfor/tyskland-vs-sverige är noindex – behöver prisexempel och källor
   - /importera-bil/nederländerna är noindex – behöver NL-specifikt innehåll

4. SEO – ANALYTICS & GSC
   - Registrera importguiden.se i Google Search Console
   - Skicka in sitemap: importguiden.se/sitemap.xml
   - Välj analytics-lösning (Plausible rekommenderas – cookiefri)

5. AFFILIATE
   - Registrera konto hos Adtraction eller Awin
   - Byt ut placeholder-länk till Wise mot riktig affiliate-URL
   - Lägg till försäkrings-affiliate (t.ex. Hedvig, If)

# ==========================================================
# TEKNISKA BESLUT ATT KOMMA IHÅG
# ==========================================================

- MDX laddas via next-mdx-remote/rsc (INTE direktimport – krockar med Turbopack)
- Märkessidor (bmw etc.) delar route med landssidor: importera-bil/[slug]/page.tsx
- robots-direktiv styrs av getRobotsForPath() → pages_manifest.json
- Ny sida börjar alltid som indexable=false
- Quality gate körs innan indexable=true sätts

# ==========================================================
# ÖPPNA FRÅGOR
# ==========================================================

- Vilket analytics-verktyg? (Plausible rekommenderas – cookiefri = inget samtycke)
- Ska Google Analytics användas? (kräver cookie-banner)
- Ska märkessidor byggas ut med unikt innehåll som prio?
- Affiliate-nätverk: Adtraction eller Awin?
- F-skatt/enskild firma – är det registrerat?

# ==========================================================
# KOMMANDON ATT KÄNNA TILL
# ==========================================================

Lokal dev:    npm run dev
Bygge:        npm run build
Push:         git add -A && git commit -m "..." && git push
Projektmapp:  /home/magnus/projects/importguiden
GitHub:       https://github.com/magtel82/importguiden
