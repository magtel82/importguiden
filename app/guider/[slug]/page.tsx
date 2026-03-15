import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { readFile } from "fs/promises";
import path from "path";
import remarkGfm from "remark-gfm";
import { getCanonicalUrl, getBreadcrumbJsonLd } from "@/lib/seo";
import { getRobotsForPath } from "@/lib/manifest";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AffiliateLink } from "@/components/affiliate/AffiliateLink";

const SITE_URL = process.env.SITE_URL ?? "https://importguiden.se";

const GUIDE_SLUGS = [
  "registreringsbesiktning",
  "coc-intyg",
  "ursprungskontroll",
  "moms-vid-bilimport",
  "kopa-bil-mobile-de-autoscout24",
  "fordonsskatt-husbil-bonus-malus",
] as const;

type GuideSlug = (typeof GUIDE_SLUGS)[number];

interface GuideFrontmatter {
  title: string;
  description: string;
  dateUpdated: string;
}

async function loadGuide(slug: string) {
  const filePath = path.join(
    process.cwd(),
    "content/guider",
    `${slug}.mdx`
  );
  let source: string;
  try {
    source = await readFile(filePath, "utf-8");
  } catch {
    return null;
  }

  const { content, frontmatter } = await compileMDX<GuideFrontmatter>({
    source,
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } },
    components: { AffiliateLink },
  });

  return { content, frontmatter };
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await loadGuide(slug);
  if (!guide) return {};

  return {
    title: guide.frontmatter.title,
    description: guide.frontmatter.description,
    alternates: { canonical: getCanonicalUrl(`/guider/${slug}`) },
    robots: getRobotsForPath(`/guider/${slug}`),
  };
}

export default async function GuiderPage({ params }: Props) {
  const { slug } = await params;
  const guide = await loadGuide(slug);
  if (!guide) notFound();

  const { content, frontmatter } = guide;

  const breadcrumbs = [
    { name: "Hem", href: "/" },
    { name: "Guider", href: "/guider" },
    { name: frontmatter.title.split("–")[0].trim() },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            getBreadcrumbJsonLd(
              breadcrumbs.map((b) => ({
                name: b.name,
                url: b.href ? `${SITE_URL}${b.href}` : SITE_URL,
              }))
            )
          ),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs items={breadcrumbs} siteUrl={SITE_URL} />

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {frontmatter.title}
            </h1>
            <p className="text-gray-500 text-sm">
              Uppdaterad:{" "}
              <time dateTime={frontmatter.dateUpdated}>
                {frontmatter.dateUpdated}
              </time>
            </p>
          </header>

          <div className="prose prose-gray max-w-none">{content}</div>
        </article>
      </div>
    </>
  );
}
