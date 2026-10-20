"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { isExpired } from "@/lib/expiry";

const noopSubscribe = () => () => {};

/**
 * Döljer innehållet i webbläsaren från och med `date` (ISO). Sidorna är
 * statiska, så serverfiltret i lib/upcoming.ts slår bara igenom vid nästa
 * bygge – det här ser till att en utgången bevakningsruta inte står kvar
 * hos besökaren fram till dess. På servern renderas innehållet alltid.
 */
export function HideAfter({ date, children }: { date: string; children: ReactNode }) {
  const expired = useSyncExternalStore(
    noopSubscribe,
    () => isExpired({ expiresAt: date }),
    () => false
  );
  return expired ? null : <>{children}</>;
}
