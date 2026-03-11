/**
 * manifest-merge.ts
 *
 * Merge-strategi för pages_manifest.json.
 * Används av cron-pipeline eller manuellt script för att uppdatera manifestet
 * utan att skriva över manuella förbättringar.
 *
 * Primary key:   path  (ex. "/importera-bil/tyskland")
 * Secondary key: id    (ex. "importera-bil-tyskland")
 *
 * MERGE-REGLER:
 * 1. Om post finns (match på path eller id):
 *    - quality.*, uniquePayloadScore, lastEvaluated: ALLTID från batch
 *    - sources: union (deduplicerat, original order bevarad)
 *    - title/description: uppdateras BARA om nytt värde är längre/mer specifikt
 *    - notes, tags, manualOverride: bevaras alltid
 *    - Om manualOverride=true: quality.indexable bevaras från original
 * 2. Om post INTE finns: skapa ny post (notes/tags tomma)
 * 3. Om post finns i manifest men INTE i batch: sätt orphaned=true
 * 4. Sortera manifestet stabilt på path (alfabetiskt) för minimala git-diffar
 */

import type { PageManifestEntry } from "@/types";

export interface PatchObject
  extends Pick<
    PageManifestEntry,
    | "id"
    | "path"
    | "title"
    | "description"
    | "sources"
    | "uniquePayloadScore"
    | "quality"
    | "lastEvaluated"
  > {}

export interface MergeReport {
  created: string[];
  updated: string[];
  unchanged: string[];
  orphanedMarked: string[];
  errors: string[];
}

export interface MergeResult {
  pages: PageManifestEntry[];
  report: MergeReport;
}

/**
 * Deduplicates an array while preserving order of first occurrence.
 */
function dedupe<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Returns true if the new value is considered "better" (more specific/longer).
 * Used for title and description to avoid overwriting manual improvements.
 */
function isBetter(existing: string, incoming: string): boolean {
  if (!incoming || incoming.trim() === "") return false;
  // Prefer longer, more specific values
  return incoming.trim().length > existing.trim().length;
}

/**
 * Merges a batch of PatchObjects into an existing manifest pages array.
 * Returns new sorted pages array and a merge report.
 */
export function mergeManifest(
  existingPages: PageManifestEntry[],
  patches: PatchObject[]
): MergeResult {
  const report: MergeReport = {
    created: [],
    updated: [],
    unchanged: [],
    orphanedMarked: [],
    errors: [],
  };

  const patchMap = new Map<string, PatchObject>();
  for (const patch of patches) {
    patchMap.set(patch.path, patch);
    if (patch.id) patchMap.set(patch.id, patch);
  }

  const patchedPaths = new Set(patches.map((p) => p.path));
  const patchedIds = new Set(patches.map((p) => p.id).filter(Boolean));

  const updated: PageManifestEntry[] = existingPages.map((existing) => {
    const patch =
      patchMap.get(existing.path) ?? patchMap.get(existing.id);

    // Not in batch → mark orphaned
    if (!patch) {
      if (!existing.orphaned) {
        report.orphanedMarked.push(existing.path || existing.id);
        return { ...existing, orphaned: true };
      }
      report.unchanged.push(existing.path || existing.id);
      return existing;
    }

    // Build merged entry
    const merged: PageManifestEntry = {
      ...existing,

      // Always update from batch
      uniquePayloadScore: patch.uniquePayloadScore,
      lastEvaluated: patch.lastEvaluated,

      // quality: always update, but respect manualOverride on indexable
      quality: existing.manualOverride
        ? {
            ...patch.quality,
            indexable: existing.quality.indexable,
          }
        : patch.quality,

      // sources: union, deduplicated
      sources: dedupe([...existing.sources, ...patch.sources]),

      // title/description: only update if incoming is more specific
      title: isBetter(existing.title, patch.title)
        ? patch.title
        : existing.title,
      description: isBetter(existing.description, patch.description)
        ? patch.description
        : existing.description,

      // Preserved always
      notes: existing.notes,
      tags: existing.tags,
      manualOverride: existing.manualOverride,
      orphaned: false, // un-orphan if it reappears
    };

    // Detect if anything actually changed
    const changed =
      JSON.stringify(merged) !== JSON.stringify(existing);

    if (changed) {
      report.updated.push(existing.path || existing.id);
    } else {
      report.unchanged.push(existing.path || existing.id);
    }

    return merged;
  });

  // Create new entries for patches not in existing manifest
  for (const patch of patches) {
    const exists = existingPages.some(
      (p) => p.path === patch.path || p.id === patch.id
    );
    if (!exists) {
      const newEntry: PageManifestEntry = {
        ...patch,
        notes: "",
        tags: [],
      };
      updated.push(newEntry);
      report.created.push(patch.path || patch.id);
    }
  }

  // Sort stably by path (alphabetical) for minimal git diffs
  updated.sort((a, b) => a.path.localeCompare(b.path));

  return { pages: updated, report };
}

/**
 * Generates a ready-to-write manifest object from merged pages.
 */
export function buildManifest(pages: PageManifestEntry[]) {
  return {
    _version: "2.0.0",
    _generated: new Date().toISOString(),
    pages,
  };
}
