/*
 * Shared by the website and scripts/fetch-publications.ts, which runs under plain Node:
 * do not import anything from 'astro:*' here.
 */
import { z } from 'astro/zod';

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
  year: z.int(),
  volume: z.string(),
  issue: z.string(),
  pages: z.string(),
  doi: z.string().nullable(),
  pmcid: z.string().nullable(),
});

export type Publication = z.infer<typeof publicationSchema>;

/** Sort comparator: newest first; same-day papers by PMID, newest first. */
export const newestFirst = (a: Publication, b: Publication) =>
  b.date.localeCompare(a.date) || Number(b.id) - Number(a.id);
