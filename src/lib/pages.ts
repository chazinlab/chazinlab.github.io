/** The two single-file pages, src/content/pages/home.md and contact.md, ready to render. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { renderBody, type Rendered } from './content';

/** Mission text (Content), home figure, featured papers. */
export const homePage = async () => withBody((await getCollection('home'))[0], 'home');

/** Contact details and the "Joining the lab" text (Content). */
export const contactPage = async () => withBody((await getCollection('contact'))[0], 'contact');

async function withBody<E extends CollectionEntry<'home' | 'contact'>>(
  entry: E | undefined,
  page: string,
): Promise<{ data: E['data']; Content: Rendered }> {
  if (!entry) throw new Error(`src/content/pages/${page}.md is missing.`);
  return { data: entry.data, Content: await renderBody(entry) };
}
