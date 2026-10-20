import data from "@/data/mobile-de.json";
import { formatDateSv } from "@/lib/date";

type MobileDeData = {
  svenska: boolean | null;
  sprak: string[] | null;
  kontrollerat: string | null;
  kalla?: string;
};

const D = data as MobileDeData;

/** Kortsvaret om mobile.de:s språk – null om uppgiften inte är ifylld. */
export function mobileDeSprakSvar(): string | null {
  if (!D.sprak || D.sprak.length === 0 || D.svenska === null || !D.kontrollerat) return null;
  return `${D.svenska ? "Ja" : "Nej"}. mobile.de:s gränssnitt finns på ${D.sprak.length} språk: ${D.sprak.join(", ")}${
    D.svenska ? "" : " – men inte på svenska"
  }.`;
}

/**
 * Svaret på "Finns mobile.de på svenska?" ur data/mobile-de.json. Visas bara
 * när uppgiften är ifylld och daterad.
 */
export function MobileDeSprak() {
  const svar = mobileDeSprakSvar();
  if (!svar || !D.kontrollerat) return null;
  return (
    <p>
      <strong>{svar.split(".")[0]}.</strong>
      {svar.slice(svar.indexOf(".") + 1)}{" "}
      <em>(Källa: {D.kalla ?? "mobile.de"}, {formatDateSv(D.kontrollerat)}.)</em>
    </p>
  );
}
