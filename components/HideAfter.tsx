"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Döljer innehållet i webbläsaren från och med `date` (ISO). Sidorna är
 * statiska, så serverfiltret i lib/upcoming.ts slår bara igenom vid nästa
 * bygge – det här ser till att en utgången bevakningsruta inte står kvar
 * hos besökaren fram till dess.
 */
export function HideAfter({ date, children }: { date: string; children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setHidden(Date.now() >= new Date(`${date}T00:00:00+01:00`).getTime());
  }, [date]);
  return hidden ? null : <>{children}</>;
}
