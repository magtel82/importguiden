/**
 * Beräknar svensk fordonsskatt inklusive malus.
 *
 * Följer Skatteverkets fordonsskattetabeller (uppdaterade 2026-02-01):
 * - Tabell 72 (inte dieseldrivna) och tabell 63 (dieseldrivna) för personbil
 *   klass I och husbil (personbil klass II) som blivit skattepliktiga första
 *   gången 1 juli 2018 eller senare och är av fordonsår 2018 eller senare.
 *
 * Personbil klass I, skattepliktig första gången 1 juni 2022 eller senare:
 * - Grundbelopp 360 kr
 * - År 1–3 (malus): 107 kr/g över 75 g/km upp till 125 g, 132 kr/g över 125 g
 * - Från år 4: 22 kr/g över 111 g/km
 *
 * Husbil (personbil klass II) från 1 februari 2025: ingen malus, utan
 * 22 kr/g över 111 g/km från första året.
 *
 * Dieseldrivna (tabell 63): därtill miljötillägg 250 kr och bränsletillägg
 * 13,52 kr × hela koldioxidutsläppet – under och efter malusperioden.
 *
 * Dieseldrivna som blev skattepliktiga första gången FÖRE 1 juli 2018 (eller
 * har fordonsår före 2018) följer i stället tabell 62:
 * (360 + 22 kr/g över 111 g/km) × bränslefaktor 2,37 + miljötillägg 250 kr.
 * Ingen malus. Exempel, diesel 200 g/km: (360 + 1 958) × 2,37 + 250 ≈ 5 744 kr.
 * Samma husbil enligt tabell 63 ger ≈ 5 272 kr – båda stämmer, för olika
 * årgångar.
 *
 * "Skattepliktig första gången" = första registrering i världen för ett
 * importerat fordon (vägtrafikskattelagen 1 kap. 6 a §). Malusens tre år
 * räknas alltså från första registreringen utomlands.
 *
 * Gäller INTE dieselbilar skattepliktiga före 2008, husbilar före 2011 eller
 * husbilar som saknar koldioxidvärde och beskattas efter vikt. Kalkylatorn ska därför presentera resultatet som en
 * uppskattning och hänvisa till Transportstyrelsens uppgift för det enskilda
 * fordonet.
 *
 * Källor:
 * https://www.transportstyrelsen.se/sv/vagtrafik/fordon/skatter-och-avgifter/fordonsskatt/skattens-storlek/
 * https://www.transportstyrelsen.se/sv/vagtrafik/fordon/skatter-och-avgifter/malus/
 */

export type FuelType =
  | "bensin"
  | "diesel"
  | "elbil"
  | "laddhybrid-bensin"
  | "laddhybrid-diesel";

export interface MalusResult {
  /** Fordonsskatt per år just nu (inkl. malus om malusperioden pågår) */
  annualTax: number;
  /** Fordonsskatt per år efter malusperioden */
  annualTaxAfterMalus: number;
  /** Kvarvarande månader av malusperioden (0 om ingen malus) */
  malusMonthsRemaining: number;
  hasMalus: boolean;
  grundbelopp: number;
  /** Koldioxidbelopp under malusperioden (0 om ingen malus) */
  malusAmount: number;
  /** Koldioxidbelopp efter malusperioden (22 kr/g över 111 g/km) */
  co2AmountAfterMalus: number;
  /** Miljötillägg diesel (0 om ej diesel) */
  dieselTillagg: number;
  /** Bränsletillägg diesel (CO₂ × 13,52, 0 om ej diesel) */
  bransletillagg: number;
}

export const GRUNDBELOPP = 360;
const MALUS_LOWER = 75;               // g/km – malus från 76 g
const MALUS_UPPER = 125;              // g/km – högre sats däröver
const MALUS_RATE_TIER1 = 107;         // kr per gram, 76–125 g/km
const MALUS_RATE_TIER2 = 132;         // kr per gram, över 125 g/km
const MALUS_PERIOD_MONTHS = 36;       // år 1–3
const CO2_THRESHOLD = 111;            // g/km – ordinarie koldioxidbelopp däröver
const CO2_RATE = 22;                  // kr per gram över 111 g/km
const DIESEL_MILJO_TILLAGG = 250;     // kr/år
const DIESEL_BRANSLE_PER_CO2 = 13.52; // kr per g/km och år
const DIESEL_BRANSLEFAKTOR_PRE_2018 = 2.37; // tabell 62

export function malusAmountFor(co2gkm: number): number {
  if (co2gkm <= MALUS_LOWER) return 0;
  const tier1 = Math.min(co2gkm, MALUS_UPPER) - MALUS_LOWER;
  const tier2 = Math.max(0, co2gkm - MALUS_UPPER);
  return tier1 * MALUS_RATE_TIER1 + tier2 * MALUS_RATE_TIER2;
}

export function co2AmountFor(co2gkm: number): number {
  return Math.max(0, co2gkm - CO2_THRESHOLD) * CO2_RATE;
}

export function isDieselFuel(fuelType: FuelType): boolean {
  return fuelType === "diesel" || fuelType === "laddhybrid-diesel";
}

export interface MalusOptions {
  /**
   * Fordonet blev skattepliktigt första gången (registrerades första gången
   * någonstans) före 1 juli 2018, eller har fordonsår före 2018. Då gäller
   * tabell 62 för diesel och ingen malus.
   */
  firstTaxedBeforeJuly2018?: boolean;
}

export function calculateMalus(
  co2gkm: number,
  fuelType: FuelType,
  ageMonths: number,
  vehicleType: "personbil" | "husbil",
  options: MalusOptions = {}
): MalusResult {
  const co2 = fuelType === "elbil" ? 0 : Math.max(0, co2gkm);
  const diesel = isDieselFuel(fuelType);

  if (options.firstTaxedBeforeJuly2018) {
    const base = GRUNDBELOPP + co2AmountFor(co2);
    const annual = diesel
      ? Math.round(base * DIESEL_BRANSLEFAKTOR_PRE_2018 + DIESEL_MILJO_TILLAGG)
      : base;
    return {
      annualTax: annual,
      annualTaxAfterMalus: annual,
      malusMonthsRemaining: 0,
      hasMalus: false,
      grundbelopp: GRUNDBELOPP,
      malusAmount: 0,
      co2AmountAfterMalus: co2AmountFor(co2),
      dieselTillagg: diesel ? DIESEL_MILJO_TILLAGG : 0,
      bransletillagg: 0,
    };
  }

  const dieselTillagg = diesel ? DIESEL_MILJO_TILLAGG : 0;
  const bransletillagg = diesel ? Math.round(co2 * DIESEL_BRANSLE_PER_CO2) : 0;
  const co2AmountAfterMalus = co2AmountFor(co2);

  const annualTaxAfterMalus =
    GRUNDBELOPP + co2AmountAfterMalus + dieselTillagg + bransletillagg;

  // Husbilar har ingen malus sedan 1 februari 2025, och elbilar har inget
  // koldioxidutsläpp att beskatta.
  const malusMonthsRemaining =
    vehicleType === "husbil" ? 0 : Math.max(0, MALUS_PERIOD_MONTHS - ageMonths);
  const malusAmount = malusMonthsRemaining > 0 ? malusAmountFor(co2) : 0;
  const hasMalus = malusAmount > 0;

  const annualTax = hasMalus
    ? GRUNDBELOPP + malusAmount + dieselTillagg + bransletillagg
    : annualTaxAfterMalus;

  return {
    annualTax,
    annualTaxAfterMalus,
    malusMonthsRemaining: hasMalus ? malusMonthsRemaining : 0,
    hasMalus,
    grundbelopp: GRUNDBELOPP,
    malusAmount,
    co2AmountAfterMalus,
    dieselTillagg,
    bransletillagg,
  };
}
