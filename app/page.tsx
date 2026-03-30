import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { ProcessSteps } from "@/components/ProcessSteps";
import { CostOverview } from "@/components/CostOverview";

export const metadata: Metadata = {
  title: "Importera bil eller husbil privat från Europa – Oberoende guide 2026",
  description:
    "Oberoende, källhänvisad information om privat import av personbil och husbil från EU till Sverige. Gratis kalkylator, steg-för-steg-guider och aktuella kostnader.",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  robots: getRobotsForPath("/"),
};

const guides = [
  {
    href: "/importera-bil/tyskland",
    title: "Importera bil från Tyskland",
    description: "Komplett guide: sökning, besiktning, exportskyltar, ursprungskontroll och registrering.",
  },
  {
    href: "/importera-husbil/tyskland",
    title: "Importera husbil från Tyskland",
    description: "Husbilsimport steg för steg – märken, körkortskrav, fuktskador och besiktning.",
  },
  {
    href: "/kalkylator/bilimport",
    title: "Importkalkylator",
    description: "Räkna ut totalkostnaden – moms, besiktning, försäkring och transport.",
  },
  {
    href: "/guider/ursprungskontroll",
    title: "Ursprungskontroll",
    description: "Obligatorisk kontroll via Transportstyrelsen. 1 240 kr, 2–5 dagars handläggningstid.",
  },
  {
    href: "/guider/registreringsbesiktning",
    title: "Registreringsbesiktning",
    description: "Vad som kontrolleras, var du bokar och vad det kostar (ca 1 500–1 900 kr).",
  },
  {
    href: "/guider/moms-vid-bilimport",
    title: "Moms vid bilimport",
    description: "När betalar du 25% moms? Regler för nytt vs begagnat fordon förklarade.",
  },
  {
    href: "/guider#markesguider",
    title: "Märkesguider – bil",
    description: "BMW, Mercedes, VW, Audi, Porsche och Tesla – ADAC-data, kända fel och tips per märke.",
  },
  {
    href: "/guider#markesguider",
    title: "Märkesguider – husbil",
    description: "Hymer, Dethleffs, Bürstner, Knaus och Hobby – chassiinfo, Ducato-varning och kontrollpunkter.",
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
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-3 sm:text-4xl">
            Importera fordon från Europa — steg för steg
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            Oberoende guide med aktuella kostnader, kalkylator och praktiska råd
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
            <Link
              href="/importera-bil/guide"
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label="Importera bil – steg-för-steg-guide"
            >
              <span className="text-3xl" aria-hidden="true">🚗</span>
              <span className="font-semibold text-gray-900">Importera bil</span>
              <span className="text-sm text-gray-500">Steg-för-steg från Tyskland och Europa</span>
            </Link>
            <Link
              href="/importera-husbil/guide"
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label="Importera husbil – komplett guide"
            >
              <span className="text-3xl" aria-hidden="true">🚐</span>
              <span className="font-semibold text-gray-900">Importera husbil</span>
              <span className="text-sm text-gray-500">Komplett guide med husbilsspecifika krav</span>
            </Link>
            <Link
              href="/kalkylator/bilimport"
              className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label="Räkna på importkostnaden"
            >
              <span className="text-3xl" aria-hidden="true">🧮</span>
              <span className="font-semibold text-gray-900">Räkna på kostnaden</span>
              <span className="text-sm text-gray-500">Importkalkylatorn med aktuell växelkurs</span>
            </Link>
          </div>
          <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r text-left max-w-2xl">
            <p className="text-sm text-blue-900">
              <strong>Husbilar:</strong> avskaffad malus sedan februari 2025 – importerade husbilar träffas inte längre av miljöbilsavgift.
            </p>
          </div>
        </section>

        {/* Ny här? */}
        <section className="mb-16 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Ny på fordonsimport?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Börja här – tre steg som ger dig hela bilden innan du bestämmer dig.
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-gray-700">
                <Link href="/kalkylator/bilimport" className="text-blue-700 font-medium hover:underline">Räkna ut din kostnad</Link> – se om importen lönar sig
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-gray-700">
                Läs <Link href="/guider/hur-lang-tid-tar-bilimport" className="text-blue-700 font-medium hover:underline">hur lång tid det tar</Link> – realistisk tidslinje
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-gray-700">
                Följ hela guiden: <Link href="/importera-bil/tyskland" className="text-blue-700 font-medium hover:underline">bil</Link> eller <Link href="/importera-husbil/tyskland" className="text-blue-700 font-medium hover:underline">husbil</Link> – steg för steg
              </span>
            </li>
          </ol>
        </section>

        {/* Process steps */}
        <ProcessSteps />

        {/* Guides grid */}
        <section className="mb-16" aria-labelledby="guider-rubrik">
          <h2 id="guider-rubrik" className="text-2xl font-bold text-gray-900 mb-6">
            Guider och verktyg
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="block rounded-lg p-5 hover:shadow-sm transition-all border border-gray-200 bg-gray-50 hover:border-blue-400"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
                <p className="text-sm text-gray-500">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Kostnadsoversikt */}
        <CostOverview />

        {/* Trust / E-E-A-T */}
        <section className="bg-gray-50 rounded-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Om Importguiden</h2>
          <p className="text-sm text-gray-600 mb-4">
            Importguiden är en oberoende informationssajt för privatpersoner som funderar på
            att importera bil eller husbil från Europa. Vi har ingen koppling till importföretag,
            bilhandlare eller transportbolag – vår uppgift är att ge dig saklig information
            så att du kan fatta ett välgrundat beslut på egen hand.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 mb-4">
            <li className="flex gap-2">
              <span className="text-green-700 font-bold shrink-0">✓</span>
              Källhänvisad information – Transportstyrelsen, Tullverket, Skatteverket
            </li>
            <li className="flex gap-2">
              <span className="text-green-700 font-bold shrink-0">✓</span>
              Ingen säljagenda – vi säljer inga importtjänster eller bilar
            </li>
            <li className="flex gap-2">
              <span className="text-green-700 font-bold shrink-0">✓</span>
              Uppdateras när avgifter och regler ändras
            </li>
            <li className="flex gap-2">
              <span className="text-green-700 font-bold shrink-0">✓</span>
              Gratis kalkylator – ingen registrering krävs
            </li>
          </ul>
          <p className="text-xs text-gray-400">
            Sajten finansieras delvis via affiliate-länkar, tydligt märkta med (annonslänk).{" "}
            <Link href="/finansiering" className="hover:underline">Läs mer om hur vi finansieras</Link>.
          </p>
        </section>

      </div>
    </>
  );
}
