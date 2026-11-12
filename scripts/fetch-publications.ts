/**
 * Refreshes src/data/publications.json from PubMed.
 * Run with: npm run publications
 */
import { writeFile } from 'node:fs/promises';
import { site } from '../src/site.config.ts';
import { fetchPublications } from './publications/pubmed.ts';

const output = new URL('../src/data/publications.json', import.meta.url);

const publications = await fetchPublications(site.pubmedQuery);

// An empty result almost always means PubMed had a hiccup; keep the existing list.
if (publications.length === 0) {
  throw new Error(`PubMed returned no results for "${site.pubmedQuery}". Existing list left unchanged.`);
}

await writeFile(output, JSON.stringify(publications, null, 2) + '\n');
console.log(`Saved ${publications.length} publications (newest: ${publications[0].date}).`);
