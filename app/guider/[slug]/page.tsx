import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getCanonicalUrl, getFaqJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { TableOfContents } from "@/components/TableOfContents";
import { GuideFooter } from "@/components/GuideFooter";
import { GlossaryTable } from "@/components/GlossaryTable";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";
import { extractHeadings } from "@/lib/headings";
import { formatDateSv } from "@/lib/date";
import { UpcomingChangeNotice } from "@/components/UpcomingChangeNotice";
import { withYear } from "@/lib/site-config";
import { formatCost, costSourceLine } from "@/lib/costs";
import { BELOPP_MDX_COMPONENTS } from "@/components/Belopp";

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
  "eeg-intyg",
  "elbilspremie-importerad-bil",
  "tysk-bilordlista",
  "matarmanipulation",
  "garanti-vid-bilimport",
  "krockhistorik-unfallfrei",
  "importera-husvagn",
] as const;

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
    components: { AffiliateLink, GlossaryTable, ...BELOPP_MDX_COMPONENTS },
  });

  return {
    content,
    frontmatter: {
      ...frontmatter,
      title: withYear(frontmatter.title),
      description: withYear(frontmatter.description),
    },
    headings,
  };
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
            question: "Hur läser jag mobile.de på svenska?",
            answer:
              "Med webbläsarens översättning. I Google Chrome väljer du Översätt till höger om adressfältet, så översätts sidan till svenska. Annonsernas fackord blir ofta fel i maskinöversättning – använd ordlistan på sidan för de viktigaste termerna, som Unfallfrei, Scheckheftgepflegt och MwSt. ausweisbar.",
          },
          {
            question: "Är mobile.de säkert?",
            answer:
              "Sajten i sig är seriös, men som på alla marknadsplatser finns det bedragare. Köp alltid av en registrerad återförsäljare (Händler) som förstagångsköpare och boka en oberoende besiktning via DEKRA, TÜV eller ADAC.",
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
            question: "Vad betyder Fahrzeugbrief på mobile.de?",
            answer:
              "Fahrzeugbrief, eller Zulassungsbescheinigung Teil II, är den tyska motsvarigheten till det svenska registreringsbeviset. Det är ett viktigt dokument som bevisar ägarskap och behövs vid avregistrering och export av bilen.",
          },
        ])
      : slug === "ursprungskontroll"
      ? getFaqJsonLd([
          {
            question: "Vad kostar ursprungskontroll?",
            answer:
              `Ursprungskontroll kostar ${formatCost("ursprungskontroll")} (källa: Transportstyrelsen). Du får en faktura per post och handläggningen startar när betalningen registrerats.`,
          },
          {
            question: "Hur lång tid tar ursprungskontroll?",
            answer:
              "Transportstyrelsen anger ingen fast handläggningstid utan publicerar vilket ködatum som handläggs just nu, i e-tjänsten Visa ärendestatus för ursprungskontroll. Den 19 oktober 2026 handlades ärenden med ködatum 22 september 2026, alltså en kö på ungefär fyra veckor. Kontrollera aktuellt läge innan du planerar.",
          },
          {
            question: "Hur följer jag status på min ursprungskontroll?",
            answer:
              "Via Transportstyrelsens e-tjänst Visa ärendestatus för ursprungskontroll. Du anger ditt referensnummer och behöver ingen inloggning.",
          },
          {
            question: "Kan jag köra bilen innan ursprungskontrollen är klar?",
            answer:
              "Enligt Transportstyrelsen får ett importerat fordon användas i trafik i högst sju dagar från den dag det fördes in i landet, förutsatt giltig utländsk registrering och gällande utländsk trafikförsäkring. Därefter krävs tillfällig registrering. Undantag: du får köra kortast lämpliga väg till och från besiktningsföretaget med skriftlig kallelse och giltig trafikförsäkring.",
          },
          {
            question: "Vad händer om ursprungskontrollen inte godkänns?",
            answer:
              "Transportstyrelsen skickar beslutet med post. Saknas något i ansökan får du först ett brev med begäran om komplettering. Kontakta säljaren om det som saknas gäller fordonets handlingar.",
          },
          {
            question: "Vad kontrollerar Transportstyrelsen vid ursprungskontroll?",
            answer:
              "Ursprungskontrollen ska hindra att stulna eller efterlysta fordon registreras i Sverige. Den krävs för alla fordon som ska registreras här, utom nya fordon från registrerade importörer, och ett godkännande gäller i fem år.",
          },
        ])
      : slug === "moms-vid-bilimport"
      ? getFaqJsonLd([
          {
            question: "Betalar man moms när man importerar bil från Tyskland?",
            answer:
              "Vid köp av begagnad bil från privatperson i EU betalar du normalt ingen moms i Sverige. Moms tillkommer endast om bilen räknas som ett 'nytt transportmedel' (under 6 månader gammal eller under 6 000 km).",
          },
          {
            question: "Vad räknas som nytt transportmedel vid bilimport?",
            answer:
              "En bil räknas som ny om den är yngre än 6 månader eller har körts färre än 6 000 km. Då ska du betala svensk moms (25 %) vid importen.",
          },
          {
            question: "Hur redovisar man moms vid bilimport till Skatteverket?",
            answer:
              "Om moms ska betalas redovisar du det i en momsdeklaration till Skatteverket. Som privatperson görs detta via blankett SKV 5740.",
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
              "Priset sätts av tillverkaren och skiljer mellan märken. Tesla utfärdar ofta COC utan kostnad. Fråga märkets kundtjänst om pris och leveranstid innan du beställer.",
          },
          {
            question: "Behöver jag COC-intyg för att importera bil?",
            answer:
              "Det är inte alltid formellt obligatoriskt, men det underlättar registreringen avsevärt. Utan COC kan besiktningsstationen kräva alternativ dokumentation eller hänvisa till enskilt godkännande via Transportstyrelsen – en process som kan ta månader och kostar mer än en vanlig registreringsbesiktning.",
          },
        ])
      : slug === "importforsakring"
      ? getFaqJsonLd([
          {
            question: "Hur försäkrar man en importerad bil i Sverige?",
            answer:
              "Med en svensk trafikförsäkring som tecknas på chassinumret. Efter sju dagar i Sverige krävs dessutom tillfällig registrering, och till ansökan bifogas ett trafikförsäkringsbevis för tillfällig registrering eller ett 30-dagars försäkringsintyg från ett svenskt försäkringsbolag (Transportstyrelsen).",
          },
          {
            question: "Vad kostar importförsäkring för bil?",
            answer:
              `Hos If kostar trafikförsäkringen för tillfällig registrering ${formatCost("importforsakring_if")} och gäller i högst tre månader (${costSourceLine("importforsakring_if")}). Andra försäkringsbolag har egna priser.`,
          },
          {
            question: "Hur länge gäller en tillfällig trafikförsäkring?",
            answer:
              "If:s försäkring för tillfällig registrering gäller i högst tre månader och upphör när bilen godkänts vid registreringsbesiktning. Den tillfälliga registreringen gäller i tre månader och kan inte förlängas (Transportstyrelsen).",
          },
          {
            question: "Räcker det med försäkring för att köra bilen i Sverige?",
            answer:
              "Nej. Efter sju dagar krävs även tillfällig registrering. Undantaget är kortaste väg till och från registreringsbesiktningen med skriftlig kallelse och giltig trafikförsäkring.",
          },
        ])
      : slug === "exportforsakring"
      ? getFaqJsonLd([
          {
            question: "Hur ser tyska exportskyltar ut?",
            answer:
              "Ausfuhrkennzeichen är vita skyltar med ett rött fält längst till höger där utgångsdatumet står. Röda skyltar (rote Kennzeichen) är något annat – de används av bilhandlare.",
          },
          {
            question: "Hur länge gäller exportskyltar och exportförsäkring?",
            answer:
              "Exportregistreringen gäller lika länge som exportförsäkringen och enligt tysk lag högst ett år (§ 45 Fahrzeug-Zulassungsverordnung). Löptiden väljer du när du tecknar försäkringen.",
          },
          {
            question: "Behöver jag exportförsäkring om bilen transporteras på trailer?",
            answer:
              "Nej. En bil som lastats på ett släp eller en biltransport räknas som last. Rullar den på egna hjul, till exempel bogserad, är den ett fordon i trafik och behöver exportskyltar.",
          },
        ])
      : null;

  return (
    <>
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
                {formatDateSv(frontmatter.dateUpdated)}
              </time>
            </p>
          </header>

          <UpcomingChangeNotice path={`/guider/${slug}`} />
          <TableOfContents headings={headings} />
          <div className="prose prose-gray max-w-none">{content}</div>
        </article>

        <GuideFooter slug={slug} />
      </div>
    </>
  );
}
