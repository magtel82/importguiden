import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

const comparisons: Record<string, { title: string; description: string }> = {
  "tyskland-vs-sverige": {
    title: "Bilar billigare i Tyskland? – Prisjämförelse 2025",
    description:
      "Vi jämför bilpriser i Sverige och Tyskland. Lönar det sig verkligen att importera?",
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(comparisons).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = comparisons[slug];
  if (!comp) return {};

  return {
    title: comp.title,
    description: comp.description,
    alternates: { canonical: getCanonicalUrl(`/jamfor/${slug}`) },
    robots: getRobotsForPath(`/jamfor/${slug}`),
  };
}

export default async function JamforPage({ params }: Props) {
  const { slug } = await params;
  const comp = comparisons[slug];
  if (!comp) notFound();

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Jämför", href: `/jamfor/${slug}` },
    { name: comp.title.split("–")[0].trim() },
  ];

  const updatedDate = new Date().toISOString().split("T")[0];

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
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{comp.title}</h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
            </p>
          </header>

          <p className="text-gray-700 mb-6 text-lg">
            Många funderar på om det lönar sig att importera bil från Tyskland. Svaret beror
            på vilken bil du söker, hur noggrant du räknar och hur bekväm du är med processen.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Prisskillnader i praktiken</h2>
            <p className="text-gray-700 mb-3">
              Generellt sett är bilar något billigare i Tyskland, framför allt tyska märken
              (BMW, Mercedes, Audi, VW, Porsche). Det beror på att det är en stor inhemsk
              marknad och att bilarna ibland har lägre prissättning hos ursprungslandets
              återförsäljare.
            </p>
            <p className="text-gray-700">
              Men – du måste alltid räkna in importkostnaderna: ursprungskontroll (~1 240 kr),
              registreringsbesiktning (~1 700 kr) och transport (~2 000–9 000 kr). Det betyder
              att du behöver hitta en prisskillnad på minst 5 000–15 000 kr för att det
              ska vara värt det.
            </p>
          </section>

          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-8">
            <h3 className="font-semibold text-gray-900 mb-2">Räkna om det lönar sig</h3>
            <p className="text-sm text-gray-600 mb-3">
              Använd vår kalkylator för att räkna ut din totala kostnad och jämföra med
              svenska priser.
            </p>
            <Link
              href="/kalkylator/bilimport"
              className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Öppna kalkylatorn
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
