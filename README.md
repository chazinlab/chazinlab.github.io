# Chazin Lab website

The website of the Chazin Lab, Departments of Biochemistry and Chemistry, Vanderbilt University. It's a static site built with [Astro](https://astro.build).

- **Lab members updating content:** see [HOW_TO_UPDATE.md](HOW_TO_UPDATE.md).
- **Vocabulary** (Theme, Project, Member, Alumnus, Key paper, Featured paper): see [GLOSSARY.md](GLOSSARY.md).

## Developing

Requires Node 22.23 or later.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start a local preview at http://localhost:4321 |
| `npm run build` | Build the site into `dist/` |
| `npm run publications` | Refresh `src/data/publications.json` from PubMed |
| `npm test` | Run the tests |
| `npx astro check` | Type-check everything |
| `npm run format` | Format the code with Prettier |
| `npm run format:check` | Check the formatting without changing files (also runs on every deploy) |

## Where things live

```
src/
  site.config.ts          Developer settings: lab name, affiliation, PubMed search (no editor content)
  content.config.ts       What each content file must contain (validated at build time)
  content/                All editable content (Markdown, plus the list of roles); the only folder editors touch
    themes/               One file per research theme
    research/             One file per project
    people/current/       One file per current member
    people/alumni.yaml    Every former member, in one list
    people/roles.ts       The roles a member can have, in People-page order
    pages/home.md         Mission, home figure, featured papers
    pages/contact.md      Address, email, directions, "Joining the lab"
  data/publications.json  Generated from PubMed: don't edit by hand
  lib/                    One module per area (publications, research, people, pages) reads the content;
                          its *-model.ts holds the rules (ordering, citations) and is tested with plain Node
  components/             Citation, Figure, PersonCard, ProjectCard
  layouts/BaseLayout.astro  Header, navigation, footer
  pages/                  One file per page
  styles/global.css       Design tokens: colors, spacing, type
scripts/                  PubMed fetcher and its tests
public/                   Site icons
```
