/**
 * Regelbevakning – hämtar 3 URL:er per dag i rotation,
 * jämför innehållshash mot sparat state i Vercel Blob,
 * skickar alert via Resend om förändring detekteras.
 *
 * Designbeslut:
 * - 3 URL:er per dag → täcker alla 12 var 4:e dag
 * - stripDynamicContent() tar bara <main>-elementet för att undvika false positives
 * - State sparas som regulation-state.json i Vercel Blob (Private)
 */

import { put, head, getDownloadUrl } from "@vercel/blob";
import { sendAlert } from "./resend";
import regulationUrls from "@/datasets/regulation-urls.json";

interface UrlEntry {
  id: string;
  url: string;
  description: string;
  affectsPages: string[];
  priority: string;
}

interface UrlState {
  id: string;
  url: string;
  hash: string;
  lastChecked: string;
  lastChanged: string | null;
}

interface RegulationState {
  version: string;
  updatedAt: string;
  urls: UrlState[];
}

interface RegulationCheckResult {
  checked: number;
  changed: number;
  errors: number;
  alertsSent: number;
}

const BLOB_KEY = "regulation-state.json";
const URLS_PER_DAY = 3;

/**
 * Extraherar <main>-elementets textinnehåll för att undvika
 * false positives från dynamiska element (menyer, datum, annonser).
 * Fallback: hela body-texten.
 */
function stripDynamicContent(html: string): string {
  // Försök extrahera <main>...</main>
  const mainMatch = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  const content = mainMatch ? mainMatch[1] : html;

  // Ta bort alla HTML-taggar och normalisera whitespace
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Enkel FNV-1a-inspirerad hash av en sträng → hex-sträng.
 * Används istället för crypto (undviker Edge Runtime-begränsningar).
 */
function simpleHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * Laddar sparad state från Vercel Blob.
 * Returnerar null om ingen state finns än.
 */
async function loadState(): Promise<RegulationState | null> {
  try {
    const blobMeta = await head(BLOB_KEY).catch(() => null);
    if (!blobMeta) return null;

    const downloadUrl = await getDownloadUrl(BLOB_KEY);
    const response = await fetch(downloadUrl);
    if (!response.ok) return null;

    return (await response.json()) as RegulationState;
  } catch (err) {
    console.error("[regulation-check] Kunde inte läsa state:", err);
    return null;
  }
}

/**
 * Sparar state till Vercel Blob (skriver över befintlig fil).
 */
async function saveState(state: RegulationState): Promise<void> {
  await put(BLOB_KEY, JSON.stringify(state, null, 2), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

/**
 * Väljer vilka 3 URL:er som ska kontrolleras idag baserat på datum.
 * Rotation: dag 0 = URL 0–2, dag 1 = URL 3–5 osv.
 */
function selectUrlsForToday(urls: UrlEntry[]): UrlEntry[] {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  const startIndex = (dayOfYear * URLS_PER_DAY) % urls.length;
  const selected: UrlEntry[] = [];
  for (let i = 0; i < URLS_PER_DAY; i++) {
    selected.push(urls[(startIndex + i) % urls.length]);
  }
  return selected;
}

/**
 * Huvudfunktion – körs från cron/daily.
 */
export async function runRegulationCheck(): Promise<RegulationCheckResult> {
  const result: RegulationCheckResult = {
    checked: 0,
    changed: 0,
    errors: 0,
    alertsSent: 0,
  };

  const allUrls = regulationUrls.urls as UrlEntry[];
  const todaysUrls = selectUrlsForToday(allUrls);

  // Ladda befintlig state
  const existingState = await loadState();
  const stateMap = new Map<string, UrlState>(
    existingState?.urls.map((u) => [u.id, u]) ?? []
  );

  const now = new Date().toISOString();
  const changedDescriptions: string[] = [];

  for (const entry of todaysUrls) {
    try {
      const response = await fetch(entry.url, {
        headers: { "User-Agent": "Importguiden-bot/1.0 (regelbevakning)" },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.warn(
          `[regulation-check] HTTP ${response.status} för ${entry.url}`
        );
        result.errors++;
        continue;
      }

      const html = await response.text();
      const text = stripDynamicContent(html);
      const hash = simpleHash(text);

      result.checked++;

      const previous = stateMap.get(entry.id);

      if (previous && previous.hash !== hash) {
        result.changed++;
        changedDescriptions.push(
          `• ${entry.description}\n  URL: ${entry.url}\n  Påverkar: ${entry.affectsPages.join(", ")}`
        );
        stateMap.set(entry.id, {
          ...previous,
          hash,
          lastChecked: now,
          lastChanged: now,
        });
      } else {
        stateMap.set(entry.id, {
          id: entry.id,
          url: entry.url,
          hash,
          lastChecked: now,
          lastChanged: previous?.lastChanged ?? null,
        });
      }
    } catch (err) {
      console.error(`[regulation-check] Fel vid fetch av ${entry.url}:`, err);
      result.errors++;
    }
  }

  // Spara uppdaterad state
  const newState: RegulationState = {
    version: "1.0.0",
    updatedAt: now,
    urls: Array.from(stateMap.values()),
  };
  await saveState(newState);

  // Skicka alert om något ändrats
  if (changedDescriptions.length > 0) {
    const subject = `[Importguiden] ${changedDescriptions.length} regeländring(ar) detekterad(e)`;
    const body = [
      "Följande sidor har förändrats sedan senaste kontrollen:",
      "",
      ...changedDescriptions,
      "",
      "Kontrollera sidorna manuellt och uppdatera innehållet på importguiden.se vid behov.",
      "",
      `Kontroll utförd: ${now}`,
    ].join("\n");

    await sendAlert(subject, body);
    result.alertsSent++;
  }

  console.log("[regulation-check] Klar:", result);
  return result;
}
