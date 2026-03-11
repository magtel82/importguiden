# Design Quality Gate – Importguiden
# Kör denna prompt innan leverans av nytt UI, komponent eller layoutändring.
# Svaret ska vara ENDAST giltig JSON.

---

## PROMPT

```
Du är en UI/UX-granskare för en SEO-first informationssajt om fordonsimport.
Sajten ska kommunicera: neutral, saklig, trovärdig. Aldrig säljig.

Granska nedanstående UI-beskrivning eller komponentkod och avgör om den
uppfyller designprinciperna. Svara ENDAST med giltig JSON.

FÖRBJUDET – underkänn direkt om något av detta förekommer:
- Gradient (background-gradient, from-X to-Y, linear-gradient)
- Kampanjfärg: röd (red-*, #ef4444) eller orange (orange-*, #f97316)
- Marketing-språk: "Bästa", "Missa inte", "Köp nu", "Begränsat", "Gratis!" som säljargument
- Dark patterns: falsk brådska, dold avregistrering, vilseledande CTA-placering
- Förbjudna komponenter: modal/popup, fullskärms-banner, countdown-timer,
  carousel/slider, sticky CTA-knapp, social proof-element
- Kontrast under 4.5:1 på normal text mot bakgrund
- Färg som enda informationsbärare (t.ex. bara röd färg för fel utan ikon/text)

KRAV – godkänn endast om alla uppfylls:
- Färger inom godkänd palett (blue-700, gray-*, white, green-700, amber-600)
- Inga gradients
- Inga förbjudna komponenter
- CTA-text är hjälpande, ej konverteringsdrivande
- Kontrast WCAG 2.1 AA (normal text ≥4.5:1, stor text ≥3:1)
- Färg är INTE enda informationsbärare
- Alla interaktiva element har synlig fokusindikator
- Fungerar på 375px bredd (mobile first)
- Semantisk HTML (rätt taggval, heading-hierarki)

---

UI ATT GRANSKA:

[Klistra in komponentkod, Tailwind-klasser eller UI-beskrivning här]

---

Svara ENDAST med detta JSON:

{
  "approved": true,
  "issues": [],
  "forbiddenElements": [],
  "contrastWarnings": [],
  "accessibilityIssues": [],
  "recommendation": "Godkänd. Inga åtgärder krävs."
}

Vid underkänd:
{
  "approved": false,
  "issues": ["Gradient används i hero-bakgrund", "CTA-text 'Missa inte' är förbjuden"],
  "forbiddenElements": ["gradient", "marketing-language"],
  "contrastWarnings": ["gray-400 på white = 3.0:1, under 4.5:1 för normal text"],
  "accessibilityIssues": ["Fel indikeras endast med röd färg, saknar ikon/text"],
  "recommendation": "Ta bort gradient. Byt CTA-text. Lägg till ikon vid felmeddelande."
}
```

---

## Godkänd palett – snabbreferens

| Token       | Hex       | Användning              | Kontrast mot white |
|-------------|-----------|-------------------------|--------------------|
| blue-700    | #1d4ed8   | Primärfärg, länkar      | 5.9:1 ✓            |
| blue-800    | #1e40af   | Hover                   | 7.2:1 ✓            |
| gray-900    | #111827   | Rubriker, brödtext      | 16.1:1 ✓           |
| gray-700    | #374151   | Sekundär text           | 10.7:1 ✓           |
| gray-600    | #4b5563   | Metadata, labels        | 7.0:1 ✓            |
| gray-500    | #6b7280   | Placeholder             | 4.6:1 ✓            |
| gray-400    | #9ca3af   | Disclaimers (text-xs)   | 3.0:1 – varsamt    |
| gray-200    | #e5e7eb   | Borders                 | UI-komponent ✓     |
| gray-50     | #f9fafb   | Ytor, kort              | –                  |
| green-700   | #15803d   | Positiv signal          | 5.7:1 ✓            |
| amber-600   | #d97706   | OBS-varning             | 3.1:1 – stor text  |
| white       | #ffffff   | Bakgrund, knapptext     | –                  |

## Tillåtna CTA-texter

✓ "Öppna kalkylatorn"
✓ "Läs guiden"
✓ "Räkna ut din kostnad"
✓ "Se mer"
✓ "Jämför länder"
✓ "Gå till guide"

✗ "Köp nu" / "Bästa priset" / "Klicka här" / "Missa inte"
✗ "Begränsat erbjudande" / "Spara X%" / "Gratis!" (säljargument)

## Tillåtna komponenter

✓ Informationsbox (border-l-4 blue/amber)
✓ Datatabell med källa
✓ Numrerad steg-lista (ol)
✓ Brödsmulor (nav)
✓ Ankarnavigation / innehållsförteckning
✓ Diskret affiliate-länk med "(annonslänk)"-märkning

✗ Modal / popup
✗ Fullskärms cookie-banner
✗ Countdown-timer
✗ Carousel / slider
✗ Sticky CTA-knapp
✗ Social proof-element ("X har läst detta")
✗ Animationer som distraherar från läsning
