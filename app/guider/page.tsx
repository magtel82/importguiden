import type { Metadata } from "next";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { GuiderContent } from "./GuiderContent";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

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
