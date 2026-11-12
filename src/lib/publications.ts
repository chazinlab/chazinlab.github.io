/** Everything the pages need to know about the publication list. */
import { getCollection } from 'astro:content';
import { newestFirst, type Publication } from './publication-schema';

const HOME_COUNT = 5;

async function allPublications(): Promise<Publication[]> {
  const entries = await getCollection('publications');
  return entries.map((entry) => entry.data).sort(newestFirst);
}

/** Publications grouped by year, newest year first. */
export async function publicationsByYear(): Promise<{ year: number; publications: Publication[] }[]> {
  const groups = Map.groupBy(await allPublications(), (pub) => pub.year);
  return [...groups].map(([year, publications]) => ({ year, publications }));
}

/**
 * The publications with these PMIDs, in the order given.
 * An unknown PMID stops the build: it is almost always a typo in a content file.
 */
export async function publicationsById(ids: readonly string[]): Promise<Publication[]> {
  const byId = new Map((await allPublications()).map((pub) => [pub.id, pub]));
  return ids.map((id) => {
    const pub = byId.get(id);
    if (!pub) throw new Error(`PMID ${id} is not in the publication list. Check for a typo, or run \`npm run publications\`.`);
    return pub;
  });
}

/** The home-page list: the featured papers, or the most recent ones until any are chosen. */
export async function featuredPublications(
  featuredIds: readonly string[],
): Promise<{ heading: string; publications: Publication[] }> {
  return featuredIds.length > 0
    ? { heading: 'Featured Publications', publications: await publicationsById(featuredIds) }
    : { heading: 'Recent Publications', publications: (await allPublications()).slice(0, HOME_COUNT) };
}
