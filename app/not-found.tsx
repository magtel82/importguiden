import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sidan hittades inte – Importguiden",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-sm font-medium text-blue-700 mb-3">404</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Sidan hittades inte
      </h1>
      <p className="text-gray-600 mb-10 max-w-md mx-auto">
        Den här sidan existerar inte eller har flyttats. Använd länkarna nedan
        för att hitta rätt.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="rounded bg-blue-700 px-6 py-3 font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Till startsidan
        </Link>
        <Link
          href="/guider"
          className="rounded border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Se alla guider
        </Link>
      </div>

      <div className="mt-16 border-t border-gray-200 pt-10">
        <p className="text-sm font-medium text-gray-500 mb-4">Populära guider</p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/importera-bil/tyskland" className="text-blue-700 hover:underline">
              Importera bil från Tyskland →
            </Link>
          </li>
          <li>
            <Link href="/kalkylator/bilimport" className="text-blue-700 hover:underline">
              Importkalkylator →
            </Link>
          </li>
          <li>
            <Link href="/guider/registreringsbesiktning" className="text-blue-700 hover:underline">
              Registreringsbesiktning →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
