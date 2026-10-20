# En källa för belopp, husvagnsverifiering och efterkontroll – 2026-10-20

Körd av: Claude Code (Opus 5.5). Föregicks samma dag av hotfixen för kalkylatorns
jämförelse själv/importfirma (commit 90906e9).

## 1. Beloppen – före och efter

Före: ca 318 belopp i 31 filer, varav många utan källa och flera motstridiga.
Efter: alla belopp i app/, content/ och components/ kommer från
`data/cost-data.json`. `lib/belopp.test.mjs` fallerar på hårdkodade belopp;
undantag (räkneexempel) står i `lib/belopp-vitlista.json` med motivering.

| Post | Före | Efter | Källa (kontrollerad 19–20 okt 2026) | Typ |
|---|---|---|---|---|
| Ursprungskontroll | 1 240 kr | 1 240 kr | Transportstyrelsen, avgifter för fordonsregistrering | officiell |
| Registreringsskylt | 62 kr | 62 kr/st | Transportstyrelsen, registreringsskyltar | officiell |
| Vägtrafikregisteravgift | 74 kr | 74 kr/år (förslag 80 kr 2027) | Transportstyrelsen | officiell |
| Registreringsbesiktning personbil | ~1 700 kr / 1 500–1 900 kr (ingen källa) | **2 500–3 500 kr** | Ystad Bilbesiktning, Fordonsprovarna Kungälv (3 239 kr) | marknadspris |
| Registreringsbesiktning husbil | 3 000–5 000 kr (ingen källa) | 2 500–3 500 kr | samma | marknadspris |
| Ombesiktning/efterkontroll | 500–800 kr (ingen källa) | **1 000–1 349 kr** | samma | marknadspris |
| Enskilt godkännande | 5 000–15 000 kr (ingen källa) | 4 599 kr (en station) | Fordonsprovarna Kungälv | marknadspris |
| Importförsäkring bil | 1 500 kr schablon | 800 kr (If) | If | marknadspris |
| Importförsäkring husbil | 2 500 / 2 000–4 000 kr (ingen källa) | **borttagen – offert** | – | – |
| Exportskyltar (avgift) | 30–60 EUR / 500–1 000 kr | från 33,20 EUR | Service Berlin (GebOSt) | officiell |
| Exportförsäkring | 50–150 EUR / 300–600 kr / 300–800 kr | från 79 EUR, 15 dagar | nondos.de | marknadspris |
| Köpbesiktning Tyskland | 80–150 / 80–200 / 120–200 EUR | ADAC Hamburg från 109 EUR | ADAC Hansa | marknadspris |
| Transport, köra själv | 3,5 kr/km, ~2 000 / 1 500–3 000 kr | 25 kr/mil + exportkostnad | Skatteverket (milersättning) | schablon |
| Transport, firma | 6 000–20 000 kr (flera versioner) | **borttaget – offert** (kalkylatorn: eget offertfält) | – | – |
| COC-intyg | 500–1 500 kr / 50–200 EUR / €100–350 per märke | **borttaget** – tillverkaren sätter priset | – | – |
| EEG-intyg | 50–200 EUR | **borttaget** | – | – |
| Batteribyte, batteridiagnostik, besparing per elbil | olika | **borttaget** | – | – |
| Hymer-priser, tumregler 15 000–30 000 kr | olika | **borttaget** | – | – |
| Elbilspremie, inkomstgränser | i löptext | i datafilen | Naturvårdsverket | officiell |
| Fordonsskattesatser | hårdkodade i kod | i datafilen | Skatteverket, tabell 62/63/72 | officiell |
| EUR/USD/GBP-kurs | 11,5 / 10,8 / 13,5 (reserv) | ECB 2026-10-19 | ECB | officiell |
| Importfirma (jämförelse) | 24 875 / 37 375 kr | oförändrat, **undantag**: ingen källänk | importfirmans säljsida (medvetet olänkad) | marknadspris |

Sakfel som hittades på vägen: momsgränsen "färre än 6 000 km" (rätt: högst) i
kalkylatorn, kostnadssidan och Tysklandsguiden; "röda skyltar" kvar i
ProcessSteps på startsidan.

## 2. Husvagnsguiden – påstående för påstående (status: noindex)

| Påstående | Källcitat | Status |
|---|---|---|
| Ingen fordonsskatt för släpvagn med skattevikt högst 3 000 kg sedan 1 feb 2026 | Vägtrafikskattelag 2 kap. 2 § p. 5: "släpvagnar med en skattevikt av högst 3 ton. Lag (2025:1363)". Skatteverket: "Fordonsskatt betalas inte för … släpvagnar med en skattevikt på högst 3000 kg". Transportstyrelsen: "Från och med den 1 februari 2026 tas fordonsskatt inte ut för släpvagnar med en skattevikt upp till 3 000 kg (tidigare 750 kg)." | Belagt |
| "De flesta husvagnar ligger under gränsen" | – | Borttaget (ingen källa) |
| Ursprungskontroll krävs för husvagn | Transportstyrelsen: "Du behöver ansöka om ursprungskontroll för alla fordon som ska registreras i Sverige, med undantag för nya fordon som importeras av registrerade importörer…" | Belagt |
| Släp undantagna från försäkringskravet vid tillfällig registrering | Transportstyrelsen: "Släpfordon är undantagna denna försäkringsplikt." | Belagt |
| Släp kräver ingen egen trafikförsäkring | Trafikskadelag (1975:1410) 2 §: "Trafikförsäkring skall finnas för motordrivet fordon som är registrerat i vägtrafikregistret och inte är avställt…". 1 b §: "Om det till ett motordrivet fordon som omfattas av lagen har kopplats ett fordon av något annat slag, tillämpas lagens bestämmelser om skada i följd av trafik med ett motordrivet fordon på fordonskombinationen i dess helhet." | Belagt, tillagt 2026-10-21 |
| Tillfällig registrering 3 mån, kan ej förlängas; 7-dagarsregeln | Transportstyrelsen: "Den tillfälliga registreringen gäller i tre månader och kan inte förlängas." / "…får du köra fordonet i högst sju dagar från det datum då fordonet fördes in i landet…" | Belagt |
| B: bil + husvagn sammanlagt högst 3 500 kg (husvagn över 750 kg räknas som lätt släp bara då) | Transportstyrelsen: "Även ett släp med högre totalvikt än 750 kg kan vara lätt, så länge den sammanlagda totalvikten på släp och bil är högst 3 500 kg. För att köra sådana fordonskombinationer räcker det med körkort med behörighet B." | Belagt. Justerat 2026-10-22: uppgiften om tågvikt 4 250 kg på B (gäller bara släp ≤750 kg) är borttagen ur guiden |
| Utökad B: högst 4 250 kg | Transportstyrelsen: "Med den utökade B-behörigheten får du köra fordonskombinationer där bilens och släpets sammanlagda totalvikt är högst 4 250 kg." | Belagt |
| BE för tyngre | Transportstyrelsen: "I andra fall krävs behörighet för utökad B eller BE." | Belagt |
| En husvagn räknas inte som nytt transportmedel; ny husvagn från tysk handlare: normalt tysk moms, ingen svensk | Skatteverket: "Ett motordrivet marktransportmedel är ett fordon … och har en motor med en cylindervolym på mer än 48 kubikcentimeter eller en effekt på mer än 7,2 kilowatt." | **Slutsats ur definitionen** – Skatteverket säger inte uttryckligen att husvagnar är undantagna. Formulering godkänd av Magnus 2026-10-22 |
| Exportskyltar för släp | FZV § 45: "…oder ein Anhänger hinter einem Kraftfahrzeug dauerhaft in einen anderen Staat verbracht werden…" | Belagt |
| Kontrollbesiktning lätt släp 48/24 mån | Transportstyrelsen: "Lätta släp (max 3 500 kg) ska kontrollbesiktas första gången senast 48 månader efter den månad då fordonet första gången togs i trafik. därefter senast 24 månader…" | Belagt |
| Originalet av tillverkarintyget med till besiktningen | Transportstyrelsen: "Originalet av intyget ska du ta med vid registreringsbesiktningen." | Belagt |
| Ingen tull vid handel inom EU | Europeiska unionen, EU:s tullunion i praktiken: "För EU:s del innebär detta att inga tullar ska betalas för varor som skickas från ett EU-land till ett annat." | Belagt, återinfört 2026-10-21 |
| "Fukt är det vanligaste dolda felet" | – | Omskrivet ("syns inte alltid utanpå") |
| Wohnwagen = husvagn på mobile.de | Terminologi | Ej källbelagt (översättning) |

Tabellen godkänd av Magnus 2026-10-22 med två justeringar (körkort, moms). Sidan indexerad samma dag.

## 3. Ej verifierat / TODO

- mobile.de:s språk – data/mobile-de.json är tom (sajten svarar 403). Fylls i för hand.
- Prisjämförelsen /jamfor/tyskland-vs-sverige: LÖST 2026-10-20 – omskriven till
  metodsida (förslag b). Segmenttabellen och prisskillnader per märke borttagna;
  undantaget i vitlistan är borttaget.
- Märkessidornas data (car-brands-import.json, motorhome-brands-import.json:
  priceSEK, procentuella prisskillnader) och procentuppgifter i löptext
  (t.ex. "15–25 % dyrare", "2–3 procent växlingskostnad") är inte källgranskade –
  testet täcker bara kr/EUR i app/, content/ och components/.
- Importfirmans listpris saknar källänk (medvetet) och täckningen är okänd.
- Husbilens exportförsäkring: inget publicerat pris hittat.

## 4. URL:er med ändrat innehåll (för GSC)

- https://importguiden.se/
- https://importguiden.se/guider/besikta-husbil
- https://importguiden.se/guider/besiktningsfel-vid-import
- https://importguiden.se/guider/coc-intyg
- https://importguiden.se/guider/eeg-intyg
- https://importguiden.se/guider/elbilspremie-importerad-bil
- https://importguiden.se/guider/exportforsakring
- https://importguiden.se/guider/fordonsskatt-husbil-bonus-malus
- https://importguiden.se/guider/hur-lang-tid-tar-bilimport
- https://importguiden.se/guider/importera-elbil
- https://importguiden.se/guider/importforsakring
- https://importguiden.se/guider/kopa-bil-mobile-de-autoscout24
- https://importguiden.se/guider/kopa-husbil-mobil-de
- https://importguiden.se/guider/registreringsbesiktning
- https://importguiden.se/guider/transportera-bil-fran-tyskland
- https://importguiden.se/guider/ursprungskontroll
- https://importguiden.se/importera-bil/audi
- https://importguiden.se/importera-bil/bmw
- https://importguiden.se/importera-bil/kostnad
- https://importguiden.se/importera-bil/mercedes
- https://importguiden.se/importera-bil/porsche
- https://importguiden.se/importera-bil/tesla
- https://importguiden.se/importera-bil/tyskland
- https://importguiden.se/importera-bil/volkswagen
- https://importguiden.se/importera-husbil/burstner
- https://importguiden.se/importera-husbil/dethleffs
- https://importguiden.se/importera-husbil/hobby
- https://importguiden.se/importera-husbil/hymer
- https://importguiden.se/importera-husbil/knaus
- https://importguiden.se/importera-husbil/kostnad
- https://importguiden.se/importera-husbil/tyskland
- https://importguiden.se/jamfor/tyskland-vs-sverige
- https://importguiden.se/kalkylator/bilimport
- https://importguiden.se/regelandringar


---

# Körning 2026-10-21 – kvarvarande punkter

1. **Bygg-spärr:** "prebuild": "npm test && npm run lint". Verifierat: ett planterat
   belopp ("4 321 kr" i eeg-intyg.mdx) får `npm run build` att falla i prebuild.
   Vercel-projektet har inget eget byggkommando och Node 24.x.
2. **Importfirman:** källa Importbil.se (startsidan, dateModified 2026-10-07):
   "Vårt fastpris på import av bilar/husbilar, inkluderar: Transport,
   registreringsbesiktning, ursprungskontroll hos Transportstyrelsen och leverans
   i Lund." 19 900 / 29 900 kr + moms. Jämförelsen visar nu exakt belopp för de
   täckta posterna; skyltar och försäkring jämförs inte (källan anger dem inte).
   Länkas inte från sajten.
3. **mobile.de:** 10 språk, ingen svenska – manuell kontroll 2026-10-19.
4. **Kalkylatorn:** egen förbrukning (l/mil) och bränslepris; schablon 25 kr/mil
   som standard med texten att verklig kostnad ofta är högre.
5. **Registreringsbesiktning:** Opus, Bilprovningen och Carspect publicerar inte
   pris (citat i cost-data.json), DEKRA saknar uppgift. Intervallet oförändrat
   (Ystad, Kungälv).
6. **/jamfor:** break-even-kalkyl (pris SE + pris DE, transport, moms).
7. **Procent:** testet fångar procent; märkesdatan priceEUR/priceSEK/priceAdvantage
   och meningar med "X–Y procent lägre priser" borttagna; Sprinter-procent,
   elbilsprocent och växlingsavgifter borttagna. Momsgränsen rättad på fler sidor.
8. **Husvagn:** tull (EU-källa) och trafikförsäkring (TSL 1 b och 2 §§) tillagda.
   Fortfarande noindex.

## Ej belagt – kvar
- mätarmanipulationsguiden: procentuppgifter tillskrivna ADAC, VDA och carVertical
  (källorna inte kontrollerade i den här körningen).
- /importera-husbil/tyskland: "ökning på ungefär 39 procent" och "66 procent"
  (källa: branschstatistik/Vroom, inte kontrollerade).
- DEKRA:s pris för registreringsbesiktning – ingen uppgift på webbplatsen.

## URL:er med ändrat innehåll 2026-10-21 (för GSC)

- https://importguiden.se/
- https://importguiden.se/guider
- https://importguiden.se/guider/importera-elbil
- https://importguiden.se/guider/kopa-bil-mobile-de-autoscout24
- https://importguiden.se/guider/kopa-husbil-mobil-de
- https://importguiden.se/guider/moms-vid-bilimport
- https://importguiden.se/guider/tysk-bilordlista
- https://importguiden.se/importera-bil/audi
- https://importguiden.se/importera-bil/bmw
- https://importguiden.se/importera-bil/mercedes
- https://importguiden.se/importera-bil/porsche
- https://importguiden.se/importera-bil/tesla
- https://importguiden.se/importera-bil/tyskland
- https://importguiden.se/importera-bil/volkswagen
- https://importguiden.se/importera-husbil/burstner
- https://importguiden.se/importera-husbil/dethleffs
- https://importguiden.se/importera-husbil/hobby
- https://importguiden.se/importera-husbil/hymer
- https://importguiden.se/importera-husbil/knaus
- https://importguiden.se/jamfor/tyskland-vs-sverige
- https://importguiden.se/kalkylator/bilimport
- https://importguiden.se/regelandringar
