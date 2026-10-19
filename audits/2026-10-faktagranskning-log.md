# Faktagranskning 2026-10-19

Körd av: Claude Code (Opus 5.5)
Uppdrag: Kontrollera att sajten är aktuell (nya regler, lagar, avgifter), rätta
allt som är fel, informera om budgetpropositionen 12 november och se till att
alla källänkar fungerar.

Branch: `fix/faktagranskning-2026-10` (ej pushad – main auto-deployar).

---

## Sakfel som rättades

| Fel | Rätt | Källa |
|---|---|---|
| Märkessidornas skattetabeller: "efter 3 år" 360 kr för alla bensinbilar | 360 + 22 kr/g över 111 g/km (t.ex. Tiguan ca 1 548 kr) | Skatteverket, tabell 72 |
| 14 av 36 tabellrader hade fel malusbelopp | Räknas nu av lib/malus-calculator.ts | Skatteverket, tabell 63/72 |
| Diesel-laddhybrid (C 300 de) 360 kr | ca 948 kr (miljö- + bränsletillägg) | Skatteverket, tabell 63 |
| Kalkylatorn: koldioxidbelopp efter malus saknades | Tillagt | Skatteverket |
| Kalkylatorn: alla husbilar 360 kr/år | 360 + 22 kr/g över 111 (+ dieseltillägg) | Skatteverket, tabell 63/72 |
| Husbilsskatt "viktbaserad" | CO₂-baserad för husbilar med CO₂-värde | Skatteverket |
| Gammal husbilsmalus 40 000–80 000 kr/år (280 g) | ca 30 200 kr/år | Skatteverket |
| Husbil-märkessidor: ordinarie skatt 2 000–4 000 kr/år (200 g diesel) | ca 5 270 kr/år | Skatteverket |
| Ausfuhrkennzeichen "röda skyltar" (12 ställen) | Vita med rött datumfält | FZV § 45, Anlage 4 |
| Exportskyltar giltiga 5–30 dagar, kan ej förlängas | Följer försäkringen, max 1 år | FZV § 45 |
| Trafikskadelag (1975:103) | SFS 1975:1410 | Riksdagen |
| Abmeldung hos KBA | Hos lokal Zulassungsstelle | – |
| Registreringsbesiktning: "behöver tillfälliga skyltar" | Sjudagarsregeln + kallelse-undantaget | Transportstyrelsen |

## Döda länkar som byttes

Transportstyrelsen `/sv/vagtrafik/Fordon/Importerade-fordon/…`,
`/fordonsagare/importera-fordon`, `/sv/vagtrafik/fordon/besiktning/`,
`/sv/vagtrafik/Fordon/fordonsimport/`; Skatteverket `importavfordon.4.html`
och `importeradbilfraneulandet.4.html`; Tullverket `fordon.4.html` (410 Gone);
Naturvårdsverkets bonus-malus-sida; ADAC export; TÜV Nord; trafikskadelagen.

Efter rättning: 58 externa URL:er kontrollerade. Alla svarar 200 utom eur-lex
(202), mobile.de och tullverket.se (403) – bot-skydd, sidorna finns.

`datasets/regulation-urls.json` pekade till stor del på 404-sidor, så
bevakningen kunde inte larma. Listan är omskriven (15 URL:er, alla levande).

## Kontrollerat – oförändrat

Ursprungskontroll 1 240 kr · godkännande 5 år · moms 6 mån/6 000 km, SKV 5282,
35 dagar · elbilspremie 46 800/32 400 kr, starttillägg 18 000/10 000 kr,
inkomstgränser, 64 800–450 000 kr · malussatser 75/107/132 · körkort 3 500 kg.

## Nytt

- Ruta "Bevakas" om budgetpropositionen för 2027 (senast 12 november 2026) på
  18 sidor + avsnitt "Bevakas just nu" på /regelandringar. Datadriven via
  `upcoming` i data/regulation-changes.json.
- Ny typ "Rättelse" i loggen – egna fel redovisas öppet.
- Kommande körkortsregler (4 250 kg, husbilar undantagna 2027-regeln).
- Elbilspremien och ny viktningsfaktor för laddhybrider i elbilsguiden.
- Svenska datum ("19 oktober 2026") i stället för ISO överallt (lib/date.ts).

## Ej verifierat

- Om malusens tre år räknas från första registrering i utlandet (sajten säger
  det; Transportstyrelsens formulering är tvetydig). Oförändrat.
- Exportförsäkringens prisnivåer (50–150 EUR) – nu märkta som ungefärliga.
- Registreringsbesiktningens pris – fortfarande schablon.
