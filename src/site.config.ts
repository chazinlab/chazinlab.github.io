/**
 * Settings for whoever maintains the site's code.
 * Lab members edit content in src/content/ instead (see HOW_TO_UPDATE.md).
 *
 * This file is also read by scripts/fetch-publications.ts, which runs outside Astro,
 * so it must not import anything from 'astro:*'.
 */
export const site = {
  name: 'Chazin Lab',
  affiliation: 'Department of Biochemistry, Vanderbilt University',

  /** The PubMed search that defines the publication list. */
  pubmedQuery: 'Chazin WJ[Author]',

  /** How the PI's name is written in PubMed author lists (shown in bold in citations). */
  piPubmedName: 'Chazin WJ',
};
