import type { Metadata } from "next";
import Link from "next/link";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import changes from "@/data/regulation-changes.json";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export const metadata: Metadata = {
  title: "Regeländringar vid fordonsimport – logg",
  description:
    "Logg över regel- och avgiftsändringar som påverkar import av bil och husbil till Sverige. Vi bevakar Transportstyrelsen, Skatteverket och Tullverket och noterar även när inget ändrats.",
  alternates: { canonical: getCanonicalUrl("/regelandringar") },
  robots: getRobotsForPath("/regelandringar"),
};

const breadcrumbs = [{ name: "Hem", href: "/" }, { name: "Regeländringar" }];

const TYPE_LABEL: Record<string, string> = {
  regelandring: "Regeländring",
  verifiering: "Verifierad uppgift",
  oforandrad: "Kontrollerad – oförändrad",
};

const MONTHS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

export default function RegelandringarPage() {
  const entries = [...changes.changes].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Regeländringar vid fordonsimport
        </h1>
        <p className="text-gray-600 mb-2">
          Regler och avgifter för fordonsimport ändras. Här loggar vi vad som
          ändrats, när, och vilka sidor på Importguiden som uppdaterats till
          följd av det.
        </p>
        <p className="text-sm text-gray-600 mb-8">
          Vi noterar även kontroller där ingenting ändrats. En uppgift som
          kontrollerats och visat sig oförändrad är lika användbar som en
          ändring – den talar om att siffran fortfarande gäller.
        </p>

        <section
          aria-labelledby="bevakade-kallor-rubrik"
          className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-5"
        >
          <h2
            id="bevakade-kallor-rubrik"
            className="font-semibold text-gray-900 mb-2"
          >
            Källor vi bevakar
          </h2>
          <ul className="space-y-1 text-sm text-gray-600">
            {changes._meta.monitoredSources.map((s) => (
              <li key={s} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            Senast genomgången: {formatDate(changes._meta.lastReviewed)}
          </p>
        </section>

        <ol className="space-y-6">
          {entries.map((entry) => (
            <li
              key={`${entry.date}-${entry.title}`}
              className="rounded-lg border border-gray-200 p-5"
            >
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <time
                  dateTime={entry.date}
                  className="text-sm font-medium text-gray-900"
                >
                  {formatDate(entry.date)}
                </time>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-blue-700">
                  {TYPE_LABEL[entry.type] ?? entry.type}
                </span>
              </div>

              <h2 className="mb-1 font-semibold text-gray-900">
                {entry.title}
              </h2>
              <p className="mb-3 text-sm text-gray-600">{entry.summary}</p>

              <p className="mb-3 text-xs text-gray-400">
                Källa:{" "}
                <a
                  href={entry.sourceUrl}
                  className="underline hover:text-gray-600"
                  rel="noopener"
                >
                  {entry.source}
                </a>
              </p>

              {entry.affectedPages.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-600">Berörda sidor: </span>
                  {entry.affectedPages.map((path, i) => (
                    <span key={path}>
                      {i > 0 && <span className="text-gray-400">, </span>}
                      <Link
                        href={path}
                        className="text-blue-700 hover:underline"
                      >
                        {path}
                      </Link>
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-10 text-xs text-gray-400">
          Loggen speglar ändringar vi själva noterat och verifierat mot
          myndighetskälla. Den är inte en fullständig förteckning över allt som
          ändrats i svensk fordonslagstiftning – kontrollera alltid aktuell
          information hos ansvarig myndighet innan du fattar beslut.
        </p>
      </div>
    </>
  );
}
