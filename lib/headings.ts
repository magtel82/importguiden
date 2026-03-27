import GithubSlugger from "github-slugger";

export interface Heading {
  text: string;
  id: string;
}

/**
 * Extracts H2 headings from raw MDX source.
 * Uses github-slugger to match rehype-slug's ID generation.
 */
export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const lines = source.split("\n");

  return lines
    .filter((line) => /^## /.test(line))
    .map((line) => {
      const text = line
        .replace(/^## /, "")
        .replace(/\\\*/g, "*")
        .trim();
      const id = slugger.slug(text);
      return { text, id };
    });
}
