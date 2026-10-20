import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCountries, getCountryBySlug, getCarBrands, getCarBrandBySlug, getCarBrandImportData, formatSEK } from "@/lib/data";
import { getCanonicalUrl, getFaqJsonLd } from "@/lib/seo";
import { getRobotsForPath, getLastUpdatedForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { BrandGrid } from "@/components/BrandGrid";
import { TableOfContents } from "@/components/TableOfContents";
import { extractHeadings } from "@/lib/headings";
import { CostTable } from "@/components/CostTable";
import { calculateMalus, type FuelType } from "@/lib/malus-calculator";
import { formatDateSv } from "@/lib/date";
import { UpcomingChangeNotice } from "@/components/UpcomingChangeNotice";
import { CONTENT_YEAR } from "@/lib/site-config";
import { formatCost, formatKr, formatSekRange, feeTotal, exportKostnad, TULL_EU, FORDONSSKATT } from "@/lib/costs";
import { BELOPP_MDX_COMPONENTS } from "@/components/Belopp";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

// === Brand-specific data: Garanti, Fordonsskatt, FAQ ===

interface GarantiItem { title: string; text: string; list?: string[] }
interface FordonsskattRow { model: string; co2: number; fuel: FuelType }

const FUEL_LABEL: Record<FuelType, string> = {
  bensin: "Bensin",
  diesel: "Diesel",
  elbil: "El",
  "laddhybrid-bensin": "Laddhybrid (bensin)",
  "laddhybrid-diesel": "Laddhybrid (diesel)",
};

/** Ny bil (malus år 1–3) och samma bil från år 4, enligt lib/malus-calculator. */
function taxFor(row: FordonsskattRow) {
  return calculateMalus(row.co2, row.fuel, 0, "personbil");
}
interface FaqItem { question: string; answer: string }

/**
 * Garantiavsnittet anger medvetet inga garantitider: tillverkarnas villkor
 * skiljer sig mellan modeller och år, och vi publicerar bara uppgifter vi
 * kontrollerat mot tillverkarens egna villkor (källgranskning 2026-10-20).
 */
function garantiFor(name: string, extra: GarantiItem[] = []): { intro: string; items: GarantiItem[]; source: string } {
  return {
    intro: `Garantivillkoren för ${name} skiljer sig mellan modeller och årgångar. Vi anger därför inga garantitider här – kontrollera i stället vad som gäller för just det exemplar du tittar på.`,
    items: [
      { title: "Be om garantibeviset", text: "Be säljaren om garantibeviset och servicehistoriken. Kontrollera när garantin började gälla och om den förutsätter service enligt tillverkarens intervall." },
      { title: "Kontrollera via VIN innan köp", text: `Ring en auktoriserad ${name}-verkstad i Sverige, uppge bilens VIN och be dem bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad i Sverige. Ta med:`, list: ["Köpehandling med VIN", "Servicehistorik", "COC-intyg"] },
      { title: "Batterigaranti (elbilar och laddhybrider)", text: "Högvoltsbatteriet har ofta en egen garanti med andra villkor än resten av bilen. Fråga efter batterigarantins villkor för den aktuella bilen." },
      { title: "Begagnatgarantier och serviceavtal", text: "Garantier från begagnatprogram och tyska serviceavtal har egna villkor. Fråga innan du räknar med dem som en fördel." },
      ...extra,
    ],
    source: `Kontrollera alltid aktuella villkor direkt med ${name} eller en auktoriserad verkstad.`,
  };
}

const BRAND_GARANTI: Record<string, { intro: string; items: GarantiItem[]; source: string }> = {
  bmw: garantiFor("BMW"),
  mercedes: garantiFor("Mercedes-Benz"),
  volkswagen: garantiFor("Volkswagen"),
  audi: garantiFor("Audi"),
  porsche: garantiFor("Porsche"),
  tesla: garantiFor("Tesla", [
    { title: "Autopilot och FSD", text: "Fråga Tesla innan köpet om köpta mjukvarufunktioner som Enhanced Autopilot eller Full Self-Driving följer med bilen vid ägarbytet." },
  ]),
};

/** Räkneexempel per drivmedel. Inga modellnamn: CO₂-värdet varierar mellan versioner och står i bilens COC-intyg. */
const EXEMPEL_RADER: FordonsskattRow[] = [
  { model: "Elbil", co2: 0, fuel: "elbil" },
  { model: "Laddhybrid (bensin)", co2: 25, fuel: "laddhybrid-bensin" },
  { model: "Bensin", co2: 130, fuel: "bensin" },
  { model: "Bensin", co2: 200, fuel: "bensin" },
  { model: "Diesel", co2: 130, fuel: "diesel" },
];

const BRAND_FORDONSSKATT: Record<string, { intro?: string; rows: FordonsskattRow[] }> = {
  bmw: { rows: EXEMPEL_RADER },
  mercedes: { rows: EXEMPEL_RADER },
  volkswagen: { rows: EXEMPEL_RADER },
  audi: { rows: EXEMPEL_RADER },
  porsche: { rows: EXEMPEL_RADER },
  tesla: { intro: `Tesla tillverkar bara elbilar, och elbilar betalar bara grundbeloppet ${formatKr(FORDONSSKATT.grundbelopp)}/år i fordonsskatt — ingen malus.`, rows: [
    { model: "Model 3", co2: 0, fuel: "elbil" },
    { model: "Model Y", co2: 0, fuel: "elbil" },
    { model: "Model S", co2: 0, fuel: "elbil" },
    { model: "Model X", co2: 0, fuel: "elbil" },
  ]},
};

const BRAND_FAQ: Record<string, FaqItem[]> = {
  bmw: [
    { question: "Gäller BMW-garantin i Sverige vid import?", answer: "Det beror på garantivillkoren för den aktuella bilen. Be en auktoriserad BMW-verkstad i Sverige att utifrån bilens VIN bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad här." },
    { question: "Vilka BMW-modeller är mest driftsäkra enligt ADAC?", answer: "I ADAC Pannenstatistik 2026 finns elva BMW-modeller bland de bästa i sin klass, bland andra 3-serien, 4-serien, X3, 5-serien och X5. Ingen BMW-modell finns bland de sämsta." },
    { question: "Vad kostar det att importera en BMW från Tyskland?", answer: `Utöver bilpriset tillkommer ${formatSekRange(feeTotal("bil"))} i fasta avgifter (ursprungskontroll ${formatCost("ursprungskontroll")}, registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor, importförsäkring och skyltar) plus transport. Använd vår kalkylator för en exakt beräkning.` },
  ],
  mercedes: [
    { question: "Gäller Mercedes-garantin i Sverige vid import?", answer: "Det beror på garantivillkoren för den aktuella bilen. Be en auktoriserad Mercedes-Benz-verkstad i Sverige att utifrån bilens VIN bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad här." },
    { question: "Vilka Mercedes-modeller är mest driftsäkra enligt ADAC?", answer: "I ADAC Pannenstatistik 2026 finns A-klass, B-klass, EQA, GLB och GLE bland de bästa i sina klasser. Ingen Mercedes-modell finns bland de sämsta." },
    { question: "Vad kostar det att importera en Mercedes från Tyskland?", answer: `Utöver bilpriset tillkommer ${formatSekRange(feeTotal("bil"))} i fasta avgifter (ursprungskontroll ${formatCost("ursprungskontroll")}, registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor, importförsäkring och skyltar) plus transport. Använd vår kalkylator för en exakt beräkning.` },
  ],
  volkswagen: [
    { question: "Gäller Volkswagen-garantin i Sverige vid import?", answer: "Det beror på garantivillkoren för den aktuella bilen. Be en auktoriserad Volkswagen-verkstad i Sverige att utifrån bilens VIN bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad här." },
    { question: "Vilka Volkswagen-modeller är mest driftsäkra enligt ADAC?", answer: "I ADAC Pannenstatistik 2026 finns fjorton VW-modeller bland de bästa i sina klasser, bland andra Golf, Tiguan, Passat, ID.3 och ID.4. Ingen VW-modell finns bland de sämsta." },
    { question: "Vad kostar det att importera en Volkswagen från Tyskland?", answer: `Utöver bilpriset tillkommer ${formatSekRange(feeTotal("bil"))} i fasta avgifter (ursprungskontroll ${formatCost("ursprungskontroll")}, registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor, importförsäkring och skyltar) plus transport. Använd vår kalkylator för en exakt beräkning.` },
  ],
  audi: [
    { question: "Gäller Audi-garantin i Sverige vid import?", answer: "Det beror på garantivillkoren för den aktuella bilen. Be en auktoriserad Audi-verkstad i Sverige att utifrån bilens VIN bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad här." },
    { question: "Vilka Audi-modeller är mest driftsäkra enligt ADAC?", answer: "I ADAC Pannenstatistik 2026 finns A1, A3, Q2, Q3, A4, A5, Q4 e-tron, Q5 och e-tron/Q8 e-tron bland de bästa i sina klasser. Ingen Audi-modell finns bland de sämsta." },
    { question: "Vad kostar det att importera en Audi från Tyskland?", answer: `Utöver bilpriset tillkommer ${formatSekRange(feeTotal("bil"))} i fasta avgifter (ursprungskontroll ${formatCost("ursprungskontroll")}, registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor, importförsäkring och skyltar) plus transport. Använd vår kalkylator för en exakt beräkning.` },
  ],
  porsche: [
    { question: "Gäller Porsche-garantin i Sverige vid import?", answer: "Det beror på garantivillkoren för den aktuella bilen. Be en auktoriserad Porsche-verkstad i Sverige att utifrån bilens VIN bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad här." },
    { question: "Vilka Porsche-modeller är mest driftsäkra enligt ADAC?", answer: "Ingen Porsche-modell finns med i ADAC Pannenstatistik 2026:s listor över de bästa eller sämsta i sin klass. Kräv komplett servicehistorik och låt en oberoende besiktningsman undersöka bilen före köp." },
    { question: "Vad kostar det att importera en Porsche från Tyskland?", answer: `Utöver bilpriset tillkommer ${formatSekRange(feeTotal("bil"))} i fasta avgifter (ursprungskontroll ${formatCost("ursprungskontroll")}, registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor, importförsäkring och skyltar) plus transport. Använd vår kalkylator för en exakt beräkning.` },
  ],
  tesla: [
    { question: "Gäller Tesla-garantin i Sverige vid import?", answer: "Det beror på garantivillkoren för den aktuella bilen. Be Tesla att utifrån bilens VIN bekräfta vilken garanti som återstår och om den gäller när bilen är registrerad här." },
    { question: "Vilka Tesla-modeller är mest driftsäkra enligt ADAC?", answer: "I ADAC Pannenstatistik 2026 finns Tesla Model 3 och Model Y bland de bästa i mellanklassen." },
    { question: "Vad kostar fordonsskatten för en importerad Tesla?", answer: `Tesla tillverkar bara elbilar, och elbilar betalar bara grundbeloppet ${formatKr(FORDONSSKATT.grundbelopp)}/år i fordonsskatt (ingen malus).` },
  ],
};

const BRAND_TITLES: Record<string, { title: string; description: string }> = {
  mercedes: { title: `Importera Mercedes från Tyskland – Kostnader, garanti och modeller ${CONTENT_YEAR}`, description: "Importera Mercedes-Benz privat från Tyskland. ADAC-data, garanti, fordonsskatt och kalkylator." },
  volkswagen: { title: `Importera Volkswagen från Tyskland – Guide med kostnader och tips ${CONTENT_YEAR}`, description: "Importera Volkswagen privat från Tyskland. ADAC-data, garanti, fordonsskatt och kalkylator." },
  audi: { title: `Importera Audi från Tyskland – Kostnader, ADAC-data och garanti ${CONTENT_YEAR}`, description: "Importera Audi privat från Tyskland. ADAC-data, garanti, fordonsskatt och kalkylator." },
  porsche: { title: `Importera Porsche från Tyskland – Guide med kostnader ${CONTENT_YEAR}`, description: "Importera Porsche privat från Tyskland. Garanti, fordonsskatt, dokument och kalkylator." },
  tesla: { title: `Importera Tesla från Tyskland – Elbilsimport, garanti och kostnader ${CONTENT_YEAR}`, description: "Importera Tesla privat från Tyskland. Batteri, garanti, kontobyte, fordonsskatt och importkalkylator." },
};

// Guides relevant for all car brands
const CAR_IMPORT_GUIDES: {
  slug: string;
  title: string;
  desc: (brand: string) => string;
}[] = [
  {
    slug: "kopa-bil-mobile-de-autoscout24",
    title: "Söka bil på mobile.de – guide på svenska",
    desc: (brand) =>
      `Filtrera fram rätt ${brand}, tolka tyska annonser och undvik vanliga fallgropar på Europas största bilmarknad.`,
  },
  {
    slug: "hur-lang-tid-tar-bilimport",
    title: "Hur lång tid tar en bilimport?",
    desc: () =>
      "Stegen du själv styr tar 2–6 veckor, plus kötiden för ursprungskontrollen. Steg-för-steg-tidslinje så du vet vad som väntar.",
  },
  {
    slug: "transportera-bil-fran-tyskland",
    title: "Transportera bilen hem – egenköra, trailer eller spedition",
    desc: () =>
      "Tre alternativ med olika kostnader och risker. Vilket passar din situation och din budget bäst?",
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
      `Beställ hos Transportstyrelsen (${formatCost("ursprungskontroll")}). Utan godkänd ursprungskontroll kan bilen inte registreras.`,
  },
  {
    slug: "registreringsbesiktning",
    title: "Registreringsbesiktning – sista steget mot svenska skyltar",
    desc: (brand) =>
      `Publicerade priser ${formatCost("registreringsbesiktning")}. Lär dig vad besiktningsmannen kontrollerar extra noga på en importerad ${brand}.`,
  },
  {
    slug: "moms-vid-bilimport",
    title: "Moms vid bilimport – när betalar du 25 %?",
    desc: () =>
      "Avgörs av bilens ålder och körsträcka (6 månader / 6 000 km-regeln). Läs reglerna innan du köper.",
  },
];

// Extra guide for electric vehicles
const EV_GUIDE = {
  slug: "importera-elbil",
  title: "Importera elbil – batteristatus, laddkontakter och skillnader",
  desc: (brand: string) =>
    `Vad du måste kontrollera på en importerad ${brand}-elbil: batterihälsa (SoH), laddstandard och garanti.`,
};

// Slugs where the EV guide is relevant
const EV_BRAND_SLUGS = ["tesla", "volkswagen"];

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
      title: `Importera bil från ${country.name} – Komplett guide ${CONTENT_YEAR}`,
      description: `Allt du behöver veta för att importera bil privat från ${country.name} till Sverige. Kostnader, process och praktiska råd.`,
      alternates: { canonical: getCanonicalUrl(`/importera-bil/${slug}`) },
      robots,
    };
  }

  const brand = getCarBrandBySlug(slug);
  if (brand) {
    const importData = getCarBrandImportData(slug);
    const year = CONTENT_YEAR;
    const customTitle = BRAND_TITLES[slug];
    return {
      title: customTitle
        ? customTitle.title
        : importData
          ? `Importera ${brand.name} från Tyskland – Guide ${year} (ADAC-data, kostnader)`
          : `Importera ${brand.name} från Tyskland – Guide och kostnader`,
      description: customTitle
        ? customTitle.description
        : importData
          ? `Importera ${brand.name} privat från Tyskland. Modeller enligt ADAC Pannenstatistik 2026, dokument att begära och kalkylator.`
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

  const updatedDate = getLastUpdatedForPath(`/importera-bil/${slug}`);

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
      const { content, frontmatter } = await compileMDX<{ dateUpdated: string }>({
        source,
        options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
        components: { AffiliateLink, BrandGrid, ...BELOPP_MDX_COMPONENTS },
      });

      const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `Importera bil från Tyskland – Komplett guide ${CONTENT_YEAR}`,
        datePublished: "2026-03-11",
        dateModified: frontmatter.dateUpdated,
        author: { "@type": "Organization", name: "Importguiden", url: SITE_URL },
        publisher: { "@type": "Organization", name: "Importguiden", url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/importera-bil/tyskland` },
      };

      const tysklandFaqSchema = getFaqJsonLd([
        {
          question: "Är det lönsamt att importera bil från Tyskland?",
          answer: "Det beror på prisskillnaden för just den bil du tittar på. Jämför den med summan av transport, ursprungskontroll, registreringsbesiktning, skyltar, eventuell moms och fordonsskatt.",
        },
        {
          question: "Hur lång tid tar det att importera bil från Tyskland?",
          answer: "Det avgörs mest av kötiden för ursprungskontrollen, som Transportstyrelsen inte anger som en fast handläggningstid. Aktuellt ködatum visas i Transportstyrelsens e-tjänst Visa ärendestatus för ursprungskontroll. Först när ursprungskontrollen är godkänd kan du boka registreringsbesiktning.",
        },
        {
          question: "Behöver man betala tull vid import från Tyskland?",
          answer: "Nej, inom EU gäller fri rörlighet för varor. Du betalar ingen tull vid import från Tyskland till Sverige.",
        },
        {
          question: "Kan man importera bil från Tyskland utan att åka dit?",
          answer: "Ja, du kan anlita ett transportföretag. Du behöver då ordna köpekontraktet och betalningen på distans, få registreringsbevisets original skickade till dig och gärna låta en oberoende besiktningsman undersöka bilen innan köpet.",
        },
      ]);

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(tysklandFaqSchema) }}
          />
          <div className="mx-auto max-w-3xl px-4 py-10">
            <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
            <article className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline prose-table:text-sm">
              <h1>Importera bil från Tyskland – Komplett guide {CONTENT_YEAR}</h1>
              <p className="not-prose text-gray-500 text-sm">
                Uppdaterad:{" "}
                <time dateTime={frontmatter.dateUpdated}>
                  {formatDateSv(frontmatter.dateUpdated)}
                </time>
              </p>
              <UpcomingChangeNotice path={`/importera-bil/${slug}`} />
              <TableOfContents headings={headings} />
              {content}
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
                Importera bil från {country.name} – Komplett guide {CONTENT_YEAR}
              </h1>
              {updatedDate && (
                <p className="text-gray-500 text-sm">
                  Uppdaterad: <time dateTime={updatedDate}>{formatDateSv(updatedDate)}</time>
                </p>
              )}
            </header>

          <UpcomingChangeNotice path={`/importera-bil/${slug}`} />

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
                  { title: "Exportregistrering och hemtransport", desc: "Säljaren avregistrerar bilen. Du kan köra hem på tyska exportskyltar eller anlita transport." },
                  { title: "Ursprungskontroll", desc: `Beställ ursprungskontroll hos Transportstyrelsen (${formatCost("ursprungskontroll")}).` },
                  { title: "Registreringsbesiktning", desc: `Boka registreringsbesiktning hos godkänd station. Publicerade priser ${formatCost("registreringsbesiktning")}.` },
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
                  <tr><td className="p-3">Ursprungskontroll</td><td className="p-3 text-right font-medium">{formatCost("ursprungskontroll")}</td><td className="p-3 text-xs text-gray-500">Transportstyrelsen</td></tr>
                  <tr><td className="p-3">Registreringsbesiktning</td><td className="p-3 text-right font-medium">{formatCost("registreringsbesiktning")}</td><td className="p-3 text-xs text-gray-500">Publicerade prislistor</td></tr>
                  <tr><td className="p-3">Exportskyltar och exportförsäkring (kör hem)</td><td className="p-3 text-right font-medium">från {formatSekRange(exportKostnad())}</td><td className="p-3 text-xs text-gray-500">Service Berlin, nondos.de</td></tr>
                  <tr><td className="p-3">Moms (om fordon anses nytt)</td><td className="p-3 text-right font-medium">25 % av priset</td><td className="p-3 text-xs text-gray-500">Skatteverket</td></tr>
                  <tr><td className="p-3">Tull (EU-import)</td><td className="p-3 text-right font-medium text-green-700">{TULL_EU}</td><td className="p-3 text-xs text-gray-500">Tullverket</td></tr>
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
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />
          <article>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Importera {brand!.name} från Tyskland – Guide {CONTENT_YEAR}
              </h1>
            </header>

          <UpcomingChangeNotice path={`/importera-bil/${slug}`} />
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
      {BRAND_FAQ[brand!.slug] && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getFaqJsonLd(BRAND_FAQ[brand!.slug])),
          }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Importera {importData.name} från Tyskland – Guide {CONTENT_YEAR}
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

          <UpcomingChangeNotice path={`/importera-bil/${slug}`} />

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
                <dt className="text-gray-600">Hitta bilar</dt>
                <dd className="font-medium text-gray-900">{importData.whereToBuy.join(", ")}</dd>
              </div>
            </dl>
          </div>

          {/* ADAC: bästa i klassen */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {importData.name}-modeller bland de bästa enligt ADAC
            </h2>
            {importData.recommendedModels.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 font-semibold text-gray-700">Modell</th>
                      <th className="text-left p-3 font-semibold text-gray-700">ADAC-klass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importData.recommendedModels.map((model) => (
                      <tr key={model.model}>
                        <td className="p-3 font-medium text-gray-900">{model.model}</td>
                        <td className="p-3 text-gray-700">{model.adacClass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                Ingen {importData.name}-modell finns med i ADAC:s listor över de bästa eller sämsta i sin klass.
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              ADAC listar de modeller som hade minst pannor i sin fordonsklass, räknat på pannor under 2025 för
              bilar med första registrering 2016–2023. Källa:{" "}
              <a href={importData.adacSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                {importData.adacSource}
              </a>
              , publicerad 23 april 2026.
            </p>
          </section>

          {/* Brand-specific: Garanti */}
          {BRAND_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Garanti vid {importData.name}-import</h2>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {BRAND_GARANTI[brand!.slug].intro}
              </p>
              <div className="space-y-4 text-sm text-gray-700">
                {BRAND_GARANTI[brand!.slug].items.map((item, i) => (
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
              <p className="text-xs text-gray-400 mt-3">{BRAND_GARANTI[brand!.slug].source}</p>
            </section>
          )}

          {/* Brand-specific: Fordonsskatt */}
          {BRAND_FORDONSSKATT[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Fordonsskatt — räkneexempel</h2>
              {BRAND_FORDONSSKATT[brand!.slug].intro ? (
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r mb-4">
                  <p className="text-sm text-blue-800">{BRAND_FORDONSSKATT[brand!.slug].intro}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Vid import till Sverige gäller svensk fordonsskatt. Under de tre första åren från första registrering (var som helst i världen) kan malus-tillägget bli betydande — särskilt för bensin- och dieselmodeller.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 font-semibold text-gray-700">Modell</th>
                      <th className="text-left p-3 font-semibold text-gray-700">CO₂ (g/km)</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Bränsle</th>
                      <th className="text-left p-3 font-semibold text-gray-700">År 1–3</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Från år 4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {BRAND_FORDONSSKATT[brand!.slug].rows.map((row) => {
                      const tax = taxFor(row);
                      return (
                        <tr key={`${row.model}-${row.co2}-${row.fuel}`}>
                          <td className="p-3 font-medium text-gray-900">{row.model}</td>
                          <td className="p-3 text-gray-700 tabular-nums">{row.co2}</td>
                          <td className="p-3 text-gray-700">{FUEL_LABEL[row.fuel]}</td>
                          <td className="p-3 text-gray-700 tabular-nums whitespace-nowrap">{formatSEK(tax.annualTax)}/år</td>
                          <td className="p-3 text-gray-700 tabular-nums whitespace-nowrap">{formatSEK(tax.annualTaxAfterMalus)}/år</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Beräknat enligt Skatteverkets fordonsskattetabeller för bilar som blir skattepliktiga 1 juni 2022 eller senare: grundbelopp {formatKr(FORDONSSKATT.grundbelopp)}; år 1–3 {formatKr(FORDONSSKATT.malusRateTier1)} per gram över {FORDONSSKATT.malusLowerGram} g/km och {formatKr(FORDONSSKATT.malusRateTier2)} per gram över {FORDONSSKATT.malusUpperGram} g/km; från år 4 {formatKr(FORDONSSKATT.co2RatePerGram)} per gram över {FORDONSSKATT.co2ThresholdGram} g/km. Dieselbilar betalar dessutom miljötillägg {formatKr(FORDONSSKATT.dieselMiljotillagg)} och bränsletillägg {String(FORDONSSKATT.dieselBransletillaggPerGram).replace(".", ",")} kr × koldioxidvärdet. CO₂-värdena är exempel – bilens eget värde står i COC-intyget och i fält V.7 i Zulassungsbescheinigung Teil I. Laddhybrider som registreras från 2026 får ett högre beräknat CO₂-värde (ny viktningsfaktor) och kan därför hamna över malusgränsen.{" "}
                Källor:{" "}
                <a href="https://www.transportstyrelsen.se/sv/vagtrafik/fordon/skatter-och-avgifter/fordonsskatt/skattens-storlek/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  Transportstyrelsen – Skattens storlek
                </a>
                ,{" "}
                <a href="https://www.transportstyrelsen.se/sv/vagtrafik/fordon/skatter-och-avgifter/malus/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  Malus
                </a>
                ,{" "}
                <a href="https://www.transportstyrelsen.se/sv/om-oss/pressrum/nyhetsarkiv/2026/forandrad-viktningsfaktor-for-nya-laddhybrider/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  Ny viktningsfaktor för laddhybrider
                </a>
                .
              </p>
            </section>
          )}

          {/* Fahrzeugbrief guide – all car brands */}
          {BRAND_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Hitta rätt i tyska handlingar (Fahrzeugbrief)</h2>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                När du köper en {importData.name} i Tyskland får du registreringsbeviset (Zulassungsbescheinigung Teil I och Teil II). Här hittar du de viktigaste uppgifterna du behöver för svensk registrering.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Teil I (Fahrzeugschein)</p>
                  <ul className="text-xs text-gray-700 space-y-1.5">
                    <li><span className="font-medium">Fält V.7:</span> CO₂-utsläpp (g/km) — behövs för fordonsskatt-beräkning</li>
                    <li><span className="font-medium">Fält P.2:</span> Motoreffekt (kW)</li>
                    <li><span className="font-medium">Fält D.2:</span> Typ, variant och version</li>
                    <li><span className="font-medium">Fält B:</span> Datum för första registrering</li>
                    <li><span className="font-medium">Fält F.1/F.2:</span> Största tillåtna totalvikt</li>
                    <li><span className="font-medium">Fält G:</span> Vikt i körklart skick (tjänstevikt)</li>
                  </ul>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Teil II (Fahrzeugbrief)</p>
                  <p className="text-xs text-gray-700 mb-2">
                    Del II av registreringsbeviset — se till att du får originalet vid köpet.
                  </p>
                  <p className="text-xs text-gray-500">
                    Tips: Fotografera alla sidor av Teil I och Teil II innan du lämnar säljaren.
                    Du behöver uppgifterna för ansökan om ursprungskontroll.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Fältkoderna är gemensamma för EU enligt{" "}
                <a href="https://eur-lex.europa.eu/legal-content/SV/TXT/?uri=CELEX:31999L0037" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                  direktiv 1999/37/EG om registreringsbevis för fordon
                </a>
                , bilaga I.
              </p>
            </section>
          )}

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
              Källa:{" "}
              <a href={importData.adacSourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                {importData.adacSource}
              </a>
              .
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
                { title: "Köp och transportera hem", desc: "Skriv köpekontrakt med VIN och mätarställning. Transportera bilen till Sverige – kör hem eller anlita transport." },
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

          {/* CostTable for all brands with enriched content */}
          {BRAND_GARANTI[brand!.slug] && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alla importavgifter</h2>
              <CostTable vehicleType="bil" compact />
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
          {(() => {
            const guides = EV_BRAND_SLUGS.includes(brand!.slug)
              ? [...CAR_IMPORT_GUIDES, EV_GUIDE]
              : CAR_IMPORT_GUIDES;
            return (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Guider för din {importData.name}-import
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  Allt du behöver veta – från att hitta bilen i Tyskland till svenska skyltar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {guides.map((guide) => (
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
                  <Link href="/importera-bil/kostnad" className="text-blue-700 hover:underline">
                    Alla kostnader vid bilimport
                  </Link>
                </p>
              </section>
            );
          })()}
        </article>
      </div>
    </>
  );
}
