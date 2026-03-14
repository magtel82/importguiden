import type { Metadata } from "next";
import Link from "next/link";
import { getCostData } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";
const UPDATED_DATE = "2026-03-14";

export function generateMetadata(): Metadata {
  const robots = getRobotsForPath("/importera-husbil/kostnad");
  return {
    title: "Vad kostar det att importera husbil från EU? – Alla avgifter 2025",
    description:
      "Komplett genomgång av kostnader vid husbilsimport: ursprungskontroll, registreringsbesiktning, importförsäkring, transport och moms. Med räkneexempel.",
    alternates: { canonical: getCanonicalUrl("/importera-husbil/kostnad") },
    robots,
  };
}

export default function HusbildKostnadPage() {
  const costData = getCostData();

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera husbil", href: "/importera-husbil/tyskland" },
    { name: "Kostnad" },
  ];

  const exempelHusbilspris = 400_000;
  const exempelTransportHusbil = 12_000;
  const exempelTotal =
    exempelHusbilspris +
    costData.fees.ursprungskontroll.amount +
    costData.fees.registreringsbesiktning_husbil.amount +
    costData.fees.importforsäkring_husbil.amount +
    exempelTransportHusbil;

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
              Vad kostar det att importera husbil från EU?
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={UPDATED_DATE}>{UPDATED_DATE}</time>
              {" "}· Källa: Transportstyrelsen, Tullverket, Skatteverket
            </p>
          </header>

          <p className="text-gray-700 mb-4 text-lg">
            Utöver husbilens pris tillkommer fasta kostnader på{" "}
            <strong>
              ca{" "}
              {(
                costData.fees.ursprungskontroll.amount +
                costData.fees.registreringsbesiktning_husbil.amount +
                costData.fees.importforsäkring_husbil.amount
              ).toLocaleString("sv-SE")}{" "}
              kr
            </strong>{" "}
            (ursprungskontroll, besiktning och importförsäkring), plus
            transport. Ingen tull tillkommer vid import från EU. Husbilsimport
            innebär generellt högre fasta kostnader än bilimport – framför allt
            registreringsbesiktningen är mer omfattande och dyrare.
          </p>

          <p className="text-gray-700 mb-8">
            Nedan hittar du en fullständig genomgång av alla kostnader, ett
            konkret räkneexempel och svar på de vanligaste frågorna.
          </p>

          {/* Fasta avgifter */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Fasta avgifter vid husbilsimport (2025)
            </h2>
            <p className="text-gray-700 mb-4">
              Dessa kostnader är obligatoriska eller starkt rekommenderade
              oavsett vilket EU-land du importerar från.
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
                        Obligatorisk. Samma avgift som för personbil.
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
                        Registreringsbesiktning, husbil
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Mer omfattande än personbil. Schablonvärde.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      ~{costData.fees.registreringsbesiktning_husbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      Besiktningsbolag
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">
                        Importförsäkring, husbil
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Krävs för hemtransport. Schablonvärde.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      ~{costData.fees.importforsäkring_husbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      Schablonvärde
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">Tull (EU-import)</span>
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
                  fordon och gäller lika för husbil som för personbil.
                  Transportstyrelsen kontrollerar att husbilen inte är stulen
                  och inte belastad med kvarstående skulder i hemlandet.
                  Handläggningstid: normalt 2–5 arbetsdagar. Beställ tidigt –
                  du kan inte genomföra registreringsbesiktningen utan godkänt
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
                  {costData.fees.registreringsbesiktning_husbil.amount.toLocaleString("sv-SE")} kr
                </h3>
                <p className="text-gray-700 text-sm">
                  Registreringsbesiktningen för husbil är mer tidskrävande och
                  dyrare än för personbil. Besiktaren kontrollerar både
                  fordonsdelen och bostadsdelen – el, gas, vatteninstallationer
                  och konstruktion ingår ofta. Räkna med 3 000–5 000 kr beroende
                  på husbilens storlek, ålder och utrustning. Boka i god tid –
                  inte alla stationer har kompetens för husbil. Läs mer i
                  guiden om{" "}
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
                  {costData.fees.importforsäkring_husbil.amount.toLocaleString("sv-SE")} kr
                </h3>
                <p className="text-gray-700 text-sm">
                  Du behöver en giltig försäkring som täcker husbilen under
                  hemtransporten. Husbilens värde och storlek gör att
                  importförsäkringen är dyrare än för personbil – räkna med
                  2 000–4 000 kr. Kontrollera med ditt försäkringsbolag i förväg
                  om din ordinarie husbilsförsäkring täcker ett fordon du ännu
                  inte registrerat i Sverige. Det gör den sällan.
                </p>
              </div>
            </div>
          </section>

          {/* Transport */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Transportkostnad – husbil
            </h2>
            <p className="text-gray-700 mb-4">
              Transport är en av de större kostnaderna vid husbilsimport.
              De flesta väljer att köra hem husbilen själv, men det kräver rätt
              körkortsbehörighet (B, BE eller C beroende på totalvikt) och en
              giltig importförsäkring.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Köra hem själv
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Räkna med ca {costData.transport.drive_self_cost_per_km} kr/km
                  i bränslekostnad. Husbil drar mer bränsle än personbil –
                  ofta 12–20 liter/100 km. Sträcka Sverige–södra Tyskland:
                  ungefär 1 500–2 000 km.
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ≈ 7 000–12 000 kr (enkel resa)
                </p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Anlita transportföretag
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Husbil på trailer eller lowloader. Dyrare än personbil
                  på grund av storlek och vikt.
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ≈ 8 000–15 000 kr
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Kontrollera körkortskrav för den specifika husbilen. Husbilar
              över 3 500 kg totalvikt kräver BE-behörighet eller högre.
              Exportregistrering (röda skyltar, ca 30–60 EUR) krävs om du kör
              hem från Tyskland.
            </p>
          </section>

          {/* Moms */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Moms vid husbilsimport
            </h2>
            <p className="text-gray-700 mb-3">
              Samma momsregler gäller för husbil som för personbil. Moms (25%)
              tillkommer bara om fordonet anses som <strong>nytt</strong> enligt
              EU:s definition:
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
              De flesta begagnade husbilar som privatpersoner importerar är
              äldre än 6 månader och har mer än 6 000 km – och är därmed
              momsfria. Men 25% moms på en husbil till 500 000 kr är 125 000 kr
              extra, så det är viktigt att kontrollera.
            </p>
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
                moms vid fordonimport
              </Link>
              .
            </p>
          </section>

          {/* Räkneexempel */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Räkneexempel: begagnad husbil från Tyskland
            </h2>
            <p className="text-gray-700 mb-4">
              En typisk import: begagnad husbil köpt för{" "}
              {exempelHusbilspris.toLocaleString("sv-SE")} kr, äldre än 6
              månader och mer än 6 000 km (momsfri), transporterad hem med
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
                    <td className="p-3 text-gray-700">Husbilspris</td>
                    <td className="p-3 text-right">
                      {exempelHusbilspris.toLocaleString("sv-SE")} kr
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
                      {costData.fees.registreringsbesiktning_husbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Importförsäkring</td>
                    <td className="p-3 text-right">
                      {costData.fees.importforsäkring_husbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      Transport (transportföretag)
                    </td>
                    <td className="p-3 text-right">
                      {exempelTransportHusbil.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">Moms</td>
                    <td className="p-3 text-right text-green-700">0 kr</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900">Totalt</td>
                    <td className="p-3 text-right font-semibold text-gray-900">
                      {exempelTotal.toLocaleString("sv-SE")} kr
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Schablonexempel. Faktiska kostnader varierar. Räkna ut din
              specifika situation i{" "}
              <Link
                href="/kalkylator/bilimport"
                className="text-blue-700 hover:underline"
              >
                importkalkylatorn
              </Link>
              .
            </p>
          </section>

          {/* Skillnad mot personbil */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Skillnader mot att importera personbil
            </h2>
            <p className="text-gray-700 mb-4">
              Processen liknar personbilsimport men det finns viktiga skillnader
              att känna till:
            </p>
            <ul className="space-y-3 text-gray-700 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900 shrink-0">Besiktning:</span>
                Dyrare och mer tidskrävande. Inte alla stationer utför
                registreringsbesiktning av husbilar – ring och fråga innan du
                bokar.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900 shrink-0">Körkort:</span>
                Kontrollera totalvikten. Husbilar över 3 500 kg kräver
                BE-behörighet för att dra eller köra.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900 shrink-0">Försäkring:</span>
                Husbilsförsäkring kan vara svårare att teckna för ett
                utländskt, ännu oregistrerat fordon. Kontakta försäkringsbolaget
                i god tid.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900 shrink-0">Transport:</span>
                Husbilar transporteras ofta på egna hjul eller på lowloader –
                inte trailer som vanlig bil. Pris och logistik skiljer sig.
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-gray-900 shrink-0">COC-intyg:</span>
                Krävs precis som för personbil. Be säljaren om det direkt vid
                köpet. Läs mer i guiden om{" "}
                <Link
                  href="/guider/coc-intyg"
                  className="text-blue-700 hover:underline"
                >
                  COC-intyg
                </Link>
                .
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Vanliga frågor om husbilsimport
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Lönar det sig att importera husbil från Tyskland?
                </h3>
                <p className="text-gray-700 text-sm">
                  Tyskland har Europas största marknad för begagnade husbilar
                  och prisskillnaderna mot Sverige kan vara betydande –
                  50 000–150 000 kr är inte ovanligt för populära märken som
                  Dethleffs, Bürstner, Knaus och Hymer. Med tillkommande
                  kostnader på ca 17 000–20 000 kr kan importen ändå vara
                  lönsam om prisskillnaden är tillräcklig.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vilka husbilsmärken importeras mest från EU?
                </h3>
                <p className="text-gray-700 text-sm">
                  Tyska märken dominerar: Hymer, Dethleffs, Bürstner, Knaus,
                  Hobby och LMC är vanliga. Även italienska märken som Adria och
                  Carado importeras. Prisskillnaden är störst på tyska märken
                  med stor hemmamarknad.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Kan jag importera en husbil från ett land utanför EU?
                </h3>
                <p className="text-gray-700 text-sm">
                  Ja, men det tillkommer tull och eventuellt andra importavgifter.
                  Processen är mer komplex och den här guiden täcker i
                  huvudsak EU-import. Kontakta Tullverket för information om
                  import från länder utanför EU.
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
              Fyll i husbilens pris, land och transportmetod för en
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
