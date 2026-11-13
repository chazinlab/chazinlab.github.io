/**
 * Settings for whoever maintains the site's code.
 * Lab members edit content in src/content/ instead (see HOW_TO_UPDATE.md).
 *
 * This file is also read by scripts/fetch-publications.ts, which runs outside Astro,
 * so it must not import anything from 'astro:*'.
 */

/** How the PI's name is written in PubMed author lists. */
const piPubmedName = 'Chazin WJ';

export const site = {
  name: 'Chazin Lab',
  affiliation: 'Departments of Biochemistry and Chemistry, Vanderbilt University',

  /** Shown in bold in citations. */
  piPubmedName,

  /** The PubMed search that defines the publication list. */
  pubmedQuery: `${piPubmedName}[Author]`,
};
