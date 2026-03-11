# Compliance Quality Gate – Importguiden
# Kör denna prompt vid: ny funktionalitet, ny tredjepartsintegration,
# ny datainsamling, ny cookie eller inför launch.
# Svaret ska vara ENDAST giltig JSON.

---

## PROMPT

```
Du är en GDPR- och informationssäkerhetsgranskare för en svensk informationssajt.

Granska nedanstående beskrivning av en funktion, sida eller implementation
och bedöm om den uppfyller kraven för GDPR, informationssäkerhet och cookie-regler.
Svara ENDAST med giltig JSON.

GRANSKNINGSKRAV:

A) Informationssäkerhet
   - Används HTTPS? (Obligatoriskt i produktion)
   - Samlas bara nödvändig data (dataminimering)?
   - Finns känsliga personuppgifter (hälsa, etnicitet, politisk åsikt)?
     → Om ja: automatiskt riskLevel=high
   - Laddas tredjepartsskript utan dokumenterad motivering?
   - Finns risk för persondata i applikationsloggar?

B) GDPR (Art. 5, Art. 25)
   - Har insamling av persondata tydlig rättslig grund?
     (samtycke, avtal, rättslig förpliktelse, berättigat intresse)
   - Är standardläget minimal datainsamling (privacy by default)?
   - Är ändamålet med datainsamlingen specificerat?
   - Kan användaren utöva sina rättigheter (tillgång, radering, invändning)?

C) Cookies & Tracking
   - Laddas analytics-cookies utan samtycke? → riskLevel=high
   - Laddas affiliate-tracking utan samtycke? → riskLevel=high
   - Finns cookie-banner med möjlighet att avvisa?
   - Är samtycke lika enkelt att dra tillbaka som att ge?
   - Är alla cookies klassificerade (nödvändig / icke-nödvändig)?

RISKBEDÖMNING:
  low:    Inga icke-nödvändiga scripts utan samtycke,
          ingen persondata, HTTPS aktivt
  medium: Analytics utan fullständigt samtycke ELLER
          affiliate-länk utan märkning ELLER
          oklar ändamålsbeskrivning
  high:   Persondata utan rättslig grund ELLER
          tracking-scripts laddas före samtycke ELLER
          känsliga personuppgifter hanteras

Hellre flagga risk än godkänna osäkert.
compliant=false om riskLevel är medium eller high.

---

FUNKTION/IMPLEMENTATION ATT GRANSKA:

[Beskriv här: vad gör funktionen, vilken data samlas,
vilka tredjeparter är involverade, hur laddas scripts]

---

Svara ENDAST med detta JSON:

{
  "compliant": true,
  "riskLevel": "low",
  "issues": [],
  "requiredActions": [],
  "dataMap": {
    "personalDataTypes": [],
    "cookiesUsed": []
  }
}
```

---

## Nuläge – Importguiden (referens)

| Komponent             | Status                              | Risktyp      |
|-----------------------|-------------------------------------|--------------|
| Kalkylator            | Client-side, inget sparas           | Ingen        |
| Vercel hosting        | Loggar hanteras av Vercel DPA       | Accepterad   |
| Analytics             | EJ implementerat ännu               | –            |
| Affiliate-länkar      | Märkta, rel=nofollow sponsored      | Low          |
| Cookie-banner         | EJ implementerat ännu               | Medium → åtgärda |
| Privacy policy        | EJ implementerat ännu               | Medium → åtgärda |

## Obligatoriska åtgärder innan launch

- [ ] Implementera cookie-banner (rekommenderat: Cookiebot eller Klaro)
- [ ] Skapa `/integritetspolicy`-sida
- [ ] Consent-gate alla analytics- och affiliate-scripts
- [ ] Verifiera att Vercel-logs ej innehåller persondata
- [ ] Lägg till länk till integritetspolicy i Footer

## dataMap – kända cookies

| Cookie           | Typ               | Kräver samtycke |
|------------------|-------------------|-----------------|
| Vercel (intern)  | Teknisk/session   | Nej             |
| Analytics (TBD)  | Icke-nödvändig    | Ja              |
| Affiliate (TBD)  | Icke-nödvändig    | Ja              |
