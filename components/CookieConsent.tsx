"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "importguiden_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);

    const handler = () => {
      localStorage.removeItem(CONSENT_KEY);
      setVisible(true);
    };
    window.addEventListener("show-cookie-settings", handler);
    return () => window.removeEventListener("show-cookie-settings", handler);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "all");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "necessary");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie-inställningar"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-lg"
    >
      <div className="mx-auto max-w-5xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Vi använder analytiska cookies och affiliate-tracking med ditt samtycke. Nödvändiga
          cookies krävs inte – sajten fungerar utan.{" "}
          <Link href="/integritetspolicy#cookies" className="text-blue-700 underline hover:text-blue-800">
            Läs mer
          </Link>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Endast nödvändiga
          </button>
          <button
            onClick={accept}
            className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Godkänn alla
          </button>
        </div>
      </div>
    </div>
  );
}
