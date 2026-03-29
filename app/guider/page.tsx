import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export function generateMetadata(): Metadata {
  return {
    title: "Guider om fordonsimport – Importguiden",
    description:
      "Steg-för-steg guider om att importera bil från Europa. Ursprungskontroll, registreringsbesiktning, COC-intyg och momsregler.",
    alternates: { canonical: getCanonicalUrl("/guider") },
    robots: getRobotsForPath("/guider"),
  };
}

const guides = [
  {
    slug: "kopa-bil-mobile-de-autoscout24",
    title: "Söka bil på mobile.de – guide på svenska",
    description:
      "Navigera sajten, filtrera rätt, kontakta säljare och undvik fallgropar. Komplett guide för svenska köpare.",
    time: "6 min",
  },
  {
    slug: "moms-vid-bilimport",
    title: "Moms vid bilimport",
    description:
      "När betalar du moms och när slipper du? EU:s regler om nytt vs begagnat fordon.",
    time: "5 min",
  },
  {
    slug: "ursprungskontroll",
    title: "Ursprungskontroll",
    description:
      "Obligatorisk kontroll via Transportstyrelsen. Hur du beställer och vad som händer sedan.",
    time: "4 min",
  },
  {
    slug: "registreringsbesiktning",
    title: "Registreringsbesiktning",
    description:
      "Vad kontrolleras, var du gör det och vad det kostar. Obligatoriskt för alla importerade fordon.",
    time: "5 min",
  },
  {
    slug: "coc-intyg",
    title: "COC-intyg",
    description:
      "Vad Certificate of Conformity är, varför det krävs och hur du skaffar det.",
    time: "4 min",
  },
  {
    slug: "fordonsskatt-husbil-bonus-malus",
    title: "Fordonsskatt och bonus-malus för husbilar 2025",
    description:
      "Lagändringen februari 2025 tog bort malus för husbilar. Vad gäller nu och vad innebär det för din importkalkyl?",
    time: "5 min",
  },
  {
    slug: "hur-lang-tid-tar-bilimport",
    title: "Hur lång tid tar det att importera bil?",
    description:
      "Realistisk tidslinje från sökning till svenska skyltar. Räkna med 4–8 veckor – här ser du varje steg.",
    time: "5 min",
  },
  {
    slug: "transportera-bil-fran-tyskland",
    title: "Transportera bil från Tyskland",
    description:
      "Köra hem själv, biltransport på trailer eller spedition? Kostnader, fördelar och nackdelar.",
    time: "6 min",
  },
  {
    slug: "importera-elbil",
    title: "Importera elbil – Tesla, BMW i4, VW ID m.fl.",
    description:
      "Vad skiljer elbilsimport? Batteristatus, momsregler och vad du bör kontrollera innan köp.",
    time: "7 min",
  },
  {
    slug: "besikta-husbil",
    title: "Besiktning av importerad husbil",
    description:
      "Fuktmätning, gaskontroll, körkortskrav och var du bokar. Vad som gäller och kostar för husbilsbesiktning.",
    time: "6 min",
  },
];

export default function GuiderPage() {
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Guider" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd(
              breadcrumbs.map((b) => ({
                name: b.name,
                url: b.href ? `${SITE_URL}${b.href}` : SITE_URL,
              }))
            )
          ),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Guider om fordonsimport
        </h1>
        <p className="text-gray-600 mb-8">
          Sakliga steg-för-steg guider för dig som importerar bil eller husbil
          från Europa till Sverige.
        </p>

        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Kompletta steg-för-steg-guider</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/importera-bil/tyskland"
              className="block rounded-lg border-2 border-blue-200 bg-blue-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Importera bil från Tyskland</h3>
              <p className="text-sm text-gray-600">Hela processen: sökning, besiktning, exportskyltar, ursprungskontroll och registrering.</p>
            </Link>
            <Link
              href="/importera-husbil/tyskland"
              className="block rounded-lg border-2 border-blue-200 bg-blue-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Importera husbil från Tyskland</h3>
              <p className="text-sm text-gray-600">Steg för steg: märken, fuktskador, körkortskrav, besiktning och registrering.</p>
            </Link>
          </div>
        </section>

        <h2 className="text-lg font-bold text-gray-900 mb-3">Fördjupningsguider</h2>
        <ul className="space-y-4 mb-10">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guider/${guide.slug}`}
                className="block rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-gray-500">{guide.description}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400 mt-1">
                    {guide.time} läsning
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mb-10">
          <h2 id="markesguider" className="text-lg font-bold text-gray-900 mb-1">Märkesspecifika importguider</h2>
          <p className="text-sm text-gray-600 mb-4">
            ADAC-data, kända problem, rekommenderade modeller och dokument – för just det märke du funderar på.
          </p>

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Personbilar</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[
              { slug: "bmw", name: "BMW", tagline: "3-serie, 5-serie, X3 – 15–40 % lägre pris" },
              { slug: "mercedes", name: "Mercedes-Benz", tagline: "A-klass, C-klass, E-klass – 10–30 % lägre pris" },
              { slug: "volkswagen", name: "Volkswagen", tagline: "Golf, Passat, Tiguan – 10–25 % lägre pris" },
              { slug: "audi", name: "Audi", tagline: "A3, A4, Q3 – ADAC bäst i klass 2025" },
              { slug: "porsche", name: "Porsche", tagline: "Cayenne, Macan, 911 – 20–40 % lägre pris" },
              { slug: "tesla", name: "Tesla", tagline: "Model 3, Model Y – SoH, laddkontakter, garanti" },
            ].map((brand) => (
              <Link
                key={brand.slug}
                href={`/importera-bil/${brand.slug}`}
                className="block rounded-lg p-5 border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">{brand.name}</span>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">Bil</span>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">{brand.tagline}</span>
              </Link>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Husbilar</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { slug: "hymer", name: "Hymer", tagline: "B-klass, ML-T, Exsis – Fiat Ducato-chassi" },
              { slug: "dethleffs", name: "Dethleffs", tagline: "Trend, Esprit, Globebus – prisvärd import" },
              { slug: "burstner", name: "Bürstner", tagline: "Lyseo, Ixeo, Delfin – bred modellflora" },
              { slug: "knaus", name: "Knaus", tagline: "Sun TI, Van TI, Sky TI – halvintegrerad" },
              { slug: "hobby", name: "Hobby", tagline: "Optima, De Luxe – Tysklands folkligaste märke" },
            ].map((brand) => (
              <Link
                key={brand.slug}
                href={`/importera-husbil/${brand.slug}`}
                className="block rounded-lg p-5 border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">{brand.name}</span>
                  <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">Husbil</span>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">{brand.tagline}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">
            Räkna ut din totalkostnad
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Använd vår kalkylator för att se vad importen kostar – moms,
            ursprungskontroll, besiktning och transport.
          </p>
          <Link
            href="/kalkylator/bilimport"
            className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Öppna kalkylatorn
          </Link>
        </div>
      </div>
    </>
  );
}
