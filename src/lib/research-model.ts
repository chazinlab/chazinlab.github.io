/**
 * How the Research page is put together: themes in order, each with its projects in order and
 * every project's key papers.
 *
 * Tested with plain Node, so this file must not import anything from 'astro:*' (types are fine).
 * `Body` is rendered Markdown, which passes through untouched.
 */
import type { ImageMetadata } from 'astro';
import type { FindByPmid, Publication } from './publications-model.ts';

interface ThemeSource<Body> {
  /** The theme's file name. */
  id: string;
  name: string;
  order: number;
  Summary: Body;
}

interface ProjectSource<Body> {
  /** The project's file name. */
  id: string;
  /** The file name of the theme it belongs to. */
  theme: string;
  order: number;
  title: string;
  figure?: ImageMetadata;
  caption: string;
  Description: Body;
  /** PMIDs of its key papers. */
  keyPapers: readonly string[];
}

export interface ResearchProject<Body> {
  title: string;
  figure: ImageMetadata | undefined;
  caption: string;
  Description: Body;
  keyPapers: Publication[];
}

export interface ResearchTheme<Body> {
  /** The theme's file name, used as the #anchor on the Research page. */
  id: string;
  name: string;
  Summary: Body;
  projects: ResearchProject<Body>[];
}

/** Sort comparator for things with an `order` setting: 1 comes first. */
const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;

/** Themes in `order`, each with its projects in `order`. */
export function assembleThemes<Body>(
  themes: readonly ThemeSource<Body>[],
  projects: readonly ProjectSource<Body>[],
  findPapers: FindByPmid,
): ResearchTheme<Body>[] {
  return themes.toSorted(byOrder).map(({ id, name, Summary }) => ({
    id,
    name,
    Summary,
    projects: projects
      .filter((project) => project.theme === id)
      .toSorted(byOrder)
      .map(({ title, figure, caption, Description, keyPapers, id: projectId }) => ({
        title,
        figure,
        caption,
        Description,
        keyPapers: findPapers(keyPapers, `keyPapers in src/content/research/${projectId}.md`),
      })),
  }));
}
