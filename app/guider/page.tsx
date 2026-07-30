import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { GuiderContent } from "./GuiderContent";
import { findGuidesMissingFromSections } from "@/lib/guides";

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

export default function GuiderPage() {
  return (
    // BreadcrumbList-schemat emitteras av <Breadcrumbs> inne i
    // <GuiderContent> – lägg inte till det här också.
    <GuiderContent />
  );
}
