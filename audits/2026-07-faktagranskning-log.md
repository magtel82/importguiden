# Faktagranskning och innehållsuppdatering 2026-07-28

Körd av: Claude Code (Opus 5)
Uppdrag: Genomgång av befintligt innehåll – faktagranska mot Transportstyrelsen,
Tullverket och Skatteverket, fylla innehållsgap kring ursprungskontroll-status,
uppdatera datum ärligt.

Omfattning: 9 commits, 22 filer, `291573a..bfd9027`.
Working tree var rent före och efter sessionen.

---

## Sammanfattning

Fyra sakfel hittades och rättades. Samtliga avgifter som kontrollerades visade
sig stämma – felen låg i processbeskrivningar och tidsangivelser, inte i belopp.

| Kontrollerat | Utfall |
|---|---|
| Ursprungskontroll 1 240 kr | Stämmer, oförändrad |
| Skyltavgift 198 kr | Stämmer (2×62 kr + 74 kr) |
| Moms 6 mån / 6 000 km, 25 % | Stämmer |
| Tull inom EU = 0 kr | Stämmer |
| Husbil undantagen malus | Stämmer |
| Handläggningstid 2–5 arbetsdagar | **FEL – saknade källa, motsades av ködata** |
| Malus-ändringens omfattning | **FEL – gällde alla husbilar, inte bara nya** |
| Körförbud före godkänd kontroll | **FEL – sjudagarsregeln gäller** |
| Ansökan kräver BankID och kortbetalning | **FEL – faktura per post, ej verifierat BankID** |

---

## Rättade sakfel

### 1. Handläggningstid för ursprungskontroll

Påståendet "2–5 arbetsdagar" fanns på tio ställen i sajten. Det saknar källa hos
Transportstyrelsen, som inte anger någon fast handläggningstid utan publicerar
aktuellt ködatum löpande i e-tjänsten för ärendestatus.

Vid kontroll 2026-07-28 handlades ärenden med ködatum **17 juni 2026** – en kö på
omkring sex veckor. Uppgiften var alltså inte bara okällbelagd utan direkt
missvisande för läsarens tidsplanering.

Ersatt genomgående med hänvisning till myndighetens aktuella ködatum.

Commits: `bb2b1cd`, `09dd5f3`, `bfd9027`

### 2. Malus-ändringens omfattning för husbilar

Guiden påstod att ändringen 1 februari 2025 bara gällde husbilar som registreras
därefter, och att fordon mitt i sin malus-period fortsatte enligt gamla regler.

Enligt Transportstyrelsen omfattade ändringen **alla husbilar som hade
malus-skatt** – inte bara fabriksnya – och överskjutande fordonsskatt
återbetalades till cirka 9 000 berörda fordon.

Tillagt i samma ändring: malus tas ut på personbil klass I, lätta bussar och
lätta lastbilar; husbil är klass II och omfattas därför inte. Karenstiden vid
avställning återgick samtidigt till 15 dygn (från 4).

Commit: `cca65ac`

### 3. Körning före godkänd ursprungskontroll

Både ursprungskontroll-guiden, tidslinjeguiden och FAQ-schemat sa att fordonet
inte får framföras före godkänd kontroll.

Rätt enligt Transportstyrelsen: ett importerat fordon får användas i trafik i
**högst sju dagar** från införseldagen med giltig utländsk registrering och
trafikförsäkring. Därefter krävs tillfällig registrering. Undantag för kortast
lämpliga väg till och från besiktning med skriftlig kallelse.

Commits: `bb2b1cd`, `bfd9027`

### 4. Ansökningsprocessen

"BankID för identifiering" och "kortbetalning eller faktura" gick inte att
verifiera. Verifierat i stället: e-tjänst i fyra steg, utländska
registreringsbeviset i original ska bifogas, faktura skickas per post med
bankgiro och OCR, handläggning startar först när betalningen registrerats.

Nytt: godkänd ursprungskontroll är giltig i 5 år.

Commit: `bb2b1cd`

---

## Innehållsgap – ursprungskontroll-status

GSC visade 2 647 exponeringar men 15 klick på `/guider/ursprungskontroll`.
Sidan lovade i sin meta description en statustjänst som inte nämndes i brödtexten.

Nytt avsnitt "Så ser du status på ditt ärende" beskriver Transportstyrelsens
e-tjänst **"Visa ärendestatus för ursprungskontroll"**.

**Korrigering av antagandet i uppdraget:** tjänsten nås inte via Mina sidor med
BankID. Den kräver ingen inloggning alls – man anger ett referensnummer.
Verifierat mot `fordon-ukansok.transportstyrelsen.se/arendestatus`.

Inga detaljer om vad tjänsten visar för enskilda ärenden återges, enligt
instruktion.

Commit: `bb2b1cd`

---

## Övriga ändringar

**Moms preciserad mot Skatteverket** (`97a33b2`)
Definitionen följer nu myndighetens ordalydelse: köpt inom sex månader efter
första ibruktagande, eller kört **högst** 6 000 km. Sajten skrev "färre än",
vilket ger fel utfall exakt vid 6 000 km. Tillagt: blankett SKV 5282 och
35-dagarsfristen.

**Kostnadsdata verifierad** (`1e96c3f`)
Källänkar pekar nu på Transportstyrelsens faktiska prislistor. Noterat att
vägtrafikregisteravgiften är årlig (höjd 69 → 74 kr 2026-01-01), inte en
engångskostnad.

**Motstridiga siffror harmoniserade** (`9b955a4`)
`/importera-bil/tyskland` hade två kostnadstabeller som sa olika saker om samma
poster. Avvikarna rättades mot `data/cost-data.json` som single source of truth.
Totalraden var dessutom felräknad och är nu uppdelad i grundkostnad
(~3 000–3 800 kr) och kostnad med transport och COC (~9 200–16 600 kr).

**Tidslinjen omräknad** (`bfd9027`)
Guiden angav 4–8 veckor som totaltid, vilket förutsätter att ursprungskontrollen
går på dagar. Omstrukturerad i två delar: det läsaren själv styr (2–6 veckor) och
kötiden (varierar). Läsaren får en metod för att räkna ut sin egen tidslinje i
stället för en siffra som blir inaktuell.

**CLAUDE.md uppdaterad** (`a537e12`)
Den gamla noten "verifiera mot Transportstyrelsen" är avklarad. Tre nya regler
inlagda så att felen inte återkommer.

---

## 2025-referenser – medvetet bevarade

De flesta 2025-referenser **ska stå kvar** och rördes inte:

- `validFrom: "2025-01-01"` i `import-costs.json` beskriver när avgiften började
  gälla. Avgiften är oförändrad, så 2026 hade varit direkt felaktigt.
- Alla "februari 2025"-referenser avser lagändringen och är historiskt korrekta.

Enda äkta felet: `components/CostOverview.tsx` angav "Transportstyrelsen (2025)"
om en avgift verifierad för 2026. Rättat.

---

## Datum och quality gate

Quality gate (`docs/quality-gate-single.md`) kördes på tolv sidor. Samtliga
passerar: 828–1 603 ord, källbelagda faktapåståenden, inga tunna sidor.

`dateUpdated` bumpades **endast** på de nio sidor där fakta faktiskt ändrades.
Åtta guider rördes inte – ingen fake-frescha.

Scoreändringar: ursprungskontroll 85 → 88, fordonsskatt-husbil 86 → 88,
moms 87 → 89, hur-lang-tid 78 → 80, importera-bil/tyskland 87 → 84,
importera-husbil/tyskland 85 → 84 (sänkta på grund av flaggade problem).

**Inga indexable-flaggor ändrades.** 40 indexerbara sidor före och efter,
verifierat mot HEAD. Sitemap bekräftad med `npm run build`: 40 URL:er.

Commit: `3db9895`

---

## Flaggat – kunde inte verifieras

**Registreringsbesiktningens pris.** Varken Opus eller Besikta publicerar pris
för registreringsbesiktning online (Opus hänvisar till telefon). Samtliga belopp
på sajten är schabloner utan myndighetsstöd. De är märkta som schabloner och
siffrorna är numera samstämmiga över alla sidor, men de saknar källa.
Noterat i `import-costs.json._meta.verificationNote`.

**"66 % fler husbilsregistreringar 2025"** i `/importera-husbil/tyskland`,
angiven källa Transportstyrelsen. Inget stöd hittat. Ligger kvar, flaggat i
manifestets `notes`. **Kräver beslut: verifiera eller ta bort.**

**prop. 2024/25:27** som referens på samma sida. Sakinnehållet stämmer, men
propositionsbeteckningen kunde inte bekräftas – ändringen gick via
budgetpropositionen för 2025.

---

## Sidoupptäckt: exponerad access-token

`git remote` innehöll en personlig access-token i klartext
(`ghp_wu8Uo…`, scope `repo` + `workflow`, utgången 2026-06-09). Den blockerade
push eftersom git använde den i stället för `gh`-inloggningen.

Kontrollerat: tokenen fanns **inte** i någon commit, inte i någon spårad fil och
inte kvar i `.git/config` efter åtgärd. Exponeringen var lokal.

Åtgärd: remote bytt till ren URL, `credential.helper` satt till
`!gh auth git-credential`. Tokenen raderad av Magnus i GitHubs
webbgränssnitt 2026-07-28.

---

## Commits

```
bfd9027  Räkna om tidslinjen för bilimport efter verifierad kötid
a537e12  Uppdatera CLAUDE.md efter faktagranskning 2026-07-28
9b955a4  Harmonisera motstridiga kostnadssiffror i bilguiden för Tyskland
3db9895  Uppdatera manifest efter quality gate på granskade sidor
1e96c3f  Verifiera kostnadsdata mot myndighetskällor och uppdatera källhänvisningar
97a33b2  Precisera momsregler mot Skatteverket
cca65ac  Rätta felaktig uppgift om malus-ändringens omfattning för husbilar
09dd5f3  Ta bort overifierad handläggningstid för ursprungskontroll på övriga sidor
bb2b1cd  Uppdatera ursprungskontroll – e-tjänst för ärendestatus och korrigerad process
```

---

## Nästa steg

1. **Beslut:** 66 %-påståendet i husbilsguiden – verifiera eller ta bort
2. **Valfritt:** ring besiktningsstationer för verifierbara priser på
   registreringsbesiktning
3. **Bevakning:** kötiden för ursprungskontroll bör kontrolleras med jämna
   mellanrum. Det daterade exemplet i tidslinjeguiden (28 juli 2026, sex veckors
   kö) bör uppdateras om läget ändras väsentligt
