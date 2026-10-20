/** Antal hela dagar mellan ett ISO-datum och `now`. */
export function ageInDays(iso: string, now: Date = new Date()): number {
  const then = new Date(`${iso}T00:00:00+01:00`).getTime();
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function isStale(iso: string, maxDays: number, now: Date = new Date()): boolean {
  return ageInDays(iso, now) > maxDays;
}
