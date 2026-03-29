# TODO – Importguiden

_Senast uppdaterad: 2026-03-29 (2)_

---

## ✅ Klart sedan senast

- [x] Märkesspecifika importguider (bil) – BMW, Mercedes, VW, Audi, Porsche, Tesla
  - Rikt pSEO-innehåll med ADAC Pannenstatistik 2025, kända fel, rekommenderade modeller, dokument
  - Tesla-specifik sektion (SoH, laddkontakt, garanti, mjukvaruuppdateringar)
  - Alla 6 sidor satta till `indexable: true` i manifest
- [x] Märkesspecifika importguider (husbil) – Hymer, Dethleffs, Bürstner, Knaus, Hobby
  - Ducato-varning (49 pannen/1000 fordon) per märkessida
  - Chassiinfo, körkortsregler, kända fel (fukt, gas), dokument att begära
  - Alla 5 sidor satta till `indexable: true` i manifest
- [x] Internlänkar till märkesguider inlagda i:
  - `/importera-bil/tyskland` – ny sektion "Märkesspecifika guider" med alla 6 bilmärken
  - `/importera-husbil/tyskland` – ny sektion "Märkesspecifika husbilsguider" med alla 5 märken
  - Startsidan (`app/page.tsx`) – två nya kort i guider-griden
- [x] Enhetlig styling på guide-korten (startsidan) – kalkylator-kortet stack inte längre ut
- [x] Quality gate + indexering av 3 guider: `hur-lang-tid-tar-bilimport` (78), `transportera-bil-fran-tyskland` (80), `importera-elbil` (82)
- [x] Guide: `/guider/besikta-husbil` – fuktmätning, gaskontroll, körkortskrav (B/C1/C), kostnad, stationsbokning. Score 80, indexable: true.
- [x] Guidekort på alla märkessidor – ersätter länklista med kontextuella guidekort (2-kolumns-rutnät)
  - Bil (6 märken): 7 guidekort med märkesspecifika beskrivningar. Tesla + VW får extra elbilsguide.
  - Husbil (5 märken): 8 guidekort inkl. besikta-husbil och fordonsskatt-guide.
  - Varje kort: titel + beskrivning med märkesnamnet inbakat + "Läs guide →"

---

## 🔴 Prioriterat nu

### Innehåll – nästa guider
- [ ] Guide: `/guider/kopa-husbil-mobil-de` – söka husbilar på mobile.de/AutoScout24, filtrera rätt, vad man ska titta på (analogt med befintlig guide för personbil)
- [ ] Guide: `/guider/besiktningsfel-vid-import` – vanliga underkännandeorsaker, hög sökintent

---

## 🟡 Viktigt men ej akut

### Kalkylatorer & verktyg
- [ ] Bonus/malus-beräkning i kalkylatorn – mata in CO₂ (g/km) och få exakt årlig fordonsskatt
- [ ] "Är det lönsamt?"-verktyg – jämför tyskt annons-pris mot Blocket-snittpris för samma modell

### Guider – längre sikt
- [ ] Guide: Hur du kontrollerar en tysk bils historik (Carfax Europe, ADAC, KBA)
- [ ] Guide: Importera veteranbil/klassiker – egna tullregler, reducerad moms, annan besiktning
- [ ] Guide: `/jamfor/husbil-tyskland-vs-sverige` – prisjämförelse husbilar

---

## 🟢 Backlog (efter trafiktillväxt)

- [ ] Valutakursutveckling SEK/EUR – historisk graf, "är det rätt tid att importera nu?"
- [ ] Checklista som nedladdningsbar PDF – hög delbarhet, låg friktion
- [ ] Transportkostnadskalkylator – välj avstånd från tysk stad, få uppskattad kostnad
- [ ] Annons-parser – klistra in mobile.de-länk → prelberäkning i kalkylatorn (kräver scraper)
- [ ] Guide: Importera från Sverige till Norge – norsk trafik synlig i GSC
- [ ] Guide: Registrera svensk bil i Spanien
