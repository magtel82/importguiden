import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ImportCalculator } from "@/components/calculator/ImportCalculator";
import { formatCost, costSourceLine, eurRateLine, MOMS } from "@/lib/costs";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

import { getRobotsForPath } from "@/lib/manifest";
import { UpcomingChangeNotice } from "@/components/UpcomingChangeNotice";

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

        <UpcomingChangeNotice path="/kalkylator/bilimport" />

        <ImportCalculator />

        <div className="mt-8 text-sm text-gray-500 bg-gray-50 rounded p-4 border border-gray-100">
          <p className="font-semibold text-gray-700 mb-1">Hur beräkningen fungerar</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              Moms ({Math.round(MOMS.moms_rate * 100)} %) tillkommer om fordonet köps inom{" "}
              {MOMS.moms_new_vehicle_threshold_months} månader från första ibruktagande eller har
              körts högst {MOMS.moms_new_vehicle_threshold_km.toLocaleString("sv-SE")} km
            </li>
            <li>Tull är 0 % vid import från EU-land</li>
            <li>
              Ursprungskontroll: {formatCost("ursprungskontroll")} ({costSourceLine("ursprungskontroll")})
            </li>
            <li>
              Registreringsbesiktning: publicerade priser {formatCost("registreringsbesiktning")} –
              kalkylatorn räknar med mittvärdet
            </li>
            <li>
              Köra hem själv: din egen förbrukning och ditt bränslepris, eller – om du lämnar dem
              tomma – {formatCost("bilkostnad_per_mil")} per mil enligt Skatteverkets schablon för
              skattefri milersättning (verklig kostnad är ofta högre), plus exportskyltar ({formatCost("exportskyltar_avgift")}) och
              exportförsäkring (från {formatCost("exportforsakring_15d")}). Euro räknas om med{" "}
              {eurRateLine()}.
            </li>
            <li>Transport med firma: fyll i ditt eget offertpris</li>
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
