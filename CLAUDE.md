# CLAUDE.md – Importguiden

# Senast uppdaterad: 2026-03-27 (2)

# Status: MVP GO – affiliate-redo, aktiv utveckling

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

* säljer INGA importtjänster
* ger saklig, faktagranskad information
* tjänar pengar via affiliate och annonser

Förtroende > kortsiktig konvertering.
SEO, förtroende och långsiktighet styr alla beslut.

# ==========================================================

# STACK (IMPLEMENTERAD)

# ==========================================================

* Next.js 16 (App Router)
* React 19
* TypeScript (strict)
* Tailwind CSS + @tailwindcss/typography
* MDX via next-mdx-remote/rsc (server-side, App Router-kompatibelt)
* JSON-datafiler i data/ (driver pSEO)
* Vercel Hobby
* Ingen databas, inget CMS

# ==========================================================

# REPO \& DEPLOY

# ==========================================================

GitHub:   https://github.com/magtel82/importguiden
Vercel:   Importeras från GitHub, auto-deploy på push till main
Lokalt:   npm run dev  →  http://localhost:3000
Bygge:    npm run build

# ==========================================================

# KRITISKA PLATTFORMSFAKTA

# ==========================================================

Vercel Cron (Hobby):

* 1 cron per dag, schedule "0 6 \* \* \*" (06:00 UTC)
* Endpoint: /api/cron/daily
* Vercel skickar Authorization: Bearer <CRON\_SECRET>
* Verifiera alltid CRON\_SECRET i route-handleren

Next.js Sitemap:

* app/sitemap.ts → /sitemap.xml
* Läser ENBART indexable=true från pages\_manifest.json
* Google max: 50 000 URL:er eller 50 MB per sitemap

Robots:

* app/robots.ts → /robots.txt
* allow: /, disallow: /api/

# ==========================================================

# MILJÖVARIABLER

# ==========================================================

SITE\_URL             # krävs – ex. https://importguiden.se
CRON\_SECRET          # krävs – generera: openssl rand -hex 32
SMTP\_USER            # krävs för alertmail – e-postadress hos one.com (info@importguiden.se)
SMTP\_PASSWORD        # krävs för alertmail – lösenord till one.com-kontot
REVALIDATE\_SECRET    # valfritt – för framtida ISR

Lokalt: .env.local (gitignorerad)
Produktion: Vercel Dashboard → Settings → Environment Variables

# ==========================================================

# FILSTRUKTUR (FAKTISK)

# ==========================================================

app/
layout.tsx                        # Root layout, Header + Footer + CookieConsent
# Innehåller skip-to-content länk (tillgänglighet)
# <main id="main-content"> för skip-to-content
page.tsx                          # Startsida /
globals.css                       # Tailwind + typography plugin
not-found.tsx                     # Custom 404-sida
robots.ts                         # /robots.txt
sitemap.ts                        # /sitemap.xml – läser manifest
importera-bil/
\[slug]/page.tsx                 # Länder OCH märken i samma route
# slug=tyskland → laddar MDX-fil + Article JSON-LD
# slug=bmw → inline märkessida
# compileMDX får components: { AffiliateLink }
kostnad/page.tsx                # /importera-bil/kostnad
importera-husbil/
\[slug]/page.tsx                 # Länder + märken (husbil)
# slug=tyskland → laddar MDX-fil + Article JSON-LD
# slug=annat-land → generisk template
# compileMDX med remarkGfm
kostnad/page.tsx                # /importera-husbil/kostnad
guider/
page.tsx                        # /guider – hubsida med lista över alla guider
\[slug]/page.tsx                 # Läser MDX via compileMDX + remarkGfm
kalkylator/
bilimport/page.tsx              # Kalkylator (client component)
jamfor/
\[slug]/page.tsx                 # Prisjämförelser
om-oss/page.tsx                   # Om oss – inkl. kontakt info@importguiden.se
integritetspolicy/page.tsx        # GDPR-policy – kontakt info@importguiden.se
finansiering/page.tsx             # Affiliate-transparens, partners, principer
kontakta-oss/page.tsx             # Kontaktsida med formulär
api/
cron/daily/route.ts             # Daglig pipeline-orchestrator

content/
importera-bil/
tyskland.mdx                    # Flagship-guide, \~1 180 ord
# Läses via next-mdx-remote/rsc + remarkGfm
# Använder <AffiliateLink> för Wise-länk
importera-husbil/
tyskland.mdx                    # Husbil-guide, \~1 100 ord
# Läses via next-mdx-remote/rsc + remarkGfm
guider/
registreringsbesiktning.mdx     # \~826 ord
coc-intyg.mdx                   # \~868 ord
ursprungskontroll.mdx           # \~707 ord
moms-vid-bilimport.mdx          # \~894 ord
kopa-bil-mobile-de-autoscout24.mdx
fordonsskatt-husbil-bonus-malus.mdx
# Alla guider: compileMDX + remarkGfm, ingen AffiliateLink

components/
layout/
Header.tsx                      # "use client" – desktop nav + mobilmeny (hamburger)
# sticky top-0 z-50 – ligger kvar vid scroll (mobil+desktop)
# Logotyp: <Image src="/logo.svg" width=160 height=32>
# Visar aktiv sida, ARIA-attribut, fokusindikatorer
Footer.tsx                      # Inkl. länk till integritetspolicy, finansiering,
# kontaktmail och CookieSettingsLink
Breadcrumbs.tsx                 # Renderar JSON-LD + visuell nav
calculator/
ImportCalculator.tsx            # "use client" – live-beräkning via useMemo (ingen knapp)
# Realtids-växelkurs: Frankfurter API (base=SEK, inverteras)
#   Fallback: EUR 11.5, USD 10.8, GBP 13.5
# Avgifter läses från data/cost-data.json (enda källa)
# Landväljare (5 länder) + redigerbart km-fält med schablon
# Trailer-transport: intervall per distans (<1000/1000-2000/>2000 km)
# Importförsäkring som kostnadsrad (schablon, cost-data.json)
# Besparing vs. svenskt pris (valfritt fält)
# Delbar URL via useSearchParams + router.replace (shallow)
# Params: price, currency, country, type, ageMonths,
#         mileageKm, transport, km, swePrice
# Suspense-wrapper krävs (useSearchParams, App Router)
affiliate/
AffiliateLink.tsx               # rel="nofollow sponsored" + märkning
CookieConsent.tsx                 # "use client" – bottom-banner, localStorage-baserad
# Lyssnar på "show-cookie-settings" event
CookieSettingsLink.tsx            # "use client" – knapp i footer som återöppnar banner

data/                               # JSON-datafiler (ej databas)
countries.json                    # EU-länder med slug, valuta, euMember
car-brands.json                   # Bilmärken med slug
motorhome-brands.json             # Husbilsmärken
cost-data.json                    # Avgifter med belopp + källhänvisning
# Innehåller: ursprungskontroll, registreringsbesiktning
# (personbil/husbil), skyltavgift, importforsäkring
# (personbil 1500 kr / husbil 2500 kr, schablonvärden),
# transport.drive\_self\_cost\_per\_km, moms-regler

datasets/
pages\_manifest.json               # SINGLE SOURCE OF TRUTH – se nedan
regulation-urls.json              # 12 URL:er för regelbevakning (Fas 1 cron-pipeline)
# Innehåller id, url, description, affectsPages, priority
# Används av lib/regulation-check.ts (ej byggt än)

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
mvp-checklist.md                  # GO/NO-GO-checklista – STATUS: ✅ GO (2026-03-14)
quality-gate-single.md            # Prompt för manuell granskning
quality-gate-batch.md             # Prompt för batch-granskning
seo-quality-gate.md               # Teknisk SEO, 10 checkpunkter
design-quality-gate.md            # WCAG 2.1 AA, förbjudna element
ai-self-review.md                 # 18 JA/NEJ-frågor innan leverans
ci-spec.json                      # Maskinläsbar spec, kontrakt, thresholds
compliance-gate.md                # GDPR/cookie-gate

vercel.json                         # Cron-konfiguration
DEPLOY.md                           # Deploy-steg för Vercel Hobby

# ==========================================================

# MANIFEST-ARKITEKTUR (KRITISKT – LÄSFÄRDIG)

# ==========================================================

datasets/pages\_manifest.json är sanning för alla sidor.
Version: 2.0.0

Varje post har:
id                  – primary key (slug, ex. "importera-bil-tyskland")
path                – secondary key (ex. "/importera-bil/tyskland")
title               – SEO-titel
description         – meta description
sources\[]           – källhänvisningar (URL:er)
uniquePayloadScore  – heltal 0–100
quality:
hasSources        – boolean
isThin            – boolean (true = tunt innehåll)
indexable         – boolean (styr sitemap + robots)
lastEvaluated       – ISO-datum
notes               – fri text, BEVARAS alltid vid merge
tags\[]              – kategorier, BEVARAS alltid vid merge
manualOverride      – om true: batch-merge får EJ skriva över indexable
orphaned            – sätts om sidan försvinner ur batch

REGLER:

* indexable=false → robots noindex + ej i sitemap
* isThin=true → ska ha indexable=false
* Saknar sources → hasSources=false (OK för verktyg som kalkylatorn)
* Hellre noindex än SEO-risk

NULÄGE (märkessidor):

* /importera-bil/bmw, /audi, /mercedes, /volkswagen, /volvo, /tesla
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
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";

const source = await readFile(
path.join(process.cwd(), "content/importera-bil/tyskland.mdx"),
"utf-8"
);
const { content } = await compileMDX({
source,
options: { parseFrontmatter: true },
components: { AffiliateLink },   // skicka med komponenter som MDX-filen använder
});

Rendera sedan {content} i en <article className="prose ...">-tagg.

Om en MDX-fil använder <AffiliateLink> måste komponenten skickas med i components-objektet.
Aldrig plain markdown (*Annonslänk*) för affiliate-länkar – använd alltid <AffiliateLink>.

# ==========================================================

# SEO – OBLIGATORISKT PÅ ALLA SIDOR

# ==========================================================

TEKNISKT (implementerat):

* generateMetadata() på alla routes
* canonical URLs via getCanonicalUrl()
* BreadcrumbList JSON-LD via getBreadcrumbJsonLd()
* Article JSON-LD på flagship-guider (Tyskland)
* robots-direktiv från manifest via getRobotsForPath()
* Synligt "Uppdaterad datum" på alla guider
* Skip-to-content länk i layout.tsx (WCAG)
* Custom 404-sida (not-found.tsx)

INNEHÅLL:

* Minst 800 ord unikt innehåll på guider
* H1 = primärt sökord
* Tydlig internlänkning
* Inga copy-paste-variationer

FAKTA:

* Allt om regler/kostnader måste ha källa
* Aldrig "det kostar X kr" utan referens
* Hellre uppskattning + källa än exakta siffror utan stöd

# ==========================================================

# QUALITY GATE (WORKFLOW)

# ==========================================================

Innan en sida sätts till indexable=true:

1. Kör prompten i docs/quality-gate-single.md (en sida)
eller docs/quality-gate-batch.md (flera sidor)
2. Ta manifestPatch-objektet ur JSON-svaret
3. Kör mergeManifest() i lib/manifest-merge.ts
eller merge manuellt i datasets/pages\_manifest.json
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
3. Lägg till post i pages\_manifest.json med indexable=false
4. Skriv innehåll, kör quality gate, sätt indexable=true

Nytt bilmärke:

1. Lägg till i data/car-brands.json
2. Sida genereras automatiskt
3. Startar som noindex (märkessidor är tunna per default)
4. Skriv märkesspecifikt innehåll → quality gate → indexable=true

Ny guide:

1. Skapa content/guider/<slug>.mdx
2. Lägg till slug i GUIDE\_SLUGS-arrayen i app/guider/\[slug]/page.tsx
3. Lägg till guide i listan i app/guider/page.tsx (hubsidan)
4. Lägg till post i pages\_manifest.json med indexable=false
5. Quality gate → indexable=true om OK

# ==========================================================

# AFFILIATE-PRINCIPER

# ==========================================================

* Använd <AffiliateLink> komponenten alltid
* rel="nofollow sponsored" sätts automatiskt
* Synlig text "(annonslänk)" renderas av komponenten
* Inga banners
* Kontext före klick: förklara vad länken leder till
* Nuvarande partner: Wise (valutaväxling) – AKTIVT avtal, spårningslänk: https://wise.prf.hn/click/camref:1100l5I28j
* Affiliate-readiness: KLAR (integritetspolicy, finansiering, consent-banner, disclosure allt på plats)
* Kontaktmail för affiliate-ansökningar: info@importguiden.se

# ==========================================================

# DESIGN-PRINCIPER

# ==========================================================

* **Mobile first – alltid** (designa för 375px, skala upp till desktop)
* Läsbarhet > wow-effekt (Tailwind prose för MDX-innehåll)
* Brödsmulor på alla sidor djupare än startsidan
* Inga popups
* Blå primärfärg: blue-700
* Källhänvisningar alltid synliga i text
* Skip-to-content länk i layout (tangentbordsanvändare)

# ==========================================================

# SPRÅK

# ==========================================================

* Endast svenska
* Ingen i18n initialt
* Framtida expansion: förbered med SITE\_URL och lang-attribut
* <html lang="sv"> redan satt i layout.tsx

# ==========================================================

# DEL 7 – DESIGN (BINDANDE FÖR ALLT AI-GENERERAT UI)

# ==========================================================

# Alla UI-förslag, komponenter och layouter MÅSTE följa denna sektion.

# Vid konflikt: denna sektion vinner.

## DESIGNFILOSOFI

Importguiden är en informationssajt, inte en shoppingsajt.
Designen ska kommunicera: neutral, saklig, trovärdig.

ALDRIG:

* Skapa intrycket av ett erbjudande eller kampanj
* Använda visuella element som tar fokus från innehållet
* Använda design för att manipulera användaren (dark patterns)

ALLTID:

* Design tjänar innehållet, inte tvärtom
* Läsbarhet prioriteras över estetik
* Varje UI-element ska ha ett funktionellt syfte

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

* Röd (#ef4444 och varianter) – associeras med kampanj/fel
* Orange (#f97316 och varianter) – säljig känsla
* Gradients av något slag
* Färger utanför paletten utan explicit motivering

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

**MOBILE FIRST – ICKE FÖRHANDLINGSBART**
Designa alltid från 375px och skala upp. Aldrig tvärtom.

* Max-bredd för innehållskolumn: max-w-3xl (48rem)
* Max-bredd för grid-sidor (startsida etc.): max-w-5xl (64rem)
* Padding: px-4 py-10 (mobil), justeras uppåt på desktop
* Alla interaktiva element: minst 48px touchyta (höjd och bredd)
* Knappar som delar bredd: flex w-full, aldrig fast bredd i px
* Inga horisontella scroll-effekter
* Inga fasta höjder på innehållsblock
* Text i knappar/tabbar: whitespace-nowrap för att undvika radbrytning på liten skärm
* grid-cols-1 som bas, skala med sm: md: lg: – aldrig tvärtom

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

* Primär: bg-blue-700 text-white, rundad (rounded)
* Sekundär: border border-gray-300 text-gray-700
* Max en primär CTA per synlig viewport
* Aldrig flytande/sticky knappar

## KOMPONENTREGLER

TILLÅTET:

* Informationsboxar (blå/amber border-l-4)
* Datatabeller med källa
* Numrerade steg-listor
* Brödsmulor
* Enkel progress/steg-indikator
* Ankarnavigation (innehållsförteckning) på långa sidor

FÖRBJUDET:

* Modaler och popups
* Banners (inklusive cookie-banner som täcker innehåll)
* Countdown-timers
* "Social proof"-element ("1 234 har läst detta")
* Carousel/slider
* Animationer som distraherar från läsning
* Sticky sidebars med CTA

## TILLGÄNGLIGHET (WCAG 2.1 AA – OBLIGATORISKT)

Kontrast:

* Normal text (< 18pt): minst 4.5:1 mot bakgrund
* Stor text (≥ 18pt eller 14pt bold): minst 3:1
* UI-komponenter, ikoner, borders: minst 3:1

Kontrastpar (godkända):
gray-900 på white:   16.1:1  ✓
gray-700 på white:   10.7:1  ✓
blue-700 på white:    5.9:1  ✓
gray-600 på white:    7.0:1  ✓
gray-400 på white:    3.0:1  – Endast text-xs/disclaimers
white på blue-700:    5.9:1  ✓

REGLER:

* Färg får ALDRIG vara enda informationsbärare
(t.ex. ett fel ska ha ikon + text, inte bara röd färg)
* Alla länkar ska vara tydliga utan färg → alltid underline på hover,
och i löptext alltid underline (prose hanterar detta)
* Alla bilder ska ha alt-text (beskrivande, ej "bild av")
* Alla formulärfält ska ha synlig <label> (ej bara placeholder)
* Fokusindikatorer får ej tas bort (ring-2 focus:ring-blue-500)
* Semantisk HTML: nav, main, article, section, h1-h6 i rätt ordning

## DESIGN QUALITY GATE

Fil: docs/design-quality-gate.md
Kör gaten innan leverans av nytt UI eller komponent.

GODKÄND om:

* Inga förbjudna färger används
* Inga gradients
* Inga förbjudna komponenter (popup, banner, slider, sticky CTA)
* Inga förbjudna CTA-texter
* Kontrast uppfyller WCAG 2.1 AA för alla textpar
* Färg är inte enda informationsbärare
* Alla interaktiva element har fokusindikator
* Mobile-first verifierat (fungerar på 375px)

UNDERKÄND direkt (inga undantag) om:

* Gradient används
* Kampanjfärg (röd/orange) används
* Marketing-språk i UI ("Bästa", "Missa inte", "Köp nu")
* Dark pattern (falsk brådska, dold avregistrering, vilseledande CTA)
* Visuellt element tar fokus från innehållet utan funktionellt syfte
* Kontrast under 4.5:1 på normal text

# ==========================================================

# DEL 8 – SEO-STRATEGI

# ==========================================================

## PRIORITERING

Husbil före bil i närtid:

* Lägre konkurrens (KD), högre transaktionsvärde
* Regeländring feb 2025 (malus borttaget) = ökad efterfrågan och köpintresse
* Färre välskrivna guider hos konkurrenter

Bil-segmentet byggs parallellt men är sekundärt tills
husbil-innehållet är färdigt och indexerat.

## KEYWORD-KATEGORIER

Prioritet 1 – Transaktionsnära (hög intent):
importera husbil från tyskland
importera bil från tyskland
importera bil kostnad
importera husbil kostnad

Prioritet 2 – Processfrågor (informationssökande):
coc intyg bil
ursprungskontroll bil
registreringsbesiktning importerad bil
moms bilimport eu
fordonsskatt husbil
bonus malus husbil

Prioritet 3 – pSEO / long-tail (märke + land):
importera bmw från tyskland
importera mercedes från tyskland
importera hymer från tyskland
(märkessidor – noindex tills unikt innehåll finns)

## INTERNLÄNKNING

Regel: Varje guide ska länka till minst två andra relevanta sidor.
Kalkylatorn ska länkas från alla kostnadssidor och guider.
Flagship-sidorna (bil/tyskland, husbil/tyskland) är nav – länka dit ofta.
Guider ska länka till varandra när ämnet är relaterat.

## CONTENT GAP – NÄSTA ATT SKRIVA

Prioriterat (ej byggt):
/guider/besikta-husbil                  – specifikt för husbilar, skiljer sig från personbil
/guider/transportera-bil                 – egenköra vs trailer vs biltransport
/guider/importera-elbil                  – Tesla, BMW i4, VW ID-serien, batteristatus
/importera-husbil/\[märke]               – Hymer, Dethleffs, Bürstner, Knaus m.fl.

Längre sikt:
/guider/besiktningsfel-vid-import        – vanliga underkännandeorsaker
/guider/kopa-husbil-mobil-de             – plattsajter för husbilar i Tyskland
/jamfor/husbil-tyskland-vs-sverige       – prisjämförelse husbilar

## SGE / AI-SYNLIGHET

* Formattera nyckelfrågor i fråge-svar-format (ökar chans för SGE-snippet)
* Presentera siffror och fakta i isolerbara meningar med tydlig källangivelse
* Interaktiva verktyg (kalkylatorn) kan inte ersättas av AI-svar – prioritera dem
* Uppdatera innehåll snabbt vid regelförändringar för att behålla aktualitet

## ANALYTICS \& GSC

GSC:       Registrera importguiden.se, skicka in /sitemap.xml
Analytics: Plausible rekommenderas (cookiefri = inget samtycke krävs)
Om Google Analytics väljs: consent-gate obligatoriskt innan script laddas

# ==========================================================

# DEL 9 – AFFILIATE \& MONETISERING

# ==========================================================

## NULÄGE (2026-03-27)

Partner: Wise (valutaväxling)
Status:  AKTIVT – spårningslänk inlagd (camref:1100l5I28j), godkänd för EUR-kampanjen
URL:     https://wise.prf.hn/click/camref:1100l5I28j
Placering: Kalkylatorn, bilguiden (tyskland.mdx), husbilsguiden (tyskland.mdx)
Nätverk: Ej ansökt för övriga program – välj Adtraction (rekommenderas, stark i Norden) eller Awin

## PROGRAM ATT PRIORITERA

1. Wise          – valutaväxling vid betalning utomlands (redan integrerad)
2. Lendo/Zmarta  – billån / finansiering
3. Försäkring    – Hedvig, If eller Trygg-Hansa (importförsäkring)
4. Bilhistorik   – t.ex. carVertical (fordonshistorik-rapport)

## IMPLEMENTERINGSREGLER

* Använd alltid <AffiliateLink>-komponenten (rel="nofollow sponsored")
* Synlig märkning "(annonslänk)" renderas automatiskt av komponenten
* Inga banners eller popups
* Kontext krävs före varje affiliate-länk – förklara vad länken leder till
* Scripts laddas ENBART efter cookie-samtycke (consent-gate)
* Uppdatera /finansiering och /integritetspolicy vid nya partner

## NÄR ETT NYTT AVTAL TECKNAS

1. Lägg till partner i app/finansiering/page.tsx (synlig lista)
2. Uppdatera /integritetspolicy med ny tredjepartsinfo
3. Byt placeholder-URL mot riktig affiliate-URL i relevant MDX/komponent
4. Uppdatera "Nuvarande partners" i denna fil

## NUVARANDE PARTNERS

Wise – AKTIVT avtal (2026-03-27), EUR-kampanjen, camref:1100l5I28j
  Placering: kalkylatorn, /importera-bil/tyskland, /importera-husbil/tyskland

# ==========================================================

# DEL 10 – CONTENT-PIPELINE \& REDAKTIONELL PROCESS

# ==========================================================

## WORKFLOW FÖR NY SIDA

1. Identifiera sökord och intent (keyword-spreadsheet eller GSC-data)
2. Skapa MDX-fil i rätt mapp (content/guider/, content/importera-bil/ etc.)
3. Lägg till slug i relevant array (GUIDE\_SLUGS eller generateStaticParams)
4. Lägg till post i datasets/pages\_manifest.json med indexable=false
5. Skriv innehåll – minst 800 ord, källbelagt, H1 = primärt sökord
6. Kör docs/quality-gate-single.md – kontrollera uniquePayloadScore
7. Score ≥ 75 → sätt indexable=true i manifest
8. npm run build – verifiera att /sitemap.xml uppdateras
9. Commit + push → Vercel deployar automatiskt

## FAKTAKRAV

* Alla påståenden om kostnader, regler och processer ska ha källa
* Källor anges som URL i sources\[] i pages\_manifest.json
* Aldrig "det kostar X kr" utan referens till Transportstyrelsen,
Tullverket eller Skatteverket
* Hellre "cirka X kr (källa: Transportstyrelsen, 2025)" än exakt siffra utan stöd
* Kontrollera att siffror i cost-data.json stämmer vid ny information
OBS: ursprungskontroll höjdes till 1 240 kr 2025 – verifiera mot Transportstyrelsen

## UPPDATERINGSRUTIN

Triggrar för innehållsuppdatering:

* Regeländring från Transportstyrelsen, Tullverket eller Skatteverket
* Avgiftsändring (ursprungskontroll, besiktning etc.)
* Ny cron-alert från /api/cron/daily
* Synligt daterat innehåll ("2025") som passerar årsskifte

Vid uppdatering:

* Ändra "Uppdaterad"-datum synligt i MDX-filen
* Uppdatera lastEvaluated i pages\_manifest.json
* Commit med tydligt meddelande: "Uppdatera \[sida] – \[anledning]"
* Uppdatera "Senast uppdaterad" i toppen av denna fil

## SPRÅK \& TON

* Svenska, formell men tillgänglig ton
* Inga säljuttryck ("bästa", "missa inte", "unikt erbjudande")
* Neutralt och faktabaserat – läsaren fattar egna beslut
* Fråge-svar-format på nyckelfrågor ökar chansen för Google SGE-snippet
* Källhänvisningar ska vara synliga i löptext, inte bara i manifest

# ==========================================================

# DEL 11 – COMPLIANCE: INFORMATIONSSÄKERHET \& GDPR

# ==========================================================

## A) INFORMATIONSSÄKERHET (GRUNDNIVÅ)

Dataminimering:

* Samla bara data som är nödvändig för funktionen
* Inga formulär som samlar namn/e-post utan tydligt syfte
* Kalkylatorn sparar ingen data – all beräkning sker client-side

HTTPS:

* Obligatoriskt – Vercel hanterar SSL automatiskt
* Sätt aldrig SITE\_URL till http:// i produktion

Känsliga personuppgifter:

* Importguiden samlar inga känsliga personuppgifter (hälsa, etnicitet etc.)
* Inga inloggningsfunktioner initialt

Tredjepartsskript:

* Minimera antal externa scripts
* Ladda analytics och affiliate-scripts ENBART efter samtycke
* Varje nytt tredjepartsskript kräver dokumenterad motivering i CLAUDE.md

Loggar:

* Inga persondata (IP-adresser, e-post) i applikationsloggar
* Vercel-loggar hanteras av Vercel – se deras DPA

## B) GDPR – PRIVACY BY DESIGN \& DEFAULT

Art. 5 – Grundprinciper:

* Transparens: användaren ska förstå vad som samlas och varför
* Ändamålsbegränsning: data används bara för det syfte den samlades för
* Dataminimering: standardläge = minimal datainsamling

Art. 25 – Privacy by design/default:

* Standardläge: inga icke-nödvändiga cookies laddas
* Samtycke krävs innan analytics eller affiliate-tracking aktiveras
* Ny funktionalitet designas med minimal datainsamling som utgångspunkt

## C) COOKIES \& TRACKING

Cookieklassificering:
Nödvändiga:       Inga (sajten är statisk, inga sessioner)
Analytics:        Icke-nödvändiga → kräver samtycke
Affiliate:        Icke-nödvändiga → kräver samtycke

Krav:

* Cookie-banner ska visas vid första besök
* Bannern ska INTE blockera innehållet (ej fullskärm)
* Användaren ska kunna avvisa alla icke-nödvändiga cookies
* Samtycke ska kunna dras tillbaka lika enkelt som det gavs
* Scripts (analytics, affiliate) laddas ENBART om samtycke = true
* Implementera "consent-gated" script-laddning

Rekommenderad lösning:

* Plausible Analytics (cookiefri, kräver ej samtycke) – REKOMMENDERAS
* Alternativt: Klaro (open source) eller Cookiebot

Privacy policy sida (/integritetspolicy):
Ska innehålla:

* Vilka cookies som används och varför
* Vilka tredjeparter som får data (Vercel, analytics-tjänst, affiliate-nätverk)
* Hur länge data lagras
* Hur användaren utövar sina rättigheter (Art. 15-22 GDPR)
* Kontaktuppgifter till personuppgiftsansvarig: info@importguiden.se

## D) COMPLIANCE QUALITY GATE

Fil: docs/compliance-gate.md
Returnerar JSON – se gate-definitionen i den filen.

Riskbedömning:
low:    Inga icke-nödvändiga scripts, ingen datainsamling
medium: Analytics utan samtycke ELLER affiliate utan märkning
high:   Persondata samlas utan rättslig grund ELLER scripts laddas före samtycke

Regel: compliant=false blockerar deploy i CI.

# ==========================================================

# REGLER FÖR CLAUDE (KOMPLETT LISTA)

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
10. Använd aldrig förbjudna färger eller gradients
11. Kör design quality gate innan leverans av nytt UI
22. Mobile first – designa alltid från 375px. Interaktiva element ≥ 48px touchyta. Knappar med delad bredd: flex w-full. Text i knappar: whitespace-nowrap.
12. Kör SEO quality gate (docs/seo-quality-gate.md) på alla nya textsidor
13. Kör AI self-review (docs/ai-self-review.md) innan varje leverans
14. Ladda aldrig tredjepartsskript utan consent-gate
15. Nya routes som samlar data kräver compliance-genomgång först
16. Affiliate-länkar i MDX → använd alltid <AffiliateLink>, aldrig plain markdown
17. Ny guide → skapa MDX, lägg till i GUIDE\_SLUGS och i guider/page.tsx (hubsidan)
18. Header är "use client" – lägg inte till server-side logik där
19. Efter varje avslutad uppgift: commit + push till main med tydligt commit-meddelande på svenska
20. Uppdatera /finansiering och /integritetspolicy vid nya affiliate-partner
21. Uppdatera "Senast uppdaterad" i toppen av CLAUDE.md vid ändringar i denna fil

# ==========================================================
# BACKLOG (ej prioriterat – görs efter trafiktillväxt)
# ==========================================================

## Extern bevakning – myndighetssidor (AKTIV – körs via Visualping)
Visualping bevakar följande sidor dagligen och mailar vid förändringar:

1. https://www.transportstyrelsen.se/sv/vagtrafik/fordon/aga-kopa-eller-salja-fordon/import-och-export-av-fordon/fordonsimport-och-ursprungskontroll/import-fran-ett-eu-land/
2. https://www.skatteverket.se/privat/etjansterochblanketter/svarpavanligafragor/fleromraden/privatmomspaimportbil/jagskaimporteraenbiltillsverigemastejagbetalamomsisverige.5.2a9d99b2110b7fcf5c080008162.html
3. https://www.tullverket.se/privat/genomtullen/bilochbatoversverigesgrans/kopaellersaljabiloversverigesgrans.4.7df61c5915510cfe9e710757.html
4. https://www.transportstyrelsen.se/fordonsagare/importera-fordon

OBS: Bygg INTE detta i cron-jobbet – Visualping sköter bevakningen.
När mail inkommer om förändring – uppdatera relevant guide inom 24h och
lägg till "Uppdaterad [datum] – [vad som ändrades]" högst upp på sidan.

## Annons-parser
Låg prioritet – byggs först när sajten har stabil trafik.
Koncept: användaren klistrar in länk till annons (mobile.de, AutoScout24),
systemet läser ut pris, årsmodell, CO₂, vikt och gör prelberäkning
via kalkylatorn. Kräver scraper-lösning som hanterar blockering.

# ==========================================================
# COMMUNITY – FORUM & FACEBOOK (länkbygge och synlighet)
# ==========================================================
Dessa platser är relevanta för att svara på frågor, hjälpa folk
och naturligt länka till Importguiden. Alltid genuint hjälpsamt
– aldrig ren länkdropping.

## Flashback
- Bilimport från Tyskland: https://www.flashback.org/t3097581

## Garaget.org
- Aktivt bilintresserat forum med flera trådar om import från Tyskland
- https://www.garaget.org (sök på "importera bil Tyskland")

## Husbilsklubben.se
- Aktivt husbilsforum med trådar om husbilsimport
- https://www.husbilsklubben.se (sök på "importera husbil")
- Hög prioritet – matchar husbilsnischen direkt

## Facebook-grupper (sök upp i Facebook)
- "Husbil Sverige"
- "Köpa och sälja husbilar i Sverige"
- "Husbilar & husvagnar Sverige"

## Strategi
Svara genuint på frågor som redan ställts.
Länka till relevant guide när det passar naturligt.
Etablera trovärdighet innan sajten länkas.

