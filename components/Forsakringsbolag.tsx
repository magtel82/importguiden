import data from "@/data/forsakringsbolag.json";
import { formatCost, costSourceLine, type CostId } from "@/lib/costs";
import { formatDateSv } from "@/lib/date";

/**
 * Neutral jämförelse av vad försäkringsbolagen själva skriver om försäkring
 * för importerade fordon. Data i data/forsakringsbolag.json, priser i
 * data/cost-data.json. Inga partnerlänkar.
 */
export function Forsakringsbolag() {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left p-3 font-semibold text-gray-700">Bolag</th>
            <th className="text-left p-3 font-semibold text-gray-700">Vad bolaget skriver</th>
            <th className="text-left p-3 font-semibold text-gray-700 whitespace-nowrap">Pris</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.bolag.map((b) => (
            <tr key={b.namn}>
              <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                <a href={b.kalla} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                  {b.namn}
                </a>
              </td>
              <td className="p-3 text-gray-700">{b.uppgift}</td>
              <td className="p-3 text-gray-700">
                {b.pris ? (
                  <>
                    <span className="font-medium whitespace-nowrap">{formatCost(b.pris as CostId)}</span>
                    <span className="block text-xs text-gray-500">{costSourceLine(b.pris as CostId)}</span>
                  </>
                ) : (
                  b.prisText
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-3 py-2 text-xs text-gray-500">
        Uppgifterna är hämtade från bolagens egna webbplatser, kontrollerade{" "}
        {formatDateSv(data.kontrollerat)}. Listan är alfabetisk och inte en rekommendation –
        Importguiden har inga samarbeten med försäkringsbolagen. Fler bolag kan erbjuda samma
        sak; fråga ditt eget bolag.
      </p>
    </div>
  );
}
