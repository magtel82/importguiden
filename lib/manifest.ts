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
