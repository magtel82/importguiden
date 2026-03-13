"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/importera-bil/tyskland", label: "Importera bil" },
  { href: "/importera-husbil/tyskland", label: "Importera husbil" },
  { href: "/kalkylator/bilimport", label: "Kalkylator" },
  { href: "/guider", label: "Guider" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          Importguiden
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600" aria-label="Huvudnavigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-blue-700 focus:outline-none focus:underline ${
                pathname === link.href || pathname?.startsWith(link.href + "/")
                  ? "text-blue-700"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <Link
            href="/kalkylator/bilimport"
            className="hidden md:inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Räkna kostnad
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-gray-200 bg-white px-4 py-4"
          aria-label="Mobilnavigation"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded px-3 py-2 text-sm font-medium hover:bg-gray-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    pathname === link.href || pathname?.startsWith(link.href + "/")
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/kalkylator/bilimport"
              onClick={() => setMobileOpen(false)}
              className="block rounded bg-blue-700 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Räkna importkostnad
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
