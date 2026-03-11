import Link from "next/link";
import { getBreadcrumbJsonLd } from "@/lib/seo";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  siteUrl: string;
}

export function Breadcrumbs({ items, siteUrl }: BreadcrumbsProps) {
  const jsonLdItems = items.map((item, i) => ({
    name: item.name,
    url: item.href ? `${siteUrl}${item.href}` : siteUrl,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbJsonLd(jsonLdItems)),
        }}
      />
      <nav aria-label="Brödsmulor" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap gap-1 items-center">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true" className="text-gray-300">/</span>}
              {item.href && index < items.length - 1 ? (
                <Link href={item.href} className="hover:text-blue-700">
                  {item.name}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
