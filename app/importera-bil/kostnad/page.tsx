import type { Metadata } from "next";
import Link from "next/link";
import { getCostData } from "@/lib/data";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export const metadata: Metadata = {
  title: `Vad kostar det att importera bil? – Alla avgifter ${new Date().getFullYear()}`,
  description:
    "Komplett genomgång av alla kostnader vid bilimport: moms, tull, ursprungskontroll, registreringsbesiktning och transport.",
  alternates: { canonical: getCanonicalUrl("/importera-bil/kostnad") },
};

export default function KostnadPage() {
  const costData = getCostData();
  const updatedDate = new Date().toISOString().split("T")[0];

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera bil", href: "/importera-bil/tyskland" },
    { name: "Kostnad" },
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Vad kostar det att importera bil? – Alla avgifter {new Date().getFullYear()}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
              {" "}· Källa: Transportstyrelsen, Tullverket, Skatteverket
            </p>
          </header>

          <p className="text-gray-700 mb-6 text-lg">
            Utöver priset på bilen tillkommer ett antal fasta och rörliga kostnader när du
            importerar ett fordon till Sverige. Här är en fullständig genomgång av vad du
            behöver räkna med.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fasta avgifter (2025)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Avgift</th>
                    <th className="text-right p-3 font-semibold text-gray-700 border-b border-gray-200">Belopp</th>
                    <th className="text-left p-3 font-semibold text-gray-700 border-b border-gray-200">Källa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">Ursprungskontroll</span>
                      <p className="text-xs text-gray-500 mt-0.5">{costData.fees.ursprungskontroll.note}</p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      {costData.fees.ursprungskontroll.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">Transportstyrelsen</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">Registreringsbesiktning, personbil</span>
                      <p className="text-xs text-gray-500 mt-0.5">{costData.fees.registreringsbesiktning_personbil.note}</p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      ~{costData.fees.registreringsbesiktning_personbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">Transportstyrelsen</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">Registreringsbesiktning, husbil</span>
                      <p className="text-xs text-gray-500 mt-0.5">{costData.fees.registreringsbesiktning_husbil.note}</p>
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      ~{costData.fees.registreringsbesiktning_husbil.amount.toLocaleString("sv-SE")} kr
                    </td>
                    <td className="p-3 text-gray-500 text-xs">Transportstyrelsen</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-gray-700">
                      <span className="font-medium">Tull (import inom EU)</span>
                    </td>
                    <td className="p-3 text-right font-medium text-green-700">0 kr</td>
                    <td className="p-3 text-gray-500 text-xs">Tullverket</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Moms – när betalar du?</h2>
            <p className="text-gray-700 mb-3">
              Moms (25%) tillkommer om fordonet anses som <strong>nytt</strong> enligt EU-regler.
              Ett fordon är nytt om det är:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">
              <li>Yngre än {costData.tax.moms_new_vehicle_threshold_months} månader, <strong>eller</strong></li>
              <li>Har körts färre än {costData.tax.moms_new_vehicle_threshold_km.toLocaleString("sv-SE")} km</li>
            </ul>
            <p className="text-gray-700">
              Om bilen är äldre än 6 månader <strong>och</strong> har mer än 6 000 mil på mätaren
              betalar du ingen moms i Sverige vid importen.
            </p>
            <p className="text-xs text-gray-500 mt-2">Källa: <a href={costData.tax.source} className="underline" target="_blank" rel="nofollow">Skatteverket</a></p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transport</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Köra hem själv</h3>
                <p className="text-sm text-gray-600">
                  Räkna med ca {costData.transport.drive_self_cost_per_km} kr/km i bränslekostnad.
                  Sträcka Sverige–södra Tyskland: ~1 500–2 000 km.
                </p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Anlita transportföretag</h3>
                <p className="text-sm text-gray-600">
                  {costData.transport.trailer_transport_from_germany.note}
                  {" "}Ca {costData.transport.trailer_transport_from_germany.min.toLocaleString("sv-SE")}–{costData.transport.trailer_transport_from_germany.max.toLocaleString("sv-SE")} kr.
                </p>
              </div>
            </div>
          </section>

          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Räkna din totala kostnad</h3>
            <p className="text-sm text-gray-600 mb-3">
              Fyll i bilens pris, land och transportmetod för att se en sammanställning.
            </p>
            <Link
              href="/kalkylator/bilimport"
              className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Öppna importkalkylator
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
