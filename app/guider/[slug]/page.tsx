import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getCanonicalUrl, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TableOfContents } from "@/components/TableOfContents";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { extractHeadings } from "@/lib/headings";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

const GUIDE_SLUGS = [
  "registreringsbesiktning",
  "coc-intyg",
  "ursprungskontroll",
  "moms-vid-bilimport",
  "kopa-bil-mobile-de-autoscout24",
  "fordonsskatt-husbil-bonus-malus",
  "hur-lang-tid-tar-bilimport",
  "transportera-bil-fran-tyskland",
  "importera-elbil",
  "besikta-husbil",
  "kopa-husbil-mobil-de",
  "besiktningsfel-vid-import",
  "exportforsakring",
  "importforsakring",
] as const;

type GuideSlug = (typeof GUIDE_SLUGS)[number];

interface GuideFrontmatter {
  title: string;
  description: string;
  dateUpdated: string;
}

async function loadGuide(slug: string) {
  const filePath = path.join(
    process.cwd(),
    "content/guider",
    `${slug}.mdx`
  );
  let source: string;
  try {
    source = await readFile(filePath, "utf-8");
  } catch {
    return null;
  }

  const headings = extractHeadings(source);

  const { content, frontmatter } = await compileMDX<GuideFrontmatter>({
    source,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
    components: { AffiliateLink },
  });

  return { content, frontmatter, headings };
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await loadGuide(slug);
  if (!guide) return {};

  return {
    title: guide.frontmatter.title,
    description: guide.frontmatter.description,
    alternates: { canonical: getCanonicalUrl(`/guider/${slug}`) },
    robots: getRobotsForPath(`/guider/${slug}`),
  };
}

export default async function GuiderPage({ params }: Props) {
  const { slug } = await params;
  const guide = await loadGuide(slug);
  if (!guide) notFound();

  const { content, frontmatter, headings } = guide;

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Guider", href: "/guider" },
    { name: frontmatter.title.split("–")[0].trim() },
  ];

  const faqSchema =
    slug === "kopa-bil-mobile-de-autoscout24"
      ? getFaqJsonLd([
          {
            question: "Finns mobile.de på svenska?",
            answer:
              "Nej, mobile.de finns bara på tyska och delvis engelska. Med ordlistan på sidan och Google Translate i Chrome klarar du dig utmärkt. AutoScout24 är ett alternativ med mer genomarbetat flerspråkigt stöd.",
          },
          {
            question: "Finns mobile.de på engelska?",
            answer:
              "Ja, delvis. Scrolla längst ned på mobile.de och välj engelska som språk. Observera att inte alla annonser översätts och att viss terminologi kan vara missvisande i översättningen.",
          },
          {
            question: "Är mobile.de säkert?",
            answer:
              "Mobile.de är Tysklands största bilsajt med över 1,4 miljoner annonser. Sajten i sig är seriös, men som på alla marknadsplatser finns det bedragare. Köp alltid av en registrerad återförsäljare (Händler) som förstagångsköpare och boka en oberoende besiktning via DEKRA, TÜV eller ADAC.",
          },
          {
            question: "Är det säkrare att köpa av handlare än privatperson på mobile.de?",
            answer:
              "Ja, som förstagångsköpare rekommenderas återförsäljare (Händler). Du får reklamationsrätt enligt EU:s konsumentköplag, bilen är ofta servad och exportdokumentation hanteras rutinmässigt. Privata säljare säljer i befintligt skick utan garanti.",
          },
          {
            question: "Hur kontaktar jag en säljare på mobile.de?",
            answer:
              "Via kontaktformuläret direkt på annonsen. De flesta återförsäljare svarar på engelska. Privata säljare kan variera – grundläggande engelska eller tyska fraser räcker i de flesta fall.",
          },
          {
            question: "Hur ändrar man språk på mobile.de?",
            answer:
              "Scrolla längst ned på mobile.de och välj engelska i språkväljaren. Alternativt kan du använda Google Chromes inbyggda översättningsfunktion för att få sidan översatt till svenska automatiskt. Det finns inget officiellt svenskt gränssnitt.",
          },
          {
            question: "Vad betyder Fahrzeugbrief på mobile.de?",
            answer:
              "Fahrzeugbrief, eller Zulassungsbescheinigung Teil II, är den tyska motsvarigheten till det svenska registreringsbeviset. Det är ett viktigt dokument som bevisar ägarskap och behövs vid avregistrering och export av bilen.",
          },
        ])
      : slug === "ursprungskontroll"
      ? getFaqJsonLd([
          {
            question: "Vad kostar ursprungskontroll 2026?",
            answer:
              "Avgiften är 1 240 kr (källa: Transportstyrelsen). Betalas vid beställning och återbetalas inte oavsett utfall.",
          },
          {
            question: "Hur lång tid tar ursprungskontroll?",
            answer:
              "Vanligtvis 2–5 arbetsdagar från det att betalning är registrerad. I perioder med hög belastning kan det ta längre tid – räkna med upp till 1–2 veckor som säkerhetsplan.",
          },
          {
            question: "Kan jag köra bilen innan ursprungskontrollen är klar?",
            answer:
              "Nej, bilen får inte användas i trafik i Sverige innan ursprungskontrollen är godkänd, med undantag för körning till registreringsbesiktning under vissa förutsättningar. Kontakta Transportstyrelsen för detaljer.",
          },
          {
            question: "Vad händer om ursprungskontrollen inte godkänns?",
            answer:
              "Du får ett beslut med förklaring. Vanliga orsaker är saknade dokument eller att bilen finns i ett stöldregister. Du kan komplettera och ansöka igen, eller kontakta säljaren för att lösa den underliggande frågan.",
          },
          {
            question: "Vad kontrollerar Transportstyrelsen vid ursprungskontroll?",
            answer:
              "Transportstyrelsen kontrollerar fordonet mot internationella register för stulna fordon (via Interpol, Europol och nationella polisregister) samt mot kreditbelastningsregister i hemlandet för att se om bilen har kvarstående leasingskulder, panträtter eller är belagd med kvarstad. Kontrollen verifierar även att VIN-numret stämmer med registreringsdokumenten.",
          },
        ])
      : slug === "coc-intyg"
      ? getFaqJsonLd([
          {
            question: "Vad är ett COC-intyg?",
            answer:
              "COC är en förkortning av Certificate of Conformity – ett officiellt dokument utfärdat av fordonstillverkaren som intygar att fordonet uppfyller alla tillämpliga EU-direktiv vid tillverkningstillfället. Det är knutet till fordonets chassinummer (VIN) och gäller i alla EU-länder.",
          },
          {
            question: "Hur får man ett COC-intyg?",
            answer:
              "Beställ direkt från biltillverkaren med bilens VIN-nummer, via den officiella märkesimportören i Sverige, eller via tredjepartstjänster som EuroCOC. Fråga alltid säljaren först – många nyare bilar levereras med COC i dokumentmappen.",
          },
          {
            question: "Vad kostar ett COC-intyg?",
            answer:
              "Det varierar per märke: normalt €100–300 via tillverkaren. Tesla utfärdar ofta COC utan kostnad. Tredjepartstjänster tar vanligtvis €150–350.",
          },
          {
            question: "Behöver jag COC-intyg för att importera bil?",
            answer:
              "Det är inte alltid formellt obligatoriskt, men det underlättar registreringen avsevärt. Utan COC kan besiktningsstationen kräva alternativ dokumentation eller hänvisa till enskilt godkännande via Transportstyrelsen – en process som kan ta månader och kosta 5 000–15 000 kr extra.",
          },
        ])
      : slug === "importforsakring"
      ? getFaqJsonLd([
          {
            question: "Vad kostar importförsäkring för bil?",
            answer:
              "Schablonkostnaden för importförsäkring på personbil är cirka 1 500 kr, med ett intervall på 1 000–2 500 kr beroende på bolag och giltighetstid. Kontrollera aktuella priser hos IF, Folksam eller Länsförsäkringar.",
          },
          {
            question: "Hur länge gäller en importförsäkring?",
            answer:
              "Vanligen 1 till 3 månader. Giltighetstiden väljer du vid ansökan och ska täcka hela perioden från hemkomst till registrering i Sverige.",
          },
          {
            question: "Måste man ha importförsäkring?",
            answer:
              "Ja. Enligt trafikskadelagen (1975:103) är det obligatoriskt med giltig trafikförsäkring för att framföra ett motorfordon på allmän väg i Sverige – oavsett om fordonet är registrerat eller inte.",
          },
        ])
      : slug === "exportforsakring"
      ? getFaqJsonLd([
          {
            question: "Vad kostar en exportförsäkring i Tyskland?",
            answer:
              "Typiskt 50–150 EUR för personbil, beroende på giltighetstid (5–30 dagar) och försäkringsbolag. Husbilar kan kosta 80–200 EUR beroende på totalvikt.",
          },
          {
            question: "Hur länge gäller en exportförsäkring?",
            answer:
              "Du väljer giltighetstid vid ansökan: 5 till 30 dagar. Utgångsdatumet trycks direkt på exportskyltarna och kan inte förlängas i efterhand.",
          },
          {
            question: "Behöver jag exportförsäkring om jag kör bilen på släp?",
            answer:
              "Om bilen rullar på egna hjul på vägen räknas den som fordon i trafik och behöver exportskyltar. Om bilen lastats helt på ett släp eller en biltransport räknas den som last och behöver ingen exportförsäkring.",
          },
        ])
      : null;

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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {frontmatter.title}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad:{" "}
              <time dateTime={frontmatter.dateUpdated}>
                {frontmatter.dateUpdated}
              </time>
            </p>
          </header>

          <TableOfContents headings={headings} />
          <div className="prose prose-gray max-w-none">{content}</div>
        </article>
      </div>
    </>
  );
}
