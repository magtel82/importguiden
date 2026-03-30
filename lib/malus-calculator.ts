/**
 * Beräknar svensk fordonsskatt inklusive malus.
 *
 * Regler för fordon tagna i trafik 1 juni 2022 eller senare:
 * - Grundbelopp: 360 kr/år
 * - Malus gäller i 36 månader från FÖRSTA registrering (i världen)
 * - Malus gäller ej husbilar (undantagna sedan februari 2025)
 * - Malus gäller ej elbilar (0 g/km)
 * - Diesel: miljötillägg 250 kr/år + bränsletillägg (CO₂ × 13,52 kr/år)
 *
 * Källor: Transportstyrelsen, Skatteverket
 */

export type FuelType =
  | "bensin"
  | "diesel"
  | "elbil"
  | "laddhybrid-bensin"
  | "laddhybrid-diesel";

export interface MalusResult {
  /** Fordonsskatt per år inkl. malus (om malus kvarstår) */
  annualTax: number;
  /** Fordonsskatt per år efter malusperioden (grundbelopp + eventuellt diesel-tillägg) */
  annualTaxAfterMalus: number;
  /** Kvarvarande månader av malusperioden (0 om ingen malus) */
  malusMonthsRemaining: number;
  hasMalus: boolean;
  grundbelopp: number;
  /** Årsmalus baserat på CO₂ (0 om ingen malus) */
  malusAmount: number;
  /** Dieselmiljötillägg (0 om ej diesel) */
  dieselTillagg: number;
  /** Bränsletillägg diesel (CO₂ × 13,52, 0 om ej diesel) */
  bransletillagg: number;
}

const GRUNDBELOPP = 360;
const MALUS_CO2_THRESHOLD = 75;       // g/km — malus börjar däröver
const MALUS_RATE_TIER1 = 107;         // kr per gram, 76–125 g/km
const MALUS_RATE_TIER2 = 132;         // kr per gram, >125 g/km
const MALUS_PERIOD_MONTHS = 36;       // 3 år från första registrering
const DIESEL_MILJO_TILLAGG = 250;     // kr/år
const DIESEL_BRANSLE_PER_CO2 = 13.52; // kr/(g/km)/år

export function calculateMalus(
  co2gkm: number,
  fuelType: FuelType,
  ageMonths: number,
  vehicleType: "personbil" | "husbil"
): MalusResult {
  // Husbilar: undantagna från malus sedan februari 2025
  if (vehicleType === "husbil") {
    return {
      annualTax: GRUNDBELOPP,
      annualTaxAfterMalus: GRUNDBELOPP,
      malusMonthsRemaining: 0,
      hasMalus: false,
      grundbelopp: GRUNDBELOPP,
      malusAmount: 0,
      dieselTillagg: 0,
      bransletillagg: 0,
    };
  }

  // Elbilar: 0 g/km, ingen malus
  if (fuelType === "elbil" || co2gkm === 0) {
    return {
      annualTax: GRUNDBELOPP,
      annualTaxAfterMalus: GRUNDBELOPP,
      malusMonthsRemaining: 0,
      hasMalus: false,
      grundbelopp: GRUNDBELOPP,
      malusAmount: 0,
      dieselTillagg: 0,
      bransletillagg: 0,
    };
  }

  // Diesel-tillägg
  const isDiesel =
    fuelType === "diesel" || fuelType === "laddhybrid-diesel";
  const dieselTillagg = isDiesel ? DIESEL_MILJO_TILLAGG : 0;
  const bransletillagg = isDiesel ? co2gkm * DIESEL_BRANSLE_PER_CO2 : 0;

  // Malus-beräkning (bara om CO₂ > 75 g/km och ej slutat)
  const malusMonthsRemaining = Math.max(0, MALUS_PERIOD_MONTHS - ageMonths);
  const hasMalus = malusMonthsRemaining > 0 && co2gkm > MALUS_CO2_THRESHOLD;

  let malusAmount = 0;
  if (hasMalus) {
    const overTier1 = Math.min(co2gkm, 125) - MALUS_CO2_THRESHOLD; // gram 76–125
    const overTier2 = Math.max(0, co2gkm - 125);                    // gram >125
    malusAmount = overTier1 * MALUS_RATE_TIER1 + overTier2 * MALUS_RATE_TIER2;
  }

  const annualTaxAfterMalus =
    GRUNDBELOPP + dieselTillagg + bransletillagg;
  const annualTax = hasMalus
    ? GRUNDBELOPP + malusAmount + dieselTillagg + bransletillagg
    : annualTaxAfterMalus;

  return {
    annualTax,
    annualTaxAfterMalus,
    malusMonthsRemaining,
    hasMalus,
    grundbelopp: GRUNDBELOPP,
    malusAmount,
    dieselTillagg,
    bransletillagg,
  };
}
