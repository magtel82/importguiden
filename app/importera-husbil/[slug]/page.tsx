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
import { getCountries, getCountryBySlug, getMotorhomeBrands, getMotorhomeBrandImportData } from "@/lib/data";
import { getCanonicalUrl, getArticleJsonLd, getFaqJsonLd } from "@/lib/seo";
import { getRobotsForPath, getLastUpdatedForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CostTable } from "@/components/CostTable";
import { formatDateSv } from "@/lib/date";
import { UpcomingChangeNotice } from "@/components/UpcomingChangeNotice";
import { CONTENT_YEAR } from "@/lib/site-config";
import { formatCost, formatKr, formatSekRange, feeTotal, TULL_EU, FORDONSSKATT } from "@/lib/costs";
import { calculateMalus } from "@/lib/malus-calculator";
import { BELOPP_MDX_COMPONENTS } from "@/components/Belopp";

// Ordinarie fordonsskatt för husbil, ur data/cost-data.json via skatteberäkningen.
const HUSBIL_SKATT_TEXT = `${formatKr(FORDONSSKATT.grundbelopp)} plus ${formatKr(FORDONSSKATT.co2RatePerGram)} per gram över ${FORDONSSKATT.co2ThresholdGram} g/km – och för diesel dessutom miljö- och bränsletillägg. En dieselhusbil med 200 g/km betalar cirka ${formatKr(calculateMalus(200, "diesel", 0, "husbil").annualTax)} per år.`;

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

// === Brand-specific data: Garanti, Chassi, FAQ ===

interface GarantiItem { title: string; text: string; list?: string[] }
interface FaqItem { question: string; answer: string }

/**
 * Garantiavsnittet anger medvetet inga garantitider eller koncerntillhörighet:
 * vi publicerar bara uppgifter vi kontrollerat mot tillverkarens egna villkor
 * (källgranskning 2026-10-20).
 */
function garantiFor(name: string): { intro: string; items: GarantiItem[]; source: string } {
  return {
    intro: `Garantivillkoren för en ${name} skiljer sig mellan modeller och årgångar, och chassit och påbyggnaden kan ha olika garantigivare. Vi anger därför inga garantitider här.`,
    items: [
      { title: "Chassit", text: "Fråga säljaren vilken garanti som återstår på chassit och be chassitillverkarens auktoriserade verkstad bekräfta den utifrån VIN-numret." },
      { title: "Påbyggnaden och tätheten", text: `Be om ${name}s garantibevis för påbyggnaden. Finns en täthetsgaranti, kontrollera om den förutsätter dokumenterade täthetskontroller och om den följer med vid ägarbyte.` },
      { title: "Efter importen", text: "Ta med dig handlingarna när du kontaktar en auktoriserad verkstad i Sverige:", list: ["Garantibevis, servicehistorik och köpehandling", "Protokoll från tidigare täthetskontroller"] },
    ],
    source: `Kontrollera alltid aktuella villkor med ${name} eller en auktoriserad återförsäljare.`,
  };
}

const MH_GARANTI: Record<string, { intro: string; items: GarantiItem[]; source: string }> = {
  hymer: garantiFor("Hymer"),
  dethleffs: garantiFor("Dethleffs"),
  burstner: garantiFor("Bürstner"),
  knaus: garantiFor("Knaus"),
  hobby: garantiFor("Hobby"),
};

const DUCATO_SVAR = "ADAC Pannenstatistik 2026 rangordnar inte husbilsmärken, men tar upp de vanliga basfordonen: där finns Mercedes-Benz Sprinter bland de bästa i klassen Transporter/Vans, medan Fiat Ducato med första registrering 2016–2021 och 2023 finns bland de sämsta. Kontrollera vilket chassi och vilken årgång exemplaret har.";

function mhFaq(name: string): FaqItem[] {
  return [
    { question: `Betalar man malus på importerad ${name}-husbil?`, answer: `Nej, husbilar är undantagna från malus sedan 1 februari 2025. Du betalar ordinarie fordonsskatt, som för husbilar med koldioxidvärde är ${HUSBIL_SKATT_TEXT}` },
    { question: `Vilken ${name}-husbil är mest driftsäker?`, answer: DUCATO_SVAR },
    { question: `Vad kostar det att importera en ${name}-husbil?`, answer: `Fasta avgifter ${formatSekRange(feeTotal("husbil"))} (ursprungskontroll ${formatCost("ursprungskontroll")}, registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor och skyltar) plus importförsäkring enligt offert och transport.` },
  ];
}

const MH_FAQ: Record<string, FaqItem[]> = {
  hymer: mhFaq("Hymer"),
  dethleffs: mhFaq("Dethleffs"),
  burstner: mhFaq("Bürstner"),
  knaus: mhFaq("Knaus"),
  hobby: mhFaq("Hobby"),
};

const MH_TITLES: Record<string, { title: string; description: string }> = {
  dethleffs: { title: `Importera Dethleffs husbil från Tyskland – Guide och kostnader ${CONTENT_YEAR}`, description: "Importera Dethleffs husbil privat från Tyskland. Chassi och ADAC-data, fuktkontroll, dokument och importkalkylator." },
  burstner: { title: `Importera Bürstner husbil från Tyskland – Chassi, garanti och kostnader ${CONTENT_YEAR}`, description: "Importera Bürstner husbil privat från Tyskland. Chassi och ADAC-data, fuktkontroll, dokument och importkalkylator." },
  knaus: { title: `Importera Knaus husbil från Tyskland – Guide med ADAC-data ${CONTENT_YEAR}`, description: "Importera Knaus husbil privat från Tyskland. Chassi och ADAC-data, fuktkontroll, dokument och importkalkylator." },
  hobby: { title: `Importera Hobby husbil från Tyskland – Guide och kostnader ${CONTENT_YEAR}`, description: "Importera Hobby husbil privat från Tyskland. Chassi och ADAC-data, fuktkontroll, dokument och importkalkylator." },
};

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
      "Stegen du själv styr tar 2–6 veckor, plus kötiden för ursprungskontrollen. Steg-för-steg-tidslinje så du vet vad som väntar.",
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
      `Beställ hos Transportstyrelsen (${formatCost("ursprungskontroll")}). Utan godkänd ursprungskontroll kan husbilen inte registreras.`,
  },
  {
    slug: "registreringsbesiktning",
    title: "Registreringsbesiktning – sista steget mot svenska skyltar",
    desc: () =>
      `Publicerade priser ${formatCost("registreringsbesiktning")}. Alla stationer tar inte emot husbilar – fråga innan du bokar.`,
  },
  {
    slug: "fordonsskatt-husbil-bonus-malus",
    title: `Fordonsskatt för husbil – vad gäller ${CONTENT_YEAR}?`,
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
        title: `Importera husbil från Tyskland – Komplett guide ${CONTENT_YEAR}`,
        description: "Steg-för-steg guide för att importera husbil privat från Tyskland till Sverige. Kostnader, besiktning, hemtransport och praktiska råd.",
        alternates: { canonical: getCanonicalUrl("/importera-husbil/tyskland") },
        robots,
      };
    }
    return {
      title: `Importera husbil från ${country.name} – Komplett guide ${CONTENT_YEAR}`,
      description: `Steg-för-steg guide för att importera husbil privat från ${country.name}. Kostnader, besiktning och råd.`,
      alternates: { canonical: getCanonicalUrl(`/importera-husbil/${slug}`) },
      robots,
    };
  }

  const brands = getMotorhomeBrands();
  const brand = brands.find((b) => b.slug === slug);
  if (brand) {
    const importData = getMotorhomeBrandImportData(slug);
    const year = CONTENT_YEAR;
    const customTitle = MH_TITLES[slug];
    return {
      title: customTitle
        ? customTitle.title
        : importData
          ? `Importera ${brand.name} husbil från Tyskland – Guide ${year} (chassi, kostnader)`
          : `Importera ${brand.name} husbil från Tyskland – Guide`,
      description: customTitle
        ? customTitle.description
        : importData
          ? `Importera ${brand.name} husbil privat från Tyskland. Chassi och ADAC-data (Pannenstatistik 2026), dokument att begära och kalkylator.`
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

  const updatedDate = getLastUpdatedForPath(`/importera-husbil/${slug}`);

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
      const { content, frontmatter } = await compileMDX<{ dateUpdated: string }>({
        source,
        options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
        components: { AffiliateLink, ...BELOPP_MDX_COMPONENTS },
      });

      const articleJsonLd = getArticleJsonLd({
        title: `Importera husbil från Tyskland – Komplett guide ${CONTENT_YEAR}`,
        description: "Steg-för-steg guide för att importera husbil privat från Tyskland till Sverige.",
        datePublished: "2026-03-14",
        dateModified: frontmatter.dateUpdated,
        url: `${SITE_URL}/importera-husbil/tyskland`,
      });

      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
          <div className="mx-auto max-w-3xl px-4 py-10">
            <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
            <article>
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Importera husbil från Tyskland – Komplett guide {CONTENT_YEAR}
                </h1>
                <p className="text-gray-500 text-sm">
                  Uppdaterad:{" "}
                  <time dateTime={frontmatter.dateUpdated}>
                    {formatDateSv(frontmatter.dateUpdated)}
                  </time>
                  {" "}· Källa: Transportstyrelsen, Tullverket, Skatteverket
                </p>
              </header>

          <UpcomingChangeNotice path={`/importera-husbil/${slug}`} />
              <TableOfContents headings={headings} />
              <div className="prose prose-gray max-w-none">{content}</div>
            </article>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Importera husbil från {country.name} – Komplett guide {CONTENT_YEAR}
              </h1>
              {updatedDate && (
                <p className="text-gray-500 text-sm">
                  Uppdaterad: <time dateTime={updatedDate}>{formatDateSv(updatedDate)}</time>
                </p>
              )}
            </header>

          <UpcomingChangeNotice path={`/importera-husbil/${slug}`} />

            <p className="text-gray-700 mb-6 text-lg">
              {country.name} är en av de bästa marknaderna för begagnade husbilar i Europa.
              Priserna är ofta lägre än i Sverige och utbudet är stort.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r">
              <p className="text-sm text-amber-800">
                <strong>Obs:</strong> Husbilsimport skiljer sig från bilimport – besiktningen är
                mer omfattande ({formatCost("registreringsbesiktning")} enligt publicerade prislistor) och transport av en husbil kostar mer.
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
                  <tr><td className="p-3">Ursprungskontroll</td><td className="p-3 text-right font-medium">{formatCost("ursprungskontroll")}</td></tr>
                  <tr><td className="p-3">Registreringsbesiktning</td><td className="p-3 text-right font-medium">{formatCost("registreringsbesiktning")}</td></tr>
                  <tr><td className="p-3">Transport</td><td className="p-3 text-right font-medium">offert</td></tr>
                  <tr><td className="p-3">Tull (EU-import)</td><td className="p-3 text-right font-medium text-green-700">{TULL_EU}</td></tr>
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
      {MH_FAQ[brand!.slug] && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getFaqJsonLd(MH_FAQ[brand!.slug])),
          }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Importera {importData.name} husbil från Tyskland – Guide {CONTENT_YEAR}
            </h1>
            <p className="text-gray-500 text-sm">
              {updatedDate && (
                <>
                  Uppdaterad: <time dateTime={updatedDate}>{formatDateSv(updatedDate)}</time>
                  {" "}·{" "}
                </>
              )}
              Källa: {importData.adacSource}
            </p>
          </header>

          <UpcomingChangeNotice path={`/importera-husbil/${slug}`} />

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
            <div className="text-sm text-gray-700 mt-4">
              <p className="font-semibold text-gray-900 mb-1">Köpråd</p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>Kontrollera vilket chassi exemplaret har, och datum för första registrering i Zulassungsbescheinigung Teil I (fält B)</li>
                <li>Begär komplett servicehistorik inklusive chassiservice</li>
                <li>Be en auktoriserad verkstad för chassit kontrollera på VIN att alla återkallelser (Rückruf) är utförda</li>
              </ul>
            </div>
          </section>

          {/* Fact card */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Snabbfakta – {importData.name} från Tyskland
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-600">Chassi</dt>
                <dd className="font-medium text-gray-900">{importData.chassis}</dd>
              </div>
            </dl>
          </div>

          {/* Brand-specific: Garanti */}
          {MH_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Garanti vid {importData.name}-import</h2>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {MH_GARANTI[brand!.slug].intro}
              </p>
              <div className="space-y-4 text-sm text-gray-700">
                {MH_GARANTI[brand!.slug].items.map((item, i) => (
                  <div key={i}>
                    <p className="font-semibold text-gray-900 mb-1">{item.title}</p>
                    <p className="leading-relaxed">{item.text}</p>
                    {item.list && (
                      <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                        {item.list.map((li, j) => <li key={j}>{li}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">{MH_GARANTI[brand!.slug].source}</p>
            </section>
          )}

          {/* Malus borttagen för husbilar – gäller alla märken */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Malus borttagen för husbilar sedan februari 2025</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r mb-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                Från 1 februari 2025 är husbilar undantagna från malus-skatten. Du betalar ordinarie fordonsskatt — ingen förhöjd skatt under de tre första åren. Den ordinarie skatten beror fortfarande på koldioxidutsläppet.
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              En dieselhusbil med t.ex. 200 g/km CO₂ och fordonsår 2018 eller senare betalade tidigare cirka {formatKr(calculateMalus(200, "diesel", 0, "personbil").annualTax)}/år de tre första åren. Nu betalar den ordinarie fordonsskatt: grundbelopp, {formatKr(FORDONSSKATT.co2RatePerGram)} per gram över {FORDONSSKATT.co2ThresholdGram} g/km, miljötillägg och bränsletillägg – alltså cirka {formatKr(calculateMalus(200, "diesel", 0, "husbil").annualTax)}/år.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Det här gör import av nyare husbilar (under 3 år) betydligt mer ekonomiskt attraktivt än tidigare.
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Källa:{" "}
              <a href="https://www.transportstyrelsen.se/sv/vagtrafik/fordon/skatter-och-avgifter/fordonsskatt/skattens-storlek/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                Transportstyrelsen
              </a>
              {", "}
              <a href="https://www.skatteverket.se/download/18.9567cda19bf6c00272596/1770015080315/Fordonsskattetabeller.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                Skatteverkets fordonsskattetabeller
              </a>
              {" "}· Gäller fr.o.m. 1 februari 2025
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
                { title: "Kontrollera och besiktiga", desc: "Kräv fuktkontroll med fuktmätare av oberoende besiktningsman. Verifiera servicehistorik, TÜV och eventuellt gasintyg (Gasprüfung)." },
                { title: "Köp och transportera hem", desc: "Skriv köpekontrakt med VIN, mätarställning och COC-intyg som uttryckligt villkor. Kör hem eller anlita transport." },
                { title: "Ursprungskontroll och besiktning", desc: "Beställ ursprungskontroll hos Transportstyrelsen. Boka registreringsbesiktning – alla stationer tar inte emot husbilar, så fråga innan du bokar." },
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

          {/* CostTable for all brands with enriched content */}
          {MH_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alla importavgifter</h2>
              <CostTable vehicleType="husbil" compact />
            </section>
          )}

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
