import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { ContactForm } from "@/components/ContactForm";

export function generateMetadata(): Metadata {
  return {
    title: "Kontakta oss – Importguiden",
    description:
      "Har du frågor om fordonsimport eller sajten? Hör av dig till oss via formuläret.",
    alternates: { canonical: getCanonicalUrl("/kontakta-oss") },
    robots: getRobotsForPath("/kontakta-oss"),
  };
}

export default function KontaktaOssPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Kontakta oss</h1>
      <p className="text-gray-600 mb-8">
        Har du frågor om fordonsimport, innehållet på sajten eller våra
        affiliate-samarbeten? Fyll i formuläret så återkommer vi så snart vi kan.
      </p>

      <ContactForm />
    </div>
  );
}
