import { ReactNode } from "react";

interface AffiliateLinkProps {
  href: string;
  partner: string;
  children: ReactNode;
  className?: string;
}

export function AffiliateLink({ href, partner, children, className }: AffiliateLinkProps) {
  return (
    <a
      href={href}
      rel="nofollow sponsored"
      target="_blank"
      data-partner={partner}
      className={className}
    >
      {children}
      <span className="text-xs text-gray-400 ml-1">(annonslänk)</span>
    </a>
  );
}
