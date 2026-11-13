/** The only reader of the publication list: pages get render-ready models from here. */
import { getCollection } from 'astro:content';
import { featured, findByPmid, groupByYear, type FindByPmid, type Publication } from './publications-model';

const allPublications = async (): Promise<Publication[]> =>
  (await getCollection('publications')).map((entry) => entry.data);

/** Publications grouped by year, newest year first. */
export const publicationsByYear = async () => groupByYear(await allPublications());

/** The home-page list: the featured papers, or the most recent ones until any are chosen. */
export const featuredPublications = async (featuredPmids: readonly string[]) =>
  featured(await allPublications(), featuredPmids);

/** A lookup of publications by PMID; an unknown PMID stops the build. */
export const publicationFinder = async (): Promise<FindByPmid> => findByPmid(await allPublications());
