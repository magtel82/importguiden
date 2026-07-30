import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ImportCalculator } from "@/components/calculator/ImportCalculator";
import { getCostData } from "@/lib/data";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

import { getRobotsForPath } from "@/lib/manifest";

export function generateMetadata(): Metadata {
  return {
    title: "Importkalkylator – Räkna ut din totala importkostnad",
    description:
      "Räkna ut vad det kostar att importera bil från Europa. Moms, tull, transport och avgifter sammanställda.",
    alternates: { canonical: getCanonicalUrl("/kalkylator/bilimport") },
    robots: getRobotsForPath("/kalkylator/bilimport"),
  };
}

export default function KalkylatornPage() {
  const costData = getCostData();

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Kalkylator" },
  ];

  return (
    <>
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
            <li>
              Moms (25 %) tillkommer om fordonet är yngre än{" "}
              {costData.tax.moms_new_vehicle_threshold_months} månader eller har
              körts under{" "}
              {costData.tax.moms_new_vehicle_threshold_km.toLocaleString("sv-SE")} km
            </li>
            <li>Tull är 0 % vid import från EU-land</li>
            <li>
              Ursprungskontroll:{" "}
              {costData.fees.ursprungskontroll.amount.toLocaleString("sv-SE")} kr
              (Transportstyrelsen, 2026)
            </li>
            <li>Transportkostnad är ett schablonvärde</li>
          </ul>
          <p className="mt-2 text-xs">
            Beräkningen är vägledande. Kontrollera aktuella avgifter hos{" "}
            <a href="https://www.transportstyrelsen.se" className="underline" target="_blank" rel="noopener">Transportstyrelsen</a> och{" "}
            <a href="https://www.skatteverket.se" className="underline" target="_blank" rel="noopener">Skatteverket</a>.
          </p>
        </div>
      </div>
    </>
  );
}
