import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl, getFaqJsonLd } from "@/lib/seo";
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
const UPDATED_DATE = getLastUpdatedForPath("/importera-bil/kostnad");

/** Ungefärlig körsträcka Sverige–Tyskland, samma som kalkylatorns standardvärde. */
const HEMKORNING_KM = 1200;

export function generateMetadata(): Metadata {
  const robots = getRobotsForPath("/importera-bil/kostnad");
  return {
    title: `Importera bil från Tyskland – kostnad ${CONTENT_YEAR}`,
    description:
      `Ursprungskontroll ${formatCost("ursprungskontroll")}, besiktning ` +
      `${formatCost("registreringsbesiktning")}, försäkring och skyltar: ${formatSekRange(feeTotal("bil"))} ` +
      `i fasta avgifter. Plus transport – och moms om bilen räknas som ny.`,
    alternates: { canonical: getCanonicalUrl("/importera-bil/kostnad") },
    robots,
  };
}

export default function KostnadPage() {
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera bil", href: "/importera-bil/tyskland" },
    { name: "Kostnad" },
  ];

  // Alla belopp kommer från data/cost-data.json via lib/costs.ts.
  const fastaBil = formatSekRange(feeTotal("bil"));
  const fastaHusbil = formatSekRange(feeTotal("husbil"));
  const bilkostnad = bilkostnadForKm(HEMKORNING_KM);
  const export_ = exportKostnad();
  const momsProcent = Math.round(MOMS.moms_rate * 100);
  const nyGrans = MOMS.moms_new_vehicle_threshold_km.toLocaleString("sv-SE");

  const faqJsonLd = getFaqJsonLd([
    {
      question: "Måste jag betala tull när jag importerar bil från Tyskland?",
      answer:
        "Nej. Inom EU gäller fri rörlighet för varor och ingen tull tillkommer vid import av bil från ett EU-land till Sverige. Tull tillkommer däremot vid import från länder utanför EU, till exempel USA eller Japan.",
    },
    {
      question: "Vad kostar det att importera en bil från Tyskland?",
      answer:
        `Utöver köpeskillingen tillkommer ${fastaBil} i fasta avgifter: ` +
        `ursprungskontroll ${formatCost("ursprungskontroll")} (Transportstyrelsen), ` +
        `registreringsbesiktning ${formatCost("registreringsbesiktning")} enligt publicerade prislistor, ` +
        `importförsäkring ${formatCost("importforsakring_if")} hos If och skyltar med registeravgift. ` +
        "Därtill kommer transport och – om bilen räknas som ny – moms.",
    },
    {
      question: "Vad kostar det att importera en husbil?",
      answer:
        `De fasta avgifterna för husbil är ${fastaHusbil} plus importförsäkring, ` +
        "som saknar publicerat pris och kräver offert. Ursprungskontrollen kostar lika mycket som för personbil.",
    },
  ]);

  return (
    <>
      {/* BreadcrumbList-schemat emitteras av <Breadcrumbs> – lägg inte till
          det här också, då hamnar två motstridiga scheman på sidan. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Vad kostar det att importera bil från Tyskland?
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
            Utöver bilpriset tillkommer fasta avgifter på <strong>{fastaBil}</strong> för en
            personbil (ursprungskontroll, registreringsbesiktning, importförsäkring och skyltar),
            plus transport. Ingen tull tillkommer vid import från EU. Moms tillkommer bara om
            bilen räknas som ny.
          </p>

          <p className="text-gray-700 mb-6">
            Varje belopp nedan har en källa och ett kontrolldatum. Officiella avgifter kommer från
            myndigheterna; priser som företag sätter själva redovisas som publicerade priser hos
            namngivna aktörer.
          </p>

          <CostTable vehicleType="bil" />

          {/* Om posterna */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Avgifterna förklarade ({CONTENT_YEAR})</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Ursprungskontroll – {formatCost("ursprungskontroll")}
                </h3>
                <p className="text-gray-700 text-sm">
                  Obligatorisk för alla fordon som ska registreras i Sverige och görs av
                  Transportstyrelsen. Myndigheten anger ingen fast handläggningstid – aktuellt
                  ködatum finns i guiden om{" "}
                  <Link href="/guider/ursprungskontroll#status" className="text-blue-700 hover:underline">
                    ursprungskontroll
                  </Link>
                  . Ansök tidigt – bilen kan inte registreringsbesiktas utan godkänt beslut.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Registreringsbesiktning – {formatCost("registreringsbesiktning")}
                </h3>
                <p className="text-gray-700 text-sm">
                  Besiktningsföretagen sätter egna priser och de stora kedjorna publicerar inte
                  priset för registreringsbesiktning. Intervallet bygger på två stationer som gör
                  det ({costSourceLine("registreringsbesiktning")}). Fråga om pris när du bokar.
                  Underkänns bilen kostar efterkontrollen {formatCost("registreringsbesiktning_efterkontroll")}{" "}
                  hos samma stationer. Läs mer i guiden om{" "}
                  <Link href="/guider/registreringsbesiktning" className="text-blue-700 hover:underline">
                    registreringsbesiktning
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Importförsäkring – {formatCost("importforsakring_if")} hos If
                </h3>
                <p className="text-gray-700 text-sm">
                  Efter sju dagar i Sverige krävs tillfällig registrering, och till ansökan behövs ett
                  svenskt trafikförsäkringsbevis. If tar {formatCost("importforsakring_if")} för en
                  sådan trafikförsäkring ({costSourceLine("importforsakring_if")}). Andra bolag
                  sätter egna priser. Se guiden om{" "}
                  <Link href="/guider/importforsakring" className="text-blue-700 hover:underline">
                    importförsäkring
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* Transport */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transportkostnad</h2>
            <p className="text-gray-700 mb-4">
              Transporten är den mest rörliga posten och räknas inte som en fast avgift.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Köra hem själv</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Bilkostnaden uppskattas med Skatteverkets schablon för egen bil,{" "}
                  {formatCost("bilkostnad_per_mil")} per mil. För ungefär{" "}
                  {HEMKORNING_KM.toLocaleString("sv-SE")} km blir det cirka {formatKr(bilkostnad)}.
                  Därtill exportskyltar ({formatCost("exportskyltar_avgift")}) och exportförsäkring
                  (från {formatCost("exportforsakring_15d")} för 15 dagar).
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ≈ {formatKr(bilkostnad + export_.min)} (enkel resa)
                </p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Anlita transportföretag</h3>
                <p className="text-sm text-gray-600">
                  Transportföretagen publicerar sällan fasta priser och priset beror på sträcka,
                  fordon och hur många bilar som körs samtidigt. Begär offert från två eller tre
                  firmor och lägg in priset i{" "}
                  <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
                    kalkylatorn
                  </Link>
                  . Transporteras bilen på trailer behövs inga exportskyltar.
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Schablonen för bilkostnad är Skatteverkets skattefria milersättning för egen bil och
              används som uppskattning – din faktiska kostnad beror på förbrukning och bränslepris.
              Euro räknas om med {eurRateLine()}. Källor:{" "}
              <a href={getCost("bilkostnad_per_mil").sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">Skatteverket</a>,{" "}
              <a href={getCost("exportskyltar_avgift").sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">Service Berlin</a>,{" "}
              <a href={getCost("exportforsakring_15d").sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">nondos.de</a>.
            </p>
          </section>

          {/* Moms */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Moms – betalar du eller inte?</h2>
            <p className="text-gray-700 mb-3">
              Moms ({momsProcent} %) tillkommer bara om fordonet räknas som <strong>nytt</strong>.
              Ett fordon är nytt om <em>minst ett</em> av dessa villkor är uppfyllt:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
              <li>
                Det köps inom {MOMS.moms_new_vehicle_threshold_months} månader efter att det
                första gången togs i bruk, <strong>eller</strong>
              </li>
              <li>Det har körts högst {nyGrans} km</li>
            </ul>
            <p className="text-gray-700 mb-4">
              De flesta begagnade bilar som privatpersoner importerar är äldre än{" "}
              {MOMS.moms_new_vehicle_threshold_months} månader <strong>och</strong> har körts mer
              än {nyGrans} km – då tillkommer ingen svensk moms. Kontrollera ändå mätarställning
              och datum för första registrering i köpekontraktet.
            </p>
            <p className="text-xs text-gray-500">
              Källa:{" "}
              <a href={MOMS.source} className="underline" target="_blank" rel="noopener">
                Skatteverket
              </a>
              . Läs mer och se räkneexempel i guiden om{" "}
              <Link href="/guider/moms-vid-bilimport" className="text-blue-700 hover:underline">
                moms vid bilimport
              </Link>
              .
            </p>
          </section>

          {/* Fordonsskatt och malus */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fordonsskatt och malus efter importen</h2>
            <p className="text-gray-700 mb-3">
              Fordonsskatten är en löpande kostnad och ingår inte i avgifterna ovan. Bensin- och
              dieselbilar med högre utsläpp än 75 g CO₂/km betalar en förhöjd skatt, malus, under
              de tre första åren.
            </p>
            <p className="text-gray-700 mb-3">
              För en importerad bil räknas de tre åren från bilens{" "}
              <strong>första registrering i utlandet</strong>, inte från registreringen i Sverige.
              En bil som registrerades första gången för mer än tre år sedan har alltså ingen malus
              kvar. Datumet står i fält B i det tyska registreringsbeviset.
            </p>
            <p className="text-gray-700">
              Räkna ut skatten för en viss bil i{" "}
              <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
                importkalkylatorn
              </Link>
              .
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Källor:{" "}
              <a href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2006227-om-vagtrafikskatt_sfs-2006-227/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                vägtrafikskattelagen 1 kap. 6 a §
              </a>
              ,{" "}
              <a href="https://www.skatteverket.se/privat/skatter/bilochtrafik/fordonsskatt.4.18e1b10334ebe8bc80003864.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                Skatteverket – Fordonsskatt
              </a>
              ,{" "}
              <a href="https://www.transportstyrelsen.se/sv/vagtrafik/fordon/skatter-och-avgifter/malus/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                Transportstyrelsen – Malus
              </a>
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Vanliga frågor om kostnader vid bilimport</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Måste jag betala tull när jag importerar bil från Tyskland?
                </h3>
                <p className="text-gray-700 text-sm">
                  Nej. Inom EU gäller fri rörlighet för varor och det tillkommer ingen tull vid
                  import av bil från ett EU-land till Sverige. Tull tillkommer däremot vid import
                  från länder utanför EU, t.ex. USA eller Japan.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vad kostar det att importera en bil från Tyskland?
                </h3>
                <p className="text-gray-700 text-sm">
                  Utöver köpeskillingen tillkommer {fastaBil} i fasta avgifter, plus transport och
                  eventuell moms. Jämför med ett svenskt pris först när allt är med – transporten
                  har du inte om du köper bilen i Sverige.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Vad kostar det att importera en husbil?</h3>
                <p className="text-gray-700 text-sm">
                  De fasta avgifterna för husbil är {fastaHusbil} plus importförsäkring, som saknar
                  publicerat pris och kräver offert. Se{" "}
                  <Link href="/importera-husbil/kostnad" className="text-blue-700 hover:underline">
                    kostnader för husbilsimport
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">Räkna ut din totalkostnad</h2>
            <p className="text-sm text-gray-600 mb-3">
              Fyll i bilens pris, land, ålder och transportmetod för en sammanställning anpassad
              till din situation.
            </p>
            <Link
              href="/kalkylator/bilimport"
              className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Öppna importkalkylatorn
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
