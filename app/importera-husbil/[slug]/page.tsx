import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/headings";
import { getCountries, getCountryBySlug, getMotorhomeBrands, getMotorhomeBrandImportData, formatSEK } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd, getArticleJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

// Guides relevant for all motorhome brands
const MOTORHOME_IMPORT_GUIDES: {
  slug: string;
  title: string;
  desc: (brand: string) => string;
}[] = [
  {
    slug: "kopa-bil-mobile-de-autoscout24",
    title: "Söka husbil på mobile.de – guide på svenska",
    desc: (brand) =>
      `Filtrera fram rätt ${brand}, tolka tyska annonser och undvik vanliga fallgropar på Europas största fordonsmarknad.`,
  },
  {
    slug: "besikta-husbil",
    title: "Besiktning av importerad husbil – fukt, gas och körkortskrav",
    desc: (brand) =>
      `Vad besiktningsmannen kontrollerar extra noga på en importerad ${brand}: fuktskador, gasinstallation och totalvikt.`,
  },
  {
    slug: "hur-lang-tid-tar-bilimport",
    title: "Hur lång tid tar en husbilsimport?",
    desc: () =>
      "Räkna med 4–8 veckor från köp till svenska skyltar. Steg-för-steg-tidslinje så du vet vad som väntar.",
  },
  {
    slug: "transportera-bil-fran-tyskland",
    title: "Transportera husbilen hem – köra eller spedition?",
    desc: () =>
      "Tre alternativ med olika kostnader och risker. En husbil har egna förutsättningar för hemtransport.",
  },
  {
    slug: "coc-intyg",
    title: "COC-intyg – vad det är och varför du behöver det",
    desc: (brand) =>
      `COC-intyget krävs för att registrera din ${brand} i Sverige. Kontrollera att det finns med vid köpet.`,
  },
  {
    slug: "ursprungskontroll",
    title: "Ursprungskontroll – obligatorisk efter hemkomst",
    desc: () =>
      "Beställ hos Transportstyrelsen (1 240 kr, 2025). Utan godkänd ursprungskontroll kan husbilen inte registreras.",
  },
  {
    slug: "registreringsbesiktning",
    title: "Registreringsbesiktning – sista steget mot svenska skyltar",
    desc: () =>
      "Ca 3 000–5 000 kr för husbil. Mer omfattande än för personbil – gas, fukt och chassi kontrolleras.",
  },
  {
    slug: "fordonsskatt-husbil-bonus-malus",
    title: "Fordonsskatt för husbil – vad gäller efter 2025?",
    desc: (brand) =>
      `Räkna ut den årliga fordonsskatten för din ${brand}. Malus togs bort för husbilar i februari 2025.`,
  },
];

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
    if (slug === "tyskland") {
      return {
        title: "Importera husbil från Tyskland – Komplett guide 2026",
        description: "Steg-för-steg guide för att importera husbil privat från Tyskland till Sverige. Kostnader, märken, besiktning och praktiska råd.",
        alternates: { canonical: getCanonicalUrl("/importera-husbil/tyskland") },
        robots,
      };
    }
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
    const importData = getMotorhomeBrandImportData(slug);
    const year = new Date().getFullYear();
    return {
      title: importData
        ? `Importera ${brand.name} husbil från Tyskland – Guide ${year} (chassi, kostnader)`
        : `Importera ${brand.name} husbil från Tyskland – Guide`,
      description: importData
        ? `Importera ${brand.name} husbil privat från Tyskland. Chassiinformation, Ducato-varning (ADAC 2025), rekommenderade modeller och kalkylator.`
        : `Allt om att importera ${brand.name} husbil privat från Tyskland.`,
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

    // Flagship page: render full MDX content for Germany
    if (slug === "tyskland") {
      const mdxPath = path.join(process.cwd(), "content/importera-husbil/tyskland.mdx");
      const source = await readFile(mdxPath, "utf-8");
      const headings = extractHeadings(source);
      const { content } = await compileMDX({
        source,
        options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
        components: { AffiliateLink },
      });

      const articleJsonLd = getArticleJsonLd({
        title: "Importera husbil från Tyskland – Komplett guide 2026",
        description: "Steg-för-steg guide för att importera husbil privat från Tyskland till Sverige.",
        datePublished: "2026-03-14",
        dateModified: "2026-03-22",
        url: `${SITE_URL}/importera-husbil/tyskland`,
      });

      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbJsonLd(breadcrumbs.map((b) => ({ name: b.name, url: b.href ? `${SITE_URL}${b.href}` : SITE_URL })))) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
          <div className="mx-auto max-w-3xl px-4 py-10">
            <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
            <article>
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Importera husbil från Tyskland – Komplett guide 2026
                </h1>
                <p className="text-gray-500 text-sm">
                  Uppdaterad: <time dateTime="2026-03-22">2026-03-22</time>
                  {" "}· Källa: Transportstyrelsen, Tullverket, Skatteverket
                </p>
              </header>
              <TableOfContents headings={headings} />
              <div className="prose prose-gray max-w-none">{content}</div>
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
  const importData = getMotorhomeBrandImportData(brand!.slug);
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera husbil", href: "/importera-husbil/tyskland" },
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Importera {brand!.name} husbil från Tyskland
            </h1>
            <p className="text-gray-700 mb-6">
              Guide för att importera {brand!.name} privat från Tyskland till Sverige.
            </p>
            <Link href="/importera-husbil/tyskland" className="text-blue-700 hover:underline text-sm">
              Läs den fullständiga guiden: Importera husbil från Tyskland
            </Link>
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
              Importera {importData.name} husbil från Tyskland – Guide {new Date().getFullYear()}
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

          {/* Chassis section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Chassi – {importData.chassis}
            </h2>
            {importData.chassisWarning && (
              <div className="border-l-4 border-amber-600 bg-amber-50 p-4 rounded-r mb-4">
                <p className="font-semibold text-amber-800 mb-1">Viktigt om chassit</p>
                <p className="text-sm text-amber-800">{importData.chassisWarningText}</p>
                <a
                  href={importData.adacSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-700 underline hover:text-amber-900 mt-2 inline-block"
                >
                  Källa: {importData.adacSource}
                </a>
              </div>
            )}
          </section>

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
                <dt className="text-gray-600">Chassi</dt>
                <dd className="font-medium text-gray-900">{importData.chassis}</dd>
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
                    <th className="text-left p-3 font-semibold text-gray-700">Notering</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importData.recommendedModels.map((model, i) => (
                    <tr key={i}>
                      <td className="p-3 font-medium text-gray-900">{model.model}</td>
                      <td className="p-3 text-gray-700">{model.years}</td>
                      <td className="p-3 text-gray-600 text-xs">{model.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          </section>

          {/* Driving license reminder */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Körkortskrav
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r">
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Under 3 500 kg:</strong> B-körkort räcker</li>
                <li><strong>3 500–7 500 kg:</strong> Kräver C1-körkort (eller C)</li>
                <li><strong>Över 7 500 kg:</strong> Kräver C-körkort</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                Kontrollera husbilens totalvikt i Fahrzeugschein (fält F.2) innan köp.
              </p>
            </div>
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
                { title: "Hitta din husbil", desc: `Sök efter ${importData.name} på mobile.de eller AutoScout24. Kontrollera chassi, årsmodell och totalvikt.` },
                { title: "Kontrollera och besiktiga", desc: "Kräv fuktkontroll med fuktmätare av oberoende besiktningsman. Verifiera servicehistorik, TÜV och gasbesiktning." },
                { title: "Köp och transportera hem", desc: "Skriv köpekontrakt med VIN, kilometerstand och COC-intyg som uttryckligt villkor. Kör hem eller anlita transport." },
                { title: "Ursprungskontroll och besiktning", desc: "Beställ ursprungskontroll hos Transportstyrelsen. Boka registreringsbesiktning – den är mer omfattande för husbilar." },
                { title: "Registrera i Sverige", desc: "När besiktningen är godkänd registrerar Transportstyrelsen husbilen och du får svenska skyltar." },
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
              <Link href="/importera-husbil/tyskland" className="text-blue-700 hover:underline">
                Importera husbil från Tyskland
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Guider för din {importData.name}-import
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Allt du behöver veta – från att hitta husbilen i Tyskland till svenska skyltar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {MOTORHOME_IMPORT_GUIDES.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guider/${guide.slug}`}
                  className="group flex flex-col p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 mb-1 leading-snug">
                    {guide.title}
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed flex-1">
                    {guide.desc(importData.name)}
                  </span>
                  <span className="text-xs text-blue-700 mt-3 font-medium">
                    Läs guide &rarr;
                  </span>
                </Link>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Se även:{" "}
              <Link href="/importera-husbil/kostnad" className="text-blue-700 hover:underline">
                Alla kostnader vid husbilsimport
              </Link>
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
