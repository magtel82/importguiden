"use client";

import { useState } from "react";
import Link from "next/link";

const bilSteps = [
  { n: "1", title: "Hitta bilen", body: "Sök på mobile.de, AutoScout24 eller liknande europeisk bilsajt. Kontrollera VIN-numret och boka oberoende besiktning (TÜV/ADAC) innan köp." },
  { n: "2", title: "Köp och papper", body: "Skriv köpekontrakt. Säkra COC-intyget. Säljaren avregistrerar bilen och lämnar avregistreringsintyg." },
  { n: "3", title: "Hemtransport", body: "Ordna exportregistrering (röda skyltar) och importförsäkring. Kör hem eller anlita transportföretag." },
  { n: "4", title: "Ursprungskontroll", body: "Beställ ursprungskontroll via Transportstyrelsen (1 240 kr). Handläggningstid 2–5 dagar." },
  { n: "5", title: "Besiktning och registrering", body: "Genomför registreringsbesiktning (ca 1 700 kr för personbil). Registrera sedan bilen i Sverige." },
];

const husbilSteps = [
  { n: "1", title: "Hitta husbilen", body: "Sök på mobile.de, AutoScout24, carado.de eller liknande europeisk husbilssajt. Filtrera på Reisemobile. Kontrollera VIN och servicehistorik." },
  { n: "2", title: "Besiktning på plats", body: "Boka oberoende besiktning (DEKRA/ADAC). Be specifikt om fuktkontroll av tak och väggar." },
  { n: "3", title: "Köp och papper", body: "Skriv köpekontrakt. Säkra COC-intyget. Kontrollera totalvikt mot ditt körkort." },
  { n: "4", title: "Hemtransport", body: "Exportregistrering (röda skyltar) och importförsäkring. Räkna med 8 000–15 000 kr för transportföretag." },
  { n: "5", title: "Ursprungskontroll & registrering", body: "Beställ ursprungskontroll via Transportstyrelsen (1 240 kr). Boka registreringsbesiktning – bekräfta att stationen hanterar husbilar." },
];

export function ProcessSteps() {
  const [active, setActive] = useState<"bil" | "husbil">("bil");

  const steps = active === "bil" ? bilSteps : husbilSteps;
  const heading = active === "bil" ? "Så går en bilimport till" : "Så går en husbilsimport till";

  return (
    <section className="mb-16" aria-labelledby="process-rubrik">
      {/* Tabs */}
      <div className="flex w-full mb-6 gap-2">
        <button
          onClick={() => setActive("bil")}
          className={`flex-1 min-h-[48px] rounded px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            active === "bil"
              ? "bg-blue-700 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          aria-pressed={active === "bil"}
        >
          Bilimport
        </button>
        <button
          onClick={() => setActive("husbil")}
          className={`flex-1 min-h-[48px] rounded px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            active === "husbil"
              ? "bg-blue-700 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          aria-pressed={active === "husbil"}
        >
          Husbilsimport
        </button>
      </div>

      <h2 id="process-rubrik" className="text-2xl font-bold text-gray-900 mb-6">
        {heading}
      </h2>

      <ol
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 transition-opacity duration-200"
        key={active}
      >
        {steps.map((s) => (
          <li key={s.n} className="rounded-lg border border-gray-200 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white mb-3">
              {s.n}
            </span>
            <p className="font-semibold text-gray-900 mb-1 text-sm">{s.title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm text-gray-500">
        {active === "bil" ? (
          <>
            Fördjupa dig i processen i våra{" "}
            <Link href="/guider" className="text-blue-700 hover:underline">
              steg-för-steg guider
            </Link>
            .
          </>
        ) : (
          <>
            <Link href="/importera-husbil/tyskland" className="text-blue-700 hover:underline">
              Läs hela guiden om husbilsimport från Tyskland
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}
