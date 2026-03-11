# CLAUDE.md – Importguiden
# Senast uppdaterad: 2026-03-11
# Status: BYGGT – aktiv utveckling
#
# Den här filen är sanning om projektet.
# Läs den INNAN du gör någon ändring.

# ==========================================================
# PROJEKTETS SYFTE
# ==========================================================

Importguiden är en oberoende informationssajt om fordonsimport inom EU.
Vi hjälper privatpersoner att fatta egna, trygga beslut när de importerar
personbilar och husbilar – primärt från Tyskland till Sverige.

Vi:
- säljer INGA importtjänster
- ger saklig, faktagranskad information
- tjänar pengar via affiliate och annonser

Förtroende > kortsiktig konvertering.
SEO, förtroende och långsiktighet styr alla beslut.

# ==========================================================
# STACK (IMPLEMENTERAD)
# ==========================================================

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS + @tailwindcss/typography
- MDX via next-mdx-remote/rsc (server-side, App Router-kompatibelt)
- JSON-datafiler i data/ (driver pSEO)
- Vercel Hobby
- Ingen databas, inget CMS

# ==========================================================
# REPO & DEPLOY
# ==========================================================

GitHub:   https://github.com/magtel82/importguiden
Vercel:   Importeras från GitHub, auto-deploy på push till main
Lokalt:   npm run dev  →  http://localhost:3000
Bygge:    npm run build

# ==========================================================
# KRITISKA PLATTFORMSFAKTA
# ==========================================================

Vercel Cron (Hobby):
- 1 cron per dag, schedule "0 6 * * *" (06:00 UTC)
- Endpoint: /api/cron/daily
- Vercel skickar Authorization: Bearer <CRON_SECRET>
- Verifiera alltid CRON_SECRET i route-handleren

Next.js Sitemap:
- app/sitemap.ts → /sitemap.xml
- Läser ENBART indexable=true från pages_manifest.json
- Google max: 50 000 URL:er eller 50 MB per sitemap

Robots:
- app/robots.ts → /robots.txt
- allow: /, disallow: /api/

# ==========================================================
# MILJÖVARIABLER
# ==========================================================

SITE_URL             # krävs – ex. https://importguiden.se
CRON_SECRET          # krävs – generera: openssl rand -hex 32
REVALIDATE_SECRET    # valfritt – för framtida ISR

Lokalt: .env.local (gitignorerad)
Produktion: Vercel Dashboard → Settings → Environment Variables

# ==========================================================
# FILSTRUKTUR (FAKTISK)
# ==========================================================

app/
  layout.tsx                        # Root layout, Header + Footer
  page.tsx                          # Startsida /
  globals.css                       # Tailwind + typography plugin
  robots.ts                         # /robots.txt
  sitemap.ts                        # /sitemap.xml – läser manifest
  importera-bil/
    [slug]/page.tsx                 # Länder OCH märken i samma route
                                    # slug=tyskland → laddar MDX-fil
                                    # slug=bmw → inline märkessida
    kostnad/page.tsx                # /importera-bil/kostnad
  importera-husbil/
    [slug]/page.tsx                 # Länder + märken (husbil)
    kostnad/page.tsx                # /importera-husbil/kostnad
  guider/
    [slug]/page.tsx                 # Inline-innehåll per guide
  kalkylator/
    bilimport/page.tsx              # Kalkylator (client component)
  jamfor/
    [slug]/page.tsx                 # Prisjämförelser
  om-oss/page.tsx
  api/
    cron/daily/route.ts             # Daglig pipeline-orchestrator

content/
  importera-bil/
    tyskland.mdx                    # Flagship-guide, ~900 ord
                                    # Läses via next-mdx-remote/rsc

components/
  layout/
    Header.tsx
    Footer.tsx
    Breadcrumbs.tsx                 # Renderar JSON-LD + visuell nav
  calculator/
    ImportCalculator.tsx            # "use client" – all logik client-side
  affiliate/
    AffiliateLink.tsx               # rel="nofollow sponsored" + märkning

data/                               # JSON-datafiler (ej databas)
  countries.json                    # EU-länder med slug, valuta, euMember
  car-brands.json                   # Bilmärken med slug
  motorhome-brands.json             # Husbilsmärken
  cost-data.json                    # Avgifter med belopp + källhänvisning

datasets/
  pages_manifest.json               # SINGLE SOURCE OF TRUTH – se nedan

lib/
  manifest.ts                       # getAllPages, getIndexablePages,
                                    # getPageByPath, getRobotsForPath
  manifest-merge.ts                 # mergeManifest(), buildManifest()
  data.ts                           # getCountries, getCarBrands, getCostData
  seo.ts                            # getCanonicalUrl, getBreadcrumbJsonLd,
                                    # getFaqJsonLd, getArticleJsonLd

types/
  index.ts                          # Alla TypeScript-interfaces

docs/
  mvp-checklist.md                  # GO/NO-GO-checklista (48 punkter)
  quality-gate-single.md            # Prompt för manuell granskning
  quality-gate-batch.md             # Prompt för batch-granskning

vercel.json                         # Cron-konfiguration
DEPLOY.md                           # Deploy-steg för Vercel Hobby

# ==========================================================
# MANIFEST-ARKITEKTUR (KRITISKT – LÄSFÄRDIG)
# ==========================================================

datasets/pages_manifest.json är sanning för alla sidor.
Version: 2.0.0

Varje post har:
  id                  – primary key (slug, ex. "importera-bil-tyskland")
  path                – secondary key (ex. "/importera-bil/tyskland")
  title               – SEO-titel
  description         – meta description
  sources[]           – källhänvisningar (URL:er)
  uniquePayloadScore  – heltal 0–100
  quality:
    hasSources        – boolean
    isThin            – boolean (true = tunt innehåll)
    indexable         – boolean (styr sitemap + robots)
  lastEvaluated       – ISO-datum
  notes               – fri text, BEVARAS alltid vid merge
  tags[]              – kategorier, BEVARAS alltid vid merge
  manualOverride      – om true: batch-merge får EJ skriva över indexable
  orphaned            – sätts om sidan försvinner ur batch

REGLER:
- indexable=false → robots noindex + ej i sitemap
- isThin=true → ska ha indexable=false
- Saknar sources → hasSources=false (OK för verktyg som kalkylatorn)
- Hellre noindex än SEO-risk

NULÄGE (märkessidor):
- /importera-bil/bmw, /audi, /mercedes, /volkswagen, /volvo, /tesla
  → indexable=false, isThin=true
  → Sätt indexable=true FÖRST när unikt märkesspecifikt innehåll finns

# ==========================================================
# ROBOTS-KOPPLING (IMPLEMENTERAD)
# ==========================================================

getRobotsForPath(path) i lib/manifest.ts anropas i generateMetadata()
på ALLA routes. Okänd path → noindex som safe default.

Alla generateMetadata() returnerar:
  robots: getRobotsForPath(`/path/till/sidan`)

# ==========================================================
# MDX-MÖNSTER (VIKTIGT)
# ==========================================================

Använd INTE direkt import av .mdx-filer (krockar med Turbopack).
Använd next-mdx-remote/rsc:

  import { compileMDX } from "next-mdx-remote/rsc";
  import { readFile } from "fs/promises";
  import path from "path";

  const source = await readFile(
    path.join(process.cwd(), "content/importera-bil/tyskland.mdx"),
    "utf-8"
  );
  const { content } = await compileMDX({
    source,
    options: { parseFrontmatter: true }
  });

Rendera sedan {content} i en <article className="prose ...">-tagg.

# ==========================================================
# SEO – OBLIGATORISKT PÅ ALLA SIDOR
# ==========================================================

TEKNISKT (implementerat):
- generateMetadata() på alla routes
- canonical URLs via getCanonicalUrl()
- BreadcrumbList JSON-LD via getBreadcrumbJsonLd()
- robots-direktiv från manifest via getRobotsForPath()
- Synligt "Uppdaterad datum" på alla guider

INNEHÅLL:
- Minst 800 ord unikt innehåll på guider
- H1 = primärt sökord
- Tydlig internlänkning
- Inga copy-paste-variationer

FAKTA:
- Allt om regler/kostnader måste ha källa
- Aldrig "det kostar X kr" utan referens
- Hellre uppskattning + källa än exakta siffror utan stöd

# ==========================================================
# QUALITY GATE (WORKFLOW)
# ==========================================================

Innan en sida sätts till indexable=true:

1. Kör prompten i docs/quality-gate-single.md (en sida)
   eller docs/quality-gate-batch.md (flera sidor)

2. Ta manifestPatch-objektet ur JSON-svaret

3. Kör mergeManifest() i lib/manifest-merge.ts
   eller merge manuellt i datasets/pages_manifest.json

4. npm run build – verifiera att /sitemap.xml uppdateras korrekt

Tumregel:
  uniquePayloadScore < 60  → bygg ut, publicera ej
  60–74                    → noindex, förbättra aktivt
  75–89                    → indexera
  90+                      → prioritera internlänkning

# ==========================================================
# DATAFILER – UTÖKA SÅ HÄR
# ==========================================================

Nytt land:
  1. Lägg till i data/countries.json
  2. Sida genereras automatiskt via generateStaticParams
  3. Lägg till post i pages_manifest.json med indexable=false
  4. Skriv innehåll, kör quality gate, sätt indexable=true

Nytt bilmärke:
  1. Lägg till i data/car-brands.json
  2. Sida genereras automatiskt
  3. Startar som noindex (märkessidor är tunna per default)
  4. Skriv märkesspecifikt innehåll → quality gate → indexable=true

Ny guide:
  1. Skapa content/guider/[slug].mdx
  2. Lägg till slug i guides-objektet i app/guider/[slug]/page.tsx
  3. Lägg till post i pages_manifest.json
  4. Quality gate → indexable=true om OK

# ==========================================================
# AFFILIATE-PRINCIPER
# ==========================================================

- Använd <AffiliateLink> komponenten alltid
- rel="nofollow sponsored" sätts automatiskt
- Synlig text "(annonslänk)" renderas av komponenten
- Inga banners
- Kontext före klick: förklara vad länken leder till
- Nuvarande partner: Wise (valutaväxling)

# ==========================================================
# DESIGN-PRINCIPER
# ==========================================================

- Mobile first
- Läsbarhet > wow-effekt (Tailwind prose för MDX-innehåll)
- Brödsmulor på alla sidor djupare än startsidan
- Inga popups
- Blå primärfärg: blue-700
- Källhänvisningar alltid synliga i text

# ==========================================================
# SPRÅK
# ==========================================================

- Endast svenska
- Ingen i18n initialt
- Framtida expansion: förbered med SITE_URL och lang-attribut
- <html lang="sv"> redan satt i layout.tsx

# ==========================================================
# REGLER FÖR CLAUDE
# ==========================================================

1. Rör inte befintlig kod utan tydlig anledning
2. Föreslå tillägg, inte omskrivningar
3. Kör alltid npm run build efter ändringar
4. Sätt aldrig indexable=true utan att quality gate har körts
5. Alla nya datafiler ska vara versionsatta och källhänvisade
6. MDX-filer laddas via next-mdx-remote/rsc – aldrig direktimport
7. getRobotsForPath() ska anropas i generateMetadata() på alla nya routes
8. notes och tags i manifestet bevaras alltid vid merge
9. Ny sida → börja med indexable=false tills innehållet är klart
