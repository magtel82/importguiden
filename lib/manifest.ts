import type { PageManifest, PageManifestEntry } from "@/types";
import manifestData from "@/datasets/pages_manifest.json";

const manifest = manifestData as PageManifest;

export function getAllPages(): PageManifestEntry[] {
  return manifest.pages;
}

export function getIndexablePages(): PageManifestEntry[] {
  return manifest.pages.filter((p) => p.quality.indexable);
}

export function getPageByPath(path: string): PageManifestEntry | undefined {
  return manifest.pages.find((p) => p.path === path);
}

/**
 * Returnerar robots-direktiv baserat på manifestet.
 * Okända sidor får noindex som fallback (säker default).
 */
export function getRobotsForPath(
  path: string
): { index: boolean; follow: boolean } {
  const entry = getPageByPath(path);
  if (!entry) return { index: false, follow: false };
  const indexable = entry.quality.indexable && !entry.manualOverride
    ? entry.quality.indexable
    : entry.quality.indexable;
  return { index: indexable, follow: true };
}
