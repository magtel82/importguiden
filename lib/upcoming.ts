import changes from "@/data/regulation-changes.json";
import { isExpired } from "@/lib/expiry";

export { isExpired };

export type UpcomingItem = (typeof changes.upcoming)[number];

/** Kommande händelser som inte passerat sitt `expiresAt`. */
export function getActiveUpcoming(now: Date = new Date()): UpcomingItem[] {
  return (changes.upcoming ?? []).filter((u) => !isExpired(u, now));
}
