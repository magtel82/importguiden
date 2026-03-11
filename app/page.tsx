import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Importguiden – Oberoende guide till privat fordonsimport",
  description:
    "Lär dig allt om att importera bil och husbil privat från Tyskland och Europa. Gratis kalkylator, steg-för-steg-guider och aktuell information.",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
};

const guides = [
  {
    href: "/importera-bil/tyskland",
    title: "Importera bil från Tyskland",
    description: "Komplett guide med kostnader, processen steg för steg och praktiska råd.",
  },
  {
    href: "/importera-husbil/tyskland",
    title: "Importera husbil från Tyskland",
    description: "Allt om att köpa husbil i Tyskland och ta hem den till Sverige.",
  },
  {
    href: "/kalkylator/bilimport",
    title: "Importkalkylator",
    description: "Räkna ut din totala kostnad – moms, besiktning, transport och mer.",
  },
  {
    href: "/guider/registreringsbesiktning",
    title: "Registreringsbesiktning",
    description: "Vad som kontrolleras, var du gör det och vad det kostar.",
  },
  {
    href: "/guider/coc-intyg",
    title: "COC-intyg",
    description: "Vad är Certificate of Conformity och hur skaffar du det?",
  },
  {
    href: "/guider/ursprungskontroll",
    title: "Ursprungskontroll",
    description: "Obligatorisk kontroll via Transportstyrelsen – så fungerar det.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Importguiden",
  url: "https://importguiden.se",
  description: "Oberoende information om privat fordonsimport från EU till Sverige.",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Importera bil från Europa – oberoende guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Importguiden ger dig saklig, faktagranskad information om privat fordonsimport
            från EU till Sverige. Vi säljer inga importtjänster.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/kalkylator/bilimport"
              className="rounded bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800"
            >
              Räkna importkostnad
            </Link>
            <Link
              href="/importera-bil/tyskland"
              className="rounded border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Börja med guiden
            </Link>
          </div>
        </section>

        {/* Guides grid */}
        <section aria-labelledby="guider-rubrik">
          <h2 id="guider-rubrik" className="text-2xl font-bold text-gray-900 mb-6">
            Populära guider
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="block rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
                <p className="text-sm text-gray-500">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust section */}
        <section className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Varför Importguiden?</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              Oberoende – vi säljer inga importtjänster eller bilar
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              Källhänvisad information – Transportstyrelsen, Tullverket, Skatteverket
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              Regelbundet uppdaterad när lagar och avgifter ändras
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              Gratis kalkylator utan registrering
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
