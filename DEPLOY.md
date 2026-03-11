# Deploy-guide – Importguiden på Vercel Hobby

## Förutsättningar

- GitHub-konto
- Vercel-konto (Hobby, gratis)
- Node.js 20+ installerat lokalt

---

## Steg 1 – Skapa GitHub-repo

```bash
cd /home/magnus/projects/importguiden
git init  # (redan gjort av create-next-app)
git add .
git commit -m "Initial commit – Importguiden"
```

Skapa ett nytt repo på github.com och pusha:

```bash
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/importguiden.git
git branch -M main
git push -u origin main
```

---

## Steg 2 – Importera till Vercel

1. Gå till https://vercel.com/new
2. Välj ditt GitHub-repo **importguiden**
3. Klicka **Deploy** (Next.js detekteras automatiskt)

---

## Steg 3 – Sätt miljövariabler i Vercel

Gå till: **Vercel Dashboard → Ditt projekt → Settings → Environment Variables**

Lägg till dessa tre variabler för **Production**:

| Variabel          | Värde                                    |
|-------------------|------------------------------------------|
| `SITE_URL`        | `https://importguiden.se` (eller din URL)|
| `CRON_SECRET`     | Generera med: `openssl rand -hex 32`     |
| `REVALIDATE_SECRET` | Valfritt – lämna tomt tills vidare    |

> **Generera CRON_SECRET:**
> ```bash
> openssl rand -hex 32
> ```
> Kopiera output och klistra in som värde.

---

## Steg 4 – Koppla domän (valfritt)

Gå till: **Settings → Domains** och lägg till din domän.

---

## Steg 5 – Verifiera cron

Cron-jobbet körs automatiskt 06:00 UTC varje dag (konfigurerat i `vercel.json`).

Vercel skickar `Authorization: Bearer <CRON_SECRET>` till `/api/cron/daily`.

Kontrollera i: **Vercel Dashboard → Ditt projekt → Cron Jobs**

---

## Lokal utveckling

```bash
npm run dev
# Öppna http://localhost:3000
```

Bygga och testa produktion lokalt:

```bash
npm run build
npm run start
```

---

## Projektstruktur (snabbguide)

```
app/                        # Next.js App Router routes
  page.tsx                  # Startsida /
  importera-bil/[slug]/     # /importera-bil/tyskland, /importera-bil/bmw etc.
  importera-bil/kostnad/    # /importera-bil/kostnad
  importera-husbil/[slug]/  # /importera-husbil/tyskland etc.
  importera-husbil/kostnad/ # /importera-husbil/kostnad
  guider/[slug]/            # /guider/registreringsbesiktning etc.
  kalkylator/bilimport/     # /kalkylator/bilimport (client component)
  jamfor/[slug]/            # /jamfor/tyskland-vs-sverige
  om-oss/                   # /om-oss
  api/cron/daily/           # Cron endpoint
  sitemap.ts                # /sitemap.xml
  robots.ts                 # /robots.txt

data/                       # JSON-datafiler (ej databas)
  countries.json
  car-brands.json
  motorhome-brands.json
  cost-data.json

datasets/
  pages_manifest.json       # pSEO manifest – styr sitemap och indexering

components/
  layout/                   # Header, Footer, Breadcrumbs
  calculator/               # ImportCalculator (client)
  affiliate/                # AffiliateLink

lib/
  data.ts                   # Läser JSON-datafiler
  manifest.ts               # Läser pages_manifest.json
  seo.ts                    # JSON-LD, canonical URLs

types/
  index.ts                  # TypeScript-typer
```

---

## Lägga till nytt innehåll

### Ny guide

1. Lägg till en ny nyckel i `guides`-objektet i `app/guider/[slug]/page.tsx`
2. Lägg till URL:en i `datasets/pages_manifest.json` med `quality.indexable: true`

### Nytt land

1. Lägg till i `data/countries.json`
2. Sidan genereras automatiskt via `generateStaticParams`

### Nytt bilmärke

1. Lägg till i `data/car-brands.json`
2. Sidan genereras automatiskt

---

## Vercel Hobby-begränsningar att ha koll på

- Max **1 cron per dag** (kl. 06:00 UTC konfigurerat)
- Byggtid max ~45 min (vi är långt under)
- 100 GB bandbredd/månad (räcker länge för en ny sajt)
- Serverless functions timeout: 10s (cron-endpointen är snabb)
