"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import costData from "@/data/cost-data.json";
import importCostsData from "@/datasets/import-costs.json";
import { calculateMalus, type FuelType } from "@/lib/malus-calculator";

// Fallback-kurser (SEK per enhet utländsk valuta)
const FALLBACK_RATES: Record<string, number> = {
  EUR: 11.5,
  USD: 10.8,
  GBP: 13.5,
  SEK: 1,
};

const COUNTRY_DISTANCES: Record<string, number> = {
  tyskland: 1200,
  nederlanderna: 900,
  belgien: 1100,
  frankrike: 1800,
  spanien: 3200,
};

const COUNTRY_LABELS: Record<string, string> = {
  tyskland: "Tyskland",
  nederlanderna: "Nederländerna",
  belgien: "Belgien",
  frankrike: "Frankrike",
  spanien: "Spanien",
};

const SWEDISH_MONTHS = [
  "jan","feb","mar","apr","maj","jun",
  "jul","aug","sep","okt","nov","dec",
];

function trailerRange(km: number): { min: number; max: number } {
  if (km < 1000) return { min: 6000, max: 10000 };
  if (km <= 2000) return { min: 8000, max: 15000 };
  return { min: 12000, max: 20000 };
}

function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNum(n: number): string {
  return new Intl.NumberFormat("sv-SE").format(n);
}

// Hämta belopp från import-costs.json. Om isRange: returnera medelvärdet.
function getCostAmount(id: string): number {
  const entry = (importCostsData.costs as Array<{
    id: string;
    amount?: number;
    amountMin?: number;
    amountMax?: number;
    isRange?: boolean;
  }>).find((c) => c.id === id);
  if (!entry) return 0;
  if (entry.isRange && entry.amountMin !== undefined && entry.amountMax !== undefined) {
    return (entry.amountMin + entry.amountMax) / 2;
  }
  return entry.amount ?? 0;
}

// Returnera käll-label för en kostnadspost.
function getCostMetaLabel(id: string): string {
  const entry = (importCostsData.costs as Array<{
    id: string;
    source: string;
    validFrom: string;
  }>).find((c) => c.id === id);
  if (!entry) return "";
  const [year, month] = entry.validFrom.split("-");
  return `${entry.source} · fr.o.m. ${SWEDISH_MONTHS[parseInt(month) - 1]} ${year}`;
}

function formatVerifiedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const monthNames = [
    "januari","februari","mars","april","maj","juni",
    "juli","augusti","september","oktober","november","december",
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
}

function ImportCalculatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [price, setPrice] = useState(() => Number(searchParams.get("price") || 200000));
  const [currency, setCurrency] = useState(() => searchParams.get("currency") || "EUR");
  const [country, setCountry] = useState(() => searchParams.get("country") || "tyskland");
  const [vehicleType, setVehicleType] = useState<"personbil" | "husbil">(
    () => (searchParams.get("type") as "personbil" | "husbil") || "personbil"
  );
  const [ageMonths, setAgeMonths] = useState(() => Number(searchParams.get("ageMonths") || 36));
  const [mileageKm, setMileageKm] = useState(() => Number(searchParams.get("mileageKm") || 60000));
  const [transportMethod, setTransportMethod] = useState<"self" | "trailer">(
    () => (searchParams.get("transport") as "self" | "trailer") || "self"
  );
  const [distanceKm, setDistanceKm] = useState(
    () => Number(searchParams.get("km") || COUNTRY_DISTANCES.tyskland)
  );
  const [swePrice, setSwePrice] = useState(
    () => (searchParams.get("swePrice") ? Number(searchParams.get("swePrice")) : 0)
  );

  // CO₂-sektion
  const [showCO2, setShowCO2] = useState(
    () => Number(searchParams.get("co2") || 0) > 0
  );
  const [co2gkm, setCO2gkm] = useState(() => Number(searchParams.get("co2") || 0));
  const [fuelType, setFuelType] = useState<FuelType>(
    () => (searchParams.get("fuel") as FuelType) || "bensin"
  );

  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesApprox, setRatesApprox] = useState(true);
  const [ratesDate, setRatesDate] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetch("https://api.frankfurter.dev/v1/latest?base=SEK&symbols=EUR,USD,GBP")
      .then((r) => r.json())
      .then((data) => {
        const inverted: Record<string, number> = { SEK: 1 };
        for (const [sym, rate] of Object.entries(data.rates as Record<string, number>)) {
          inverted[sym] = 1 / rate;
        }
        setRates(inverted);
        setRatesApprox(false);
        setRatesDate(data.date as string);
      })
      .catch(() => {
        setRatesApprox(true);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("price", String(price));
    params.set("currency", currency);
    params.set("country", country);
    params.set("type", vehicleType);
    params.set("ageMonths", String(ageMonths));
    params.set("mileageKm", String(mileageKm));
    params.set("transport", transportMethod);
    params.set("km", String(distanceKm));
    if (swePrice > 0) params.set("swePrice", String(swePrice));
    if (co2gkm > 0) params.set("co2", String(co2gkm));
    if (fuelType !== "bensin") params.set("fuel", fuelType);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [price, currency, country, vehicleType, ageMonths, mileageKm, transportMethod, distanceKm, swePrice, co2gkm, fuelType, router]);

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setDistanceKm(COUNTRY_DISTANCES[newCountry] ?? 1200);
  }

  function handleFuelTypeChange(val: FuelType) {
    setFuelType(val);
    if (val === "elbil") setCO2gkm(0);
  }

  const besiktningId =
    vehicleType === "husbil"
      ? "registreringsbesiktning-husbil"
      : "registreringsbesiktning-bil";
  const forsäkringId =
    vehicleType === "husbil" ? "importforsakring-husbil" : "importforsakring-bil";

  const result = useMemo(() => {
    if (!price || price <= 0) return null;

    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 11.5;
    const vehiclePriceSEK = price * rate;

    const isNew =
      ageMonths < costData.tax.moms_new_vehicle_threshold_months ||
      mileageKm < costData.tax.moms_new_vehicle_threshold_km;
    const moms = isNew ? vehiclePriceSEK * costData.tax.moms_rate : 0;
    const tull = 0;

    const registreringsbesiktning = getCostAmount(besiktningId);
    const ursprungskontroll = getCostAmount("ursprungskontroll");
    const skyltavgift = costData.fees.skyltavgift.amount;
    const importforsäkring = getCostAmount(forsäkringId);

    let transport: number;
    let transportRange: { min: number; max: number } | null = null;
    if (transportMethod === "self") {
      transport = distanceKm * costData.transport.drive_self_cost_per_km;
    } else {
      const range = trailerRange(distanceKm);
      transportRange = range;
      transport = (range.min + range.max) / 2;
    }

    const totalImportCost =
      moms + tull + ursprungskontroll + registreringsbesiktning +
      skyltavgift + importforsäkring + transport;
    const grandTotal = vehiclePriceSEK + totalImportCost;

    const savings = swePrice > 0 ? swePrice - grandTotal : null;
    const savingsPct =
      savings !== null && swePrice > 0
        ? (savings / swePrice) * 100
        : null;

    const malusResult =
      showCO2 && (co2gkm > 0 || fuelType === "elbil")
        ? calculateMalus(co2gkm, fuelType, ageMonths, vehicleType)
        : null;

    return {
      vehiclePriceSEK,
      moms,
      tull,
      ursprungskontroll,
      registreringsbesiktning,
      skyltavgift,
      importforsäkring,
      transport,
      transportRange,
      totalImportCost,
      grandTotal,
      savings,
      savingsPct,
      malusResult,
    };
  }, [price, currency, vehicleType, ageMonths, mileageKm, transportMethod, distanceKm, rates, swePrice, showCO2, co2gkm, fuelType, besiktningId, forsäkringId]);

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Räkna ut din importkostnad</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Pris + valuta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fordonets pris
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEK">SEK</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          {currency !== "SEK" && (
            <p className="mt-1 text-xs text-gray-400">
              Kurs: 1 {currency} = {rates[currency]?.toFixed(2).replace(".", ",")} SEK
              {ratesApprox
                ? " (approximativ kurs)"
                : ratesDate
                ? ` (uppdaterad ${ratesDate})`
                : ""}
            </p>
          )}
        </div>

        {/* Fordonstyp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fordonstyp
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as "personbil" | "husbil")}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="personbil">Personbil</option>
            <option value="husbil">Husbil</option>
          </select>
        </div>

        {/* Ålder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ålder (månader)
          </label>
          <input
            type="number"
            value={ageMonths || ""}
            onChange={(e) => setAgeMonths(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Under 6 mån eller under 6 000 km = nytt fordon → moms tillkommer.
          </p>
        </div>

        {/* Miltal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miltal (km)
          </label>
          <input
            type="number"
            value={mileageKm || ""}
            onChange={(e) => setMileageKm(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Köpland */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Köpland
          </label>
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(COUNTRY_LABELS).map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Transportavstånd */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transportavstånd (km)
          </label>
          <input
            type="number"
            value={distanceKm || ""}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Genomsnittlig sträcka. Justera efter din ort.
          </p>
        </div>

        {/* Transportmetod */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transport
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="self"
                checked={transportMethod === "self"}
                onChange={() => setTransportMethod("self")}
                className="accent-blue-700"
              />
              <span className="text-sm">Kör hem själv</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="trailer"
                checked={transportMethod === "trailer"}
                onChange={() => setTransportMethod("trailer")}
                className="accent-blue-700"
              />
              <span className="text-sm">Anlita transport</span>
            </label>
          </div>
        </div>

        {/* Jämförelsepris Sverige */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jämförpris i Sverige (SEK)
          </label>
          <input
            type="number"
            value={swePrice || ""}
            onChange={(e) => setSwePrice(Number(e.target.value))}
            placeholder="Lämna tomt om okänt"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Vad kostar ett liknande fordon i Sverige? Fyll i för att se om importen lönar sig.
          </p>
        </div>

        {/* CO₂-sektion */}
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setShowCO2(!showCO2)}
            className="text-sm text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            {showCO2 ? "▲ Dölj fordonsskatt-beräkning" : "▼ Beräkna fordonsskatt (CO₂)"}
          </button>

          {showCO2 && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 p-4 border border-gray-200 rounded bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CO₂-utsläpp (g/km, WLTP)
                </label>
                <input
                  type="number"
                  value={co2gkm || ""}
                  onChange={(e) => setCO2gkm(Number(e.target.value))}
                  disabled={fuelType === "elbil"}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Hittas i CoC-intyget eller på mobile.de under &quot;CO₂-Emissionen (komb.)&quot;
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bränsletyp
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => handleFuelTypeChange(e.target.value as FuelType)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bensin">Bensin</option>
                  <option value="diesel">Diesel</option>
                  <option value="elbil">Elbil (0 g/km)</option>
                  <option value="laddhybrid-bensin">Laddhybrid (bensin)</option>
                  <option value="laddhybrid-diesel">Laddhybrid (diesel)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultatsektion */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Beräknat resultat</h3>

        {!result ? (
          <p className="text-sm text-gray-600">Fyll i pris ovan för att se beräkning.</p>
        ) : (
          <>
            {/* Du sparar-sektion */}
            {result.savings !== null && (
              <div
                className={`mb-5 p-4 rounded-lg border ${
                  result.savings >= 0
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Din besparing
                </p>
                <div className="flex justify-between text-sm text-gray-600 mb-0.5">
                  <span>Importkostnad totalt</span>
                  <span>{formatSEK(result.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Jämförpris i Sverige</span>
                  <span>{formatSEK(swePrice)}</span>
                </div>
                {result.savings >= 0 ? (
                  <>
                    <p className="text-2xl font-bold text-green-700">
                      ✓ Du sparar ca {formatSEK(result.savings)}
                    </p>
                    {result.savingsPct !== null && (
                      <p className="text-sm text-green-700 mt-0.5">
                        ({result.savingsPct.toFixed(0)}% billigare än i Sverige)
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-amber-700">
                      ✗ Import lönar sig inte
                    </p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Du betalar ca {formatSEK(Math.abs(result.savings))} mer än i Sverige
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Detaljerad kostnadsuppställning */}
            <div className="space-y-2 text-sm">
              {/* Fordonets pris + Wise */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">Fordonets pris</span>
                  <div className="mt-0.5">
                    <AffiliateLink
                      href="https://wise.prf.hn/click/camref:1100l5I28j"
                      partner="wise"
                      className="text-xs text-blue-700 hover:underline"
                    >
                      Valutaväxling via Wise kan spara dig pengar
                    </AffiliateLink>
                  </div>
                </div>
                <span className="font-medium whitespace-nowrap">{formatSEK(result.vehiclePriceSEK)}</span>
              </div>

              {/* Moms */}
              {result.moms > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Moms (fordon anses nytt)</span>
                  <span className="font-medium">{formatSEK(result.moms)}</span>
                </div>
              )}

              {/* Tull */}
              <div className="flex justify-between">
                <span className="text-gray-600">Tull (EU-import)</span>
                <span className="font-medium text-green-700">0 kr</span>
              </div>

              {/* Ursprungskontroll */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">Ursprungskontroll</span>
                  <p className="text-xs text-gray-400">{getCostMetaLabel("ursprungskontroll")}</p>
                </div>
                <span className="font-medium whitespace-nowrap">{formatSEK(result.ursprungskontroll)}</span>
              </div>

              {/* Registreringsbesiktning */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">Registreringsbesiktning</span>
                  <p className="text-xs text-gray-400">{getCostMetaLabel(besiktningId)}</p>
                </div>
                <span className="font-medium whitespace-nowrap">{formatSEK(result.registreringsbesiktning)}</span>
              </div>

              {/* Skyltar */}
              <div className="flex justify-between">
                <span className="text-gray-600">Skyltar</span>
                <span className="font-medium">{formatSEK(result.skyltavgift)}</span>
              </div>

              {/* Importförsäkring */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">Importförsäkring (schablon)</span>
                  <p className="text-xs text-gray-400">{getCostMetaLabel(forsäkringId)}</p>
                </div>
                <span className="font-medium whitespace-nowrap">{formatSEK(result.importforsäkring)}</span>
              </div>

              {/* Transport */}
              <div className="flex justify-between items-start gap-4">
                <span className="text-gray-600">
                  {transportMethod === "self"
                    ? `Bränsle + slitage (${formatNum(distanceKm)} km)`
                    : result.transportRange
                    ? `Transport (${formatNum(result.transportRange.min)}–${formatNum(result.transportRange.max)} kr beroende på transportör)`
                    : "Transport"}
                </span>
                <span className="font-medium whitespace-nowrap">{formatSEK(result.transport)}</span>
              </div>

              {/* Totalt */}
              <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                <span className="font-semibold text-gray-900">Totalt att betala</span>
                <span className="font-bold text-blue-700 text-base">
                  {formatSEK(result.grandTotal)}
                </span>
              </div>
            </div>

            {/* Fordonsskatt-sektion (separat från totalen) */}
            {result.malusResult && (
              <div className="mt-5 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                  Årlig fordonsskatt i Sverige
                </h4>
                <div className="space-y-1.5 text-sm">
                  {result.malusResult.hasMalus ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Under malusperiod ({result.malusResult.malusMonthsRemaining} mån kvar)
                        </span>
                        <span className="font-medium">
                          {formatSEK(result.malusResult.annualTax)}/år
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Därefter</span>
                        <span className="font-medium">
                          {formatSEK(result.malusResult.annualTaxAfterMalus)}/år
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per år</span>
                      <span className="font-medium">
                        {formatSEK(result.malusResult.annualTax)}/år
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Fordonsskatten ingår inte i totalkostnaden ovan — det är en årlig kostnad.
                  {vehicleType === "husbil" &&
                    " Husbilar är undantagna från malus sedan februari 2025."}
                </p>
              </div>
            )}

            {/* Footer */}
            <p className="mt-4 text-xs text-gray-400">
              Siffror senast verifierade:{" "}
              {formatVerifiedDate(importCostsData._meta.lastVerified)}.{" "}
              Beräkningen är ungefärlig och baserad på schablonvärden. Kontrollera alltid
              faktiska kostnader hos Transportstyrelsen och Tullverket.
            </p>

            {/* Nästa steg */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Nästa steg</p>
                <p className="text-xs text-gray-600 mb-3">
                  Läs hela processen steg för steg – från sökning till svenska skyltar.
                </p>
                <Link
                  href={
                    vehicleType === "husbil"
                      ? "/importera-husbil/guide"
                      : "/importera-bil/guide"
                  }
                  className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  {vehicleType === "husbil"
                    ? "Guide: importera husbil"
                    : "Guide: importera bil"}
                </Link>
              </div>
            </div>

            {/* Kopiera länk */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Kopiera länk
              </button>
              {linkCopied && (
                <span className="text-sm text-gray-600">Länk kopierad!</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ImportCalculator() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">
          Laddar kalkylator…
        </div>
      }
    >
      <ImportCalculatorInner />
    </Suspense>
  );
}
