import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-700">
          Importguiden
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="/importera-bil/tyskland" className="hover:text-blue-700">
            Importera bil
          </Link>
          <Link href="/importera-husbil/tyskland" className="hover:text-blue-700">
            Importera husbil
          </Link>
          <Link href="/kalkylator/bilimport" className="hover:text-blue-700">
            Kalkylator
          </Link>
          <Link href="/guider/registreringsbesiktning" className="hover:text-blue-700">
            Guider
          </Link>
        </nav>
        <Link
          href="/kalkylator/bilimport"
          className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Räkna kostnad
        </Link>
      </div>
    </header>
  );
}
