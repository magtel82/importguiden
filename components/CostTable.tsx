"use client";

import importCostsData from "@/datasets/import-costs.json";
import { ExternalLink } from "lucide-react";

interface CostEntry {
  id: string;
  name: string;
  amount?: number;
  amountMin?: number;
  amountMax?: number;
  isRange?: boolean;
  isApproximate?: boolean;
  currency: string;
  validFrom: string;
  source: string;
  sourceUrl: string | null;
  note: string;
  appliesTo: string[];
}

interface CostTableProps {
  vehicleType: "bil" | "husbil";
  showTotal?: boolean;
  compact?: boolean;
  highlightId?: string;
}

const SWEDISH_MONTHS = [
  "jan", "feb", "mar", "apr", "maj", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function formatValidFrom(isoDate: string): string {
  const [year, month] = isoDate.split("-");
  return `${SWEDISH_MONTHS[parseInt(month) - 1]} ${year}`;
}

function formatVerifiedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  const monthNames = [
    "januari", "februari", "mars", "april", "maj", "juni",
    "juli", "augusti", "september", "oktober", "november", "december",
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
}

function formatAmount(entry: CostEntry): string {
  if (entry.isRange && entry.amountMin !== undefined && entry.amountMax !== undefined) {
    return `${entry.amountMin.toLocaleString("sv-SE")}–${entry.amountMax.toLocaleString("sv-SE")} kr`;
  }
  if (entry.currency === "EUR") {
    return `ca ${entry.amount} €`;
  }
  const prefix = entry.isApproximate ? "ca " : "";
  return `${prefix}${entry.amount?.toLocaleString("sv-SE")} kr`;
}

export function CostTable({
  vehicleType,
  showTotal = true,
  compact = false,
  highlightId,
}: CostTableProps) {
  const costs = (importCostsData.costs as CostEntry[]).filter((c) =>
    c.appliesTo.includes(vehicleType)
  );

  const fixedSekTotal = costs
    .filter((c) => !c.isRange && c.currency === "SEK" && c.amount !== undefined)
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const hasApprox = costs.some(
    (c) => c.isApproximate && !c.isRange && c.currency === "SEK"
  );
  const hasExtras = costs.some((c) => c.currency === "EUR" || c.isRange);

  if (compact) {
    return (
      <div className="my-3 rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {costs.map((cost) => (
              <tr
                key={cost.id}
                className={`${
                  highlightId === cost.id
                    ? "border-l-2 border-blue-700 bg-blue-50"
                    : ""
                }`}
              >
                <td className="px-3 py-2 text-gray-700">{cost.name}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {formatAmount(cost)}
                </td>
              </tr>
            ))}
            {showTotal && (
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="px-3 py-2 font-semibold text-gray-900">
                  Summa avgifter
                </td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {hasApprox ? "ca " : ""}
                  {fixedSekTotal.toLocaleString("sv-SE")} kr
                  {hasExtras && (
                    <span className="font-normal text-gray-500"> + transport</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-700">
                Avgift
              </th>
              <th className="text-right p-3 font-semibold text-gray-700 whitespace-nowrap">
                Belopp
              </th>
              <th className="text-left p-3 font-semibold text-gray-700">
                Källa
              </th>
              <th className="text-left p-3 font-semibold text-gray-700 hidden sm:table-cell whitespace-nowrap">
                Gäller fr.o.m.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {costs.map((cost) => (
              <tr
                key={cost.id}
                className={`hover:bg-gray-50 transition-colors ${
                  highlightId === cost.id
                    ? "border-l-2 border-blue-700 bg-blue-50"
                    : ""
                }`}
              >
                <td className="p-3 text-gray-700">
                  <span className="font-medium">{cost.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{cost.note}</p>
                </td>
                <td className="p-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {formatAmount(cost)}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {cost.sourceUrl ? (
                    <a
                      href={cost.sourceUrl}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                    >
                      <span>{cost.source}</span>
                      <ExternalLink
                        className="h-3 w-3 flex-shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    cost.source
                  )}
                </td>
                <td className="p-3 text-xs text-gray-500 hidden sm:table-cell">
                  {formatValidFrom(cost.validFrom)}
                </td>
              </tr>
            ))}
            {showTotal && (
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="p-3 font-semibold text-gray-900">
                  Summa fasta avgifter
                </td>
                <td className="p-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {hasApprox ? "ca " : ""}
                  {fixedSekTotal.toLocaleString("sv-SE")} kr
                  {hasExtras && (
                    <span className="block text-xs font-normal text-gray-500">
                      + exportskyltar och transport
                    </span>
                  )}
                </td>
                <td className="p-3" />
                <td className="p-3 hidden sm:table-cell" />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Senast verifierad: {formatVerifiedDate(importCostsData._meta.lastVerified)}.{" "}
        Priserna är uppskattningar och kan variera. Kontrollera alltid aktuella
        belopp hos respektive myndighet.
      </p>
    </div>
  );
}
