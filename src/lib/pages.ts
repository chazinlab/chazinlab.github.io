/** The two single-file pages, src/content/pages/home.md and contact.md, ready to render. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { renderBody, type Rendered } from './content';

type Page = 'home' | 'contact';

async function page<P extends Page>(name: P): Promise<CollectionEntry<P>> {
  const [entry] = await getCollection(name);
  if (!entry) throw new Error(`src/content/pages/${name}.md is missing.`);
  return entry;
}

const withBody = async <E extends CollectionEntry<Page>>(entry: E): Promise<{ data: E['data']; Content: Rendered }> => ({
  data: entry.data,
  Content: await renderBody(entry),
});

/** Mission text (Content), home figure, featured papers. */
export const homePage = async () => withBody(await page('home'));

/** Contact details and the "Joining the lab" text (Content). */
export const contactPage = async () => withBody(await page('contact'));

/** Contact details alone, for the footer of every page. */
export const contactDetails = async () => (await page('contact')).data;
