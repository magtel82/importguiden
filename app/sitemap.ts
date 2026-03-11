import type { MetadataRoute } from "next";
import { getIndexablePages } from "@/lib/manifest";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

export default function sitemap(): MetadataRoute.Sitemap {
  const indexablePages = getIndexablePages();

  return indexablePages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1.0 : page.uniquePayloadScore / 100,
  }));
}
