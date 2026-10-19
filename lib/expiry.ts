/**
 * En post med `expiresAt` (ISO-datum) räknas som utgången från och med
 * midnatt svensk tid det datumet.
 */
export function isExpired(item: { expiresAt?: string }, now: Date = new Date()): boolean {
  return Boolean(item.expiresAt) && now >= new Date(`${item.expiresAt}T00:00:00+01:00`);
}
