export type GuideCategory = "generell" | "bil" | "husbil";

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  time: string;
  category: GuideCategory;
}

/**
 * Single source of truth för guidernas metadata.
 * Används av /guider (hubben) och av guidesidornas fot (RelatedGuides).
 *
 * Ny guide: lägg till här OCH i GUIDE_SECTIONS nedan – annars renderas
 * guiden aldrig på hubben och blir en föräldralös sida.
 */
export const GUIDES: GuideMeta[] = [
  {
    slug: "ursprungskontroll",
    title: "Ursprungskontroll",
    description: "Obligatorisk kontroll via Transportstyrelsen. Hur du beställer och vad som händer sedan.",
    time: "4 min",
    category: "generell",
  },
  {
    slug: "registreringsbesiktning",
    title: "Registreringsbesiktning",
    description: "Vad kontrolleras, var du gör det och vad det kostar. Obligatoriskt för alla importerade fordon.",
    time: "5 min",
    category: "generell",
  },
  {
    slug: "coc-intyg",
    title: "COC-intyg",
    description: "Vad Certificate of Conformity är, varför det krävs och hur du skaffar det.",
    time: "4 min",
    category: "generell",
  },
  {
    slug: "eeg-intyg",
    title: "EEG-intyg vid bilimport",
    description: "När Transportstyrelsen kräver EEG-typintyg, hur du beställer det och vad det kostar (50–200 EUR).",
    time: "4 min",
    category: "generell",
  },
  {
    slug: "elbilspremie-importerad-bil",
    title: "Elbilspremie för importerad elbil",
    description: "Naturvårdsverket bekräftar att premien gäller lika vid privatimport. Villkoren, beloppet och vad som krävs.",
    time: "3 min",
    category: "bil",
  },
  {
    slug: "hur-lang-tid-tar-bilimport",
    title: "Hur lång tid tar det att importera bil?",
    description: "Realistisk tidslinje från sökning till svenska skyltar. Stegen du själv styr tar 2–6 veckor – plus kötiden för ursprungskontrollen.",
    time: "5 min",
    category: "generell",
  },
  {
    slug: "moms-vid-bilimport",
    title: "Moms vid bilimport",
    description: "När betalar du moms och när slipper du? EU:s regler om nytt vs begagnat fordon.",
    time: "5 min",
    category: "generell",
  },
  {
    slug: "besiktningsfel-vid-import",
    title: "Vanliga besiktningsfel vid bilimport",
    description: "De vanligaste orsakerna till att importerade bilar underkänns – COC, bromsar, däck, felkoder och husbilsspecifika fel.",
    time: "6 min",
    category: "generell",
  },
  {
    slug: "exportforsakring",
    title: "Exportförsäkring i Tyskland",
    description: "Vad en exportförsäkring (Ausfuhrkennzeichen) är, vad den kostar och när du behöver den för att köra hem bilen.",
    time: "5 min",
    category: "generell",
  },
  {
    slug: "importforsakring",
    title: "Importförsäkring bil – Tillfälligt trafikskydd i Sverige",
    description: "Vad en importförsäkring är, varför du behöver den, vad den kostar (~1 500 kr) och hur du tecknar den innan registreringsbesiktningen.",
    time: "4 min",
    category: "generell",
  },
  {
    slug: "kopa-bil-mobile-de-autoscout24",
    title: "Söka bil på mobile.de – guide på svenska",
    description: "Navigera sajten, filtrera rätt, kontakta säljare och undvik fallgropar. Komplett guide för svenska köpare.",
    time: "6 min",
    category: "bil",
  },
  {
    slug: "transportera-bil-fran-tyskland",
    title: "Transportera bil från Tyskland",
    description: "Köra hem själv, biltransport på trailer eller spedition? Kostnader, fördelar och nackdelar.",
    time: "6 min",
    category: "bil",
  },
  {
    slug: "importera-elbil",
    title: "Importera elbil – Tesla, BMW i4, VW ID m.fl.",
    description: "Vad skiljer elbilsimport? Batteristatus, momsregler och vad du bör kontrollera innan köp.",
    time: "7 min",
    category: "bil",
  },
  {
    slug: "fordonsskatt-husbil-bonus-malus",
    title: "Fordonsskatt och bonus-malus för husbilar 2026",
    description: "Lagändringen februari 2025 tog bort malus för husbilar. Vad gäller nu och vad innebär det för din importkalkyl?",
    time: "5 min",
    category: "husbil",
  },
  {
    slug: "besikta-husbil",
    title: "Besiktning av importerad husbil",
    description: "Fuktmätning, gaskontroll, körkortskrav och var du bokar. Vad som gäller och kostar för husbilsbesiktning.",
    time: "6 min",
    category: "husbil",
  },
  {
    slug: "kopa-husbil-mobil-de",
    title: "Söka husbil på mobile.de – guide på svenska",
    description: "Filtrera rätt märke och modell, tolka tyska annonser och undvik fallgropar. Komplett guide för svenska husbildsköpare.",
    time: "6 min",
    category: "husbil",
  },
];

export const CATEGORY_LABEL: Record<GuideCategory, string> = {
  generell: "Generell",
  bil: "Bil",
  husbil: "Husbil",
};

/**
 * Gruppering på /guider. Varje slug i GUIDES måste finnas i exakt en sektion.
 * Verifieras av assertAllGuidesInSection() nedan.
 */
export const GUIDE_SECTIONS: { title: string; slugs: string[] }[] = [
  {
    title: "Hitta fordonet",
    slugs: ["kopa-bil-mobile-de-autoscout24", "kopa-husbil-mobil-de"],
  },
  {
    title: "Köp och ta hem",
    slugs: ["exportforsakring", "importforsakring", "transportera-bil-fran-tyskland"],
  },
  {
    title: "Importprocessen i Sverige",
    slugs: [
      "ursprungskontroll",
      "registreringsbesiktning",
      "coc-intyg",
      "eeg-intyg",
      "besiktningsfel-vid-import",
    ],
  },
  {
    title: "Kostnader och skatt",
    slugs: [
      "moms-vid-bilimport",
      "fordonsskatt-husbil-bonus-malus",
      "elbilspremie-importerad-bil",
      "hur-lang-tid-tar-bilimport",
    ],
  },
  {
    title: "Specialguider",
    slugs: ["importera-elbil", "besikta-husbil"],
  },
];

/**
 * Relaterade guider som visas i foten på varje guidesida.
 * Ordningen speglar importprocessen – nästa naturliga steg först.
 */
export const RELATED_GUIDES: Record<string, string[]> = {
  ursprungskontroll: [
    "registreringsbesiktning",
    "hur-lang-tid-tar-bilimport",
    "coc-intyg",
  ],
  registreringsbesiktning: [
    "besiktningsfel-vid-import",
    "coc-intyg",
    "ursprungskontroll",
  ],
  "coc-intyg": ["eeg-intyg", "registreringsbesiktning", "ursprungskontroll"],
  "eeg-intyg": ["coc-intyg", "registreringsbesiktning", "besiktningsfel-vid-import"],
  "elbilspremie-importerad-bil": [
    "importera-elbil",
    "moms-vid-bilimport",
    "ursprungskontroll",
  ],
  "hur-lang-tid-tar-bilimport": [
    "ursprungskontroll",
    "transportera-bil-fran-tyskland",
    "registreringsbesiktning",
  ],
  "moms-vid-bilimport": [
    "ursprungskontroll",
    "hur-lang-tid-tar-bilimport",
    "kopa-bil-mobile-de-autoscout24",
  ],
  "besiktningsfel-vid-import": [
    "registreringsbesiktning",
    "coc-intyg",
    "besikta-husbil",
  ],
  exportforsakring: [
    "transportera-bil-fran-tyskland",
    "importforsakring",
    "hur-lang-tid-tar-bilimport",
  ],
  importforsakring: [
    "ursprungskontroll",
    "registreringsbesiktning",
    "exportforsakring",
  ],
  "kopa-bil-mobile-de-autoscout24": [
    "moms-vid-bilimport",
    "transportera-bil-fran-tyskland",
    "besiktningsfel-vid-import",
  ],
  "transportera-bil-fran-tyskland": [
    "exportforsakring",
    "importforsakring",
    "ursprungskontroll",
  ],
  "importera-elbil": [
    "elbilspremie-importerad-bil",
    "moms-vid-bilimport",
    "besiktningsfel-vid-import",
  ],
  "fordonsskatt-husbil-bonus-malus": [
    "besikta-husbil",
    "kopa-husbil-mobil-de",
    "moms-vid-bilimport",
  ],
  "besikta-husbil": [
    "besiktningsfel-vid-import",
    "fordonsskatt-husbil-bonus-malus",
    "ursprungskontroll",
  ],
  "kopa-husbil-mobil-de": [
    "besikta-husbil",
    "fordonsskatt-husbil-bonus-malus",
    "transportera-bil-fran-tyskland",
  ],
};

export function getGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getRelatedGuides(slug: string): GuideMeta[] {
  return (RELATED_GUIDES[slug] ?? [])
    .map(getGuide)
    .filter((g): g is GuideMeta => Boolean(g));
}

/**
 * Returnerar slugs som saknas i GUIDE_SECTIONS. Ska alltid vara tom –
 * en guide utanför sektionerna renderas aldrig på /guider och blir
 * föräldralös. Anropas av /guider i dev för att fånga misstaget tidigt.
 */
export function findGuidesMissingFromSections(): string[] {
  const inSections = new Set(GUIDE_SECTIONS.flatMap((s) => s.slugs));
  return GUIDES.filter((g) => !inSections.has(g.slug)).map((g) => g.slug);
}
