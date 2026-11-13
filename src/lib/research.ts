/** The only reader of research themes and projects: pages get render-ready models from here. */
import { getCollection, type CollectionEntry } from 'astro:content';
import { renderBody, type Rendered } from './content';
import { publicationFinder } from './publications';
import * as model from './research-model';

export type ResearchProject = model.ResearchProject<Rendered>;
export type ResearchTheme = model.ResearchTheme<Rendered>;

const themeSource = async (entry: CollectionEntry<'themes'>) => ({
  ...entry.data,
  id: entry.id,
  Summary: await renderBody(entry),
});

const projectSource = async (entry: CollectionEntry<'research'>) => ({
  ...entry.data,
  id: entry.id,
  theme: entry.data.theme.id,
  Description: await renderBody(entry),
});

/** Themes in `order`, each with its projects in `order`. */
export async function researchThemes(): Promise<ResearchTheme[]> {
  const [themes, projects, findPapers] = await Promise.all([
    getCollection('themes').then((entries) => Promise.all(entries.map(themeSource))),
    getCollection('research').then((entries) => Promise.all(entries.map(projectSource))),
    publicationFinder(),
  ]);
  return model.assembleThemes(themes, projects, findPapers);
}
