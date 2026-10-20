/**
 * Jämförelse "göra importen själv" mot "anlita importfirma".
 *
 * Bara det som SKILJER mellan alternativen jämförs. Fordonspris, moms, tull
 * och fordonsskatt är desamma oavsett vem som gör importen och är därför
 * inte ens parametrar här – de kan inte påverka differensen.
 *
 * Vad firmans arvode täcker är inte verifierat (se importfirma-posterna i
 * datasets/import-costs.json). I stället för att anta något redovisas
 * differensen som ett intervall:
 * - firman täcker alla poster  → firmans kostnad = arvodet
 * - firman täcker ingen post   → firmans kostnad = arvodet + alla poster
 */

export interface SelfImportCosts {
  ursprungskontroll: number;
  registreringsbesiktning: number;
  skyltavgift: number;
  importforsakring: number;
  transport: number;
}

export interface ImportComparison {
  /** Summan av posterna när du gör importen själv. */
  self: number;
  /** Firmans kostnad om arvodet täcker alla poster. */
  firmMin: number;
  /** Firmans kostnad om arvodet inte täcker någon av posterna. */
  firmMax: number;
  /** Hur mycket mer firman kostar (negativt = firman är billigare), lägst och högst. */
  diffMin: number;
  diffMax: number;
}

export function compareSelfVsFirm(costs: SelfImportCosts, firmFee: number): ImportComparison {
  const self =
    costs.ursprungskontroll +
    costs.registreringsbesiktning +
    costs.skyltavgift +
    costs.importforsakring +
    costs.transport;
  const firmMin = firmFee;
  const firmMax = firmFee + self;
  return { self, firmMin, firmMax, diffMin: firmMin - self, diffMax: firmMax - self };
}

/** Kalkylatorns hela uppställning – inklusive poster som INTE ska jämföras. */
export interface CalculatorBreakdown extends SelfImportCosts {
  vehiclePriceSEK: number;
  moms: number;
  tull: number;
}

/**
 * Jämförelsen utifrån kalkylatorns resultat. Fordonspris, moms och tull plockas
 * bort här, eftersom de betalas lika oavsett vem som gör importen.
 */
export function comparisonFromBreakdown(b: CalculatorBreakdown, firmFee: number): ImportComparison {
  return compareSelfVsFirm(
    {
      ursprungskontroll: b.ursprungskontroll,
      registreringsbesiktning: b.registreringsbesiktning,
      skyltavgift: b.skyltavgift,
      importforsakring: b.importforsakring,
      transport: b.transport,
    },
    firmFee
  );
}
