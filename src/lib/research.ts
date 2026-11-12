/** The only reader of research themes and projects: pages get render-ready models from here. */
import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { byOrder, renderBody, type Rendered } from './content';
import { publicationsById } from './publications';
import type { Publication } from './publication-schema';

export interface ResearchProject {
  title: string;
  figure: ImageMetadata | undefined;
  caption: string;
  Description: Rendered;
  keyPapers: Publication[];
}

export interface ResearchTheme {
  /** The theme's file name, used as the #anchor on the Research page. */
  id: string;
  name: string;
  Summary: Rendered;
  projects: ResearchProject[];
}

/** Themes in `order`, each with its projects in `order`. */
export async function researchThemes(): Promise<ResearchTheme[]> {
  const [themes, projects] = await Promise.all([getCollection('themes'), getCollection('research')]);

  const toProject = async (project: (typeof projects)[number]): Promise<ResearchProject> => ({
    title: project.data.title,
    figure: project.data.figure,
    caption: project.data.caption,
    Description: await renderBody(project),
    keyPapers: await publicationsById(project.data.keyPapers),
  });

  return Promise.all(
    themes.sort(byOrder).map(async (theme) => ({
      id: theme.id,
      name: theme.data.name,
      Summary: await renderBody(theme),
      projects: await Promise.all(
        projects
          .filter((project) => project.data.theme.id === theme.id)
          .sort(byOrder)
          .map(toProject),
      ),
    })),
  );
}
