import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";

export function generateMetadata(): Metadata {
  return {
    title: "Om Importguiden – Oberoende information om fordonsimport",
    description:
      "Lär känna Importguiden. Vi är en oberoende informationssajt utan koppling till importföretag.",
    alternates: { canonical: getCanonicalUrl("/om-oss") },
    robots: getRobotsForPath("/om-oss"),
  };
}

export default function OmOssPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Om Importguiden</h1>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Vad är Importguiden?</h2>
        <p className="text-gray-700 mb-3">
          Importguiden är en oberoende informationssajt för privatpersoner som funderar på
          att importera bil eller husbil från Europa till Sverige.
        </p>
        <p className="text-gray-700">
          Vi säljer inga importtjänster, inga bilar och ingen rådgivning. Vår uppgift är att
          ge dig saklig, faktagranskad och uppdaterad information – så att du kan fatta ett
          välgrundat beslut på egen hand.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Hur finansieras Importguiden?</h2>
        <p className="text-gray-700 mb-3">
          Sajten finansieras delvis via affiliate-samarbeten. Det innebär att vi kan få en
          liten provision om du klickar på en av våra märkta annonslänkar och sedan köper
          en produkt eller tjänst – utan extra kostnad för dig.
        </p>
        <p className="text-gray-700">
          Alla affiliate-länkar är tydligt märkta med &ldquo;(annonslänk)&rdquo;. Vi rekommenderar
          aldrig tjänster vi inte tror på, och annonslänkar påverkar aldrig vår redaktionella
          bedömning.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Ansvarsfriskrivning</h2>
        <p className="text-gray-700">
          Informationen på Importguiden är avsedd som vägledning. Vi strävar efter att hålla
          den uppdaterad och korrekt, men kan inte garantera fullständighet. Fordonsregler
          och avgifter kan ändras. Kontrollera alltid aktuell information hos Transportstyrelsen,
          Tullverket och Skatteverket. Importguiden tar inget ansvar för eventuella kostnader
          eller skador som uppstår till följd av information på sajten.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">GDPR och cookies</h2>
        <p className="text-gray-700">
          Vi använder analys-cookies för att förstå hur sajten används. Ingen persondata
          säljs vidare. Affiliate-nätverk kan sätta tracking-cookies i samband med länkklick.
        </p>
      </section>
    </div>
  );
}
