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

# ==========================================================
# DEL 7 – DESIGN (BINDANDE FÖR ALLT AI-GENERERAT UI)
# ==========================================================
# Alla UI-förslag, komponenter och layouter MÅSTE följa denna sektion.
# Vid konflikt: denna sektion vinner.

## DESIGNFILOSOFI

Importguiden är en informationssajt, inte en shoppingsajt.
Designen ska kommunicera: neutral, saklig, trovärdig.

ALDRIG:
- Skapa intrycket av ett erbjudande eller kampanj
- Använda visuella element som tar fokus från innehållet
- Använda design för att manipulera användaren (dark patterns)

ALLTID:
- Design tjänar innehållet, inte tvärtom
- Läsbarhet prioriteras över estetik
- Varje UI-element ska ha ett funktionellt syfte

## FÄRGPALETT (GODKÄNDA FÄRGER)

Primär:      blue-700  (#1d4ed8)   – Länkar, primärknappar, accentfärg
Hover:       blue-800  (#1e40af)   – Hover-state på primärfärg
Bakgrund:    white     (#ffffff)   – Sidbakgrund
Yta:         gray-50   (#f9fafb)   – Kort, infoboxar, tabellrader
Border:      gray-200  (#e5e7eb)   – Alla borders
Text primär: gray-900  (#111827)   – Rubriker, brödtext
Text sekundär: gray-600 (#4b5563) – Metadata, ingress, labels
Text muted:  gray-400  (#9ca3af)   – Disclaimers, fotnoter
Positiv:     green-700 (#15803d)   – Bekräftelse (t.ex. "0 kr tull")
Varning:     amber-600 (#d97706)   – OBS-boxar (ej kampanj)

FÖRBJUDNA FÄRGER:
- Röd (#ef4444 och varianter) – associeras med kampanj/fel
- Orange (#f97316 och varianter) – säljig känsla
- Gradients av något slag
- Färger utanför paletten utan explicit motivering

## TYPOGRAFI

Font:        Inter (laddas via next/font/google)
Brödtext:    text-sm (14px) eller text-base (16px), leading-relaxed
H1:          text-3xl, font-bold, gray-900
H2:          text-xl, font-bold, gray-900
H3:          font-semibold, gray-900
Metadata:    text-sm, gray-500
Disclaimers: text-xs, gray-400

MDX-innehåll renderas med Tailwind Typography (prose prose-gray).
Justera aldrig prose-klasser utan att kontrollera kontrast.

## LAYOUT

- Max-bredd för innehållskolumn: max-w-3xl (48rem)
- Max-bredd för grid-sidor (startsida etc.): max-w-5xl (64rem)
- Padding: px-4 py-10 (mobil), justeras uppåt på desktop
- Mobile first – alla komponenter ska fungera på 375px
- Inga horisontella scroll-effekter
- Inga fasta höjder på innehållsblock

## CTA-REGLER

Tillåtna CTA-texter (exempel):
  "Öppna kalkylatorn"
  "Läs guiden"
  "Räkna ut din kostnad"
  "Se mer"

Förbjudna CTA-texter:
  "Köp nu", "Bästa priset", "Klicka här", "Missa inte",
  "Begränsat erbjudande", "Spara X%", "Gratis!" (som säljargument)

CTA-knappar:
- Primär: bg-blue-700 text-white, rundad (rounded)
- Sekundär: border border-gray-300 text-gray-700
- Max en primär CTA per synlig viewport
- Aldrig flytande/sticky knappar

## KOMPONENTREGLER

TILLÅTET:
- Informationsboxar (blå/amber border-l-4)
- Datatabeller med källa
- Numrerade steg-listor
- Brödsmulor
- Enkel progress/steg-indikator
- Ankarnavigation (innehållsförteckning) på långa sidor

FÖRBJUDET:
- Modaler och popups
- Banners (inklusive cookie-banner som täcker innehåll)
- Countdown-timers
- "Social proof"-element ("1 234 har läst detta")
- Carousel/slider
- Animationer som distraherar från läsning
- Sticky sidebars med CTA

## TILLGÄNGLIGHET (WCAG 2.1 AA – OBLIGATORISKT)

Kontrast:
- Normal text (< 18pt): minst 4.5:1 mot bakgrund
- Stor text (≥ 18pt eller 14pt bold): minst 3:1
- UI-komponenter, ikoner, borders: minst 3:1

Kontrastpar (godkända):
  gray-900 på white:   16.1:1  ✓
  gray-700 på white:   10.7:1  ✓
  blue-700 på white:    5.9:1  ✓
  gray-600 på white:    7.0:1  ✓
  gray-400 på white:    3.0:1  – Endast text-xs/disclaimers
  white på blue-700:    5.9:1  ✓

REGLER:
- Färg får ALDRIG vara enda informationsbärare
  (t.ex. ett fel ska ha ikon + text, inte bara röd färg)
- Alla länkar ska vara tydliga utan färg → alltid underline på hover,
  och i löptext alltid underline (prose hanterar detta)
- Alla bilder ska ha alt-text (beskrivande, ej "bild av")
- Alla formulärfält ska ha synlig <label> (ej bara placeholder)
- Fokusindikatorer får ej tas bort (ring-2 focus:ring-blue-500)
- Semantisk HTML: nav, main, article, section, h1-h6 i rätt ordning

## DESIGN QUALITY GATE

Fil: docs/design-quality-gate.md
Kör gaten innan leverans av nytt UI eller komponent.

GODKÄND om:
- Inga förbjudna färger används
- Inga gradients
- Inga förbjudna komponenter (popup, banner, slider, sticky CTA)
- Inga förbjudna CTA-texter
- Kontrast uppfyller WCAG 2.1 AA för alla textpar
- Färg är inte enda informationsbärare
- Alla interaktiva element har fokusindikator
- Mobile-first verifierat (fungerar på 375px)

UNDERKÄND direkt (inga undantag) om:
- Gradient används
- Kampanjfärg (röd/orange) används
- Marketing-språk i UI ("Bästa", "Missa inte", "Köp nu")
- Dark pattern (falsk brådska, dold avregistrering, vilseledande CTA)
- Visuellt element tar fokus från innehållet utan funktionellt syfte
- Kontrast under 4.5:1 på normal text

# ==========================================================
# DEL 11 – COMPLIANCE: INFORMATIONSSÄKERHET & GDPR
# ==========================================================

## A) INFORMATIONSSÄKERHET (GRUNDNIVÅ)

Dataminimering:
- Samla bara data som är nödvändig för funktionen
- Inga formulär som samlar namn/e-post utan tydligt syfte
- Kalkylatorn sparar ingen data – all beräkning sker client-side

HTTPS:
- Obligatoriskt – Vercel hanterar SSL automatiskt
- Sätt aldrig SITE_URL till http:// i produktion

Känsliga personuppgifter:
- Importguiden samlar inga känsliga personuppgifter (hälsa, etnicitet etc.)
- Inga inloggningsfunktioner initialt

Tredjepartsskript:
- Minimera antal externa scripts
- Ladda analytics och affiliate-scripts ENBART efter samtycke
- Varje nytt tredjepartsskript kräver dokumenterad motivering i CLAUDE.md

Loggar:
- Inga persondata (IP-adresser, e-post) i applikationsloggar
- Vercel-loggar hanteras av Vercel – se deras DPA

## B) GDPR – PRIVACY BY DESIGN & DEFAULT

Art. 5 – Grundprinciper:
- Transparens: användaren ska förstå vad som samlas och varför
- Ändamålsbegränsning: data används bara för det syfte den samlades för
- Dataminimering: standardläge = minimal datainsamling

Art. 25 – Privacy by design/default:
- Standardläge: inga icke-nödvändiga cookies laddas
- Samtycke krävs innan analytics eller affiliate-tracking aktiveras
- Ny funktionalitet designas med minimal datainsamling som utgångspunkt

## C) COOKIES & TRACKING

Cookieklassificering:
  Nödvändiga:       Inga (sajten är statisk, inga sessioner)
  Analytics:        Icke-nödvändiga → kräver samtycke
  Affiliate:        Icke-nödvändiga → kräver samtycke

Krav:
- Cookie-banner ska visas vid första besök
- Bannern ska INTE blockera innehållet (ej fullskärm)
- Användaren ska kunna avvisa alla icke-nödvändiga cookies
- Samtycke ska kunna dras tillbaka lika enkelt som det gavs
- Scripts (analytics, affiliate) laddas ENBART om samtycke = true
- Implementera "consent-gated" script-laddning

Rekommenderad lösning:
- Cookiebot, Civic Cookie Control eller Klaro (open source)
- Alternativt: Plausible Analytics (cookiefri, kräver ej samtycke)

Privacy policy sida (/integritetspolicy):
  Ska innehålla:
  - Vilka cookies som används och varför
  - Vilka tredjeparter som får data (Vercel, analytics-tjänst, affiliate-nätverk)
  - Hur länge data lagras
  - Hur användaren utövar sina rättigheter (Art. 15-22 GDPR)
  - Kontaktuppgifter till personuppgiftsansvarig

## D) COMPLIANCE QUALITY GATE

Fil: docs/compliance-gate.md
Returnerar JSON – se gate-definitionen i den filen.

Riskbedömning:
  low:    Inga icke-nödvändiga scripts, ingen datainsamling
  medium: Analytics utan samtycke ELLER affiliate utan märkning
  high:   Persondata samlas utan rättslig grund ELLER scripts laddas före samtycke

Regel: compliant=false blockerar deploy i CI.

# ==========================================================
# DEL 7–11: REGLER FÖR CLAUDE
# ==========================================================

10. Använd aldrig förbjudna färger eller gradients
11. Kör design quality gate innan leverans av nytt UI
12. Kör SEO quality gate (docs/seo-quality-gate.md) på alla nya textsidor
13. Kör AI self-review (docs/ai-self-review.md) innan varje leverans
14. Ladda aldrig tredjepartsskript utan consent-gate
15. Nya routes som samlar data kräver compliance-genomgång först
