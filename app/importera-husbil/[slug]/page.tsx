import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCountries, getCountryBySlug, getMotorhomeBrands } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const countrySlugs = getCountries().map((c) => ({ slug: c.slug }));
  const brandSlugs = getMotorhomeBrands().map((b) => ({ slug: b.slug }));
  return [...countrySlugs, ...brandSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const robots = getRobotsForPath(`/importera-husbil/${slug}`);
  const country = getCountryBySlug(slug);
  if (country) {
    return {
      title: `Importera husbil från ${country.name} – Komplett guide ${new Date().getFullYear()}`,
      description: `Steg-för-steg guide för att importera husbil privat från ${country.name}. Kostnader, besiktning och råd.`,
      alternates: { canonical: getCanonicalUrl(`/importera-husbil/${slug}`) },
      robots,
    };
  }

  const brands = getMotorhomeBrands();
  const brand = brands.find((b) => b.slug === slug);
  if (brand) {
    return {
      title: `Importera ${brand.name} husbil från Tyskland – Guide`,
      description: `Allt om att importera ${brand.name} husbil privat från Tyskland.`,
      alternates: { canonical: getCanonicalUrl(`/importera-husbil/${slug}`) },
      robots,
    };
  }

  return {};
}

export default async function ImporteraHusbilPage({ params }: Props) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  const brands = getMotorhomeBrands();
  const brand = brands.find((b) => b.slug === slug);

  if (!country && !brand) notFound();

  const updatedDate = new Date().toISOString().split("T")[0];

  if (country) {
    const breadcrumbs = [
      { name: "Hem", href: "/" },
      { name: "Importera husbil", href: "/importera-husbil/tyskland" },
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
                Importera husbil från {country.name} – Komplett guide {new Date().getFullYear()}
              </h1>
              <p className="text-gray-500 text-sm">
                Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
              </p>
            </header>

            <p className="text-gray-700 mb-6 text-lg">
              {country.name} är en av de bästa marknaderna för begagnade husbilar i Europa.
              Priserna är ofta lägre än i Sverige och utbudet är stort.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r">
              <p className="text-sm text-amber-800">
                <strong>Obs:</strong> Husbilsimport skiljer sig från bilimport – besiktningen är
                mer omfattande (ca 3 000–5 000 kr) och transport av en husbil kostar mer.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Kostnadsöversikt</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700">Kostnad</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Belopp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="p-3">Ursprungskontroll</td><td className="p-3 text-right font-medium">1 240 kr</td></tr>
                  <tr><td className="p-3">Registreringsbesiktning</td><td className="p-3 text-right font-medium">~3 000–5 000 kr</td></tr>
                  <tr><td className="p-3">Transport</td><td className="p-3 text-right font-medium">~8 000–15 000 kr</td></tr>
                  <tr><td className="p-3">Tull (EU-import)</td><td className="p-3 text-right font-medium text-green-700">0 kr</td></tr>
                </tbody>
              </table>
            </section>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Räkna din totala kostnad</h3>
              <Link href="/kalkylator/bilimport" className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                Öppna kalkylatorn
              </Link>
            </div>
          </article>
        </div>
      </>
    );
  }

  // Brand page
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera husbil", href: "/importera-husbil/tyskland" },
    { name: `Importera ${brand!.name}` },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Importera {brand!.name} husbil från Tyskland
      </h1>
      <p className="text-gray-700 mb-6">
        Guide för att importera {brand!.name} privat från Tyskland till Sverige.
      </p>
      <Link href="/importera-husbil/tyskland" className="text-blue-700 hover:underline text-sm">
        ← Tillbaka till guide: Importera husbil från Tyskland
      </Link>
    </div>
  );
}
