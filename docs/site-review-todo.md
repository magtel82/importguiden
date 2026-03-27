# Sajt-genomlysning – Åtgärdslista (2026-03-27)

Baserad på fullständig genomgång av alla sidor, komponenter och innehåll.

---

## SNABBVINSTER (< 5 min per punkt)

- [x] **SV1** Fixa stavfel "fordonsimp" → "fordonsimport" i `/finansiering` (`app/finansiering/page.tsx:38`)
- [x] **SV2** Uppdatera `dateUpdated` i bilguiden till 2026-03-27 (`content/importera-bil/tyskland.mdx:4`)
- [x] **SV3** Uppdatera `dateUpdated` i husbilsguiden till 2026-03-27 (`content/importera-husbil/tyskland.mdx:4`)
- [x] **SV4** Lägg till mobile.de-guiden i footerns guide-kolumn (`components/layout/Footer.tsx`)
- [x] **SV5** Lägg till länk till `/importera-bil/kostnad` i bilguiden (`content/importera-bil/tyskland.mdx`)
- [x] **SV6** Lägg till länk till `/importera-husbil/kostnad` i husbilsguiden (`content/importera-husbil/tyskland.mdx`)
- [x] **SV7** Ändra en av hero-knapparna till sekundär stil (`app/page.tsx:82-88`)
- [x] **SV8** Lägg till `aria-label="Välj fordonstyp"` på ProcessSteps tab-wrapper (`components/ProcessSteps.tsx`)

---

## KRITISKA PROBLEM

- [x] **K1** Startsidan har två identiska primär-CTA:er – bryter mot designregel "max en primär CTA per viewport" (`app/page.tsx:76-88`)
- [x] **K2** Kostnadsöversikten på startsidan visar enbart bil – husbilsbesökare ignoreras. Lösning: ny CostOverview-komponent med egna bil/husbil-tabbar.
- [x] **K3** `dateUpdated` på bilguiden är 2026-03-11 trots att filen ändrats 2026-03-27 (`content/importera-bil/tyskland.mdx:4`)
- [x] **K4** Stavfel "fordonsimp" på finansieringssidan (`app/finansiering/page.tsx:38`)

*OBS: K3 = SV2, K4 = SV1 – dubbletter löses av snabbvinsterna.*

---

## FÖRBÄTTRINGSMÖJLIGHETER

### Hög effekt
- [x] **F1** Lägg till innehållsförteckning (ToC) med ankarlänkar på alla MDX-guider – minskar bounce rate, möjliggör Google sitelinks
- [x] **F2** Lägg till "Nästa steg"-ruta under kalkylatorns resultat med länk till relevant guide (bil eller husbil beroende på val)
- [x] **F3** Förstärk Om oss-sidan med E-E-A-T-signaler – vem driver sajten, varför, vilken erfarenhet
- [x] **F4** Guidernas hubsida (`/guider`) – lägg till sektion ovanför listan som lyfter flagskeppsguiderna (bil/husbil Tyskland)

### Medium effekt
- [x] **F5** Footern – lägg till mobile.de-guiden och kostnadssidorna i guide-kolumnen (gjort via SV4)
- [ ] **F6** Kontaktsidan – lägg till breadcrumbs (saknas, inkonsekvent med resten av sajten)
- [ ] **F7** Internlänkningsbrister i MDX-guider:
  - [ ] F7a: `registreringsbesiktning.mdx` – lägg till länk till mobile.de-guiden
  - [ ] F7b: `fordonsskatt-husbil-bonus-malus.mdx` – lägg till länk till mobile.de-guiden
  - [x] F7c: `tyskland.mdx` (bil) – lägg till länk till `/importera-bil/kostnad` (gjort via SV5)
  - [x] F7d: `tyskland.mdx` (husbil) – lägg till länk till `/importera-husbil/kostnad` (gjort via SV6)
- [ ] **F8** Kalkylatorn – förklara ålder/km-fälten (styr momsberäkning 6 mån / 6 000 km-regeln)
- [ ] **F9** Kalkylatorn – förklara besparingsfältet ("Jämförpris i Sverige")

### Lägre effekt
- [ ] **F10** Startsida – ge kalkylatorn visuell prioritet i guider-gridet (distinkt bakgrund/ikon)
- [ ] **F11** Checklistan i bil-/husbilsguiden (- [ ]) renderas som icke-interaktiva checkboxar – byt till numrerad lista eller gör dem interaktiva
- [ ] **F12** Guider-hubsidan – ändra ordningen så mobile.de-guiden hamnar högre (nybörjarvänligt)

---

## INNEHÅLLSLUCKOR (nya sidor att bygga)

- [ ] **IL1** "Hur länge tar det att importera bil?" – helhetstidslinje (6–8 veckor typiskt). Kan vara FAQ på startsidan eller egen kort guide.
- [ ] **IL2** Guide om transport (`/guider/transportera-bil`) – egenköra vs trailer vs biltransport, praktiska tips
- [ ] **IL3** Guide om elbilsimport (`/guider/importera-elbil`) – Tesla, batteristatus, laddinfrastruktur
- [ ] **IL4** "Ny här?"-flöde – CTA på startsidan som leder förstagångsimportörer till rätt startpunkt

---

## GRAFIK OCH DESIGN

- [ ] **G1** Startsida: dubbla primärknappar → en primär + en sekundär (kopplat till K1/SV7)
- [ ] **G2** Startsida: kostnadsöversikten bör ha husbilsvariant (kopplat till K2)
- [ ] **G3** Guider-gridet på startsidan – alla kort ser identiska ut, kalkylatorn borde sticka ut

---

*Prioriteringsordning: Snabbvinster → Kritiska problem → Förbättringar (hög) → Förbättringar (medium) → Innehållsluckor*
