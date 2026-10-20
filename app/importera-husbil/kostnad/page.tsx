import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath, getLastUpdatedForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CostTable } from "@/components/CostTable";
import { formatDateSv } from "@/lib/date";
import { CONTENT_YEAR } from "@/lib/site-config";
import {
  feeTotal,
  formatCost,
  formatKr,
  formatSekRange,
  costSourceLine,
  bilkostnadForKm,
  exportKostnad,
  getCost,
  eurRateLine,
  MOMS,
} from "@/lib/costs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";
const UPDATED_DATE = getLastUpdatedForPath("/importera-husbil/kostnad");

/** Ungefärlig körsträcka Sverige–Tyskland, samma som kalkylatorns standardvärde. */
const HEMKORNING_KM = 1200;

export function generateMetadata(): Metadata {
  const robots = getRobotsForPath("/importera-husbil/kostnad");
  return {
    title: `Vad kostar det att importera husbil från EU? – Alla avgifter ${CONTENT_YEAR}`,
    description:
      "Komplett genomgång av kostnader vid husbilsimport: ursprungskontroll, registreringsbesiktning, importförsäkring, transport och moms – med källa för varje belopp.",
    alternates: { canonical: getCanonicalUrl("/importera-husbil/kostnad") },
    robots,
  };
}

export default function HusbilKostnadPage() {
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera husbil", href: "/importera-husbil/tyskland" },
    { name: "Kostnad" },
  ];

  // Alla belopp kommer från data/cost-data.json via lib/costs.ts.
  const fasta = formatSekRange(feeTotal("husbil"));
  const bilkostnad = bilkostnadForKm(HEMKORNING_KM);
  const export_ = exportKostnad();
  const momsProcent = Math.round(MOMS.moms_rate * 100);
  const nyGrans = MOMS.moms_new_vehicle_threshold_km.toLocaleString("sv-SE");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Vad kostar det att importera husbil från EU?
          </h1>
          <p className="text-gray-500 text-sm">
            {UPDATED_DATE && (
              <>
                Uppdaterad: <time dateTime={UPDATED_DATE}>{formatDateSv(UPDATED_DATE)}</time>
                {" "}·{" "}
              </>
            )}
            Källa: Transportstyrelsen, Skatteverket och publicerade prislistor
          </p>
        </header>

        <p className="text-gray-700 mb-4 text-lg">
          Utöver husbilens pris tillkommer fasta avgifter på <strong>{fasta}</strong>{" "}
          (ursprungskontroll, registreringsbesiktning och skyltar), plus importförsäkring och
          transport. Ingen tull tillkommer vid import från EU.
        </p>
        <p className="text-gray-700 mb-6">
          Importförsäkring för husbil har inget publicerat pris – begär offert från ditt
          försäkringsbolag. Varje belopp nedan har en källa och ett kontrolldatum.
        </p>

        <CostTable vehicleType="husbil" />

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Avgifterna förklarade ({CONTENT_YEAR})</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Ursprungskontroll – {formatCost("ursprungskontroll")}
              </h3>
              <p className="text-gray-700 text-sm">
                Samma avgift som för personbil och obligatorisk för alla fordon som ska registreras i
                Sverige. Aktuellt ködatum finns i guiden om{" "}
                <Link href="/guider/ursprungskontroll#status" className="text-blue-700 hover:underline">
                  ursprungskontroll
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Registreringsbesiktning – {formatCost("registreringsbesiktning")}
              </h3>
              <p className="text-gray-700 text-sm">
                Besiktningsföretagen sätter egna priser. Intervallet bygger på två stationer som
                publicerar priset ({costSourceLine("registreringsbesiktning")}). Alla stationer tar
                inte emot husbilar – ring och fråga innan du bokar. Läs mer i guiden om{" "}
                <Link href="/guider/besikta-husbil" className="text-blue-700 hover:underline">
                  besiktning av husbil
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Importförsäkring – begär offert</h3>
              <p className="text-gray-700 text-sm">
                Efter sju dagar i Sverige krävs tillfällig registrering med svensk
                trafikförsäkring. Inget försäkringsbolag publicerar ett pris för husbil. Se guiden om{" "}
                <Link href="/guider/importforsakring" className="text-blue-700 hover:underline">
                  importförsäkring
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transportkostnad</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Köra hem själv</h3>
              <p className="text-sm text-gray-600 mb-2">
                Med Skatteverkets schablon för egen bil, {formatCost("bilkostnad_per_mil")} per mil, blir{" "}
                {HEMKORNING_KM.toLocaleString("sv-SE")} km cirka {formatKr(bilkostnad)}. En husbil drar
                normalt mer bränsle än en personbil, så räkna med att den verkliga kostnaden blir högre.
                Därtill exportskyltar och exportförsäkring, från {formatSekRange(export_)}.
              </p>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Anlita transportföretag</h3>
              <p className="text-sm text-gray-600">
                Begär offert från flera transportföretag och lägg in priset i{" "}
                <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
                  kalkylatorn
                </Link>
                .
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Körkort: en husbil med totalvikt över 3 500 kg kräver C1-behörighet, utom med B-körkort utfärdat före 1 juli 1996 (Transportstyrelsen). Euro räknas om med{" "}
            {eurRateLine()}. Källor:{" "}
            <a href={getCost("bilkostnad_per_mil").sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">Skatteverket</a>,{" "}
            <a href={getCost("exportskyltar_avgift").sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">Service Berlin</a>,{" "}
            <a href={getCost("exportforsakring_15d").sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">nondos.de</a>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Moms</h2>
          <p className="text-gray-700 mb-3">
            Moms ({momsProcent} %) tillkommer bara om husbilen räknas som <strong>ny</strong>: köpt
            inom {MOMS.moms_new_vehicle_threshold_months} månader efter att den första gången togs i
            bruk, <strong>eller</strong> körd högst {nyGrans} km. De flesta begagnade husbilar är
            äldre och har körts längre än så.
          </p>
          <p className="text-xs text-gray-500">
            Källa:{" "}
            <a href={MOMS.source} className="underline" target="_blank" rel="noopener">
              Skatteverket
            </a>
            . Se räkneexempel i guiden om{" "}
            <Link href="/guider/moms-vid-bilimport" className="text-blue-700 hover:underline">
              moms vid bilimport
            </Link>
            .
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Skillnader mot att importera personbil</h2>
          <ul className="space-y-3 text-gray-700 text-sm">
            <li>
              <span className="font-semibold text-gray-900">Besiktning:</span> inte alla stationer
              registreringsbesiktar husbilar – ring och fråga innan du bokar.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Körkort:</span> en husbil över 3 500 kg
              kräver C1-behörighet (upp till 7 500 kg) – om du inte har ett B-körkort utfärdat före 1 juli
              1996, som enligt Transportstyrelsens övergångsregel ger rätt att köra personbil över 3,5 ton.
              BE avser bil med släpvagn och ger ingen rätt att köra en tyngre husbil.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Fordonsskatt:</span> husbilar har ingen
              malus, men skatten beror på koldioxidvärdet. Se{" "}
              <Link href="/guider/fordonsskatt-husbil-bonus-malus" className="text-blue-700 hover:underline">
                skatt på husbil
              </Link>
              .
            </li>
            <li>
              <span className="font-semibold text-gray-900">Handlingar:</span> för fordon på högst
              3 500 kg som varit registrerade i ett annat EES-land räcker registreringsbeviset. Många
              husbilar väger mer, och då kan ett COC-intyg behövas. Läs mer i guiden om{" "}
              <Link href="/guider/coc-intyg" className="text-blue-700 hover:underline">
                COC-intyg
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vanliga frågor om husbilsimport</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Lönar det sig att importera husbil från Tyskland?</h3>
              <p className="text-gray-700 text-sm">
                Det beror på prisskillnaden för just den husbil du tittar på. Jämför ett svenskt pris
                med det tyska plus {fasta} i fasta avgifter, importförsäkring och transport. Räkna i{" "}
                <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
                  kalkylatorn
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Kan jag importera en husbil från ett land utanför EU?</h3>
              <p className="text-gray-700 text-sm">
                Ja, men då tillkommer tull och processen är mer komplex. Den här guiden täcker
                EU-import. Kontakta Tullverket för import från länder utanför EU.
              </p>
            </div>
          </div>
        </section>

        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-2">Räkna ut din totalkostnad</h2>
          <Link
            href="/kalkylator/bilimport?type=husbil"
            className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Öppna importkalkylatorn
          </Link>
        </div>
      </article>
    </div>
  );
}
