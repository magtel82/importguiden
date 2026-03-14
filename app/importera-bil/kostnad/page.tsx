import type { Metadata } from "next";
import Link from "next/link";
import { getCostData } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";
const UPDATED_DATE = "2026-03-14";

export function generateMetadata(): Metadata {
  const robots = getRobotsForPath("/importera-bil/kostnad");
  return {
    title: "Vad kostar det att importera bil från EU? – Alla avgifter 2025",
    description:
      "Komplett genomgång av alla kostnader vid bilimport: ursprungskontroll, registreringsbesiktning, moms, tull och transport. Med räkneexempel och totalkostnad.",
    alternates: { canonical: getCanonicalUrl("/importera-bil/kostnad") },
    robots,
  };
}

export default function KostnadPage() {
  const costData = getCostData();

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera bil", href: "/importera-bil/tyskland" },
    { name: "Kostnad" },
  ];

  const exempelBilpris = 200_000;
  const exempelTransport = 7_500;
  const exempelTotal =
    exempelBilpris +
    costData.fees.ursprungskontroll.amount +
    costData.fees.registreringsbesiktning_personbil.amount +
    costData.fees.importforsäkring_personbil.amount +
    exempelTransport;

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
              Vad kostar det att importera bil från EU?
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad:{" "}
              <time dateTime={UPDATED_DATE}>{UPDATED_DATE}</time>
              {" "}· Källa: Transportstyrelsen, Tullverket, Skatteverket
            </p>
          </header>

          <p className="text-gray-700 mb-4 text-lg">
            Utöver bilpriset tillkommer fasta kostnader på{" "}
            <strong>
              ca{" "}
              {(
                costData.fees.ursprungskontroll.amount +
                costData.fees.registreringsbesiktning_personbil.amount +
                costData.fees.importforsäkring_personbil.amount
              ).toLocaleString("sv-SE")}{" "}
              kr
            </strong>{" "}
            för en personbil (ursprungskontroll, besiktning och importförsäkring), plus
            transport. Ingen tull tillkommer vid import från EU. Moms kan
            tillkomma på fordon som anses som nya – men de flesta begagnade bilar
            är undantagna.
          </p>

          <p className="text-gray-700 mb-8">
            Nedan hittar du en fullständig genomgång av alla kostnader, ett
            konkret räkneexempel och svar på de vanligaste frågorna.
          </p>

          {/* Fasta avgifter */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Fasta avgifter (2025)
            </h2>
            <p className="text-gray-700 mb-4">
              Dessa kostnader är obligatoriska eller starkt rekommenderade
              oavsett varifrån du importerar bilen.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">
                      Kostnad
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">
                      Belopp
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">
                      Källa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">Ursprungskontroll</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Obligatorisk. Beställs via Transportstyrelsen.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      {costData.fees.ursprungskontroll.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      Transportstyrelsen (2025)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">
                        Registreringsbesiktning, personbil
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Obligatorisk. Schablonvärde – varierar per station.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      ~{costData.fees.registreringsbesiktning_personbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      Besiktningsbolag
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">
                        Importförsäkring, personbil
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Krävs för hemtransport. Schablonvärde.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      ~{costData.fees.importforsäkring_personbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      Schablonvärde
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">
                        Tull (import inom EU)
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Ingen tull vid köp från EU-land.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium text-green-700">
                      0 kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">Tullverket</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Ursprungskontroll –{" "}
                  {costData.fees.ursprungskontroll.amount.toLocaleString("sv-SE")} kr
                </h3>
                <p className="text-gray-700 text-sm">
                  Ursprungskontrollen är obligatorisk för alla importerade
                  fordon och utförs av Transportstyrelsen. Den kontrollerar att
                  bilen inte är stulen och inte belastad med kvarstående skulder
                  i hemlandet. Handläggningstid: normalt 2–5 arbetsdagar.
                  Beställ tidigt – du kan inte besikta bilen utan godkänt
                  resultat. Läs mer i guiden om{" "}
                  <Link
                    href="/guider/ursprungskontroll"
                    className="text-blue-700 hover:underline"
                  >
                    ursprungskontroll
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Registreringsbesiktning – ca{" "}
                  {costData.fees.registreringsbesiktning_personbil.amount.toLocaleString("sv-SE")} kr
                </h3>
                <p className="text-gray-700 text-sm">
                  Registreringsbesiktning är ett obligatoriskt steg för att
                  registrera en importerad bil i Sverige. Det genomförs av ett
                  godkänt besiktningsföretag (Opus Bilprovning, Besikta, DEKRA
                  m.fl.) och skiljer sig från en vanlig kontrollbesiktning.
                  Boka specifikt registreringsbesiktning – inte kontrollbesiktning.
                  Läs mer i guiden om{" "}
                  <Link
                    href="/guider/registreringsbesiktning"
                    className="text-blue-700 hover:underline"
                  >
                    registreringsbesiktning
                  </Link>
                  .
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Importförsäkring – ca{" "}
                  {costData.fees.importforsäkring_personbil.amount.toLocaleString("sv-SE")} kr
                </h3>
                <p className="text-gray-700 text-sm">
                  Du behöver en giltig försäkring för hemtransporten. Din
                  befintliga svenska bilförsäkring täcker sällan ett fordon du
                  ännu inte äger. Kontrollera med ditt försäkringsbolag i
                  förväg. Många bolag erbjuder en kortförsäkring specifikt för
                  detta ändamål. Schablonvärde: ca{" "}
                  {costData.fees.importforsäkring_personbil.amount.toLocaleString("sv-SE")}{" "}
                  kr – kan variera 1 000–2 500 kr.
                </p>
              </div>
            </div>
          </section>

          {/* Transport */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Transportkostnad
            </h2>
            <p className="text-gray-700 mb-4">
              Transportkostnaden varierar kraftigt beroende på om du kör hem
              bilen själv eller anlitar ett transportföretag.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Köra hem själv
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Räkna med ca {costData.transport.drive_self_cost_per_km} kr/km
                  i bränslekostnad. Sträcka Sverige–södra Tyskland: ungefär
                  1 500–2 000 km.
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ≈ 5 000–7 000 kr (enkel resa)
                </p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Anlita transportföretag
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {costData.transport.trailer_transport_from_germany.note}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {costData.transport.trailer_transport_from_germany.min.toLocaleString("sv-SE")}–
                  {costData.transport.trailer_transport_from_germany.max.toLocaleString("sv-SE")} kr
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Glöm inte att du också behöver exportregistrering (röda skyltar,
              ca 30–60 EUR) om du kör bilen hem – och en giltig importförsäkring
              för hela sträckan.
            </p>
          </section>

          {/* Moms */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Moms – betalar du eller inte?
            </h2>
            <p className="text-gray-700 mb-3">
              Moms (25%) tillkommer bara om fordonet anses som{" "}
              <strong>nytt</strong> enligt EU:s regler. Ett fordon är nytt om
              det uppfyller <em>minst ett</em> av dessa kriterier:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
              <li>
                Yngre än{" "}
                {costData.tax.moms_new_vehicle_threshold_months} månader,{" "}
                <strong>eller</strong>
              </li>
              <li>
                Har körts färre än{" "}
                {costData.tax.moms_new_vehicle_threshold_km.toLocaleString("sv-SE")}{" "}
                km
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              De allra flesta begagnade bilar som privatpersoner importerar
              uppfyller båda villkoren för att vara momsfria: äldre än 6 månader{" "}
              <strong>och</strong> mer än 6 000 km. Kontrollera ändå alltid
              mätarställning och datum för första registrering i köpekontraktet.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r mb-3">
              <p className="text-sm text-amber-900">
                <strong>Obs:</strong> Köper du en relativt ny bil med låg
                körsträcka – t.ex. ett ex-demo-fordon – kan den ändå räknas som
                ny och moms tillkommer. 25% på 300 000 kr är 75 000 kr extra.
                Räkna alltid noga innan köp.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Källa:{" "}
              <a
                href={costData.tax.source}
                className="underline"
                target="_blank"
                rel="nofollow"
              >
                Skatteverket
              </a>
              . Läs mer i guiden om{" "}
              <Link
                href="/guider/moms-vid-bilimport"
                className="text-blue-700 hover:underline"
              >
                moms vid bilimport
              </Link>
              .
            </p>
          </section>

          {/* Räkneexempel */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Räkneexempel: begagnad personbil från Tyskland
            </h2>
            <p className="text-gray-700 mb-4">
              En typisk import: begagnad bil köpt för{" "}
              {exempelBilpris.toLocaleString("sv-SE")} kr, äldre än 6 månader
              och mer än 6 000 km (momsfri), transporterad hem med
              transportföretag.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">
                      Post
                    </th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">
                      Kostnad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 text-gray-700">Bilpris</td>
                    <td className="p-3 text-right">
                      {exempelBilpris.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Ursprungskontroll</td>
                    <td className="p-3 text-right">
                      {costData.fees.ursprungskontroll.amount.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      Registreringsbesiktning
                    </td>
                    <td className="p-3 text-right">
                      {costData.fees.registreringsbesiktning_personbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Importförsäkring</td>
                    <td className="p-3 text-right">
                      {costData.fees.importforsäkring_personbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      Transport (transportföretag)
                    </td>
                    <td className="p-3 text-right">
                      {exempelTransport.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Moms</td>
                    <td className="p-3 text-right text-green-700">0 kr</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900">
                      Totalt
                    </td>
                    <td className="p-3 text-right font-semibold text-gray-900">
                      {exempelTotal.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Schablonexempel. Faktiska kostnader varierar. Räkna ut din specifika situation i{" "}
              <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
                importkalkylatorn
              </Link>
              .
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Vanliga frågor om kostnader vid bilimport
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Måste jag betala tull när jag importerar bil från Tyskland?
                </h3>
                <p className="text-gray-700 text-sm">
                  Nej. Inom EU gäller fri rörlighet för varor och det tillkommer
                  ingen tull vid import av bil från ett EU-land till Sverige.
                  Tull tillkommer däremot vid import från länder utanför EU, t.ex.
                  USA eller Japan.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Hur mycket kan jag spara på att importera bil?
                </h3>
                <p className="text-gray-700 text-sm">
                  Det varierar kraftigt beroende på märke, modell och marknad.
                  Tyska märken (BMW, Audi, Mercedes, Volkswagen, Porsche) har
                  ofta störst prisskillnad – ibland 30 000–80 000 kr på mellanklass
                  och premium. På svenska märken som Volvo är skillnaden
                  vanligtvis liten. Räkna alltid bort de fasta importkostnaderna
                  (ca 10 000–12 000 kr för en personbil) innan du jämför.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vad kostar det att importera en husbil?
                </h3>
                <p className="text-gray-700 text-sm">
                  För husbil är registreringsbesiktningen dyrare (ca{" "}
                  {costData.fees.registreringsbesiktning_husbil.amount.toLocaleString("sv-SE")}{" "}
                  kr) och importförsäkringen högre (ca{" "}
                  {costData.fees.importforsäkring_husbil.amount.toLocaleString("sv-SE")}{" "}
                  kr). Ursprungskontrollen är densamma. Räkna med totalt ca
                  15 000–20 000 kr i tillkommande kostnader utöver bilpriset och
                  transport.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Kan jag göra avdrag för kostnader vid bilimport?
                </h3>
                <p className="text-gray-700 text-sm">
                  För privatpersoner: nej, det finns inga skattemässiga avdrag
                  för importkostnader på en privat bil. Köper du via ett
                  företag är reglerna annorlunda – rådfråga revisor.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              Räkna ut din totalkostnad
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Fyll i bilens pris, land, ålder och transportmetod för en
              sammanställning anpassad till din situation.
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
