import Link from "next/link";

const brands = [
  { slug: "bmw", name: "BMW", desc: "3-serien, 5-serien, X3 – bäst i klassen enligt ADAC Pannenstatistik 2026." },
  { slug: "mercedes", name: "Mercedes-Benz", desc: "A-klass, B-klass, GLE – bäst i klassen enligt ADAC Pannenstatistik 2026." },
  { slug: "volkswagen", name: "Volkswagen", desc: "Golf, Passat, Tiguan – bäst i klassen enligt ADAC Pannenstatistik 2026." },
  { slug: "audi", name: "Audi", desc: "A3, A4, Q3 – bäst i klassen enligt ADAC Pannenstatistik 2026." },
  { slug: "porsche", name: "Porsche", desc: "Cayenne, Macan, 911." },
  { slug: "tesla", name: "Tesla", desc: "Model 3, Model Y – batteristatus (SoH), kontobyte och garanti." },
];

export function BrandGrid() {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
      {brands.map((brand) => (
        <Link
          key={brand.slug}
          href={`/importera-bil/${brand.slug}`}
          className="block rounded-lg p-5 border border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-white hover:shadow-sm transition-all"
        >
          <span className="text-lg font-bold text-gray-900">{brand.name}</span>
          <p className="text-xs text-gray-500 leading-relaxed mt-1">{brand.desc}</p>
        </Link>
      ))}
    </div>
  );
}
