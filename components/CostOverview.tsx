"use client";

import { useState } from "react";
import Link from "next/link";

const bilCosts = [
  { label: "Ursprungskontroll", amount: "1 240 kr", source: "Transportstyrelsen (2025)" },
  { label: "Registreringsbesiktning, personbil", amount: "~1 700 kr", source: "Schablonvärde" },
  { label: "Importförsäkring", amount: "~1 500 kr", source: "Schablonvärde" },
  { label: "Transport (kör hem från Tyskland)", amount: "~5 000–7 000 kr", source: "Schablonvärde" },
  { label: "Tull (import inom EU)", amount: "0 kr", source: "Tullverket", green: true },
];

const husbilCosts = [
  { label: "Ursprungskontroll", amount: "1 240 kr", source: "Transportstyrelsen (2025)" },
  { label: "Registreringsbesiktning, husbil", amount: "~3 000–5 000 kr", source: "Schablonvärde" },
  { label: "Importförsäkring", amount: "~2 000–4 000 kr", source: "Schablonvärde" },
  { label: "Transport (kör hem från Tyskland)", amount: "~7 000–12 000 kr", source: "Schablonvärde" },
  { label: "Tull (import inom EU)", amount: "0 kr", source: "Tullverket", green: true },
];

export function CostOverview() {
  const [active, setActive] = useState<"bil" | "husbil">("bil");

  const costs = active === "bil" ? bilCosts : husbilCosts;
  const heading = active === "bil"
    ? "Vad kostar det att importera bil?"
    : "Vad kostar det att importera husbil?";
  const intro = active === "bil"
    ? "Utöver bilpriset tillkommer dessa fasta kostnader vid import av personbil från EU. Ingen tull tillkommer vid köp från EU-länder."
    : "Utöver husbilspriset tillkommer dessa fasta kostnader vid import av husbil från EU. Ingen tull tillkommer vid köp från EU-länder.";
  const costLink = active === "bil"
    ? { href: "/importera-bil/kostnad", text: "vad kostar det att importera bil" }
    : { href: "/importera-husbil/kostnad", text: "vad kostar det att importera husbil" };

  return (
    <section className="mb-16" aria-labelledby="kostnad-rubrik">
      <div className="flex w-full mb-4 gap-2" role="tablist" aria-label="Välj fordonstyp för kostnad">
        <button
          onClick={() => setActive("bil")}
          className={`flex-1 min-h-[48px] rounded px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            active === "bil"
              ? "bg-blue-700 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          role="tab"
          aria-selected={active === "bil"}
        >
          Personbil
        </button>
        <button
          onClick={() => setActive("husbil")}
          className={`flex-1 min-h-[48px] rounded px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            active === "husbil"
              ? "bg-blue-700 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          role="tab"
          aria-selected={active === "husbil"}
        >
          Husbil
        </button>
      </div>

      <h2 id="kostnad-rubrik" className="text-2xl font-bold text-gray-900 mb-4">
        {heading}
      </h2>
      <p className="text-gray-600 text-sm mb-4">{intro}</p>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse border border-gray-200 rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Kostnad</th>
              <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Belopp</th>
              <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Källa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100" key={active}>
            {costs.map((c) => (
              <tr key={c.label}>
                <td className="p-3 text-gray-700">{c.label}</td>
                <td className={`p-3 text-right font-medium ${c.green ? "text-green-700" : ""}`}>{c.amount}</td>
                <td className="p-3 text-gray-500 text-xs">{c.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Räkna ut din exakta totalkostnad i{" "}
        <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
          importkalkylatorn
        </Link>{" "}
        eller läs mer på sidan{" "}
        <Link href={costLink.href} className="text-blue-700 hover:underline">
          {costLink.text}
        </Link>
        .
      </p>
    </section>
  );
}
