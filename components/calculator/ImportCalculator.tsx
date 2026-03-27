"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import costData from "@/data/cost-data.json";

// Fallback-kurser (SEK per enhet utländsk valuta)
const FALLBACK_RATES: Record<string, number> = {
  EUR: 11.5,
  USD: 10.8,
  GBP: 13.5,
  SEK: 1,
};

// Avståndschabloner per land (km från Sverige)
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

function ImportCalculatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State initialiseras från URL-parametrar om de finns
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

  // Växelkurser
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [ratesApprox, setRatesApprox] = useState(true);
  const [ratesDate, setRatesDate] = useState<string | null>(null);

  // Kopiera länk
  const [linkCopied, setLinkCopied] = useState(false);

  // Hämta realtidskurser vid mount
  useEffect(() => {
    fetch("https://api.frankfurter.dev/v1/latest?base=SEK&symbols=EUR,USD,GBP")
      .then((r) => r.json())
      .then((data) => {
        // Frankfurter returnerar kurser med SEK som bas: "hur många EUR per 1 SEK"
        // Vi inverterar: 1 / rate → "hur många SEK per 1 EUR"
        const inverted: Record<string, number> = { SEK: 1 };
        for (const [sym, rate] of Object.entries(data.rates as Record<string, number>)) {
          inverted[sym] = 1 / rate;
        }
        setRates(inverted);
        setRatesApprox(false);
        setRatesDate(data.date as string);
      })
      .catch(() => {
        // Behåll fallback-kurser
        setRatesApprox(true);
      });
  }, []);

  // Synka URL-parametrar vid state-ändringar
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
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [price, currency, country, vehicleType, ageMonths, mileageKm, transportMethod, distanceKm, swePrice, router]);

  // När land ändras: sätt avstånd till landets schablon
  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    setDistanceKm(COUNTRY_DISTANCES[newCountry] ?? 1200);
  }

  // Live-beräkning via useMemo
  const result = useMemo(() => {
    if (!price || price <= 0) return null;

    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 11.5;
    const vehiclePriceSEK = price * rate;

    // Moms: fordon anses nytt om det är yngre än 6 månader ELLER har kört färre än 6 000 km
    const isNew =
      ageMonths < costData.tax.moms_new_vehicle_threshold_months ||
      mileageKm < costData.tax.moms_new_vehicle_threshold_km;
    const moms = isNew ? vehiclePriceSEK * costData.tax.moms_rate : 0;

    const tull = 0;

    const registreringsbesiktning =
      vehicleType === "husbil"
        ? costData.fees.registreringsbesiktning_husbil.amount
        : costData.fees.registreringsbesiktning_personbil.amount;

    const ursprungskontroll = costData.fees.ursprungskontroll.amount;
    const skyltavgift = costData.fees.skyltavgift.amount;

    const importforsäkring =
      vehicleType === "husbil"
        ? costData.fees.importforsäkring_husbil.amount
        : costData.fees.importforsäkring_personbil.amount;

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
      moms +
      tull +
      ursprungskontroll +
      registreringsbesiktning +
      skyltavgift +
      importforsäkring +
      transport;

    const grandTotal = vehiclePriceSEK + totalImportCost;

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
    };
  }, [price, currency, vehicleType, ageMonths, mileageKm, transportMethod, distanceKm, rates]);

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
            Uppskattat pris i Sverige för liknande fordon (SEK)
          </label>
          <input
            type="number"
            value={swePrice || ""}
            onChange={(e) => setSwePrice(Number(e.target.value))}
            placeholder="Lämna tomt om okänt"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Resultatsektion – alltid synlig */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Beräknat resultat</h3>

        {!result ? (
          <p className="text-sm text-gray-600">Fyll i pris ovan för att se beräkning.</p>
        ) : (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fordonets pris</span>
                <span className="font-medium">{formatSEK(result.vehiclePriceSEK)}</span>
              </div>
              {result.moms > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Moms (fordon anses nytt)</span>
                  <span className="font-medium">{formatSEK(result.moms)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tull (EU-import)</span>
                <span className="font-medium text-green-700">0 kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ursprungskontroll</span>
                <span className="font-medium">{formatSEK(result.ursprungskontroll)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registreringsbesiktning</span>
                <span className="font-medium">{formatSEK(result.registreringsbesiktning)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Skyltar</span>
                <span className="font-medium">{formatSEK(result.skyltavgift)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Importförsäkring (schablon)</span>
                <span className="font-medium">{formatSEK(result.importforsäkring)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {transportMethod === "self"
                    ? `Bränsle + slitage (${formatNum(distanceKm)} km)`
                    : result.transportRange
                    ? `Transport (${formatNum(result.transportRange.min)} – ${formatNum(result.transportRange.max)} kr beroende på transportör)`
                    : "Transport"}
                </span>
                <span className="font-medium">{formatSEK(result.transport)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                <span className="font-semibold text-gray-900">Totalt att betala</span>
                <span className="font-bold text-blue-700 text-base">
                  {formatSEK(result.grandTotal)}
                </span>
              </div>
              {swePrice > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-gray-600">Uppskattad besparing</span>
                  <span
                    className={
                      swePrice - result.grandTotal > 0
                        ? "font-semibold text-green-700"
                        : "font-medium text-gray-600"
                    }
                  >
                    {formatSEK(swePrice - result.grandTotal)}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Beräkningen är ungefärlig och baserad på schablonvärden. Kontrollera alltid
              faktiska kostnader hos Transportstyrelsen och Tullverket.
            </p>

            <div className="mt-4 border-t border-gray-200 pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Kan vara relevant för dig
              </p>
              <AffiliateLink
                href="https://wise.prf.hn/click/camref:1100l5I28j"
                partner="wise"
                className="block text-sm text-blue-700 hover:underline"
              >
                Wise – Byt valuta till bra kurs
              </AffiliateLink>
              {/* Aktiveras när affiliate-avtal för importförsäkring finns – ersätt href="#" med partnerurl */}
              {/* <AffiliateLink
                href="#"
                partner="importforsäkring"
                className="block text-sm text-blue-700 hover:underline"
              >
                Jämför importförsäkringar
              </AffiliateLink> */}
            </div>

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
