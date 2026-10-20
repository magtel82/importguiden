import data from "../data/cost-data.json" with { type: "json" };

/**
 * Läser och formaterar belopp ur data/cost-data.json – sajtens enda källa
 * för belopp. Inga sidor ska skriva egna kronbelopp (se lib/belopp.test.mjs).
 */

export type CostType = "officiell" | "marknadspris" | "schablon";

export interface CostItem {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  currency: "SEK" | "EUR";
  type: CostType;
  source: string;
  sourceUrl: string;
  sourceUrls?: string[];
  checked: string;
  note?: string;
  metod?: string;
}

export const COSTS = data.costs as unknown as Record<string, CostItem>;
export type CostId = keyof typeof data.costs;

export const EUR_SEK = data.exchangeRates.EUR.sek;
export const EUR_RATE = data.exchangeRates.EUR;

/** Reservkurser (SEK per enhet) om kalkylatorns livekurs inte går att hämta. */
export const FALLBACK_SEK_RATES: Record<string, number> = {
  EUR: data.exchangeRates.EUR.sek,
  USD: data.exchangeRates.USD.sek,
  GBP: data.exchangeRates.GBP.sek,
  SEK: 1,
};
export const FORDONSSKATT = data.fordonsskatt;
export const MOMS = data.tax;
export const COST_DATA_UPDATED = data._updated;

/** Ingen tull vid import inom EU (Tullverket). */
export const TULL_EU = formatKr(0);

export function getCost(id: CostId): CostItem {
  const item = COSTS[id];
  if (!item) throw new Error(`Okänd kostnadspost: ${id}`);
  return item;
}

/** Heltal med svensk tusenavgränsning (vanligt mellanslag, inte NBSP). */
export function formatNumber(n: number, decimals = 0): string {
  const fixed = n.toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return frac ? `${grouped},${frac}` : grouped;
}

export function formatKr(n: number): string {
  return `${formatNumber(Math.round(n))} kr`;
}

/** Avrundar ett omräknat belopp till närmaste tiotal kronor. */
export function eurToSek(eur: number): number {
  return Math.round((eur * EUR_SEK) / 10) * 10;
}

function formatEur(n: number): string {
  return `${formatNumber(n, Number.isInteger(n) ? 0 : 2)} EUR`;
}

/** Lägsta, högsta och mittvärde i kronor (EUR räknas om). */
export function sekRange(id: CostId): { min: number; max: number; mid: number } {
  const c = getCost(id);
  const conv = (n: number) => (c.currency === "EUR" ? eurToSek(n) : n);
  const min = conv(c.value ?? c.min ?? 0);
  const max = conv(c.value ?? c.max ?? 0);
  return { min, max, mid: Math.round((min + max) / 2) };
}

/** "1 240 kr", "2 500–3 500 kr" eller "79 EUR (ca 880 kr)". */
export function formatCost(id: CostId): string {
  const c = getCost(id);
  if (c.currency === "SEK") {
    return c.value !== undefined
      ? formatKr(c.value)
      : `${formatNumber(c.min!)}–${formatKr(c.max!)}`;
  }
  const eur =
    c.value !== undefined ? formatEur(c.value) : `${formatNumber(c.min!)}–${formatEur(c.max!)}`;
  const { min, max } = sekRange(id);
  const sek = min === max ? formatKr(min) : `${formatNumber(min)}–${formatKr(max)}`;
  return `${eur} (ca ${sek})`;
}

const MONTHS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

function dateSv(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

/** "If – …, kontrollerat 19 oktober 2026" */
export function costSourceLine(id: CostId): string {
  const c = getCost(id);
  return `${c.source}, kontrollerat ${dateSv(c.checked)}`;
}

/** Text för EUR-kursen: "1 EUR = 11,10 kr (ECB, 19 oktober 2026)". */
export function eurRateLine(): string {
  return `1 EUR = ${formatNumber(EUR_SEK, 2)} kr (ECB, ${dateSv(EUR_RATE.date)})`;
}

// ── Fasta avgifter per fordonstyp ────────────────────────────────────────────

export interface FeeRow {
  id: string;
  label: string;
  min: number;
  max: number;
  type: CostType;
  source: string;
  sourceUrl: string;
  checked: string;
  note?: string;
}

function rowFor(id: CostId, label?: string): FeeRow {
  const c = getCost(id);
  const { min, max } = sekRange(id);
  return {
    id,
    label: label ?? c.label,
    min,
    max,
    type: c.type,
    source: c.source,
    sourceUrl: c.sourceUrl,
    checked: c.checked,
    note: c.note,
  };
}

/** Två registreringsskyltar plus vägtrafikregisteravgiften (första året). */
export function skyltavgiftKr(): number {
  return 2 * (getCost("registreringsskylt").value ?? 0) + (getCost("vagtrafikregisteravgift").value ?? 0);
}

function skyltRow(): FeeRow {
  const s = getCost("registreringsskylt");
  const v = skyltavgiftKr();
  return {
    id: "skyltavgift",
    label: "Registreringsskyltar (2 st) och vägtrafikregisteravgift",
    min: v,
    max: v,
    type: "officiell",
    source: "Transportstyrelsen",
    sourceUrl: s.sourceUrl,
    checked: s.checked,
    note: `${formatKr(s.value ?? 0)} per skylt och ${formatKr(getCost("vagtrafikregisteravgift").value ?? 0)} i årlig vägtrafikregisteravgift.`,
  };
}

/**
 * Avgifter som tillkommer vid varje import (exklusive transport och moms).
 * Husbilens importförsäkring saknar publicerat pris och ingår därför inte –
 * sidorna säger det uttryckligen.
 */
export function feeRows(vehicle: "bil" | "husbil"): FeeRow[] {
  const rows = [
    rowFor("ursprungskontroll"),
    rowFor("registreringsbesiktning", "Registreringsbesiktning"),
  ];
  if (vehicle === "bil") rows.push(rowFor("importforsakring_if", "Importförsäkring (trafikförsäkring vid tillfällig registrering, If)"));
  rows.push(skyltRow());
  return rows;
}

export function feeTotal(vehicle: "bil" | "husbil"): { min: number; max: number } {
  return feeRows(vehicle).reduce(
    (t, r) => ({ min: t.min + r.min, max: t.max + r.max }),
    { min: 0, max: 0 }
  );
}

export function formatSekRange(r: { min: number; max: number }): string {
  return r.min === r.max ? formatKr(r.min) : `${formatNumber(r.min)}–${formatKr(r.max)}`;
}

/** Kör du hem själv: tyska exportskyltar + exportförsäkring (15 dagar). */
export function exportKostnad(): { min: number; max: number } {
  const a = sekRange("exportskyltar_avgift");
  const b = sekRange("exportforsakring_15d");
  return { min: a.min + b.min, max: a.max + b.max };
}

/** Uppskattad bilkostnad för en sträcka enligt schablonen (kr per mil). */
export function bilkostnadForKm(km: number): number {
  return Math.round(((getCost("bilkostnad_per_mil").value ?? 0) * km) / 10 / 10) * 10;
}

// ── Jämförelseposter (kalkylatorns "själv vs importfirma") ──────────────────

export interface ComparisonItem {
  label: string;
  value: number;
  valueExMoms: number;
  currency: "SEK";
  type: CostType;
  source: string;
  sourceUrl: string;
  checked: string;
  linkPolicy: string;
  coverage: {
    verified: boolean;
    quote: string;
    includedItems: string[];
    notStated: string[];
    delivery: { note: string; stockholmExMoms: number; goteborgExMoms: number };
  };
}

export function getComparison(id: "importfirma_bil" | "importfirma_husbil"): ComparisonItem {
  return (data.comparisons as unknown as Record<string, ComparisonItem>)[id];
}

/** Formaterar en skattesats med rätt enhet (gram, faktor, månader eller kronor). */
export function formatSats(id: string, v: number): string {
  const GRAM = ["malusLowerGram", "malusUpperGram", "co2ThresholdGram"];
  if (GRAM.includes(id)) return `${formatNumber(v)} g/km`;
  if (id === "dieselBranslefaktorPre2018") return formatNumber(v, 2);
  if (id === "malusPeriodMonths") return `${v} månader`;
  return `${formatNumber(v, Number.isInteger(v) ? 0 : 2)} kr`;
}
