# TODO – Importguiden

_Senast uppdaterad: 2026-03-29_

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

---

## 🔴 Prioriterat nu

### Innehåll – nästa guider att skriva
- [ ] Guide: `/guider/besikta-husbil` – specifikt för husbilar, skiljer sig från personbil (nämns i CLAUDE.md som prio)
- [ ] Guide: `/guider/kopa-husbil-mobil-de` – plattsajter för husbilar i Tyskland (analogt med befintlig mobile.de-guide för bil)
- [ ] Guide: `/guider/besiktningsfel-vid-import` – vanliga underkännandeorsaker, hög sökintent

### Quality gate / indexering
- [ ] Kör quality gate på de 3 nybyggda guiderna som fortfarande är `noindex`:
  - `/guider/hur-lang-tid-tar-bilimport`
  - `/guider/transportera-bil-fran-tyskland`
  - `/guider/importera-elbil`
  - Sätt `indexable: true` om score ≥ 75

### Internlänkning
- [ ] Lägg till länk till relevanta märkessidor från kalkylatorn (efter beräkning – "Läs om att importera [märke]")
- [ ] Lägg till internlänkar från märkessidorna till relevanta guider (t.ex. bil/bmw → coc-intyg, registreringsbesiktning)

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
