import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import regulationChanges from "./data/regulation-changes.json";
import { isExpired } from "./lib/expiry";
import liveFacts from "./data/live-facts.json";
import { ageInDays, isStale } from "./lib/staleness";

// Varna i bygget om en bevakad händelse har passerat sitt utgångsdatum.
// Rutan döljs automatiskt, men posten ska gås igenom och tas bort.
for (const u of regulationChanges.upcoming ?? []) {
  if (isExpired(u)) {
    console.warn(
      `\n⚠️  data/regulation-changes.json: bevakningen "${u.title}" gick ut ${u.expiresAt}. ` +
        "Gå igenom händelsen, logga eventuella ändringar och ta bort posten under `upcoming`.\n"
    );
  }
}

// Varna (inte fallera) när en ofta ändrad uppgift inte lästs av på länge.
{
  const ko = liveFacts.ursprungskontrollKo;
  if (isStale(ko.kontrollerat, ko.maxAlderDagar)) {
    console.warn(
      `\n⚠️  data/live-facts.json: ködatumet för ursprungskontroll kontrollerades ${ko.kontrollerat} ` +
        `(${ageInDays(ko.kontrollerat)} dagar sedan, gräns ${ko.maxAlderDagar}). Läs av ${ko.kallaUrl} och uppdatera.\n`
    );
  }
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  async redirects() {
    return [
      // Sammanslagen 2026-10-19 – en sida per sökavsikt i stället för två som konkurrerar.
      {
        source: "/guider/forsakra-importerad-bil",
        destination: "/guider/importforsakring",
        permanent: true,
      },
    ];
  },
  experimental: {
    mdxRs: true,
  },
};

export default withMDX(nextConfig);
