"use client";

import { useMemo, useState, useId } from "react";
import glossary from "@/data/german-car-terms.json";

interface Term {
  term: string;
  category: string;
  sv: string;
  important?: boolean;
}

const TERMS = glossary.terms as Term[];
const CATEGORIES = glossary.categories as Record<string, string>;

/**
 * Sökbar ordlista över tyska fordonstermer.
 *
 * Renderas inne i en MDX-guide via components-objektet i
 * app/guider/[slug]/page.tsx. Datan ligger i data/german-car-terms.json.
 */
export function GlossaryTable() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("alla");
  const searchId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((t) => {
      const matchesCategory = category === "alla" || t.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) || t.sv.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const btnBase =
    "rounded px-3 py-2 text-sm font-medium whitespace-nowrap min-h-[48px] focus:outline-none focus:ring-2 focus:ring-blue-500";
  const btnActive = `${btnBase} bg-blue-700 text-white`;
  const btnInactive = `${btnBase} border border-gray-300 text-gray-700 hover:bg-gray-50`;

  return (
    // not-prose: ordlistan ska inte ärva prose-typografin från MDX-wrappern
    <div className="not-prose my-8">
      <div className="mb-4">
        <label
          htmlFor={searchId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Sök term
        </label>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="t.ex. unfallfrei, HU, dragkrok"
          className="w-full rounded border border-gray-300 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory("alla")}
          className={category === "alla" ? btnActive : btnInactive}
          aria-pressed={category === "alla"}
        >
          Alla
        </button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={category === key ? btnActive : btnInactive}
            aria-pressed={category === key}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm text-gray-600" role="status" aria-live="polite">
        {filtered.length === 0
          ? "Inga träffar. Prova ett kortare sökord."
          : `Visar ${filtered.length} av ${TERMS.length} termer.`}
      </p>

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Tyska fordonstermer med svensk förklaring
            </caption>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  scope="col"
                  className="px-4 py-3 text-sm font-semibold text-gray-900"
                >
                  Tysk term
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-sm font-semibold text-gray-900"
                >
                  Betydelse på svenska
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.term}
                  className="border-b border-gray-200 last:border-b-0 even:bg-gray-50"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 align-top text-sm font-semibold text-gray-900"
                  >
                    {t.term}
                    {t.important && (
                      <span className="mt-1 block text-xs font-medium text-blue-700">
                        Extra viktig vid import
                      </span>
                    )}
                  </th>
                  <td className="px-4 py-3 align-top text-sm text-gray-600">
                    {t.sv}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
