/**
 * Årtalet som visas i titlar, H1:or och meta descriptions ("… 2026").
 * Byts EN gång per år – vid årsskiftet, efter att innehållet faktagranskats
 * för det nya året. Använd aldrig new Date() för detta: då byter sidorna
 * årtal vid första bygget i januari oavsett om innehållet är granskat.
 */
export const CONTENT_YEAR = 2026;

/** Ersätter platshållaren {år} (används i MDX-frontmatter och manifest). */
export function withYear(text: string): string {
  return text.replaceAll("{år}", String(CONTENT_YEAR));
}
