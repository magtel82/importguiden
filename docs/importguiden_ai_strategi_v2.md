# Importguiden – AI-strategi & MCP
# Uppdaterad: 2026-03-14
# Synkad med: CLAUDE.md 2026-03-14 (MVP GO)

## Problemet

2026 konkurrerar en content-sajt inte bara mot andra sajter – den konkurrerar mot AI. Google AI Overview, ChatGPT, Claude och Perplexity kan besvara grundläggande importfrågor utan att besökaren klickar till någon sajt. Detta hotar alla affiliate-sajter som bygger på organisk trafik.

## Nuläge Importguiden (implementerat)

Saker vi redan har som AI inte kan matcha:
- **Importkalkylator** med realtids-växelkurs (Frankfurter API), landval, redigerbart avstånd, delbar URL
- **Verifierade avgifter** från cost-data.json med källhänvisning
- **Delbara beräkningsresultat** via URL-parametrar (viralt potential)
- **Cookie-consent + affiliate-compliance** (GDPR-redo)
- **Quality gate-system** som säkerställer att innehållet håller hög standard
- **Daglig cron-pipeline** (api/cron/daily) – redan förberedd infrastruktur

Content live:
- content/importera-bil/tyskland.mdx (~1 180 ord)
- content/importera-husbil/tyskland.mdx (~1 100 ord)
- 4 guider: registreringsbesiktning, coc-intyg, ursprungskontroll, moms-vid-bilimport

---

## Försvarsstrategi: 4 lager

### Lager 1: Saker AI inte kan göra (IMPLEMENTERAT)

**Importkalkylatorn (live)**
- Personliga beräkningar baserade på användarens specifika situation
- Realtids-växelkurs via Frankfurter API med fallback
- Avgifter från cost-data.json (en källa till sanning)
- Landval med redigerbart km-fält + transportintervall
- Importförsäkring som kostnadsrad
- Besparing vs svenskt pris
- Delbar URL per beräkning

**Verifierad, daterad information (live)**
- Varje fakta-påstående har källa
- "Uppdaterad datum" synligt på alla guider
- cost-data.json med _updated och source per post

**Vad som bör stärkas:**
- Interaktiv steg-för-steg-checklista: "Var i importprocessen är du?"
- Personaliserad guide baserad på användarens val (land, fordonstyp, ny/begagnad)
- Nedladdningsbar PDF-checklista (lead magnet utan att vara säljig)

### Lager 2: AI-chat på sajten (NÄSTA STEG)

Bygg en AI-assistent på importguiden.se som har tillgång till all vår data.

**Användarupplevelse:**
Besökaren frågar: "Jag vill importera en Hymer B-MC 2022 från Tyskland. Vad kostar det totalt?"

AI:n svarar med:
- Beräknad totalkostnad baserad på vår kalkylatordata och cost-data.json
- Relevanta steg från våra guider (MDX-innehållet)
- Aktuella avgifter och regler med källhänvisning
- Naturligt integrerade affiliate-länkar via AffiliateLink-mönstret

**Teknisk implementation:**
- Ny komponent: components/chat/ImportChat.tsx ("use client")
- Ny API-route: app/api/chat/route.ts
- Anropar Claude API (claude-sonnet-4-20250514) med system prompt som innehåller:
  - Data från countries.json, car-brands.json, motorhome-brands.json, cost-data.json
  - Sammanfattning av MDX-guidernas nyckelinfo
  - Affiliate-kontext (Wise för valutaväxling, framtida partners för försäkring/lån)
  - Instruktion att citera källor och hänvisa till relevanta sidor på importguiden.se
- Max 1 000 tokens per svar (kostnadskontroll)
- Rate-limitad per session (5–10 frågor) via localStorage-räknare
- Consent-gate: chatten laddar INTE Claude API förrän användaren aktivt klickar "Starta chatten"

**Krav enligt CLAUDE.md:**
- Ingen modal/popup – chatten ska vara en sektion på en sida (t.ex. /chat eller inbäddad på startsidan)
- Följ designreglerna: blue-700 accenter, gray-palett, inga förbjudna färger
- AffiliateLink-komponenten används för alla affiliate-länkar i AI-svar
- GDPR: inga personuppgifter sparas, inga konversationer loggas server-side
- Compliance gate måste passera innan deploy

**Varför detta slår ChatGPT rakt av:**
- Vår AI har specifik, verifierad, aktuell svensk importdata från cost-data.json
- ChatGPT har generell kunskap som kan vara inaktuell eller felaktig
- Vår AI kan länka till relevanta sidor och verktyg på sajten
- Besökaren stannar på sajten → affiliate-klick möjliga

**Kostnad:**
- Claude Sonnet: ~$3/miljon input tokens, ~$15/miljon output tokens
- Uppskattning: 1 000 besökare/mån × 20% använder chatten × 3 frågor = 600 anrop/mån
- ~$5–15/mån vid nuvarande skala
- Ny miljövariabel krävs: ANTHROPIC_API_KEY (server-only, ej NEXT_PUBLIC)

### Lager 3: MCP-server – gör vår data tillgänglig för extern AI (FAS 3)

Bygg en MCP-server som exponerar Importguidens data för externa AI-verktyg.

**Vad den exponerar (tools):**
- calculate_import_cost – samma logik som ImportCalculator, anropbar av AI
- get_current_fees – returnerar cost-data.json med senaste uppdateringsdatum
- get_import_process – steg-för-steg-process per land
- get_latest_regulation_changes – senaste regeländringar (från bevaknings-pipeline)

**Vem använder den:**
- Claude Desktop-användare som installerar vår MCP-server
- Potentiellt andra AI-verktyg som stödjer MCP
- Utvecklare som bygger import-relaterade verktyg

**Vad det ger oss:**
- Attribution – AI-verktyg nämner Importguiden som källa
- GEO (Generative Engine Optimization) – vi blir den data AI refererar till
- Trafik – nyfikna användare besöker sajten för komplett info
- Auktoritet – signalerar till Google att vi är en primärkälla

**Implementation:**
- Separat repo eller mapp i monorepo: mcp-server/
- Node.js med @anthropic-ai/mcp-sdk
- Läser samma JSON-datafiler som sajten (countries.json, cost-data.json etc.)
- Publiceras som npm-paket och/eller hostad endpoint
- Dokumentation i README

### Lager 4: Regelbevakning (NÄSTA STEG – använd befintlig cron)

Importguiden har redan api/cron/daily med Vercel Cron (daglig, 06:00 UTC).
Denna pipeline kan utökas med regelbevakning.

**URL:er att bevaka:** Se separat fil: importguiden_regelbevakning.md (12 URL:er)

**Fas 2a: Ändringsdetektering (i befintlig cron-pipeline)**
- Utöka api/cron/daily/route.ts med en ny steg: regelbevakning
- Fetch HTML från bevakade URL:er
- Jämför hash mot senaste kända hash (spara i datasets/regulation-hashes.json)
- Om ändring: skicka e-post via Resend till info@importguiden.se
- Ny miljövariabel: RESEND_API_KEY (server-only)

**Fas 2b: AI-sammanfattning**
- Vid detekterad ändring: skicka ändrad text till Claude API
- Claude sammanfattar vad som ändrats i klartext
- Sammanfattningen inkluderas i e-postnotisen
- Ny miljövariabel: ANTHROPIC_API_KEY (återanvänd från Lager 2)

**Fas 2c: Auto-uppdatering**
- Vid bekräftad regeländring: skapa GitHub Issue via GitHub API
- Issue innehåller: vilken URL ändrades, AI-sammanfattning, vilka sidor på sajten som berörs
- Manuell granskning innan cost-data.json eller MDX-filer uppdateras (ej full automation)

**Begränsning Vercel Hobby:**
- 1 cron per dag – alla steg måste rymmas i samma anrop
- Timeout: 10 sekunder (Hobby) – kan vara tight om alla 12 URL:er fetchas
- Alternativ: fetcha 2–3 URL:er per dag på rotation (alla täcks inom en vecka)

---

## Prioritering och tidplan

| Fas | Vad | När | Kostnad | Ny miljövariabel |
|-----|-----|-----|---------|-------------------|
| ✅ | Importkalkylator (live) | Klar | 0 kr | — |
| ✅ | Verifierad data med datum | Klar | 0 kr | — |
| 2a | Regelbevakning i cron-pipeline | Nästa sprint | 0 kr | RESEND_API_KEY |
| 2b | AI-chat på sajten | När 10+ sidor finns | ~50–150 kr/mån | ANTHROPIC_API_KEY |
| 2c | Regelbevakning med AI-sammanfattning | Efter 2b (återanvänd API-nyckel) | ~10 kr/mån | — |
| 3 | MCP-server | När sajten har auktoritet | 0 kr (open source) | — |

## Mätning

Hur vet vi att AI-strategin funkar?

- **Kalkylator-användning:** Unika beräkningar per månad (mät via page views + query params)
- **Delbara länkar:** Hur många besökare kommer via kalkylator-URL med params?
- **AI-chat-användning:** Antal sessioner, frågor per session, klick på affiliate-länkar i svar
- **Citeringar:** Dyker Importguiden upp i Google AI Overview? Perplexity?
- **Direkttrafik:** Ökar andelen som kommer direkt (inte via Google) = folk minns sajten
- **Tid på sidan:** Längre tid = interaktiva verktyg fungerar
- **Regelbevakning:** Antal fångade ändringar, tid från ändring till uppdaterad sajt
