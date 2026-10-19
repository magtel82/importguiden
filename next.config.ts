import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import regulationChanges from "./data/regulation-changes.json";
import { isExpired } from "./lib/expiry";

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
