import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCountries, getCountryBySlug, getCarBrands, getCarBrandBySlug, getCarBrandImportData, formatSEK } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/headings";

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

  const robots = getRobotsForPath(`/importera-bil/${slug}`);
  const country = getCountryBySlug(slug);
  if (country) {
    return {
      title: `Importera bil från ${country.name} – Komplett guide ${new Date().getFullYear()}`,
      description: `Allt du behöver veta för att importera bil privat från ${country.name} till Sverige. Kostnader, process och praktiska råd.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
      robots,
    };
  }

  const brand = getCarBrandBySlug(slug);
  if (brand) {
    const importData = getCarBrandImportData(slug);
    const year = new Date().getFullYear();
    return {
      title: importData
        ? `Importera ${brand.name} från Tyskland – Guide ${year} (ADAC-data, kostnader)`
        : `Importera ${brand.name} från Tyskland – Guide och kostnader`,
      description: importData
        ? `Importera ${brand.name} privat från Tyskland. Rekommenderade modeller, kända problem (ADAC Pannenstatistik 2025), dokument att begära och kalkylator.`
        : `Hur importerar du en ${brand.name} privat från Tyskland? Guide med kostnader, tips och vanliga fallgropar.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
      robots,
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

    // Flagship page: render full MDX content for Germany
    if (slug === "tyskland") {
      const mdxPath = path.join(process.cwd(), "content/importera-bil/tyskland.mdx");
      const source = await readFile(mdxPath, "utf-8");
      const headings = extractHeadings(source);
      const { content } = await compileMDX({
        source,
        options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
        components: { AffiliateLink },
      });

      const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Importera bil från Tyskland – Komplett guide 2026",
        datePublished: "2026-03-11",
        dateModified: "2026-03-13",
        author: { "@type": "Organization", name: "Importguiden", url: SITE_URL },
        publisher: { "@type": "Organization", name: "Importguiden", url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/importera-bil/tyskland` },
      };

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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <div className="mx-auto max-w-3xl px-4 py-10">
            <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
            <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-table:text-sm">
              <h1>Importera bil från Tyskland – Komplett guide 2026</h1>
              <TableOfContents headings={headings} />
              {content}
            </article>
          </div>
        </>
      );
    }

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
  const importData = getCarBrandImportData(brand!.slug);
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera bil", href: "/importera-bil/tyskland" },
    { name: `Importera ${brand!.name}` },
  ];

  // Fallback: thin page for brands without import data
  if (!importData) {
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
            </header>
            <p className="text-gray-700 mb-6">
              Att importera en {brand!.name} privat från Tyskland kan vara ett smart sätt att
              hitta rätt bil till ett bättre pris.
            </p>
            <p className="text-sm text-gray-600">
              Processen är densamma oavsett märke. Se vår fullständiga guide:{" "}
              <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
                Importera bil från Tyskland
              </Link>
            </p>
          </article>
        </div>
      </>
    );
  }

  // Rich brand page with import data
  const severityStyles: Record<string, { border: string; bg: string; text: string; label: string }> = {
    "hög": { border: "border-amber-600", bg: "bg-amber-50", text: "text-amber-800", label: "Hög risk" },
    "medel": { border: "border-blue-600", bg: "bg-blue-50", text: "text-blue-800", label: "Kontrollera" },
    "låg": { border: "border-gray-300", bg: "bg-gray-50", text: "text-gray-700", label: "Mindre allvarligt" },
  };

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
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Importera {importData.name} från Tyskland – Guide {new Date().getFullYear()}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
              {" "}· Källa: {importData.adacSource}
            </p>
          </header>

          {/* Intro */}
          <div className="mb-8 space-y-4">
            {importData.intro.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tesla-specific section */}
          {importData.teslaSpecific && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Så skiljer sig Tesla-köpet
              </h2>
              {importData.specialCaseNote && (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4 rounded-r">
                  <p className="text-sm text-blue-800">{importData.specialCaseNote}</p>
                </div>
              )}
              <dl className="space-y-4">
                {[
                  { label: "Batteristatus (SoH)", value: importData.teslaSpecific.batteryCheck },
                  { label: "Laddkontakt", value: importData.teslaSpecific.chargingConnector },
                  { label: "Supercharger-åtkomst", value: importData.teslaSpecific.superchargerAccess },
                  { label: "Garanti", value: importData.teslaSpecific.warranty },
                  { label: "Programvaruuppdateringar", value: importData.teslaSpecific.softwareUpdates },
                  { label: "Ägarbyte", value: importData.teslaSpecific.transferProcess },
                ].map((item, i) => (
                  <div key={i}>
                    <dt className="font-semibold text-gray-900">{item.label}</dt>
                    <dd className="text-gray-700 text-sm mt-1">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Fact card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Snabbfakta – {importData.name} från Tyskland
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Prisintervall (EUR)</dt>
                <dd className="font-medium text-gray-900">
                  {importData.priceEUR.min.toLocaleString("sv-SE")}–{importData.priceEUR.max.toLocaleString("sv-SE")} EUR
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Prisintervall (SEK)</dt>
                <dd className="font-medium text-gray-900">
                  {formatSEK(importData.priceSEK.min)}–{formatSEK(importData.priceSEK.max)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Typisk besparing mot Sverige</dt>
                <dd className="font-medium text-gray-900">{importData.priceAdvantage}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Hitta bilar</dt>
                <dd className="font-medium text-gray-900">{importData.whereToBuy.join(", ")}</dd>
              </div>
            </dl>
          </div>

          {/* Recommended models */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Rekommenderade modeller
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700">Modell</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Årsmodell</th>
                    <th className="text-left p-3 font-semibold text-gray-700">ADAC-betyg</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Notering</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importData.recommendedModels.map((model, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-gray-900">{model.model}</td>
                      <td className="p-3 text-gray-700">{model.years}</td>
                      <td className="p-3 text-gray-700 capitalize">{model.adacRating}</td>
                      <td className="p-3 text-gray-600 text-xs">{model.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Källa:{" "}
              <a href={importData.adacSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                {importData.adacSource}
              </a>
            </p>
          </section>

          {/* Known issues */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Kända problem att kontrollera
            </h2>
            <div className="space-y-4">
              {importData.knownIssues.map((issue, i) => {
                const style = severityStyles[issue.severity] ?? severityStyles["medel"];
                return (
                  <div key={i} className={`border-l-4 ${style.border} ${style.bg} p-4 rounded-r`}>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{issue.issue}</h3>
                      <span className={`text-xs font-medium ${style.text} px-2 py-0.5 rounded-full border ${style.border}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{issue.description}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Problemområden baserade på{" "}
              <a href={importData.adacSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                {importData.adacSource}
              </a>{" "}
              och branscherfarenhet.
            </p>
          </section>

          {/* Documents to request */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dokument att begära vid köp
            </h2>
            <ol className="list-decimal list-inside space-y-2">
              {importData.documentsToRequest.map((doc, i) => (
                <li key={i} className="text-gray-700 text-sm">{doc}</li>
              ))}
            </ol>
          </section>

          {/* Import process 5 steps */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Importprocessen i 5 steg
            </h2>
            <ol className="space-y-4">
              {[
                { title: "Hitta din bil", desc: `Sök efter ${importData.name} på ${importData.whereToBuy.slice(0, 2).join(" eller ")}. Jämför priser och kontrollera att bilen har komplett dokumentation.` },
                { title: "Kontrollera och besiktiga", desc: "Verifiera servicehistorik, TÜV-rapport och COC-intyg. Boka oberoende besiktning (DEKRA eller TÜV) om möjligt." },
                { title: "Köp och transportera hem", desc: "Skriv köpekontrakt med VIN och kilometerstand. Transportera bilen till Sverige – kör hem eller anlita transport." },
                { title: "Ursprungskontroll och besiktning", desc: "Beställ ursprungskontroll hos Transportstyrelsen. Boka registreringsbesiktning hos godkänd station." },
                { title: "Registrera i Sverige", desc: "När besiktningen är godkänd registrerar Transportstyrelsen bilen och du får svenska skyltar." },
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              Läs den fullständiga steg-för-steg-guiden:{" "}
              <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
                Importera bil från Tyskland
              </Link>
            </p>
          </section>

          {/* Calculator CTA */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Räkna ut vad din {importData.name}-import kostar
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Kalkylatorn räknar ut alla avgifter: moms, ursprungskontroll, besiktning och transport.
            </p>
            <Link
              href="/kalkylator/bilimport"
              className="inline-block rounded bg-blue-700 px-6 py-3 text-sm font-medium text-white hover:bg-blue-800"
            >
              Öppna kalkylatorn
            </Link>
          </div>

          {/* Affiliate CTA – Wise */}
          <div className="border border-gray-200 rounded-lg p-5 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Betala i euro till lägre växelkurs</h3>
            <p className="text-sm text-gray-700 mb-3">
              Vid köp i Tyskland betalar du i euro. Med Wise får du bankens
              mittkurs utan dolda påslag – ofta flera tusen kronor billigare
              än din banks växelkurs vid stora belopp.
            </p>
            <AffiliateLink
              href="https://wise.prf.hn/click/camref:1100l5I28j"
              partner="Wise"
              className="text-blue-700 hover:underline font-medium"
            >
              Wise – valutaväxling till verklig mittkurs
            </AffiliateLink>
          </div>

          {/* Related guides */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Läs mer</h2>
            <ul className="space-y-2">
              <li><Link href="/guider/registreringsbesiktning" className="text-blue-700 hover:underline text-sm">Guide: Registreringsbesiktning</Link></li>
              <li><Link href="/guider/coc-intyg" className="text-blue-700 hover:underline text-sm">Guide: COC-intyg</Link></li>
              <li><Link href="/guider/ursprungskontroll" className="text-blue-700 hover:underline text-sm">Guide: Ursprungskontroll</Link></li>
              <li><Link href="/guider/moms-vid-bilimport" className="text-blue-700 hover:underline text-sm">Guide: Moms vid bilimport</Link></li>
              <li><Link href="/importera-bil/kostnad" className="text-blue-700 hover:underline text-sm">Alla kostnader vid bilimport</Link></li>
            </ul>
          </section>
        </article>
      </div>
    </>
  );
}
