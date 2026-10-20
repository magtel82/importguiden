import facts from "@/data/live-facts.json";
import { formatDateSv } from "@/lib/date";
import { ageInDays } from "@/lib/staleness";

const KO = facts.ursprungskontrollKo;

/** Statusraden för ursprungskontrollens kö, ur data/live-facts.json. */
export function Kodatum() {
  const veckor = Math.round(ageInDays(KO.kodatum, new Date(`${KO.kontrollerat}T12:00:00+01:00`)) / 7);
  return (
    <>
      Den {formatDateSv(KO.kontrollerat)} handlade Transportstyrelsen ärenden med ködatum{" "}
      <strong>{formatDateSv(KO.kodatum)}</strong> – en kö på ungefär {veckor} veckor (
      <em>
        källa:{" "}
        <a href={KO.kallaUrl} target="_blank" rel="noopener noreferrer">
          {KO.kalla}
        </a>
      </em>
      ).
    </>
  );
}

/** "Senast kontrollerat: …" – visas synligt i statusrutan. */
export function KoKontrollerat() {
  return <>Senast kontrollerat: {formatDateSv(KO.kontrollerat)}</>;
}

/** Tabell över avlästa ködatum. */
export function KoHistorik() {
  return (
    <div className="not-prose my-4 overflow-x-auto">
      <table className="w-full text-sm border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 font-semibold text-gray-700">Kontrollerat</th>
            <th className="text-left p-2 font-semibold text-gray-700">Ködatum som handlades</th>
            <th className="text-left p-2 font-semibold text-gray-700">Kö, ungefär</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {KO.historik.map((h) => (
            <tr key={h.kontrollerat}>
              <td className="p-2">{formatDateSv(h.kontrollerat)}</td>
              <td className="p-2">{formatDateSv(h.kodatum)}</td>
              <td className="p-2">
                {Math.round(ageInDays(h.kodatum, new Date(`${h.kontrollerat}T12:00:00+01:00`)) / 7)} veckor
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
