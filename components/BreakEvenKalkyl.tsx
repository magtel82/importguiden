"use client";

import { useState } from "react";
import {
  feeTotal,
  bilkostnadForKm,
  exportKostnad,
  formatKr,
  formatSekRange,
  eurRateLine,
  EUR_SEK,
  MOMS,
} from "@/lib/costs";

/**
 * Break-even för en enskild bil: pris i Sverige mot pris i Tyskland plus
 * importkostnader. Alla avgifter och kursen kommer ur data/cost-data.json –
 * komponenten innehåller inga egna belopp.
 */
export function BreakEvenKalkyl() {
  const [prisSE, setPrisSE] = useState(0);
  const [prisDE, setPrisDE] = useState(0);
  const [transport, setTransport] = useState<"self" | "offer">("self");
  const [km, setKm] = useState(1200);
  const [offert, setOffert] = useState(0);
  const [ny, setNy] = useState(false);

  const fasta = feeTotal("bil");
  const prisDESek = Math.round(prisDE * EUR_SEK);
  const moms = ny ? Math.round(prisDESek * MOMS.moms_rate) : 0;
  const frakt = transport === "self" ? bilkostnadForKm(km) + exportKostnad().min : offert;
  const totalMin = prisDESek + moms + fasta.min + frakt;
  const totalMax = prisDESek + moms + fasta.max + frakt;
  const klar = prisSE > 0 && prisDE > 0 && (transport === "self" || offert > 0);
  const diffMin = prisSE - totalMax; // sämsta fallet
  const diffMax = prisSE - totalMin; // bästa fallet

  const input =
    "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-lg border border-gray-200 p-5 mb-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pris i Sverige (kr)</label>
          <input type="number" className={input} value={prisSE || ""} onChange={(e) => setPrisSE(Number(e.target.value))} placeholder="Från Bytbil eller Blocket" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pris i Tyskland (EUR)</label>
          <input type="number" className={input} value={prisDE || ""} onChange={(e) => setPrisDE(Number(e.target.value))} placeholder="Från mobile.de" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transport</label>
          <select className={input} value={transport} onChange={(e) => setTransport(e.target.value as "self" | "offer")}>
            <option value="self">Kör hem själv</option>
            <option value="offer">Transportfirma (offert)</option>
          </select>
        </div>
        <div>
          {transport === "self" ? (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Körsträcka (km)</label>
              <input type="number" className={input} value={km || ""} onChange={(e) => setKm(Number(e.target.value))} />
            </>
          ) : (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offertpris (kr)</label>
              <input type="number" className={input} value={offert || ""} onChange={(e) => setOffert(Number(e.target.value))} />
            </>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2">
          <input type="checkbox" checked={ny} onChange={(e) => setNy(e.target.checked)} className="accent-blue-700" />
          Bilen räknas som ny (köpt inom {MOMS.moms_new_vehicle_threshold_months} månader eller körd
          högst {MOMS.moms_new_vehicle_threshold_km.toLocaleString("sv-SE")} km) – svensk moms tillkommer
        </label>
      </div>

      {klar ? (
        <div className="mt-5 border-t border-gray-200 pt-4 text-sm space-y-1.5">
          <div className="flex justify-between"><span className="text-gray-600">Bilen i Tyskland, omräknad</span><span>{formatKr(prisDESek)}</span></div>
          {ny && <div className="flex justify-between"><span className="text-gray-600">Svensk moms</span><span>{formatKr(moms)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-600">Fasta avgifter</span><span>{formatSekRange(fasta)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">{transport === "self" ? "Hemkörning, exportskyltar och försäkring" : "Transport enligt offert"}</span><span>{formatKr(frakt)}</span></div>
          <div className="flex justify-between font-semibold border-t border-gray-200 pt-2"><span>Totalt för tyska bilen</span><span>{formatSekRange({ min: totalMin, max: totalMax })}</span></div>
          <div className="flex justify-between font-semibold"><span>Pris i Sverige</span><span>{formatKr(prisSE)}</span></div>
          <p className={`mt-2 rounded p-3 font-medium ${diffMin > 0 ? "bg-green-50 text-green-800" : diffMax < 0 ? "bg-amber-50 text-amber-900" : "bg-gray-50 text-gray-800"}`}>
            {diffMin > 0
              ? `Importen blir ${formatSekRange({ min: diffMin, max: diffMax })} billigare – innan din egen tid och en marginal för oväntade kostnader.`
              : diffMax < 0
              ? `Bilen blir ${formatSekRange({ min: -diffMax, max: -diffMin })} dyrare att importera än att köpa i Sverige.`
              : "Ungefär jämnt – skillnaden ryms inom osäkerheten i besiktningspriset."}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">Fyll i båda priserna för att se resultatet.</p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Euro räknas om med {eurRateLine()}. Hemkörningen räknas med Skatteverkets schablon för egen
        bil – din verkliga kostnad kan vara högre. För egen förbrukning och livekurs, använd
        importkalkylatorn.
      </p>
    </div>
  );
}
