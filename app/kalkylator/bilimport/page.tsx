import type { Metadata } from "next";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ImportCalculator } from "@/components/calculator/ImportCalculator";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export const metadata: Metadata = {
  title: "Importkalkylator – Räkna ut din totala importkostnad",
  description:
    "Räkna ut vad det kostar att importera bil från Europa. Moms, tull, transport och avgifter sammanställda.",
  alternates: { canonical: getCanonicalUrl("/kalkylator/bilimport") },
};

export default function KalkylatornPage() {
  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Kalkylator" },
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Importkalkylator</h1>
        <p className="text-gray-600 mb-6">
          Räkna ut din ungefärliga totalkostnad vid import av bil eller husbil från Europa.
        </p>

        <ImportCalculator />

        <div className="mt-8 text-sm text-gray-500 bg-gray-50 rounded p-4 border border-gray-100">
          <p className="font-semibold text-gray-700 mb-1">Hur beräkningen fungerar</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Moms (25%) tillkommer om fordonet är yngre än 6 månader eller under 6 000 mil</li>
            <li>Tull är 0% vid import från EU-land</li>
            <li>Ursprungskontroll: 1 240 kr (Transportstyrelsen, 2025)</li>
            <li>Transportkostnad är ett schablonvärde</li>
          </ul>
          <p className="mt-2 text-xs">
            Beräkningen är vägledande. Kontrollera aktuella avgifter hos{" "}
            <a href="https://www.transportstyrelsen.se" className="underline" target="_blank" rel="nofollow">Transportstyrelsen</a> och{" "}
            <a href="https://www.skatteverket.se" className="underline" target="_blank" rel="nofollow">Skatteverket</a>.
          </p>
        </div>
      </div>
    </>
  );
}
