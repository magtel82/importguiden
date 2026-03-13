import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";

export function generateMetadata(): Metadata {
  return {
    title: "Integritetspolicy – Importguiden",
    description:
      "Hur Importguiden hanterar cookies och personuppgifter. Information om dina rättigheter enligt GDPR.",
    alternates: { canonical: getCanonicalUrl("/integritetspolicy") },
    robots: getRobotsForPath("/integritetspolicy"),
  };
}

export default function IntegritetspolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Integritetspolicy</h1>
      <p className="text-sm text-gray-500 mb-8">Senast uppdaterad: 13 mars 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Vem är ansvarig?</h2>
        <p className="text-gray-700">
          Importguiden är ansvarig för behandlingen av personuppgifter på importguiden.se.
        </p>
        <p className="mt-2 text-gray-700">
          Kontakt:{" "}
          <a href="mailto:info@importguiden.se" className="text-blue-700 underline hover:text-blue-800">
            info@importguiden.se
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Hur du navigerar sajten</h2>
        <p className="text-gray-700">
          Importguiden är en statisk informationssajt. Du behöver inte registrera ett konto och
          vi ber dig aldrig om namn, e-post eller annan personlig information för att läsa våra
          guider eller använda kalkylatorn. Kalkylatorn beräknar allt lokalt i din webbläsare –
          ingen data skickas till oss.
        </p>
      </section>

      <section className="mb-8" id="cookies">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
        <p className="text-gray-700 mb-4">Vi använder cookies i två kategorier:</p>

        <div className="border-l-4 border-gray-200 pl-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">Nödvändiga cookies</h3>
          <p className="text-sm text-gray-700">
            Importguiden sätter inga egna nödvändiga cookies. Sajten fungerar utan cookies.
          </p>
        </div>

        <div className="border-l-4 border-gray-200 pl-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">Analytiska cookies (kräver samtycke)</h3>
          <p className="text-sm text-gray-700">
            Vi kan använda ett analysverktyg för att förstå hur besökare använder sajten – vilka
            sidor som läses och hur länge. Dessa cookies aktiveras enbart om du godkänner dem via
            vår cookie-banner.
          </p>
        </div>

        <div className="border-l-4 border-gray-200 pl-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">Affiliate-tracking (kräver samtycke)</h3>
          <p className="text-sm text-gray-700">
            När du klickar på en länk märkt "(annonslänk)" kan affiliate-nätverket sätta en
            tracking-cookie för att registrera att klicket kom från vår sajt. Dessa cookies
            aktiveras enbart om du har godkänt dem.
          </p>
        </div>

        <p className="text-sm text-gray-600">
          Du kan när som helst ändra ditt val via länken "Cookieinställningar" i sidfoten.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Webbhosting</h2>
        <p className="text-gray-700">
          Importguiden driftas av Vercel Inc. (USA). Vercel kan logga teknisk information som
          IP-adresser i syfte att säkra driften av tjänsten. Se Vercels dataskyddspolicy för
          mer information. Vercel är certifierat enligt EU–US Data Privacy Framework.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Dina rättigheter (GDPR art. 15–22)</h2>
        <p className="text-gray-700 mb-3">
          Eftersom vi normalt sett inte samlar in personuppgifter om dig finns det vanligtvis
          inga uppgifter att rätta, radera eller exportera. Om du ändå har frågor om hur dina
          uppgifter hanteras, kontakta oss på{" "}
          <a href="mailto:info@importguiden.se" className="text-blue-700 underline hover:text-blue-800">
            info@importguiden.se
          </a>
          .
        </p>
        <p className="text-gray-700">
          Du har alltid rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY) på{" "}
          <a
            href="https://www.imy.se"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline hover:text-blue-800"
          >
            imy.se
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Ändringar av denna policy</h2>
        <p className="text-gray-700">
          Vi kan uppdatera denna policy när regler eller tjänster förändras. Senaste ändringsdag
          framgår alltid längst upp på sidan.
        </p>
      </section>
    </div>
  );
}
