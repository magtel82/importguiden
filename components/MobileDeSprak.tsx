import data from "@/data/mobile-de.json";
import { formatDateSv } from "@/lib/date";

/**
 * Svaret på "Finns mobile.de på svenska?" – visas bara när språklistan i
 * data/mobile-de.json är ifylld och daterad. Innan dess visas inget påstående
 * om sajtens språk.
 */
export function MobileDeSprak() {
  const sprak = data.sprak as string[] | null;
  if (!sprak || sprak.length === 0 || data.svenska === null || !data.kontrollerat) return null;
  return (
    <p>
      <strong>{data.svenska ? "Ja" : "Nej"}</strong> – mobile.de finns på {sprak.join(", ")} (kontrollerat
      på mobile.de {formatDateSv(data.kontrollerat as unknown as string)}).
    </p>
  );
}
