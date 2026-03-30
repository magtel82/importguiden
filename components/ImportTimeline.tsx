"use client";

import { useState } from "react";
import Link from "next/link";
import { CostTable } from "@/components/CostTable";

interface Step {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  cta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
}

interface ImportTimelineProps {
  vehicleType: "bil" | "husbil";
  activeStep?: number;
}

export function ImportTimeline({ vehicleType, activeStep = 1 }: ImportTimelineProps) {
  const [currentStep, setCurrentStep] = useState(activeStep);

  const steps: Step[] = [
    {
      number: 1,
      title: "Lönar det sig?",
      subtitle: "Räkna ut totalkostnaden",
      description:
        "Ingen tull inom EU, men avgifter tillkommer. Använd vår kalkylator för att se vad det kostar totalt.",
      cta: { text: "Öppna kalkylatorn", href: "/kalkylator/bilimport" },
      secondaryCta: {
        text: "Se alla avgifter",
        href:
          vehicleType === "bil"
            ? "/importera-bil/kostnad"
            : "/importera-husbil/kostnad",
      },
    },
    {
      number: 2,
      title: vehicleType === "bil" ? "Hitta rätt bil" : "Hitta rätt husbil",
      subtitle: "Sök, granska och jämför",
      description:
        vehicleType === "bil"
          ? "Lär dig navigera mobile.de och AutoScout24. Kontrollera historik, verifiera säljaren och undvik vanliga fällor."
          : "Lär dig navigera mobile.de för husbilar. Kontrollera fuktskador, chassi och verifiera säljaren.",
      cta: {
        text: "Guide till mobile.de",
        href:
          vehicleType === "bil"
            ? "/guider/kopa-bil-mobile-de-autoscout24"
            : "/guider/kopa-husbil-mobil-de",
      },
      secondaryCta: { text: "Märkesguider", href: "/guider#markesguider" },
    },
    {
      number: 3,
      title: "Köp och betala",
      subtitle: "Moms, dokument och säker betalning",
      description:
        "Förstå momsreglerna (ny vs begagnad), säkra rätt dokument och betala tryggt.",
      cta: { text: "Momsguide", href: "/guider/moms-vid-bilimport" },
      secondaryCta: { text: "Dokumentchecklista", href: "/guider/coc-intyg" },
    },
    {
      number: 4,
      title: "Transportera hem",
      subtitle: "Köra själv eller frakta",
      description:
        "Exportskyltar, importförsäkring och praktiska tips för hemresan.",
      cta: {
        text: "Transportguide",
        href: "/guider/transportera-bil-fran-tyskland",
      },
    },
    {
      number: 5,
      title: "Registrera i Sverige",
      subtitle: "Ursprungskontroll → Besiktning → Skyltar",
      description:
        "Ansök hos Transportstyrelsen, boka registreringsbesiktning och teckna svensk försäkring. Handläggningstid: ca 1 vecka.",
      cta: { text: "Ursprungskontroll", href: "/guider/ursprungskontroll" },
      secondaryCta: {
        text: "Registreringsbesiktning",
        href: "/guider/registreringsbesiktning",
      },
    },
  ];

  const activeIndex = steps.findIndex((s) => s.number === currentStep);
  const active = steps[activeIndex] ?? steps[0];

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(index + 1, steps.length - 1);
      setCurrentStep(steps[next].number);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(index - 1, 0);
      setCurrentStep(steps[prev].number);
    }
  }

  return (
    <div className="my-8">
      {/* ---- DESKTOP: horisontell ---- */}
      <div className="hidden md:block">
        {/* Progress bar med steg-cirklar */}
        <div
          className="relative flex items-start justify-between mb-8"
          role="tablist"
          aria-label="Importprocessens steg"
        >
          {/* Bakgrundslinje */}
          <div
            className="absolute left-5 right-5 top-5 h-0.5 bg-gray-200"
            aria-hidden="true"
          />
          {/* Fylld linje fram till aktivt steg */}
          <div
            className="absolute left-5 top-5 h-0.5 bg-blue-700 transition-all duration-300"
            style={{
              width:
                activeIndex === 0
                  ? "0%"
                  : `calc(${(activeIndex / (steps.length - 1)) * 100}% - 0px)`,
            }}
            aria-hidden="true"
          />
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isDone = step.number < currentStep;
            return (
              <button
                key={step.number}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "step" : undefined}
                onClick={() => setCurrentStep(step.number)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="relative z-10 flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded group"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    isActive
                      ? "border-blue-700 bg-blue-700 text-white"
                      : isDone
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-gray-300 bg-white text-gray-500 group-hover:border-blue-400"
                  }`}
                >
                  {step.number}
                </span>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Aktivt stegs innehåll */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">
            Steg {active.number} av {steps.length}
          </p>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{active.title}</h3>
          <p className="text-sm text-gray-500 mb-3">{active.subtitle}</p>
          <p className="text-sm text-gray-700 mb-3">{active.description}</p>
          {active.number === 1 && (
            <CostTable vehicleType={vehicleType} compact showTotal={false} />
          )}
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <Link
              href={active.cta.href}
              className="inline-flex items-center justify-center rounded bg-blue-700 px-5 py-3 text-sm font-medium text-white hover:bg-blue-800 min-h-[48px]"
            >
              {active.cta.text}
            </Link>
            {active.secondaryCta && (
              <Link
                href={active.secondaryCta.href}
                className="inline-flex items-center text-sm font-medium text-blue-700 hover:underline min-h-[48px] px-2"
              >
                {active.secondaryCta.text} →
              </Link>
            )}
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Föregående steg
            </button>
            <span className="flex-1" />
            <button
              onClick={() =>
                setCurrentStep(Math.min(steps.length, currentStep + 1))
              }
              disabled={currentStep === steps.length}
              className="text-sm font-medium text-blue-700 hover:text-blue-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Nästa steg →
            </button>
          </div>
        </div>
      </div>

      {/* ---- MOBIL: vertikal ---- */}
      <div className="md:hidden">
        <ol>
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isDone = step.number < currentStep;
            const isLast = index === steps.length - 1;
            return (
              <li key={step.number} className="flex gap-4">
                {/* Vänster: cirkel + linje */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    aria-current={isActive ? "step" : undefined}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all ${
                      isActive
                        ? "border-blue-700 bg-blue-700 text-white"
                        : isDone
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-gray-300 bg-white text-gray-500"
                    }`}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  >
                    {step.number}
                  </button>
                  {!isLast && (
                    <div
                      className={`flex-1 w-0.5 my-1 min-h-[1.5rem] ${
                        isDone ? "bg-blue-700" : "bg-gray-200"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Höger: innehåll */}
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                  <button
                    onClick={() => setCurrentStep(step.number)}
                    className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded pt-1"
                    aria-expanded={isActive}
                  >
                    <p
                      className={`font-semibold text-sm ${
                        isActive ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.subtitle}</p>
                  </button>

                  {/* Expand/collapse */}
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isActive ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-sm text-gray-700 mb-3">{step.description}</p>
                    {step.number === 1 && (
                      <CostTable vehicleType={vehicleType} compact showTotal={false} />
                    )}
                    <div className="flex flex-col gap-2 mt-1">
                      <Link
                        href={step.cta.href}
                        className="inline-flex items-center justify-center rounded bg-blue-700 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800 min-h-[48px] w-full"
                      >
                        {step.cta.text}
                      </Link>
                      {step.secondaryCta && (
                        <Link
                          href={step.secondaryCta.href}
                          className="inline-flex items-center justify-center text-sm font-medium text-blue-700 hover:underline min-h-[48px]"
                        >
                          {step.secondaryCta.text} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
