# AI-strategi – Implementation TODO
# Senast uppdaterad: 2026-03-22
# Prioritetsordning: Fas 1 → Fas 2 → Fas 3

---

## FAS 1: Regelbevakning (Prioritet 1 – Börja här)

**Mål:** Automatiskt mail när myndigheter ändrar regler/avgifter.
**Kostnad:** 0 kr. Byggtid: ~2–3 dagar.

### Förberedelser (du gör i externa tjänster)

- [ ] **Vercel Blob Storage** – aktivera i Vercel Dashboard → Storage → Create Database → Blob
      Genererar automatiskt BLOB_READ_WRITE_TOKEN i miljövariablerna.

- [x] **SMTP via one.com** – redan konfigurerat (bytt från Resend 2026-03-18)
      → Miljövariabler redan satta: SMTP_USER, SMTP_PASSWORD
      → Avsändaradress: info@importguiden.se

### Kod att bygga (Claude gör detta)

- [ ] `lib/smtp.ts` – wrapper för sendAlert(subject, body) via nodemailer + one.com SMTP
- [ ] `lib/regulation-check.ts` – fetch + hash-jämförelse + stripDynamicContent()
- [ ] `datasets/regulation-urls.json` – lista med 12 URL:er att bevaka (du fyller i)
- [ ] Uppdatera `app/api/cron/daily/route.ts` – lägg till runRegulationCheck() som steg 3
- [ ] Vercel Blob: läs/skriv regulation-state.json (rotation + hashes)

### URL:er att bevaka (9 bekräftade + 3 platser kvar)

```json
[
  "https://www.transportstyrelsen.se/sv/vagtrafik/Fordon/Importerade-fordon/",
  "https://www.transportstyrelsen.se/sv/vagtrafik/Fordon/Importerade-fordon/registreringsbesiktning/",
  "https://www.transportstyrelsen.se/sv/vagtrafik/Fordon/Importerade-fordon/ursprungskontroll/",
  "https://www.skatteverket.se/foretag/moms/momsvidkopochforsaljning/momsvidinternationellaaffarer/koptjansterifransverige/importavfordon.4.html",
  "https://www.skatteverket.se/privat/fastigheterochbostad/bilochfordron/kopochsaljavbil/importeradbilfraneulandet.4.html",
  "https://www.tullverket.se/privat/resatillochfransverige/fordon.4.html",
  "https://eur-lex.europa.eu/legal-content/SV/TXT/?uri=CELEX%3A32006L0112",
  "https://eur-lex.europa.eu/legal-content/SV/TXT/?uri=CELEX%3A32007L0046",
  "https://opus.se/besiktning/registreringsbesiktning"
]
```

Kandidater för de 3 kvarvarande platserna:
- https://www.bilprovningen.se/besiktning/typer/registreringsbesiktning/
- https://www.transportstyrelsen.se/sv/vagtrafik/Fordon/Importerade-fordon/coc/
- Naturvårdsverket (bonus/malus) – relevant om Tesla/elbilssidor byggs ut

### Viktiga designbeslut

- Rotation: 3 URL:er per dag (täcker alla 12 var 4:e dag)
- stripDynamicContent(): extraherar bara <main>-elementet för att undvika false positives
- Mail skickas till: info@importguiden.se
- Ingen auto-deploy – du granskar mailet och uppdaterar manuellt

---

## FAS 2: AI-chat på sajten (Prioritet 2)

**Mål:** Besökaren kan ställa importfrågor direkt på sajten. AI:n svarar med vår verifierade data.
**Kostnad:** ~50–150 kr/mån vid nuvarande skala.
**När:** Vänta tills sajten har 15+ indexerbara sidor (mer data = bättre system prompt).

### Förberedelser (du gör)

- [ ] **Anthropic API-nyckel** – skapa på console.anthropic.com
      → Lägg till i Vercel: ANTHROPIC_API_KEY (server-only, ALDRIG NEXT_PUBLIC_)
      → Lägg till i .env.local: ANTHROPIC_API_KEY=...
      → Sätt spending limit i Anthropic Console (föreslår $20/mån som cap)

### Kod att bygga (Claude gör detta)

- [ ] `lib/chat-system-prompt.ts` – komprimerad data (<3 000 tokens):
      avgifter från cost-data.json, länderöversikt, importprocess, nyckelregler
- [ ] `app/api/chat/route.ts` – API-route som anropar Claude API
      Rate-limit: 10 frågor/session via sessionStorage
      Max 1 000 output tokens per svar
- [ ] `components/chat/ImportChat.tsx` – "use client"
      Consent-gate: chatten aktiveras först när användaren klickar "Starta"
      Inline-sektion (EJ modal/popup – förbjudet i CLAUDE.md)
      Disclaimer: "AI:n kan göra fel. Verifiera hos Transportstyrelsen."

### Placering

- Primärt: `/kalkylator/bilimport` (mest relevant kontext)
- Sekundärt: startsidan (discovery)
- Inte: egen `/chat`-route (ingen organisk trafik dit)

### GDPR – åtgärder

- [ ] Uppdatera `/integritetspolicy` med: "Frågor till AI-assistenten skickas till
      Anthropic API. Inget sparas av Importguiden."
- [ ] Disclosure direkt i chat-UI:t (syns alltid, inte bara i policy)
- [ ] System prompt-instruktion: "Be aldrig om personuppgifter"

### Viktiga designbeslut (följer CLAUDE.md)

- Modell: claude-sonnet-4-6 (claude-sonnet-4-6-20250914 eller senaste)
- Ingen RAG – komprimerad system prompt räcker för vår datamängd
- System prompt begränsar AI:n till vår verifierade data (spekulerar ej)
- Inga affiliate-länkar i AI-svar inledningsvis (juridisk gråzon)

---

## FAS 3: MCP-server (Prioritet 3 – Längre sikt)

**Mål:** Claude Desktop-användare kan installera vår MCP-server och få Importguidens
data direkt i sin AI-assistent. GEO (Generative Engine Optimization).
**Kostnad:** 0 kr (open source).
**När:** När sajten har etablerad auktoritet och trafik.

### Förberedelser (du gör)

- [ ] Skapa nytt GitHub-repo: `importguiden-mcp` (separat från sajten)
- [ ] npm-konto för publicering (om du inte redan har)

### Kod att bygga (Claude gör detta)

- [ ] `index.ts` – MCP-server med @modelcontextprotocol/sdk
- [ ] Tool: `get_current_fees` – returnerar cost-data.json (enklast, högt värde)
- [ ] Tool: `get_import_process` – steg-för-steg per land
- [ ] Tool: `calculate_import_cost` – portning av kalkylatorlogiken
- [ ] `README.md` med installationsinstruktioner för Claude Desktop

### Publicering (Claude Desktop)

Användaren installerar via claude_desktop_config.json:
```json
{
  "mcpServers": {
    "importguiden": {
      "command": "npx",
      "args": ["importguiden-mcp"]
    }
  }
}
```

### Viktiga designbeslut

- Separat repo (inte monorepo) – annan release-rytm, annan publik
- Läser samma JSON-datafiler som sajten (countries.json, cost-data.json etc.)
- Publiceras som npm-paket: `importguiden-mcp`
- Data uppdateras när cost-data.json i sajt-repot uppdateras (manuell sync)

---

## Sammanfattning

| Fas | Vad | Kostnad | Miljövariabler |
|-----|-----|---------|----------------|
| 1 | Regelbevakning | 0 kr | SMTP_USER, SMTP_PASSWORD, BLOB_READ_WRITE_TOKEN |
| 2 | AI-chat | ~100 kr/mån | ANTHROPIC_API_KEY |
| 3 | MCP-server | 0 kr | — |
