"use client";

import { useState } from "react";
import type { CalculatorInput, CalculatorResult } from "@/types";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";

const EXCHANGE_RATES: Record<string, number> = {
  EUR: 11.5,
  USD: 10.8,
  GBP: 13.5,
  SEK: 1,
};

const FIXED_FEES = {
  ursprungskontroll: 1240,
  registreringsbesiktning_personbil: 1700,
  registreringsbesiktning_husbil: 3500,
  skyltavgift: 90,
};

function calculateImportCost(input: CalculatorInput): CalculatorResult {
  const rate = EXCHANGE_RATES[input.currency] ?? 11.5;
  const vehiclePriceSEK = input.price * rate;

  // Moms: only if vehicle is "new" (under 6 months AND under 6000 km)
  const isNewForMomsRules = input.ageMonths < 6 || input.mileageKm < 6000;
  const moms = isNewForMomsRules ? vehiclePriceSEK * 0.25 : 0;

  // Tull: 0% within EU
  const tull = 0;

  // Registration fees
  const registreringsbesiktning =
    input.vehicleType === "husbil"
      ? FIXED_FEES.registreringsbesiktning_husbil
      : FIXED_FEES.registreringsbesiktning_personbil;

  const ursprungskontroll = FIXED_FEES.ursprungskontroll;
  const skyltavgift = FIXED_FEES.skyltavgift;

  // Transport
  const transport =
    input.transportMethod === "self"
      ? 2000 // Rough fuel estimate Sweden-Germany
      : 9000; // Schablon for trailer transport

  const totalImportCost =
    moms +
    tull +
    ursprungskontroll +
    registreringsbesiktning +
    skyltavgift +
    transport;

  return {
    vehiclePrice: input.price,
    vehiclePriceSEK,
    moms,
    tull,
    ursprungskontroll,
    registreringsbesiktning,
    skyltavgift,
    transport,
    totalImportCost,
    grandTotal: vehiclePriceSEK + totalImportCost,
  };
}

function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ImportCalculator() {
  const [input, setInput] = useState<CalculatorInput>({
    price: 200000,
    currency: "SEK",
    country: "tyskland",
    vehicleType: "personbil",
    isNew: false,
    ageMonths: 36,
    mileageKm: 60000,
    transportMethod: "self",
  });

  const [result, setResult] = useState<CalculatorResult | null>(null);

  function handleCalculate() {
    setResult(calculateImportCost(input));
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Räkna ut din importkostnad</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bilens pris
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={input.price || ""}
              onChange={(e) => setInput({ ...input, price: Number(e.target.value) })}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={input.currency}
              onChange={(e) => setInput({ ...input, currency: e.target.value })}
              className="rounded border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEK">SEK</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        {/* Vehicle type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fordonstyp
          </label>
          <select
            value={input.vehicleType}
            onChange={(e) =>
              setInput({ ...input, vehicleType: e.target.value as "personbil" | "husbil" })
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="personbil">Personbil</option>
            <option value="husbil">Husbil</option>
          </select>
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ålder (månader)
          </label>
          <input
            type="number"
            value={input.ageMonths || ""}
            onChange={(e) => setInput({ ...input, ageMonths: Number(e.target.value) })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miltal (km)
          </label>
          <input
            type="number"
            value={input.mileageKm || ""}
            onChange={(e) => setInput({ ...input, mileageKm: Number(e.target.value) })}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Transport */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transport
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="self"
                checked={input.transportMethod === "self"}
                onChange={() => setInput({ ...input, transportMethod: "self" })}
                className="accent-blue-700"
              />
              <span className="text-sm">Kör hem själv</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="trailer"
                checked={input.transportMethod === "trailer"}
                onChange={() => setInput({ ...input, transportMethod: "trailer" })}
                className="accent-blue-700"
              />
              <span className="text-sm">Anlita transport</span>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="mt-6 w-full rounded bg-blue-700 px-4 py-3 font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Beräkna kostnad
      </button>

      {result && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Beräknat resultat</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bilens pris</span>
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
              <span className="text-gray-600">Transport (schablonvärde)</span>
              <span className="font-medium">{formatSEK(result.transport)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
              <span className="font-semibold text-gray-900">Totalt att betala</span>
              <span className="font-bold text-blue-700 text-base">
                {formatSEK(result.grandTotal)}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Beräkningen är ungefärlig och baserad på schablonvärden. Kontrollera alltid
            faktiska kostnader hos Transportstyrelsen och Tullverket.
            {input.currency !== "SEK" && (
              <span> Växelkurs EUR/SEK ~{EXCHANGE_RATES[input.currency]} (approximation).</span>
            )}
          </p>

          <div className="mt-4 border-t border-gray-200 pt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Kan vara relevant för dig
            </p>
            <AffiliateLink
              href="https://wise.com"
              partner="wise"
              className="block text-sm text-blue-700 hover:underline"
            >
              Wise – Byt valuta till bra kurs
            </AffiliateLink>
          </div>
        </div>
      )}
    </div>
  );
}
