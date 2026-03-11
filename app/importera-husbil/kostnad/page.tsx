import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export const metadata: Metadata = {
  title: `Vad kostar det att importera husbil? – Avgifter ${new Date().getFullYear()}`,
  description:
    "Komplett genomgång av kostnader vid husbilsimport: moms, besiktning, transport och registrering.",
  alternates: { canonical: getCanonicalUrl("/importera-husbil/kostnad") },
};

export default function HusbildKostnadPage() {
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Importera husbil", href: "/importera-husbil/tyskland" },
    { name: "Kostnad" },
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
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Vad kostar det att importera husbil? – Alla avgifter {new Date().getFullYear()}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad: <time dateTime={updatedDate}>{updatedDate}</time>
            </p>
          </header>

          <p className="text-gray-700 mb-6 text-lg">
            Husbilsimport innebär generellt sett högre fasta kostnader än bilimport,
            framför allt för registreringsbesiktningen som är mer omfattande.
            Här är en fullständig genomgång.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Avgifter vid husbilsimport</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-200 rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold border-b border-gray-200">Avgift</th>
                    <th className="text-right p-3 font-semibold border-b border-gray-200">Belopp</th>
                    <th className="text-left p-3 font-semibold border-b border-gray-200">Källa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3">Ursprungskontroll</td>
                    <td className="p-3 text-right font-medium">1 240 kr</td>
                    <td className="p-3 text-xs text-gray-500">Transportstyrelsen (2025)</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      Registreringsbesiktning
                      <p className="text-xs text-gray-500">Mer omfattande än personbil</p>
                    </td>
                    <td className="p-3 text-right font-medium">~3 000–5 000 kr</td>
                    <td className="p-3 text-xs text-gray-500">Schablonvärde</td>
                  </tr>
                  <tr>
                    <td className="p-3">Transport (trailer)</td>
                    <td className="p-3 text-right font-medium">~8 000–15 000 kr</td>
                    <td className="p-3 text-xs text-gray-500">Schablonvärde</td>
                  </tr>
                  <tr>
                    <td className="p-3">Tull (EU-import)</td>
                    <td className="p-3 text-right font-medium text-green-700">0 kr</td>
                    <td className="p-3 text-xs text-gray-500">Tullverket</td>
                  </tr>
                  <tr>
                    <td className="p-3">Moms (om fordon anses nytt)</td>
                    <td className="p-3 text-right font-medium">25% av priset</td>
                    <td className="p-3 text-xs text-gray-500">Skatteverket</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Alla belopp är ungefärliga och bör verifieras hos respektive myndighet.
            </p>
          </section>

          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Räkna din importkostnad</h3>
            <Link href="/kalkylator/bilimport" className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
              Öppna kalkylatorn
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
