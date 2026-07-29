"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  GUIDES as guides,
  CATEGORY_LABEL as categoryLabel,
  GUIDE_SECTIONS as sections,
} from "@/lib/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://importguiden.se";

type Filter = "alla" | "bil" | "husbil";

const carBrands = [
  { slug: "bmw", name: "BMW", tagline: "3-serie, 5-serie, X3 – 15–40 % lägre pris" },
  { slug: "mercedes", name: "Mercedes-Benz", tagline: "A-klass, C-klass, E-klass – 10–30 % lägre pris" },
  { slug: "volkswagen", name: "Volkswagen", tagline: "Golf, Passat, Tiguan – 10–25 % lägre pris" },
  { slug: "audi", name: "Audi", tagline: "A3, A4, Q3 – ADAC bäst i klass 2026" },
  { slug: "porsche", name: "Porsche", tagline: "Cayenne, Macan, 911 – 20–40 % lägre pris" },
  { slug: "tesla", name: "Tesla", tagline: "Model 3, Model Y – SoH, laddkontakter, garanti" },
];

const motorhomeBrands = [
  { slug: "hymer", name: "Hymer", tagline: "B-klass, ML-T, Exsis – Fiat Ducato-chassi" },
  { slug: "dethleffs", name: "Dethleffs", tagline: "Trend, Esprit, Globebus – prisvärd import" },
  { slug: "burstner", name: "Bürstner", tagline: "Lyseo, Ixeo, Delfin – bred modellflora" },
  { slug: "knaus", name: "Knaus", tagline: "Sun TI, Van TI, Sky TI – halvintegrerad" },
  { slug: "hobby", name: "Hobby", tagline: "Optima, De Luxe – Tysklands folkligaste märke" },
];

export function GuiderContent() {
  const [filter, setFilter] = useState<Filter>("alla");

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Guider" },
  ];

  function guideMatchesFilter(slug: string) {
    const guide = guides.find((g) => g.slug === slug);
    if (!guide) return false;
    if (filter === "alla") return true;
    if (filter === "bil") return guide.category === "bil" || guide.category === "generell";
    if (filter === "husbil") return guide.category === "husbil" || guide.category === "generell";
    return false;
  }

  const showCarBrands = filter === "alla" || filter === "bil";
  const showMotorhomeBrands = filter === "alla" || filter === "husbil";

  const btnActive = "bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium min-h-[48px]";
  const btnInactive = "border border-gray-300 text-gray-700 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 min-h-[48px]";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Guider om fordonsimport
      </h1>
      <p className="text-gray-600 mb-6">
        Sakliga steg-för-steg guider för dig som importerar bil eller husbil
        från Europa till Sverige.
      </p>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setFilter("alla")} className={filter === "alla" ? btnActive : btnInactive}>
          Alla
        </button>
        <button onClick={() => setFilter("bil")} className={filter === "bil" ? btnActive : btnInactive}>
          Bil
        </button>
        <button onClick={() => setFilter("husbil")} className={filter === "husbil" ? btnActive : btnInactive}>
          Husbil
        </button>
      </div>

      {/* Flagship guides – always visible */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Kompletta steg-för-steg-guider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(filter === "alla" || filter === "bil") && (
            <Link
              href="/importera-bil/tyskland"
              className="block rounded-lg border-2 border-blue-200 bg-blue-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Importera bil från Tyskland</h3>
              <p className="text-sm text-gray-600">Hela processen: sökning, besiktning, exportskyltar, ursprungskontroll och registrering.</p>
            </Link>
          )}
          {(filter === "alla" || filter === "husbil") && (
            <Link
              href="/importera-husbil/tyskland"
              className="block rounded-lg border-2 border-blue-200 bg-blue-50 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-1">Importera husbil från Tyskland</h3>
              <p className="text-sm text-gray-600">Steg för steg: märken, fuktskador, körkortskrav, besiktning och registrering.</p>
            </Link>
          )}
        </div>
      </section>

      {/* Fördjupningsguider – grupperade i sektioner */}
      {sections.map((section) => {
        const visibleSlugs = section.slugs.filter(guideMatchesFilter);
        if (visibleSlugs.length === 0) return null;
        return (
          <section key={section.title} className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
            <ul className="space-y-4">
              {visibleSlugs.map((slug) => {
                const guide = guides.find((g) => g.slug === slug)!;
                return (
                  <li key={guide.slug}>
                    <Link
                      href={`/guider/${guide.slug}`}
                      className="block rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{guide.title}</h3>
                            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                              {categoryLabel[guide.category]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{guide.description}</p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-gray-400 mt-1 whitespace-nowrap">
                          {guide.time} läsning
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* Märkesspecifika guider */}
      {(showCarBrands || showMotorhomeBrands) && (
        <section className="mb-10">
          <h2 id="markesguider" className="text-lg font-bold text-gray-900 mb-1">Märkesspecifika importguider</h2>
          <p className="text-sm text-gray-600 mb-4">
            ADAC-data, kända problem, rekommenderade modeller och dokument – för just det märke du funderar på.
          </p>

          {showCarBrands && (
            <>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Personbilar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {carBrands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/importera-bil/${brand.slug}`}
                    className="block rounded-lg p-5 border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-900">{brand.name}</span>
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">Bil</span>
                    </div>
                    <span className="text-xs text-gray-500 leading-relaxed">{brand.tagline}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {showMotorhomeBrands && (
            <>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Husbilar</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {motorhomeBrands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/importera-husbil/${brand.slug}`}
                    className="block rounded-lg p-5 border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-lg font-bold text-gray-900">{brand.name}</span>
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">Husbil</span>
                    </div>
                    <span className="text-xs text-gray-500 leading-relaxed">{brand.tagline}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Kalkylator CTA */}
      <div className="mt-12 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-2">
          Räkna ut din totalkostnad
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Använd vår kalkylator för att se vad importen kostar – moms,
          ursprungskontroll, besiktning och transport.
        </p>
        <Link
          href="/kalkylator/bilimport"
          className="inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Öppna kalkylatorn
        </Link>
      </div>
    </div>
  );
}
