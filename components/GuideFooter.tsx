import Link from "next/link";
import { getRelatedGuides, getGuide } from "@/lib/guides";

interface GuideFooterProps {
  slug: string;
}

/**
 * Avslutning på varje guidesida: relaterade guider + kalkylator-CTA.
 *
 * Ersätter de handskrivna "Läs mer"-blocken som tidigare fanns i vissa
 * MDX-filer men saknades i andra. Relationerna underhålls på ett ställe
 * (RELATED_GUIDES i lib/guides.ts).
 */
export function GuideFooter({ slug }: GuideFooterProps) {
  const related = getRelatedGuides(slug);
  const guide = getGuide(slug);

  // Husbilsguider ska peka mot husbilsflödet, övriga mot bilflödet.
  const isMotorhome = guide?.category === "husbil";
  const flagshipHref = isMotorhome
    ? "/importera-husbil/tyskland"
    : "/importera-bil/tyskland";
  const flagshipLabel = isMotorhome
    ? "Importera husbil från Tyskland"
    : "Importera bil från Tyskland";

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      {related.length > 0 && (
        <section aria-labelledby="relaterade-guider-rubrik" className="mb-8">
          <h2
            id="relaterade-guider-rubrik"
            className="text-xl font-bold text-gray-900 mb-1"
          >
            Nästa steg
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Guider som hänger ihop med det här steget i importprocessen.
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/guider/${r.slug}`}
                  className="flex h-full flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-blue-400 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="mb-1 font-semibold text-gray-900">
                    {r.title}
                  </span>
                  <span className="text-sm text-gray-600">{r.description}</span>
                  <span className="mt-2 text-xs text-gray-400">
                    {r.time} läsning
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="guide-verktyg-rubrik"
        className="rounded-lg border border-gray-200 bg-gray-50 p-6"
      >
        <h2
          id="guide-verktyg-rubrik"
          className="mb-2 font-semibold text-gray-900"
        >
          Räkna ut din totalkostnad
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Se vad importen kostar totalt – moms, ursprungskontroll,
          registreringsbesiktning, försäkring och transport.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/kalkylator/bilimport"
            className="flex min-h-[48px] w-full items-center justify-center rounded bg-blue-700 px-4 py-3 text-sm font-medium whitespace-nowrap text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
          >
            Öppna kalkylatorn
          </Link>
          <Link
            href={flagshipHref}
            className="flex min-h-[48px] w-full items-center justify-center rounded border border-gray-300 px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
          >
            {flagshipLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
