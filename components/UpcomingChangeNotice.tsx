import Link from "next/link";
import { getActiveUpcoming } from "@/lib/upcoming";
import { HideAfter } from "@/components/HideAfter";
import { formatDateSv } from "@/lib/date";

/**
 * Diskret ruta om en känd, kommande händelse som kan ändra uppgifterna på
 * sidan (t.ex. budgetpropositionen). Styrs helt av `upcoming` i
 * data/regulation-changes.json. Rutan döljs automatiskt från `expiresAt`
 * (vid bygget och i webbläsaren). Ta ändå bort posten när händelsen är
 * genomgången – bygget varnar så länge en utgången post ligger kvar.
 */
export function UpcomingChangeNotice({ path }: { path: string }) {
  const items = getActiveUpcoming().filter((u) => u.affectedPages.includes(path));
  if (items.length === 0) return null;

  return (
    <>
      {items.map((item) => (
        <HideAfter key={item.id} date={item.expiresAt}>
        <aside
          aria-label={`Bevakas: ${item.title}`}
          className="not-prose mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Bevakas · senast{" "}
            <time dateTime={item.expected}>{formatDateSv(item.expected)}</time>
          </p>
          <p className="mt-1 font-semibold text-gray-900">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {item.short ?? item.summary}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Källa:{" "}
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              {item.source}
            </a>
            {" · "}
            <Link href="/regelandringar#kommande" className="underline hover:text-gray-700">
              Så bevakar vi regeländringar
            </Link>
          </p>
        </aside>
        </HideAfter>
      ))}
    </>
  );
}
