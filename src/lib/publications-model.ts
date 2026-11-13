/*
 * What a publication is and how the site lists, cites and searches publications.
 *
 * Shared by the website and scripts/fetch-publications.ts, and tested with plain Node:
 * do not import anything from 'astro:*' here.
 */
import { z } from 'astro/zod';
import { site } from '../site.config.ts';

/** One paper in src/data/publications.json — written by scripts/fetch-publications.ts. */
export const publicationSchema = z.object({
  /** PubMed ID (PMID). */
  id: z.string(),
  title: z.string(),
  /** Author names in PubMed citation style, e.g. "Chazin WJ". */
  authors: z.array(z.string()),
  journal: z.string(),
  /** YYYY-MM-DD */
  date: z.iso.date(),
  volume: z.string(),
  issue: z.string(),
  pages: z.string(),
  doi: z.string().nullable(),
  pmcid: z.string().nullable(),
});

export type Publication = z.infer<typeof publicationSchema>;

/** How many recent publications the home page shows until featured papers are chosen. */
const HOME_COUNT = 5;

/** Sort comparator: newest first; same-day papers by PMID, newest first. */
export const newestFirst = (a: Publication, b: Publication) =>
  b.date.localeCompare(a.date) || Number(b.id) - Number(a.id);

const yearOf = (pub: Publication): number => Number(pub.date.slice(0, 4));

/** Publications grouped by year, newest year first and newest first within a year. */
export function groupByYear(publications: readonly Publication[]): { year: number; publications: Publication[] }[] {
  const groups = Map.groupBy(publications.toSorted(newestFirst), yearOf);
  return [...groups].map(([year, group]) => ({ year, publications: group }));
}

/**
 * A lookup of publications by PMID: give it PMIDs and where they are listed, get the publications in that order.
 * An unknown PMID throws, which stops the build: it is almost always a typo in a content file.
 */
export function findByPmid(publications: readonly Publication[]) {
  const byId = new Map(publications.map((pub) => [pub.id, pub]));
  return (pmids: readonly string[], listedIn: string): Publication[] =>
    pmids.map((pmid) => {
      const pub = byId.get(pmid);
      if (!pub) {
        throw new Error(
          `PMID ${pmid}, listed in ${listedIn}, is not in the publication list. Check for a typo, or run \`npm run publications\`.`,
        );
      }
      return pub;
    });
}

export type FindByPmid = ReturnType<typeof findByPmid>;

/** The home-page list: the featured papers, or the most recent ones until any are chosen. */
export function featured(
  publications: readonly Publication[],
  featuredPmids: readonly string[],
): { heading: string; publications: Publication[] } {
  return featuredPmids.length > 0
    ? {
        heading: 'Featured Publications',
        publications: findByPmid(publications)(featuredPmids, 'featuredPapers in src/content/pages/home.md'),
      }
    : { heading: 'Recent Publications', publications: publications.toSorted(newestFirst).slice(0, HOME_COUNT) };
}

/** Whether an author, as written in a PubMed author list, is the PI (shown in bold in citations). */
export const isPi = (author: string): boolean => author === site.piPubmedName;

/** Year, volume, issue and pages in PubMed's citation style, e.g. "2024;300(4):105-12." (parts are left out when PubMed has none). */
export function citationSource(pub: Publication): string {
  let source = String(yearOf(pub));
  if (pub.volume || pub.issue) source += `;${pub.volume}`;
  if (pub.issue) source += `(${pub.issue})`;
  if (pub.pages) source += `:${pub.pages}`;
  return source + '.';
}

/** Everything the Publications page search matches against, in lower case. */
export const searchText = (pub: Publication): string =>
  [pub.title, ...pub.authors, pub.journal, yearOf(pub), pub.id].join(' ').toLowerCase();
