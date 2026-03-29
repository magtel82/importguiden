# TODO – Importguiden

## Innehåll & funktioner att bygga (prioritetsordning öppen)

### Kalkylatorer & verktyg
- [ ] Bygg ut importkalkylatorn med bonus/malus-beräkning – mata in CO₂ (g/km) och få exakt årlig fordonsskatt i Sverige
- [ ] Transportkostnadskalkylator – användaren väljer avstånd från tysk stad och får uppskattad transportkostnad
- [ ] "Är det lönsamt?"-verktyg – jämför tyskt annons-pris mot Blocket-snittpris för samma modell

### Guider
- [ ] Guide: Hur du kontrollerar en tysk bils historik (Carfax Europe, ADAC, KBA) – saknas hos alla konkurrenter
- [ ] Guide: Importera veteranbil/klassiker från Tyskland – egna tullregler, reducerad moms, annan besiktning
- [ ] Guide: Importera elbil fördjupad – batteristatus, garantier, laddkontakter, momsregler
- [ ] Guide: Registrera svensk bil i Spanien – process, kostnader, spanska myndigheter
- [ ] Guide: Importera från Sverige till Norge – dansk/norsk trafik redan synlig i Search Console

### Märkesspecifika importguider (pSEO) – med ADAC-data
- [ ] Bygg pSEO-struktur för märkesguider: "Importera [märke] från Tyskland"
  - Prioriterade märken baserat på sökdata: BMW, Mercedes, VW, Audi, Porsche
  - Varje guide ska innehålla:
    - Varför köpa detta märke från Tyskland (pris vs Sverige)
    - Rekommenderade modeller och årsmodeller att söka efter
    - Kända fel och vad man ska kontrollera – källhänvisat till ADAC Pannenstatistik
    - Prisintervall tyska marknaden vs Blocket
    - Specifika dokument att begära vid köp
  - Datakälla: ADAC Pannenstatistik 2025 (PDF: assets.adac.de)
  - Bygg som pSEO med JSON-dataset för märken

### ADAC-data att lyfta fram per märke (från Pannenstatistik 2025)
- [ ] BMW: 3er, 4er, X3, 5er, X5 – alla högt rankade, lyft fram som tryggt köp
- [ ] Audi: A3, A4, A5, Q2, Q3, Q4 e-tron – mycket pålitliga
- [ ] VW: Golf, Passat, Tiguan, ID.4 – pålitliga, bred tillgång
- [ ] Mercedes: A och B-klass mycket bra, men Citan har problem i alla åldersklasser
- [ ] Fiat Ducato (husbilschassi!): SÄMST i hela statistiken – 49 pannen/1000 fordon → hanteras i märkesspecifika husbilsguider

### Märkesspecifika importguider (husbil) – pSEO
- [ ] Bygg märkesguider för husbil: "Importera [märke] husbil från Tyskland"
  - Prioriterade märken: Hymer, Dethleffs, Bürstner, Knaus, Hobby
  - Varje guide ska innehålla:
    - Märkesspecifika modeller och vad som skiljer dem åt
    - Chassiinformation (Ducato, Sprinter, Crafter) med pålitlighetsdata från ADAC
    - **Ducato-varning direkt i guiden för Hymer/Dethleffs/Bürstner** – 49 pannen/1000 fordon, sämst i hela ADAC-statistiken, årsmodeller att undvika – ingen svensk sajt har denna info
    - Den generella husbilsguiden (/importera-husbil/tyskland) får en kort mening: "De flesta husbilar i mellanklass och premium bygger på Fiat Ducato-chassit. Läs den märkesspecifika guiden för vad du bör kontrollera." – ger internlänk utan att stoppa in teknisk data på fel ställe
    - Prisintervall tyska marknaden vs Sverige
    - Vad man ska kontrollera vid besiktning av just detta märke

### Övrigt
- [ ] Valutakursutveckling SEK/EUR – historisk graf, "är det rätt tid att importera nu?"
- [ ] Checklista som nedladdningsbar PDF – hög delbarhet, låg friktion
