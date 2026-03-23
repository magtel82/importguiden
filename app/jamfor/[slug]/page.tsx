import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCostData } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";
const UPDATED_DATE = "2026-03-14";

const comparisons: Record<string, { title: string; description: string }> = {
  "tyskland-vs-sverige": {
    title: "Bilar billigare i Tyskland? – Prisjämförelse 2026",
    description:
      "Vi jämför bilpriser i Sverige och Tyskland per segment. Lönar det sig att importera? Break-even-analys, konkreta exempel och vilka märken som har störst prisskillnad.",
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

  const costData = getCostData();

  const fastaKostnader =
    costData.fees.ursprungskontroll.amount +
    costData.fees.registreringsbesiktning_personbil.amount +
    costData.fees.importforsäkring_personbil.amount;

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Jämför", href: `/jamfor/${slug}` },
    { name: "Bilar i Tyskland vs Sverige" },
  ];

  const segments = [
    {
      segment: "Mellanklass (BMW 3-serie, Audi A4, Mercedes C-klass)",
      de: "220 000–280 000 kr",
      se: "270 000–350 000 kr",
      diff: "40 000–70 000 kr",
      bedomning: "Ofta lönsamt",
      bedomningColor: "text-green-700",
    },
    {
      segment: "Premium-SUV (BMW X5, Mercedes GLE, Audi Q7)",
      de: "380 000–550 000 kr",
      se: "450 000–650 000 kr",
      diff: "60 000–100 000 kr",
      bedomning: "Ofta mycket lönsamt",
      bedomningColor: "text-green-700",
    },
    {
      segment: "Sportbil (Porsche 911, BMW M3, Mercedes AMG)",
      de: "600 000–1 200 000 kr",
      se: "700 000–1 400 000 kr",
      diff: "80 000–150 000 kr",
      bedomning: "Ofta mycket lönsamt",
      bedomningColor: "text-green-700",
    },
    {
      segment: "Kompaktklass (VW Golf, Audi A3, BMW 1-serie)",
      de: "140 000–200 000 kr",
      se: "160 000–240 000 kr",
      diff: "15 000–40 000 kr",
      bedomning: "Ibland lönsamt",
      bedomningColor: "text-amber-600",
    },
    {
      segment: "Volvo (V60, XC60, XC90)",
      de: "220 000–450 000 kr",
      se: "220 000–460 000 kr",
      diff: "0–15 000 kr",
      bedomning: "Sällan lönsamt",
      bedomningColor: "text-gray-500",
    },
    {
      segment: "Elbil (Tesla Model 3, VW ID.4, BMW iX)",
      de: "200 000–500 000 kr",
      se: "210 000–520 000 kr",
      diff: "5 000–25 000 kr",
      bedomning: "Sällan lönsamt",
      bedomningColor: "text-gray-500",
    },
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

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Bilar billigare i Tyskland? – Prisjämförelse 2026
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={UPDATED_DATE}>{UPDATED_DATE}</time>
              {" "}· Källa: mobile.de, Bytbil.com, Blocket.se (schablonvärden)
            </p>
          </header>

          <p className="text-gray-700 mb-4 text-lg">
            Ja – tyska märken är generellt sett billigare i Tyskland än i Sverige,
            ibland med 40 000–100 000 kr på mellanklass och premium-segment.
            Men det gäller inte alla biltyper, och du måste alltid räkna in
            importkostnaderna innan du bestämmer dig.
          </p>
          <p className="text-gray-700 mb-8">
            Nedan hittar du en jämförelse per bilsegment, en break-even-analys
            och en guide till hur du jämför priser praktiskt.
          </p>

          {/* Prisjämförelse per segment */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Prisskillnad per bilsegment
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Priserna nedan är schablonvärden baserade på generella marknadslägen
              för 3–5 år gamla bilar med normal körsträcka. Faktiska priser varierar –
              kontrollera alltid aktuella priser på{" "}
              <a
                href="https://www.mobile.de"
                className="text-blue-700 hover:underline"
                target="_blank"
                rel="nofollow"
              >
                mobile.de
              </a>{" "}
              och{" "}
              <a
                href="https://www.bytbil.com"
                className="text-blue-700 hover:underline"
                target="_blank"
                rel="nofollow"
              >
                Bytbil.com
              </a>
              .
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Segment</th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Tyskland</th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Sverige</th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Skillnad</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Bedömning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {segments.map((s) => (
                    <tr key={s.segment}>
                      <td className="p-3 text-gray-700 text-xs">{s.segment}</td>
                      <td className="p-3 text-right text-gray-600 whitespace-nowrap text-xs">{s.de}</td>
                      <td className="p-3 text-right text-gray-600 whitespace-nowrap text-xs">{s.se}</td>
                      <td className="p-3 text-right font-medium whitespace-nowrap text-xs">{s.diff}</td>
                      <td className={`p-3 text-xs font-medium ${s.bedomningColor}`}>{s.bedomning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Schablonvärden. Prisskillnaden varierar med modellår, utrustning och marknadsläge.
            </p>
          </section>

          {/* Break-even */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Break-even: hur stor måste prisskillnaden vara?
            </h2>
            <p className="text-gray-700 mb-4">
              Utöver bilpriset tillkommer fasta importkostnader. Du behöver hitta
              en prisskillnad som överstiger dessa för att importen ska löna sig:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Kostnad</th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Belopp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 text-gray-700">Ursprungskontroll</td>
                    <td className="p-3 text-right font-medium">{costData.fees.ursprungskontroll.amount.toLocaleString("sv-SE")} kr</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Registreringsbesiktning</td>
                    <td className="p-3 text-right font-medium">~{costData.fees.registreringsbesiktning_personbil.amount.toLocaleString("sv-SE")} kr</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Importförsäkring</td>
                    <td className="p-3 text-right font-medium">~{costData.fees.importforsäkring_personbil.amount.toLocaleString("sv-SE")} kr</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Transport (kör hem, schablonvärde)</td>
                    <td className="p-3 text-right font-medium">~6 000 kr</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Din tid (resa, papper, besiktning)</td>
                    <td className="p-3 text-right text-gray-500">Räkna på det</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900">Minsta lönsamma prisskillnad</td>
                    <td className="p-3 text-right font-semibold text-gray-900">
                      ~{(fastaKostnader + 6000).toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 text-sm">
              I praktiken bör du räkna med att prisskillnaden behöver vara minst
              <strong> 20 000–25 000 kr</strong> för att importen ska vara värd
              besväret när du räknar in tid, eventuell flygbiljett och riskmarginal.
              Under 15 000 kr är det sällan lönsamt.
            </p>
          </section>

          {/* Vilka märken lönar sig */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Vilka märken har störst prisskillnad?
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Störst skillnad – tyska premium-märken
                </h3>
                <p className="text-gray-700 text-sm">
                  BMW, Mercedes-Benz, Audi och Porsche säljs i stora volymer
                  på hemmamarknaden, vilket pressar priserna. Prisskillnaden mot
                  Sverige är störst i mellanklass och premium-SUV-segmentet.
                  En BMW 5-serie eller Mercedes E-klass kan vara 40 000–80 000 kr
                  billigare i Tyskland.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Måttlig skillnad – VW-gruppen i kompaktklass
                </h3>
                <p className="text-gray-700 text-sm">
                  Volkswagen Golf, Audi A3 och Skoda Octavia har viss prisskillnad
                  men den är mer modest – ofta 15 000–35 000 kr. Bilen är vanligare
                  och konkurrensen på begagnatmarknaden är hårdare, vilket minskar
                  prisgapet.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Liten eller ingen skillnad – Volvo och elbilar
                </h3>
                <p className="text-gray-700 text-sm">
                  Volvo är ett svenskt märke med stark hemmamarknad – priserna
                  är jämförbara eller ibland lägre i Sverige. Elbilar handlas
                  alltmer på en europeisk nivå och prisskillnaderna har minskat
                  kraftigt de senaste åren. Import av elbil lönar sig sällan
                  jämfört med tyska bensin- och dieselbilar.
                </p>
              </div>
            </div>
          </section>

          {/* Hur du jämför priser */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Hur du jämför priser praktiskt
            </h2>
            <p className="text-gray-700 mb-4 text-sm">
              Gör alltid en direkt jämförelse på samma modell, årsmodell och
              ungefärlig körsträcka innan du bestämmer dig. Så här går du till väga:
            </p>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-gray-900">1.</span>
                <span>
                  Hitta en bil på{" "}
                  <a href="https://www.mobile.de" className="text-blue-700 hover:underline" target="_blank" rel="nofollow">mobile.de</a>{" "}
                  – filtrera på märke, modell, årsmodell och max körsträcka.
                  Notera priset i EUR.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-gray-900">2.</span>
                <span>
                  Sök på samma spec på{" "}
                  <a href="https://www.bytbil.com" className="text-blue-700 hover:underline" target="_blank" rel="nofollow">Bytbil.com</a>{" "}
                  eller{" "}
                  <a href="https://www.blocket.se/fordon" className="text-blue-700 hover:underline" target="_blank" rel="nofollow">Blocket</a>.
                  Jämför genomsnittspriset.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-gray-900">3.</span>
                <span>
                  Räkna om EUR till SEK med aktuell kurs och lägg på importkostnaderna
                  (~{(fastaKostnader + 6000).toLocaleString("sv-SE")} kr totalt för transport + fasta avgifter).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-gray-900">4.</span>
                <span>
                  Om totalen är minst 15 000–20 000 kr lägre än det svenska priset –
                  kan det vara värt att titta närmare.
                </span>
              </li>
            </ol>
            <p className="text-sm text-gray-500 mt-4">
              Använd{" "}
              <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
                importkalkylatorn
              </Link>{" "}
              för att räkna ut totalkostnaden med aktuell växelkurs.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Vanliga frågor
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Är det alltid billigare att köpa bil i Tyskland?
                </h3>
                <p className="text-gray-700 text-sm">
                  Nej. Det beror helt på märke och modell. Tyska premiumbilar
                  är ofta billigare i Tyskland, men svenska märken (Volvo), japanska
                  märken och elbilar är sällan nämnvärt billigare. Jämför alltid
                  konkret innan du bestämmer dig.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Kan jag lita på priserna på mobile.de?
                </h3>
                <p className="text-gray-700 text-sm">
                  Mobile.de är Tysklands ledande bilsajt och priserna är verkliga
                  utbud. Tänk dock på att annonserade priser kan vara förhandlingsbara,
                  och att bilar hos professionella handlare ibland är dyrare än
                  hos privatpersoner.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Spelar det roll om jag köper av privatperson eller handlare i Tyskland?
                </h3>
                <p className="text-gray-700 text-sm">
                  Ja. Privatpersoner säljer ofta billigare men utan garanti.
                  Handlare ger ofta garanti och har bättre koll på dokumentationen
                  (COC-intyg, servicehistorik), men tar mer betalt. Importmässigt
                  fungerar processen lika oavsett säljare.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vad händer med garantin när jag importerar?
                </h3>
                <p className="text-gray-700 text-sm">
                  En fabriksgaranti från ett EU-land gäller normalt inom hela EU,
                  inklusive Sverige. Kontrollera med märkesimportören i Sverige
                  i förväg – hanteringen varierar.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              Redo att räkna på din specifika bil?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Fyll i pris, land och transportmetod i kalkylatorn för en
              samlad bild med aktuell växelkurs.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kalkylator/bilimport"
                className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Öppna importkalkylatorn
              </Link>
              <Link
                href="/importera-bil/tyskland"
                className="inline-block rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Läs hela importguiden
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
