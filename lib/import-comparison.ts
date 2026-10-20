/**
 * Jämförelse "göra importen själv" mot "anlita importfirma".
 *
 * Bara poster som firmans källa uttryckligen säger ingår i arvodet jämförs
 * (data/cost-data.json → comparisons.*.coverage.includedItems). Fordonspris,
 * moms, tull och fordonsskatt betalas lika i båda fallen och är inte ens
 * parametrar här. Poster som källan inte nämner (skyltar, försäkring)
 * jämförs inte – de redovisas separat på sidan.
 */

export type ComparedItem = "ursprungskontroll" | "registreringsbesiktning" | "transport";

export interface ImportComparison {
  /** Summan av de jämförda posterna när du gör importen själv. */
  self: number;
  /** Firmans arvode (inkl. moms) – täcker de jämförda posterna enligt källan. */
  firm: number;
  /** Hur mycket mer firman kostar (negativt = firman är billigare). */
  diff: number;
}

export function compareSelfVsFirm(
  costs: Record<ComparedItem, number>,
  firmFee: number,
  included: string[]
): ImportComparison {
  const items = Object.keys(costs) as ComparedItem[];
  const self = items.reduce((s, k) => s + costs[k], 0);
  // Poster firman inte täcker får firman betala ovanpå arvodet.
  const firm = firmFee + items.filter((k) => !included.includes(k)).reduce((s, k) => s + costs[k], 0);
  return { self, firm, diff: firm - self };
}

/** Kalkylatorns hela uppställning – inklusive poster som INTE ska jämföras. */
export interface CalculatorBreakdown {
  vehiclePriceSEK: number;
  moms: number;
  tull: number;
  ursprungskontroll: number;
  registreringsbesiktning: number;
  skyltavgift: number;
  importforsakring: number;
  transport: number;
}

/**
 * Jämförelsen utifrån kalkylatorns resultat. Fordonspris, moms, tull, skyltar
 * och försäkring plockas bort här.
 */
export function comparisonFromBreakdown(
  b: CalculatorBreakdown,
  firmFee: number,
  included: string[]
): ImportComparison {
  return compareSelfVsFirm(
    {
      ursprungskontroll: b.ursprungskontroll,
      registreringsbesiktning: b.registreringsbesiktning,
      transport: b.transport,
    },
    firmFee,
    included
  );
}
