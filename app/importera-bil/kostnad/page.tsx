import type { Metadata } from "next";
import Link from "next/link";
import { getCostData } from "@/lib/data";
import { getCanonicalUrl, getFaqJsonLd } from "@/lib/seo";
import { getRobotsForPath, getLastUpdatedForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CostTable } from "@/components/CostTable";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";
const UPDATED_DATE = getLastUpdatedForPath("/importera-bil/kostnad");

export function generateMetadata(): Metadata {
  const robots = getRobotsForPath("/importera-bil/kostnad");
  return {
    title: "Vad kostar det att registrera en importerad bil i Sverige 2026?",
    description:
      "Komplett kostnadslista för bilimport: ursprungskontroll 1 240 kr, registreringsbesiktning ~1 700 kr, skyltavgift, importförsäkring, moms och transport. Räkneexempel och totalkostnad.",
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

  // Fasta avgifter = det som tillkommer oavsett hur bilen tar sig hem.
  // Transport räknas ALDRIG in här – den varierar från ca 4 000 kr (köra
  // själv) till 20 000 kr (trailer) och får inte kallas fast kostnad.
  const fastaAvgifterBil =
    costData.fees.ursprungskontroll.amount +
    costData.fees.registreringsbesiktning_personbil.amount +
    costData.fees.importforsäkring_personbil.amount +
    costData.fees.skyltavgift.amount;

  const fastaAvgifterHusbil =
    costData.fees.ursprungskontroll.amount +
    costData.fees.registreringsbesiktning_husbil.amount +
    costData.fees.importforsäkring_husbil.amount +
    costData.fees.skyltavgift.amount;

  const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;

  // FAQPage-schema – sidans fyra frågor. Svaren hålls korta och fristående
  // enligt SGE-strategin i CLAUDE.md, och siffrorna hämtas ur cost-data.json
  // så att schemat aldrig kan glida isär från den synliga texten.
  const faqJsonLd = getFaqJsonLd([
    {
      question: "Måste jag betala tull när jag importerar bil från Tyskland?",
      answer:
        "Nej. Inom EU gäller fri rörlighet för varor och ingen tull tillkommer vid import av bil från ett EU-land till Sverige. Tull tillkommer däremot vid import från länder utanför EU, till exempel USA eller Japan.",
    },
    {
      question: "Vad kostar det att importera en bil från EU?",
      answer:
        `Utöver köpeskillingen tillkommer ca ${kr(fastaAvgifterBil)} i fasta avgifter: ` +
        `ursprungskontroll ${kr(costData.fees.ursprungskontroll.amount)}, ` +
        `registreringsbesiktning ca ${kr(costData.fees.registreringsbesiktning_personbil.amount)}, ` +
        `importförsäkring ca ${kr(costData.fees.importforsäkring_personbil.amount)} och ` +
        `skyltavgift ${kr(costData.fees.skyltavgift.amount)}. ` +
        "Därtill kommer transport, som varierar kraftigt och inte är en fast kostnad.",
    },
    {
      question: "Hur mycket kan jag spara på att importera bil?",
      answer:
        "Det varierar med märke och modell. Tyska märken som BMW, Audi, Mercedes, Volkswagen och Porsche har ofta störst prisskillnad, ibland 30 000–80 000 kr på mellanklass och premium. På svenska märken som Volvo är skillnaden vanligtvis liten. Dra alltid av både de fasta avgifterna och transportkostnaden innan du jämför med ett svenskt pris.",
    },
    {
      question: "Vad kostar det att importera en husbil?",
      answer:
        `För husbil är avgifterna högre: totalt ca ${kr(fastaAvgifterHusbil)}, ` +
        `eftersom registreringsbesiktningen kostar ca ${kr(costData.fees.registreringsbesiktning_husbil.amount)} ` +
        `och importförsäkringen ca ${kr(costData.fees.importforsäkring_husbil.amount)}. ` +
        "Ursprungskontrollen kostar lika mycket som för personbil. Transporten blir normalt dyrare eftersom husbilen kräver större transportfordon.",
    },
  ]);

  const exempelBilpris = 200_000;
  const exempelTransport = 7_500;
  const exempelTotal = exempelBilpris + fastaAvgifterBil + exempelTransport;

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
              Vad kostar det att importera bil från EU?
            </h1>
            <p className="text-gray-500 text-sm">
              {UPDATED_DATE && (
                <>
                  Uppdaterad:{" "}
                  <time dateTime={UPDATED_DATE}>{UPDATED_DATE}</time>
                  {" "}·{" "}
                </>
              )}
              Källa: Transportstyrelsen, Tullverket, Skatteverket
            </p>
          </header>

          <p className="text-gray-700 mb-4 text-lg">
            Utöver bilpriset tillkommer fasta avgifter på{" "}
            <strong>ca {kr(fastaAvgifterBil)}</strong> för en personbil
            (ursprungskontroll, registreringsbesiktning, importförsäkring och
            skyltavgift), plus transport. Ingen tull tillkommer vid import från EU. Moms kan
            tillkomma på fordon som anses som nya – men de flesta begagnade bilar
            är undantagna.
          </p>

          <p className="text-gray-700 mb-6">
            Nedan hittar du en fullständig genomgång av alla kostnader, ett
            konkret räkneexempel och svar på de vanligaste frågorna.
          </p>

          <CostTable vehicleType="bil" />

          {/* Fasta avgifter */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Fasta avgifter (2026)
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
                      Transportstyrelsen (2026)
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
                      <span className="font-medium">Skyltavgift</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Obligatorisk. Två registreringsskyltar.
                      </p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      {kr(costData.fees.skyltavgift.amount)}
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      Transportstyrelsen (2026)
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
                  i hemlandet. Transportstyrelsen anger ingen fast
                  handläggningstid – väntetiden varierar och aktuellt ködatum
                  visas i myndighetens e-tjänst för ärendestatus. Ansök tidigt –
                  du kan inte besikta bilen utan godkänt
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
              bilen själv eller anlitar ett transportföretag. Den är den mest
              rörliga posten i kalkylen och ska aldrig räknas som en fast avgift.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Köra hem själv
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Räkna med ca{" "}
                  {costData.transport.drive_self_cost_per_km.toLocaleString(
                    "sv-SE"
                  )}{" "}
                  kr/km i bränsle och slitage. Sträckan Sverige–Tyskland är
                  ungefär 1 200 km enkel resa, mer om du ska längre söderut.
                </p>
                <p className="text-sm font-medium text-gray-900">
                  ≈{" "}
                  {kr(
                    Math.round(costData.transport.drive_self_cost_per_km * 1200)
                  )}
                  –
                  {kr(
                    Math.round(costData.transport.drive_self_cost_per_km * 2000)
                  )}{" "}
                  (enkel resa)
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
              Kör du hem bilen själv behöver du dessutom tyska exportskyltar
              (Ausfuhrkennzeichen) med tillhörande exportförsäkring – räkna med
              ca 100–200 EUR, där försäkringen utgör merparten. Läs mer i guiden
              om{" "}
              <Link
                href="/guider/exportforsakring"
                className="text-blue-700 hover:underline"
              >
                exportförsäkring i Tyskland
              </Link>
              . Transporteras bilen på trailer behövs inga exportskyltar –
              fordonet räknas då som last.
            </p>
          </section>

          {/* Moms */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Moms – betalar du eller inte?
            </h2>
            <p className="text-gray-700 mb-3">
              Moms (25 %) tillkommer bara om fordonet anses som{" "}
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
            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r mb-3">
              <p className="text-sm text-amber-900">
                <strong>Obs:</strong> Köper du en relativt ny bil med låg
                körsträcka – t.ex. ett ex-demo-fordon – kan den ändå räknas som
                ny och moms tillkommer. 25 % på 300 000 kr är 75 000 kr extra.
                Räkna alltid noga innan köp.
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Källa:{" "}
              <a
                href={costData.tax.source}
                className="underline"
                target="_blank"
                rel="noopener"
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
                    <td className="p-3 text-gray-700">Skyltavgift</td>
                    <td className="p-3 text-right">
                      {kr(costData.fees.skyltavgift.amount)}
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
                  vanligtvis liten.
                </p>
                <p className="text-gray-700 text-sm mt-2">
                  Räkna bort importkostnaderna innan du jämför, men håll isär
                  de två delarna: ca {kr(fastaAvgifterBil)} i fasta avgifter
                  (ursprungskontroll, registreringsbesiktning, importförsäkring
                  och skyltavgift) plus transport, som varierar från ungefär{" "}
                  {kr(
                    Math.round(costData.transport.drive_self_cost_per_km * 1200)
                  )}{" "}
                  om du kör hem bilen själv till{" "}
                  {kr(costData.transport.trailer_transport_from_germany.min)}–
                  {kr(costData.transport.trailer_transport_from_germany.max)}{" "}
                  med transportföretag. Transporten är alltså inte en fast
                  kostnad, men den ska med i jämförelsen – den har du inte om du
                  köper bilen i Sverige.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Vad kostar det att importera en husbil?
                </h3>
                <p className="text-gray-700 text-sm">
                  För husbil är registreringsbesiktningen dyrare (ca{" "}
                  {kr(costData.fees.registreringsbesiktning_husbil.amount)}) och
                  importförsäkringen högre (ca{" "}
                  {kr(costData.fees.importforsäkring_husbil.amount)}).
                  Ursprungskontrollen är densamma. Totalt ca{" "}
                  {kr(fastaAvgifterHusbil)} i fasta avgifter utöver köpeskillingen,
                  plus transport – som normalt blir dyrare än för personbil
                  eftersom husbilen kräver större transportfordon. Se{" "}
                  <Link
                    href="/importera-husbil/kostnad"
                    className="text-blue-700 hover:underline"
                  >
                    kostnader för husbilsimport
                  </Link>
                  .
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
            <h2 className="font-semibold text-gray-900 mb-2">
              Räkna ut din totalkostnad
            </h2>
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
