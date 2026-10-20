import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Länk till en betald samarbetspartner. Märks alltid "(annonslänk)" i
 * enlighet med /finansiering, och får rel="sponsored nofollow" så att
 * sökmotorer inte tolkar den som en redaktionell rekommendation.
 *
 * Används ännu inte – lägg inte in en partnerlänk utan att samarbetet är
 * redovisat på /finansiering.
 */
export function PartnerLink({
  href,
  partner,
  children,
}: {
  href: string;
  partner: string;
  children: ReactNode;
}) {
  return (
    <>
      <a href={href} rel="sponsored nofollow noopener noreferrer" target="_blank" data-partner={partner}>
        {children}
      </a>{" "}
      <Link href="/finansiering" className="text-xs text-gray-400 no-underline hover:underline">
        (annonslänk)
      </Link>
    </>
  );
}
