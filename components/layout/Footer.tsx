import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="font-bold text-gray-900">Importguiden</p>
            <p className="mt-2 text-sm text-gray-500">
              Oberoende information om privat fordonsimport inom EU. Vi säljer inga
              importtjänster.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Kontakt:{" "}
              <a
                href="mailto:info@importguiden.se"
                className="text-blue-700 hover:text-blue-800 hover:underline"
              >
                info@importguiden.se
              </a>
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm">Guider</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              <li>
                <Link href="/importera-bil/tyskland" className="hover:text-blue-700">
                  Importera bil från Tyskland
                </Link>
              </li>
              <li>
                <Link href="/importera-husbil/tyskland" className="hover:text-blue-700">
                  Importera husbil från Tyskland
                </Link>
              </li>
              <li>
                <Link href="/kalkylator/bilimport" className="hover:text-blue-700">
                  Importkalkylator
                </Link>
              </li>
              <li>
                <Link href="/guider/registreringsbesiktning" className="hover:text-blue-700">
                  Registreringsbesiktning
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-sm">Om sajten</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              <li>
                <Link href="/om-oss" className="hover:text-blue-700">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/finansiering" className="hover:text-blue-700">
                  Så finansieras vi
                </Link>
              </li>
              <li>
                <Link href="/integritetspolicy" className="hover:text-blue-700">
                  Integritetspolicy
                </Link>
              </li>
              <li className="text-gray-500">
                <CookieSettingsLink />
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-400">
              Importguiden finansieras delvis via affiliate-länkar, märkta med (annonslänk).
              Vi får provision om du köper via våra länkar, utan extra kostnad för dig.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-xs text-gray-400">
          <p>
            Informationen på Importguiden är vägledande. Regler kan ändras – kontrollera
            alltid aktuell information hos Transportstyrelsen och Tullverket.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Importguiden. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}
