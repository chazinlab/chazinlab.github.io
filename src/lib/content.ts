/** Rendering shared by the modules that turn content files into render-ready models. */
import { render, type CollectionEntry, type CollectionKey } from 'astro:content';

/** Rendered Markdown, ready to place on a page: <Body /> */
export type Rendered = Awaited<ReturnType<typeof render<CollectionKey>>>['Content'];

/** Renders an entry's Markdown text (the part below the ---). */
export const renderBody = async <C extends CollectionKey>(entry: CollectionEntry<C>): Promise<Rendered> =>
  (await render(entry)).Content;
