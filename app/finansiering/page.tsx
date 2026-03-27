import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";

export function generateMetadata(): Metadata {
  return {
    title: "Så finansieras Importguiden – Transparens om affiliate",
    description:
      "Importguiden finansieras via affiliate-samarbeten. Här förklarar vi hur det fungerar och hur det påverkar – eller inte påverkar – vårt innehåll.",
    alternates: { canonical: getCanonicalUrl("/finansiering") },
    robots: getRobotsForPath("/finansiering"),
  };
}

export default function FinansieringPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Så finansieras Importguiden</h1>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Oberoende, men inte gratis att driva</h2>
        <p className="text-gray-700 mb-3">
          Importguiden är en oberoende informationssajt utan koppling till importföretag,
          bilhandlare eller fordonstillverkare. Vi säljer inga importtjänster och tar inte betalt
          för att nämna en tjänst i redaktionellt innehåll.
        </p>
        <p className="text-gray-700">
          Att producera och underhålla saklig, faktagranskad information kostar tid. För att
          kunna fortsätta erbjuda detta gratis finansieras sajten delvis via
          affiliate-samarbeten.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Vad är ett affiliate-samarbete?</h2>
        <p className="text-gray-700 mb-3">
          Vi har avtal med utvalda tjänsteleverantörer inom områden som är relevanta för
          fordonsimport – till exempel valutaväxling och fordonsförsäkring. Om du väljer att
          använda en av dessa tjänster via en länk på vår sajt kan vi få en liten provision,
          utan extra kostnad för dig.
        </p>
        <p className="text-gray-700">
          Alla affiliate-länkar är tydligt märkta med <strong>(annonslänk)</strong> direkt i texten.
        </p>
      </section>

      <section className="mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Principen vi aldrig frångår</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-700 font-bold flex-shrink-0">✓</span>
              Vi rekommenderar enbart tjänster som är relevanta för din situation som fordonsimportör.
            </li>
            <li className="flex gap-2">
              <span className="text-green-700 font-bold flex-shrink-0">✓</span>
              Vi accepterar inga betalda omnämnanden, sponsrade artiklar eller betalt
              redaktionellt innehåll.
            </li>
            <li className="flex gap-2">
              <span className="text-green-700 font-bold flex-shrink-0">✓</span>
              Provisionens storlek påverkar aldrig vilka tjänster vi nämner eller hur vi
              värderar dem.
            </li>
            <li className="flex gap-2">
              <span className="text-green-700 font-bold flex-shrink-0">✓</span>
              Saklig information publiceras oavsett om det finns ett affiliate-avtal eller inte.
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Nuvarande samarbetspartner</h2>
        <p className="text-gray-700 mb-3">
          Vi strävar efter att alltid ha en aktuell lista här.
        </p>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Wise – valutaväxling vid betalning utomlands</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Annonser</h2>
        <p className="text-gray-700">
          Om vi i framtiden visar kontextuella annonser kommer dessa att vara tydligt märkta
          och aldrig ta fokus från innehållet. Vi använder inga pop-ups eller banners.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Frågor?</h2>
        <p className="text-gray-700">
          Kontakta oss på{" "}
          <a href="mailto:info@importguiden.se" className="text-blue-700 underline hover:text-blue-800">
            info@importguiden.se
          </a>
          .
        </p>
      </section>
    </div>
  );
}
