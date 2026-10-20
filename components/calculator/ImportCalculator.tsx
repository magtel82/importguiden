"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import {
  sekRange,
  skyltavgiftKr,
  exportKostnad,
  bilkostnadForKm,
  formatCost,
  formatSekRange,
  costSourceLine,
  getComparison,
  FALLBACK_SEK_RATES,
  MOMS,
  COST_DATA_UPDATED,
  TULL_EU,
  FORDONSSKATT,
} from "@/lib/costs";
import { calculateMalus, type FuelType } from "@/lib/malus-calculator";
import { comparisonFromBreakdown } from "@/lib/import-comparison";
import { formatDateSv } from "@/lib/date";


// Reservkurser (SEK per enhet) ur data/cost-data.json – ECB:s referenskurser med datum.
const FALLBACK_RATES = FALLBACK_SEK_RATES;

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




const REG_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018] as const;

function calculateAgeMonths(registrationYear: number | "older", isUnderSixMonths: boolean): number {
  if (registrationYear === "older") return 120;
  if (isUnderSixMonths) return 3;
  const now = new Date();
  const regDate = new Date(registrationYear, 6, 1); // Juli (mittpunkt av året)
  const diffMs = now.getTime() - regDate.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  return Math.max(0, diffMonths);
}

function parseRegYear(val: string | null): number | "older" {
  if (!val || val === "older") return val === "older" ? "older" : 2023;
  const n = parseInt(val);
  return isNaN(n) ? 2023 : n;
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
  const [regYear, setRegYear] = useState<number | "older">(() => parseRegYear(searchParams.get("regYear")));
  const [isUnderSixMonths, setIsUnderSixMonths] = useState(() => searchParams.get("newVehicle") === "true");
  const [mileageKm, setMileageKm] = useState(() => Number(searchParams.get("mileageKm") || 60000));
  const [transportMethod, setTransportMethod] = useState<"self" | "trailer">(
    () => (searchParams.get("transport") as "self" | "trailer") || "self"
  );
  const [distanceKm, setDistanceKm] = useState(
    () => Number(searchParams.get("km") || COUNTRY_DISTANCES.tyskland)
  );
  // Egen bränsleförbrukning (l/mil) och bränslepris (kr/l). Tomma = Skatteverkets schablon.
  const [litersPerMil, setLitersPerMil] = useState(() => Number(searchParams.get("lpm") || 0));
  const [fuelPrice, setFuelPrice] = useState(() => Number(searchParams.get("fuelPrice") || 0));
  const [transportOffer, setTransportOffer] = useState(
    () => Number(searchParams.get("transportOffer") || 0)
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
    params.set("regYear", String(regYear));
    if (isUnderSixMonths) params.set("newVehicle", "true");
    params.set("mileageKm", String(mileageKm));
    params.set("transport", transportMethod);
    params.set("km", String(distanceKm));
    if (swePrice > 0) params.set("swePrice", String(swePrice));
    if (transportOffer > 0) params.set("transportOffer", String(transportOffer));
    if (litersPerMil > 0) params.set("lpm", String(litersPerMil));
    if (fuelPrice > 0) params.set("fuelPrice", String(fuelPrice));
    if (co2gkm > 0) params.set("co2", String(co2gkm));
    if (fuelType !== "bensin") params.set("fuel", fuelType);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [price, currency, country, vehicleType, regYear, isUnderSixMonths, mileageKm, transportMethod, transportOffer, litersPerMil, fuelPrice, distanceKm, swePrice, co2gkm, fuelType, router]);

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setDistanceKm(COUNTRY_DISTANCES[newCountry] ?? 1200);
  }

  function handleFuelTypeChange(val: FuelType) {
    setFuelType(val);
    if (val === "elbil") setCO2gkm(0);
  }

  const importfirma = getComparison(vehicleType === "husbil" ? "importfirma_husbil" : "importfirma_bil");

  const result = useMemo(() => {
    if (!price || price <= 0) return null;

    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? FALLBACK_RATES.EUR;
    const vehiclePriceSEK = price * rate;

    const ageMonths = calculateAgeMonths(regYear, isUnderSixMonths);
    // Skatteverket: nytt om köpt inom sex månader ELLER kört högst 6 000 km.
    const isNew = isUnderSixMonths || mileageKm <= MOMS.moms_new_vehicle_threshold_km;
    const moms = isNew ? vehiclePriceSEK * MOMS.moms_rate : 0;
    const tull = 0;

    // Alla avgifter ur data/cost-data.json via lib/costs.ts.
    const besiktning = sekRange("registreringsbesiktning");
    const registreringsbesiktning = besiktning.mid;
    const ursprungskontroll = sekRange("ursprungskontroll").min;
    const skyltavgift = skyltavgiftKr();
    // Husbilens importförsäkring saknar publicerat pris och räknas inte in.
    const importforsäkring = vehicleType === "husbil" ? 0 : sekRange("importforsakring_if").min;

    let transport: number;
    let exportkostnad = 0;
    if (transportMethod === "self") {
      exportkostnad = exportKostnad().min;
      // Egen förbrukning och bränslepris om båda är ifyllda, annars Skatteverkets schablon.
      const egenBransle = litersPerMil > 0 && fuelPrice > 0;
      const bilkostnad = egenBransle
        ? Math.round((distanceKm / 10) * litersPerMil * fuelPrice)
        : bilkostnadForKm(distanceKm);
      transport = bilkostnad + exportkostnad;
    } else {
      transport = transportOffer > 0 ? transportOffer : 0;
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
        ? calculateMalus(co2gkm, fuelType, ageMonths, vehicleType, {
            // Fordonsår före 2018 → tabell 62 (bränslefaktor 2,37), ingen malus.
            firstTaxedBeforeJuly2018: regYear === "older" || regYear < 2018,
          })
        : null;

    // Jämförelsen med importfirma: bara poster som skiljer. Moms, tull och
    // fordonspris betalas lika i båda fallen (lib/import-comparison.ts).
    const comparison = comparisonFromBreakdown(
      {
        vehiclePriceSEK,
        moms,
        tull,
        ursprungskontroll,
        registreringsbesiktning,
        skyltavgift,
        importforsakring: importforsäkring,
        transport,
      },
      importfirma.value,
      importfirma.coverage.includedItems
    );

    return {
      comparison,
      besiktning,
      exportkostnad,
      vehiclePriceSEK,
      moms,
      tull,
      ursprungskontroll,
      registreringsbesiktning,
      skyltavgift,
      importforsäkring,
      transport,
        totalImportCost,
      grandTotal,
      savings,
      savingsPct,
      malusResult,
    };
  }, [price, currency, vehicleType, regYear, isUnderSixMonths, mileageKm, transportMethod, transportOffer, litersPerMil, fuelPrice, distanceKm, rates, swePrice, showCO2, co2gkm, fuelType, importfirma]);

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

        {/* Registreringsår */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Första registrering
          </label>
          <select
            value={String(regYear)}
            onChange={(e) => {
              const val = e.target.value === "older" ? "older" : parseInt(e.target.value);
              setRegYear(val);
              // Dölj checkbox om år 2024 eller äldre väljs
              if (val !== 2025 && val !== 2026) setIsUnderSixMonths(false);
            }}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REG_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
            <option value="older">Äldre</option>
          </select>

          {/* Villkorlig checkbox – visas bara för 2025 och 2026 */}
          {(regYear === 2025 || regYear === 2026) && (
            <div className="mt-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnderSixMonths}
                  onChange={(e) => setIsUnderSixMonths(e.target.checked)}
                  className="mt-0.5 accent-blue-700 w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">
                  Bilen registrerades för mindre än 6 månader sedan
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-400 ml-6">
                Fordon under 6 månader eller som körts högst 6 000 km räknas som nytt — då tillkommer svensk moms.
              </p>
            </div>
          )}
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
          {transportMethod === "self" ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Förbrukning (l/mil)</label>
                <input
                  type="number"
                  step="0.1"
                  value={litersPerMil || ""}
                  onChange={(e) => setLitersPerMil(Number(e.target.value))}
                  placeholder="t.ex. från bilens data"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bränslepris (kr/l)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fuelPrice || ""}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  placeholder="dagens pris"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="col-span-2 text-xs text-gray-400">
                Lämnar du fälten tomma räknar vi med Skatteverkets schablon för egen bil,{" "}
                {formatCost("bilkostnad_per_mil")} per mil. Det är en schablon för skattefri
                milersättning – din verkliga kostnad kan vara högre. Exportskyltar och exportförsäkring
                läggs till.
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <label className="block text-xs text-gray-600 mb-1">
                Offertpris från transportfirman (SEK)
              </label>
              <input
                type="number"
                value={transportOffer || ""}
                onChange={(e) => setTransportOffer(Number(e.target.value))}
                placeholder="Ange pris från offert"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Transportpriser publiceras sällan och varierar mycket. Begär offert från två eller
                tre firmor och fyll i det pris du fått.
              </p>
            </div>
          )}
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
                <span className="font-medium text-green-700">{TULL_EU}</span>
              </div>

              {/* Ursprungskontroll */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">Ursprungskontroll</span>
                  <p className="text-xs text-gray-400">{costSourceLine("ursprungskontroll")}</p>
                </div>
                <span className="font-medium whitespace-nowrap">{formatSEK(result.ursprungskontroll)}</span>
              </div>

              {/* Registreringsbesiktning */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">Registreringsbesiktning</span>
                  <p className="text-xs text-gray-400">
                    Mittvärde av publicerade priser {formatSekRange(result.besiktning)}
                  </p>
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
                  <span className="text-gray-600">Importförsäkring</span>
                  <p className="text-xs text-gray-400">
                    {vehicleType !== "husbil"
                      ? costSourceLine("importforsakring_if")
                      : "Inget publicerat pris för husbil – begär offert (ingår inte i summan)"}
                  </p>
                </div>
                <span className="font-medium whitespace-nowrap">
                  {vehicleType !== "husbil" ? formatSEK(result.importforsäkring) : "offert"}
                </span>
              </div>

              {/* Transport */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-gray-600">
                    {transportMethod === "self"
                      ? `Köra hem själv (${formatNum(distanceKm)} km)`
                      : "Transport (ditt offertpris)"}
                  </span>
                  <p className="text-xs text-gray-400">
                    {transportMethod === "self"
                      ? `${litersPerMil > 0 && fuelPrice > 0 ? "Bränsle enligt din förbrukning" : "Bilkostnad enligt Skatteverkets schablon"} ${formatSEK(result.transport - result.exportkostnad)} + exportskyltar och exportförsäkring ${formatSEK(result.exportkostnad)}`
                      : transportOffer > 0
                      ? "Enligt din offert"
                      : "Fyll i offertpris – ingår inte annars"}
                  </p>
                </div>
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

            {/* Göra det själv eller anlita importfirma (utanför totalen) */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Jämförelse: anlita en importfirma i stället
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Vi jämför bara de poster som firmans fastpris enligt källan täcker: transport,
                registreringsbesiktning och ursprungskontroll. Fordonets pris, moms och fordonsskatt
                betalar du lika oavsett vem som gör importen.
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-gray-600">Du gör importen själv</span>
                    <p className="text-xs text-gray-400">Transport, besiktning och ursprungskontroll</p>
                  </div>
                  <span className="font-medium whitespace-nowrap">{formatSEK(result.comparison.self)}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-gray-600">Du anlitar importfirma</span>
                    <p className="text-xs text-gray-400">
                      Fastpris inkl. moms, leverans i Lund – {importfirma.source.split(" – ")[0]},
                      kontrollerat {formatDateSv(importfirma.checked)}
                    </p>
                  </div>
                  <span className="font-medium whitespace-nowrap">{formatSEK(result.comparison.firm)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2 gap-4">
                  <span className="font-semibold text-gray-900">
                    {result.comparison.diff >= 0 ? "Du sparar på att göra det själv" : "Importfirman är billigare"}
                  </span>
                  <span className="font-bold whitespace-nowrap text-gray-900">
                    {formatSEK(Math.abs(result.comparison.diff))}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Publicerat fastpris hos en enskild importfirma, inte ett marknadsgenomsnitt. Leverans
                till annan ort än Lund kostar extra enligt firman. Källan anger inte om skyltar och
                importförsäkring ingår – de är därför inte med i jämförelsen. Jämförelsen tar inte
                hänsyn till din egen tid eller resa. Begär alltid en specificerad offert.
              </p>
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
                    ` Husbilar är undantagna från malus sedan februari 2025 men betalar ${FORDONSSKATT.co2RatePerGram} kronor per gram över ${FORDONSSKATT.co2ThresholdGram} g/km.`}
                  {" "}Beräkningen gäller fordon av årsmodell 2018 eller senare. Äldre fordon och
                  husbilar utan koldioxidvärde beskattas på annat sätt – Transportstyrelsen
                  visar exakt skatt för ett registrerat fordon.
                </p>
              </div>
            )}

            {/* Footer */}
            <p className="mt-4 text-xs text-gray-400">
              Avgifterna kontrollerades senast {formatDateSv(COST_DATA_UPDATED)} mot respektive
              källa. Beräkningen är ungefärlig – besiktningsföretag och försäkringsbolag sätter
              egna priser. Kontrollera alltid aktuella belopp innan du bestämmer dig.
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
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-3">
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
              <p className="mt-2 text-sm text-gray-500">
                Spara din beräkning — länken innehåller alla dina val. Bokmärk den eller skicka till någon som ska hjälpa dig.
              </p>
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
