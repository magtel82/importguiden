const MONTHS = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
];

/** "2026-10-19" → "19 oktober 2026". Ogiltigt värde returneras oförändrat. */
export function formatDateSv(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${parseInt(m[3])} ${MONTHS[parseInt(m[2]) - 1]} ${m[1]}`;
}
