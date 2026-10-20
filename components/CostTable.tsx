"use client";

import { ExternalLink } from "lucide-react";
import { formatDateSv } from "@/lib/date";
import { feeRows, feeTotal, formatSekRange, type FeeRow } from "@/lib/costs";

interface CostTableProps {
  vehicleType: "bil" | "husbil";
  showTotal?: boolean;
  compact?: boolean;
  highlightId?: string;
}

const TYPE_LABEL: Record<FeeRow["type"], string> = {
  officiell: "Officiell avgift",
  marknadspris: "Publicerat pris",
  schablon: "Uppskattning",
};

/**
 * Fasta avgifter vid import. Raderna och summan kommer från lib/costs.ts
 * (data/cost-data.json) – samma underlag som kalkylatorn och sidtexterna.
 */
export function CostTable({
  vehicleType,
  showTotal = true,
  compact = false,
  highlightId,
}: CostTableProps) {
  const rows = feeRows(vehicleType);
  const total = formatSekRange(feeTotal(vehicleType));
  const footnote =
    vehicleType === "husbil"
      ? "Importförsäkring för husbil har inget publicerat pris och ingår inte – begär offert."
      : null;

  if (compact) {
    return (
      <div className="my-3 rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr
                key={r.id}
                className={highlightId === r.id ? "border-l-2 border-blue-700 bg-blue-50" : ""}
              >
                <td className="px-3 py-2 text-gray-700">{r.label}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {formatSekRange(r)}
                </td>
              </tr>
            ))}
            {showTotal && (
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="px-3 py-2 font-semibold text-gray-900">Summa avgifter</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {total}
                  <span className="font-normal text-gray-500"> + transport</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {footnote && <p className="px-3 py-2 text-xs text-gray-500">{footnote}</p>}
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 font-semibold text-gray-700">Avgift</th>
              <th className="text-right p-3 font-semibold text-gray-700 whitespace-nowrap">Belopp</th>
              <th className="text-left p-3 font-semibold text-gray-700">Källa</th>
              <th className="text-left p-3 font-semibold text-gray-700 hidden sm:table-cell whitespace-nowrap">
                Kontrollerat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr
                key={r.id}
                className={`hover:bg-gray-50 transition-colors ${
                  highlightId === r.id ? "border-l-2 border-blue-700 bg-blue-50" : ""
                }`}
              >
                <td className="p-3 text-gray-700">
                  <span className="font-medium">{r.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TYPE_LABEL[r.type]}
                    {r.note ? ` – ${r.note}` : ""}
                  </p>
                </td>
                <td className="p-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {formatSekRange(r)}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  <a
                    href={r.sourceUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                  >
                    <span>{r.source}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                  </a>
                </td>
                <td className="p-3 text-xs text-gray-500 hidden sm:table-cell whitespace-nowrap">
                  {formatDateSv(r.checked)}
                </td>
              </tr>
            ))}
            {showTotal && (
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="p-3 font-semibold text-gray-900">Summa fasta avgifter</td>
                <td className="p-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                  {total}
                  <span className="block text-xs font-normal text-gray-500">
                    + transport och eventuell moms
                  </span>
                </td>
                <td className="p-3" />
                <td className="p-3 hidden sm:table-cell" />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {footnote ? `${footnote} ` : ""}
        Besiktningsföretagen sätter egna priser – beloppet för registreringsbesiktning bygger på
        publicerade prislistor och kan skilja sig hos din station.
      </p>
    </div>
  );
}
