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
        <h2 className="text-xl font-bold text-gray-900 mb-3">Varför Importguiden?</h2>
        <p className="text-gray-700 mb-3">
          Importguiden startades för att det saknades en samlad, oberoende källa om
          fordonsimport på svenska. Den information som finns är utspridd över myndighetssajter,
          forum och företag som säljer importtjänster – ofta med egen agenda.
        </p>
        <p className="text-gray-700">
          Vi har själva importerat fordon privat och vet hur krånglig processen kan upplevas
          första gången. Varje guide på sajten är skriven för att ge dig det vi önskat att vi
          hade haft: tydlig, steg-för-steg-information med källhänvisning till myndigheterna.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Våra källor</h2>
        <p className="text-gray-700 mb-3">
          All information om regler, avgifter och processer grundar sig på officiella källor:
        </p>
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          <li>
            <a href="https://www.transportstyrelsen.se" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
              Transportstyrelsen
            </a>{" "}
            – registrering, ursprungskontroll, besiktning
          </li>
          <li>
            <a href="https://www.skatteverket.se" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
              Skatteverket
            </a>{" "}
            – moms vid import, fordonsskatt
          </li>
          <li>
            <a href="https://www.tullverket.se" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
              Tullverket
            </a>{" "}
            – tullregler vid import inom och utanför EU
          </li>
          <li>
            <a href="https://www.konsumenteuropa.se" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
              Konsument Europa
            </a>{" "}
            – köpskydd vid handel inom EU
          </li>
        </ul>
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
        <p className="text-gray-700 mb-3">
          Analytiska cookies och affiliate-tracking aktiveras enbart med ditt samtycke via
          cookie-bannern. Ingen persondata säljs vidare. Läs vår{" "}
          <a href="/integritetspolicy" className="text-blue-700 underline hover:text-blue-800">
            integritetspolicy
          </a>{" "}
          för fullständig information.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Kontakt</h2>
        <p className="text-gray-700">
          Frågor om sajten, innehållet eller våra affiliate-samarbeten?{" "}
          <a href="mailto:info@importguiden.se" className="text-blue-700 underline hover:text-blue-800">
            info@importguiden.se
          </a>
        </p>
      </section>
    </div>
  );
}
