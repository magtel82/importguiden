import type { Metadata } from "next";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { GuiderContent } from "./GuiderContent";
import { findGuidesMissingFromSections } from "@/lib/guides";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

// En guide som saknas i GUIDE_SECTIONS renderas aldrig här och blir en
// föräldralös sida – i sitemap men utan en enda intern länk. Bygget ska
// stoppa i stället för att publicera den tyst.
const orphanedGuides = findGuidesMissingFromSections();
if (orphanedGuides.length > 0) {
  throw new Error(
    `Guider saknas i GUIDE_SECTIONS (lib/guides.ts): ${orphanedGuides.join(", ")}. ` +
      `Lägg till dem i en sektion – annars går de inte att nå från /guider.`
  );
}

export function generateMetadata(): Metadata {
  return {
    title: "Guider om fordonsimport – Importguiden",
    description:
      "Steg-för-steg guider om att importera bil från Europa. Ursprungskontroll, registreringsbesiktning, COC-intyg och momsregler.",
    alternates: { canonical: getCanonicalUrl("/guider") },
    robots: getRobotsForPath("/guider"),
  };
}

const breadcrumbs = [
  { name: "Hem", href: "/" },
  { name: "Guider" },
];

export default function GuiderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd(
              breadcrumbs.map((b) => ({
                name: b.name,
                url: b.href ? `${SITE_URL}${b.href}` : SITE_URL,
              }))
            )
          ),
        }}
      />
      <GuiderContent />
    </>
  );
}
