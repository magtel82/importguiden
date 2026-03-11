import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCountries, getCountryBySlug, getCarBrands, getCarBrandBySlug } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const countrySlugs = getCountries().map((c) => ({ slug: c.slug }));
  const brandSlugs = getCarBrands().map((b) => ({ slug: b.slug }));
  return [...countrySlugs, ...brandSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const country = getCountryBySlug(slug);
  if (country) {
    return {
      title: `Importera bil från ${country.name} – Komplett guide ${new Date().getFullYear()}`,
      description: `Allt du behöver veta för att importera bil privat från ${country.name} till Sverige. Kostnader, process och praktiska råd.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
    };
  }

  const brand = getCarBrandBySlug(slug);
  if (brand) {
    return {
      title: `Importera ${brand.name} från Tyskland – Guide och kostnader`,
      description: `Hur importerar du en ${brand.name} privat från Tyskland? Guide med kostnader, tips och vanliga fallgropar.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
    };
  }

  return {};
}

export default async function ImporteraBilPage({ params }: Props) {
  const { slug } = await params;

  const country = getCountryBySlug(slug);
  const brand = getCarBrandBySlug(slug);

  if (!country && !brand) notFound();

  const updatedDate = new Date().toISOString().split("T")[0];

  if (country) {
    const breadcrumbs = [
      { name: "Hem", href: "/" },
      { name: "Importera bil", href: "/importera-bil/tyskland" },
      { name: `Från ${country.name}` },
    ];

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBreadcrumbJsonLd(
              breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL }))
            )),
          }}
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Importera bil från {country.name} – Komplett guide {new Date().getFullYear()}
              </h1>
              <p className="text-gray-500 text-sm">
                Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
              </p>
            </header>

            <p className="text-gray-700 mb-6 text-lg">
              {country.name} är {country.primaryMarket ? "den största marknaden" : "en populär marknad"} för
              begagnade bilar i Europa. Den här guiden förklarar steg för steg hur du som
              privatperson importerar en bil från {country.name} till Sverige.
            </p>

            {country.notes && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                <p className="text-sm text-blue-800">{country.notes}</p>
              </div>
            )}

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Steg-för-steg: Så importerar du bil från {country.name}
              </h2>
              <ol className="space-y-4">
                {[
                  { title: "Hitta bilen", desc: `Sök på mobile.de, AutoScout24 eller liknande plattformar. Kontrollera att bilen inte är märkt som exportsåld.` },
                  { title: "Besiktiga och köp bilen", desc: "Resa ner för besiktning rekommenderas alltid. Kontrollera servicehistorik, COC-intyg och att bilen är fri från belastningar." },
                  { title: "Exportregistrering och hemtransport", desc: "Säljaren avregistrerar bilen. Du kan köra hem på röda exportskyltar eller anlita transport." },
                  { title: "Ursprungskontroll", desc: "Beställ ursprungskontroll hos Transportstyrelsen (1 240 kr, 2025)." },
                  { title: "Registreringsbesiktning", desc: "Boka registreringsbesiktning hos godkänd station. Ca 1 700 kr för personbil." },
                  { title: "Registrering i Sverige", desc: "När besiktningen är godkänd registrerar Transportstyrelsen bilen och du får svenska skyltar." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Kostnader vid import från {country.name}
              </h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700">Kostnad</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Belopp</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Källa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="p-3">Ursprungskontroll</td><td className="p-3 text-right font-medium">1 240 kr</td><td className="p-3 text-xs text-gray-500">Transportstyrelsen (2025)</td></tr>
                  <tr><td className="p-3">Registreringsbesiktning</td><td className="p-3 text-right font-medium">~1 700 kr</td><td className="p-3 text-xs text-gray-500">Schablonvärde</td></tr>
                  <tr><td className="p-3">Transport (kör hem)</td><td className="p-3 text-right font-medium">~2 000 kr</td><td className="p-3 text-xs text-gray-500">Bränslekostnad</td></tr>
                  <tr><td className="p-3">Moms (om fordon anses nytt)</td><td className="p-3 text-right font-medium">25% av priset</td><td className="p-3 text-xs text-gray-500">Skatteverket</td></tr>
                  <tr><td className="p-3">Tull (EU-import)</td><td className="p-3 text-right font-medium text-green-700">0 kr</td><td className="p-3 text-xs text-gray-500">Tullverket</td></tr>
                </tbody>
              </table>
            </section>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Räkna ut din kostnad</h3>
              <Link href="/kalkylator/bilimport" className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                Öppna kalkylatorn
              </Link>
            </div>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Läs mer</h2>
              <ul className="space-y-2">
                <li><Link href="/guider/registreringsbesiktning" className="text-blue-700 hover:underline text-sm">Guide: Registreringsbesiktning →</Link></li>
                <li><Link href="/guider/coc-intyg" className="text-blue-700 hover:underline text-sm">Guide: COC-intyg →</Link></li>
                <li><Link href="/guider/ursprungskontroll" className="text-blue-700 hover:underline text-sm">Guide: Ursprungskontroll →</Link></li>
                <li><Link href="/guider/moms-vid-bilimport" className="text-blue-700 hover:underline text-sm">Guide: Moms vid bilimport →</Link></li>
              </ul>
            </section>
          </article>
        </div>
      </>
    );
  }

  // Brand page
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera bil", href: "/importera-bil/tyskland" },
    { name: `Importera ${brand!.name}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd(
            breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL }))
          )),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Importera {brand!.name} från Tyskland – Guide {new Date().getFullYear()}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
            </p>
          </header>

          <p className="text-gray-700 mb-6 text-lg">
            Att importera en {brand!.name} privat från Tyskland kan vara ett smart sätt att
            hitta rätt bil till ett bättre pris. Den här guiden förklarar vad du behöver veta.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Är det värt att importera {brand!.name} från Tyskland?
            </h2>
            <p className="text-gray-700 mb-3">
              Tyskland är Europas största begagnatbilsmarknad. Prisskillnaden mot Sverige kan
              vara betydande – men räkna in alla importkostnader: ursprungskontroll, besiktning
              och transport.
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Räkna om det lönar sig</h3>
            <Link href="/kalkylator/bilimport" className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              Öppna importkalkylator
            </Link>
          </div>

          <p className="text-sm text-gray-600">
            Processen är densamma oavsett märke. Se vår fullständiga guide:{" "}
            <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
              Importera bil från Tyskland →
            </Link>
          </p>
        </article>
      </div>
    </>
  );
}
