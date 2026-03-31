import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath, getAllPages } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ImportTimeline } from "@/components/ImportTimeline";
import Link from "next/link";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export const metadata: Metadata = {
  title: "Importera bil — Steg för steg",
  description:
    "Följ vår steg-för-steg-guide för att importera bil privat från Europa till Sverige. Från kalkyl till registrering.",
  alternates: {
    canonical: getCanonicalUrl("/importera-bil/guide"),
  },
  robots: getRobotsForPath("/importera-bil/guide"),
};

export default function ImporteraBilGuidePage() {
  const bilBrands = getAllPages().filter(
    (p) =>
      p.tags?.includes("marke") &&
      p.tags?.includes("bil") &&
      p.quality.indexable
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs
        siteUrl={SITE_URL}
        items={[
          { name: "Hem", href: "/" },
          { name: "Importera bil", href: "/importera-bil/tyskland" },
          { name: "Steg för steg" },
        ]}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Importera bil — Steg för steg
      </h1>
      <p className="text-gray-600 mb-2">
        En komplett guide för att importera personbil privat från Europa till Sverige.
      </p>

      <ImportTimeline vehicleType="bil" />

      {bilBrands.length > 0 && (
        <section className="mt-10" aria-labelledby="markesguider-bil-rubrik">
          <h2
            id="markesguider-bil-rubrik"
            className="text-xl font-bold text-gray-900 mb-4"
          >
            Vill du importera ett specifikt märke?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Märkesspecifika guider med ADAC-data, kända fel och importkalkylator.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {bilBrands.map((brand) => {
              const brandName =
                brand.title.match(/Importera\s+(.+?)\s+från/)?.[1] ??
                brand.path.split("/").pop() ??
                "";
              return (
                <Link
                  key={brand.id}
                  href={brand.path}
                  className="block rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-400 hover:shadow-sm transition-all min-h-[48px] flex items-center"
                  aria-label={`Guide: importera ${brandName}`}
                >
                  <span className="font-semibold text-gray-900 text-sm">
                    {brandName}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
