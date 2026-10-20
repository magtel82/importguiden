import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CostTable } from "@/components/CostTable";
import {
  feeTotal,
  bilkostnadForKm,
  exportKostnad,
  formatKr,
  formatSekRange,
  getCost,
  eurRateLine,
  MOMS,
} from "@/lib/costs";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath, getLastUpdatedForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { formatDateSv } from "@/lib/date";
import { CONTENT_YEAR } from "@/lib/site-config";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

/**
 * Jämförelsesidan visar en METOD, inte egna bilpriser. Tidigare fanns en
 * tabell med prisnivåer per segment utan källa – den togs bort 2026-10-20.
 * Lägg inte tillbaka prisnivåer utan ett daterat, källbelagt underlag.
 */
const comparisons: Record<string, { title: string; description: string; h1: string }> = {
  "tyskland-vs-sverige": {
    title: `Bilar billigare i Tyskland? Så jämför du priset ${CONTENT_YEAR}`,
    h1: "Är bilen billigare i Tyskland? Så jämför du priset själv",
    description:
      "Lönar det sig att köpa bil i Tyskland? Jämför samma bil i svenska och tyska annonser och lägg på importkostnaderna – steg för steg, med aktuella avgifter och källor.",
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

/** Ungefärlig körsträcka Tyskland–Sverige, samma som kalkylatorns standardvärde. */
const HEMKORNING_KM = 1200;

export default async function JamforPage({ params }: Props) {
  const { slug } = await params;
  const comp = comparisons[slug];
  if (!comp) notFound();

  const updatedDate = getLastUpdatedForPath(`/jamfor/${slug}`);

  // Avgifter ur data/cost-data.json. Hemkörning räknas med Skatteverkets
  // schablon för bilkostnad plus exportskyltar och exportförsäkring.
  const fasta = feeTotal("bil");
  const hemkorning = bilkostnadForKm(HEMKORNING_KM) + exportKostnad().min;
  const totalt = { min: fasta.min + hemkorning, max: fasta.max + hemkorning };
  const nyGrans = MOMS.moms_new_vehicle_threshold_km.toLocaleString("sv-SE");

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Jämför", href: `/jamfor/${slug}` },
    { name: "Bilar i Tyskland vs Sverige" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{comp.h1}</h1>
          <p className="text-gray-500 text-sm">
            {updatedDate && (
              <>
                Uppdaterad: <time dateTime={updatedDate}>{formatDateSv(updatedDate)}</time>
                {" "}·{" "}
              </>
            )}
            Avgifter: Transportstyrelsen, Skatteverket och publicerade prislistor
          </p>
        </header>

        <p className="text-gray-700 mb-4 text-lg">
          Det går inte att svara generellt – prisskillnaden beror på märke, modell, årsmodell,
          utrustning och körsträcka, och den ändras hela tiden. Det som avgör är om just den bil du
          tittar på är billigare i Tyskland <strong>när importkostnaderna är inräknade</strong>.
        </p>
        <p className="text-gray-700 mb-8">
          Därför redovisar vi inga egna prisnivåer här. I stället får du en metod för att jämföra
          själv, och de importkostnader du ska lägga på – med källa för varje belopp.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Så jämför du – fyra steg</h2>
          <ol className="space-y-4 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-gray-900">1.</span>
              <span>
                <strong>Hitta bilen i Tyskland.</strong> Sök på{" "}
                <a href="https://www.mobile.de" className="text-blue-700 hover:underline" target="_blank" rel="nofollow">mobile.de</a>{" "}
                eller AutoScout24 och filtrera på märke, modell, årsmodell och högsta körsträcka.
                Notera priset i euro. Läs om annonstermerna i guiden{" "}
                <Link href="/guider/kopa-bil-mobile-de-autoscout24" className="text-blue-700 hover:underline">
                  mobile.de på svenska
                </Link>
                .
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-gray-900">2.</span>
              <span>
                <strong>Hitta samma bil i Sverige.</strong> Sök med samma specifikation på{" "}
                <a href="https://www.bytbil.com" className="text-blue-700 hover:underline" target="_blank" rel="nofollow">Bytbil.com</a>{" "}
                eller{" "}
                <a href="https://www.blocket.se/fordon" className="text-blue-700 hover:underline" target="_blank" rel="nofollow">Blocket</a>.
                Jämför flera annonser, inte bara den billigaste – och kontrollera att utrustningen är
                jämförbar.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-gray-900">3.</span>
              <span>
                <strong>Lägg på importkostnaderna.</strong> Räkna om euro till kronor med aktuell kurs
                och lägg till avgifterna nedan, transport och – om bilen räknas som ny – moms. En bil
                räknas som ny om den köps inom {MOMS.moms_new_vehicle_threshold_months} månader från
                första ibruktagande eller har körts högst {nyGrans} km.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-gray-900">4.</span>
              <span>
                <strong>Jämför totalen.</strong> Är den tyska totalen tydligt lägre än det svenska
                priset – med marginal för din egen tid, resa och oväntade kostnader – kan importen
                vara värd att gå vidare med.
              </span>
            </li>
          </ol>
          <p className="text-sm text-gray-500 mt-4">
            Steg 3 och 4 gör{" "}
            <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
              importkalkylatorn
            </Link>{" "}
            åt dig – fyll i det tyska priset och det svenska jämförpriset.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Hur stor måste prisskillnaden vara?
          </h2>
          <p className="text-gray-700 mb-4">
            Prisskillnaden måste minst täcka de avgifter som tillkommer vid varje import:
          </p>
          <CostTable vehicleType="bil" />
          <p className="text-gray-700 text-sm mb-3">
            Kör du hem bilen själv tillkommer bilkostnaden för resan och tyska exportskyltar med
            exportförsäkring – för {HEMKORNING_KM.toLocaleString("sv-SE")} km ungefär{" "}
            <strong>{formatKr(hemkorning)}</strong> (bilkostnad enligt{" "}
            <a href={getCost("bilkostnad_per_mil").sourceUrl} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
              Skatteverkets schablon
            </a>
            ). Med transportfirma gäller i stället det pris du får i offerten.
          </p>
          <p className="text-gray-700 text-sm">
            Med hemkörning behöver bilen alltså vara mer än{" "}
            <strong>{formatSekRange(totalt)}</strong> billigare i Tyskland för att importen ska gå
            jämnt ut – innan du räknar in din egen tid och en marginal för oväntade kostnader.
          </p>
          <p className="text-xs text-gray-400 mt-2">Euro räknas om med {eurRateLine()}.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Vad påverkar prisskillnaden?</h2>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>
              <strong>Utrustning:</strong> samma modell kan ha olika standardutrustning i Tyskland
              och Sverige. Jämför utrustning, inte bara modellnamn.
            </li>
            <li>
              <strong>Moms:</strong> en nästan ny bil kan bli momspliktig i Sverige, vilket äter upp
              en stor del av prisskillnaden. Läs om{" "}
              <Link href="/guider/moms-vid-bilimport" className="text-blue-700 hover:underline">
                moms vid bilimport
              </Link>
              .
            </li>
            <li>
              <strong>Fordonsskatt:</strong> bensin- och dieselbilar med höga utsläpp betalar malus
              de tre första åren, räknat från första registreringen i utlandet.
            </li>
            <li>
              <strong>Garanti:</strong> en importerad bil saknar svensk vagnskadegaranti. Läs om{" "}
              <Link href="/guider/garanti-vid-bilimport" className="text-blue-700 hover:underline">
                garanti vid bilimport
              </Link>
              .
            </li>
            <li>
              <strong>Annonspris mot slutpris:</strong> annonserade priser är ofta förhandlingsbara
              – i båda länderna.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vanliga frågor</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Är det alltid billigare att köpa bil i Tyskland?
              </h3>
              <p className="text-gray-700 text-sm">
                Nej. Det beror på den enskilda bilen. Jämför samma modell, årsmodell och utrustning i
                båda länderna och lägg på importkostnaderna innan du bestämmer dig.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Spelar det roll om jag köper av privatperson eller handlare?
              </h3>
              <p className="text-gray-700 text-sm">
                Ja. En handlare har ofta bättre koll på dokumentationen (COC-intyg, servicehistorik)
                och kan lämna garanti. Själva importprocessen i Sverige är densamma oavsett säljare.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Vad händer med garantin när jag importerar?</h3>
              <p className="text-gray-700 text-sm">
                Kontrollera med märkesimportören i Sverige i förväg hur nybilsgarantin hanteras. Se{" "}
                <Link href="/guider/garanti-vid-bilimport" className="text-blue-700 hover:underline">
                  garanti vid bilimport
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">Räkna på din bil</h2>
          <p className="text-sm text-gray-600 mb-3">
            Fyll i det tyska priset och det svenska jämförpriset i kalkylatorn – den lägger på
            avgifter, transport och eventuell moms.
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
  );
}
