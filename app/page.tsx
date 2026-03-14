import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Importera bil privat från Europa – Oberoende guide 2025",
  description:
    "Lär dig importera bil eller husbil privat från Tyskland och EU till Sverige. Gratis kalkylator, steg-för-steg-guider och källhänvisad information om kostnader och process.",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
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
];

const steps = [
  { n: "1", title: "Hitta bilen", body: "Sök på mobile.de eller AutoScout24. Kontrollera VIN-numret och boka oberoende besiktning (TÜV/ADAC) innan köp." },
  { n: "2", title: "Köp och papper", body: "Skriv köpekontrakt. Säkra COC-intyget. Säljaren avregistrerar bilen och lämnar avregistreringsintyg." },
  { n: "3", title: "Hemtransport", body: "Ordna exportregistrering (röda skyltar) och importförsäkring. Kör hem eller anlita transportföretag." },
  { n: "4", title: "Ursprungskontroll", body: "Beställ ursprungskontroll via Transportstyrelsen (1 240 kr). Handläggningstid 2–5 dagar." },
  { n: "5", title: "Besiktning och registrering", body: "Genomför registreringsbesiktning (ca 1 700 kr för personbil). Registrera sedan bilen i Sverige." },
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
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Importera bil privat från Europa
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Oberoende, källhänvisad information om privat fordonsimport från EU till Sverige.
            Vi säljer inga importtjänster – vi hjälper dig förstå processen och räkna på kostnaderna.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
            Tillkommande fasta kostnader vid bilimport: ursprungskontroll (1 240 kr),
            registreringsbesiktning (ca 1 700 kr) och importförsäkring. Ingen tull vid köp inom EU.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/kalkylator/bilimport"
              className="rounded bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800"
            >
              Räkna ut din importkostnad
            </Link>
            <Link
              href="/importera-bil/tyskland"
              className="rounded border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Läs guiden
            </Link>
          </div>
        </section>

        {/* Process steps */}
        <section className="mb-16" aria-labelledby="process-rubrik">
          <h2 id="process-rubrik" className="text-2xl font-bold text-gray-900 mb-6">
            Så går en bilimport till
          </h2>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {steps.map((s) => (
              <li key={s.n} className="rounded-lg border border-gray-200 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white mb-3">
                  {s.n}
                </span>
                <p className="font-semibold text-gray-900 mb-1 text-sm">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-gray-500">
            Hela processen förklarad i detalj:{" "}
            <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
              Importera bil från Tyskland – komplett guide
            </Link>
          </p>
        </section>

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
                className="block rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
                <p className="text-sm text-gray-500">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Kostnadsoversikt */}
        <section className="mb-16" aria-labelledby="kostnad-rubrik">
          <h2 id="kostnad-rubrik" className="text-2xl font-bold text-gray-900 mb-4">
            Vad kostar det att importera bil?
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Utöver bilpriset tillkommer dessa fasta kostnader vid import av personbil från EU.
            Ingen tull tillkommer vid köp från EU-länder.
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse border border-gray-200 rounded">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Kostnad</th>
                  <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Belopp</th>
                  <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Källa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-3 text-gray-700">Ursprungskontroll</td>
                  <td className="p-3 text-right font-medium">1 240 kr</td>
                  <td className="p-3 text-gray-500 text-xs">Transportstyrelsen (2025)</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Registreringsbesiktning, personbil</td>
                  <td className="p-3 text-right font-medium">~1 700 kr</td>
                  <td className="p-3 text-gray-500 text-xs">Schablonvärde</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Importförsäkring</td>
                  <td className="p-3 text-right font-medium">~1 500 kr</td>
                  <td className="p-3 text-gray-500 text-xs">Schablonvärde</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Transport (kör hem från Tyskland)</td>
                  <td className="p-3 text-right font-medium">~5 000–7 000 kr</td>
                  <td className="p-3 text-gray-500 text-xs">Schablonvärde</td>
                </tr>
                <tr>
                  <td className="p-3 text-gray-700">Tull (import inom EU)</td>
                  <td className="p-3 text-right font-medium text-green-700">0 kr</td>
                  <td className="p-3 text-gray-500 text-xs">Tullverket</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500">
            Räkna ut din exakta totalkostnad i{" "}
            <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
              importkalkylatorn
            </Link>{" "}
            eller läs mer på sidan{" "}
            <Link href="/importera-bil/kostnad" className="text-blue-700 hover:underline">
              vad kostar det att importera bil
            </Link>
            .
          </p>
        </section>

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
