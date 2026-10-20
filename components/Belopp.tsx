import {
  formatCost,
  formatKr,
  formatNumber,
  getCost,
  costSourceLine,
  eurRateLine,
  sekRange,
  skyltavgiftKr,
  feeTotal,
  formatSekRange,
  exportKostnad,
  FORDONSSKATT,
  formatSats,
  MOMS_PROCENT,
  type CostId,
} from "@/lib/costs";
import { calculateMalus, type FuelType } from "@/lib/malus-calculator";

/**
 * Belopp i sidtext hämtas ALLTID härifrån – aldrig hårdkodat i MDX/TSX.
 * Alla komponenter läser data/cost-data.json via lib/costs.ts.
 */

/** <Belopp id="ursprungskontroll" /> → beloppet formaterat i kronor. Med `kalla` läggs källan till. */
export function Belopp({ id, kalla = false }: { id: CostId; kalla?: boolean }) {
  const c = getCost(id);
  return (
    <>
      {formatCost(id)}
      {kalla ? (
        <>
          {" "}
          (<em>
            källa:{" "}
            <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
              {costSourceLine(id)}
            </a>
          </em>
          )
        </>
      ) : null}
    </>
  );
}

/** Summan av flera poster i kronor, som intervall om någon post är ett intervall. */
export function Summa({ ids: raw }: { ids: string }) {
  // MDX tillåter inga JS-uttryck i props – id:n anges kommaseparerade.
  const ids = raw.split(",").map((x) => x.trim()) as CostId[];
  const min = ids.reduce((s, id) => s + sekRange(id).min, 0);
  const max = ids.reduce((s, id) => s + sekRange(id).max, 0);
  return <>{min === max ? formatKr(min) : `${formatNumber(min)}–${formatKr(max)}`}</>;
}

export function Skyltavgift() {
  return <>{formatKr(skyltavgiftKr())}</>;
}

/** Summan av de fasta avgifterna för bil eller husbil. */
export function FastaAvgifter({ fordon }: { fordon: "bil" | "husbil" }) {
  return <>{formatSekRange(feeTotal(fordon))}</>;
}

/** Exportskyltar + exportförsäkring, omräknat till kronor. */
export function Exportkostnad() {
  return <>{formatSekRange(exportKostnad())}</>;
}

type SatsId = keyof typeof FORDONSSKATT;

/** Skattesats ur Skatteverkets tabeller: <Sats id="grundbelopp" /> → grundbeloppet i kronor. */
export function Sats({ id }: { id: SatsId }) {
  const v = FORDONSSKATT[id];
  if (typeof v !== "number") return null;
  return <>{formatSats(id, v)}</>;
}

/**
 * Årlig fordonsskatt räknad med samma funktion som kalkylatorn.
 * del="nu" = år 1–3 (med malus om sådan finns), del="efter" = från år 4.
 */
export function Skatt({
  co2,
  bransle,
  fordon = "personbil",
  del = "nu",
  fore2018 = false,
}: {
  co2: number | string;
  bransle: FuelType;
  fordon?: "personbil" | "husbil";
  del?: "nu" | "efter";
  fore2018?: boolean;
}) {
  const r = calculateMalus(Number(co2), bransle, 0, fordon, { firstTaxedBeforeJuly2018: Boolean(fore2018) });
  return <>{formatKr(del === "nu" ? r.annualTax : r.annualTaxAfterMalus)}</>;
}

/** Skillnaden mellan två poster i kronor: <Skillnad fran="elbilspremie" till="elbilspremie_sen" />. */
export function Skillnad({ fran, till }: { fran: CostId; till: CostId }) {
  return <>{formatKr(Math.abs(sekRange(fran).min - sekRange(till).min))}</>;
}

/** Svensk momssats ur datafilen (Skatteverket). */
export function Momssats() {
  return <>{MOMS_PROCENT}</>;
}

/** EUR-kursen med källa och datum ur datafilen. */
export function EurKurs() {
  return <>{eurRateLine()}</>;
}

export const BELOPP_MDX_COMPONENTS = { Belopp, Summa, Skyltavgift, FastaAvgifter, Exportkostnad, Sats, Skatt, Skillnad, EurKurs, Momssats };
