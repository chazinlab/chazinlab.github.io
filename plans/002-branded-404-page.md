# Plan 002: A wrong URL shows the lab's own "Page not found" page

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan
> in `plans/README.md` - unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d24e562..HEAD -- src/pages`
> If `src/pages/404.astro` already exists, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (UX)
- **Planned at**: commit `d24e562`, 2026-11-14

## Why this matters

The site is hosted on GitHub Pages. When a visitor follows an old or mistyped link, GitHub looks for `404.html` at the site root; there is none, so it shows GitHub's generic error page with no lab name and no navigation. Adding one Astro page fixes this: Astro builds `src/pages/404.astro` to `dist/404.html`, which GitHub Pages serves automatically for every unknown URL.

## Current state

- `src/pages/` contains exactly: `index.astro`, `research.astro`, `people.astro`, `publications.astro`, `contact.astro`. There is no `404.astro`.
- `src/layouts/BaseLayout.astro` is the layout every page uses. Its props (lines 9-13):

```astro
interface Props {
  /** Page name for the browser tab; omit on the home page. */
  title?: string;
  description?: string;
}
```

- The simplest existing page to copy the shape from is `src/pages/research.astro:1-14`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ProjectCard from '../components/ProjectCard.astro';
import { researchThemes } from '../lib/research';

const themes = await researchThemes();
---

<BaseLayout title="Research">
  <section class="section">
    <div class="container">
      <h1>Research</h1>
    </div>
  </section>
```

Conventions to match:

- Pages wrap content in `<section class="section"><div class="container">...`. Those two classes are global (`src/styles/global.css:87-96`).
- Paragraph intro text uses the global class `lede`.
- Internal links are root-relative without a trailing slash: `/research`, `/people`, `/publications`, `/contact`.
- Never use the em dash character; use a plain hyphen.

## Commands you will need

Prefix every command with `export PATH=/opt/homebrew/bin:$PATH;` and run from the repo root.

| Purpose   | Command           | Expected on success |
|-----------|-------------------|---------------------|
| Tests     | `npm test`        | `pass 26`, `fail 0` |
| Typecheck | `npx astro check` | `0 errors`, `0 warnings`, `0 hints` |
| Build     | `npm run build`   | ends with `[build] Complete!` |

## Scope

**In scope**:
- `src/pages/404.astro` (create)

**Out of scope**:
- `src/layouts/BaseLayout.astro` - do not add 404 to the `nav` list or change the layout.
- Any redirect logic or JavaScript.

## Git workflow

- Branch: `improve/002-404-page`.
- One commit, plain imperative sentence, e.g. `Add a page-not-found page`. No `Co-Authored-By` line. Do NOT push unless instructed.

## Steps

### Step 1: Create the page

Create `src/pages/404.astro` with exactly:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Page not found" description="This page does not exist on the Chazin Lab website.">
  <section class="section">
    <div class="container">
      <h1>Page not found</h1>
      <p class="lede">That page doesn't exist, or it has moved.</p>
      <p>
        Try the <a href="/">home page</a>, or go to <a href="/research">Research</a>,
        <a href="/people">People</a>, <a href="/publications">Publications</a> or
        <a href="/contact">Contact</a>.
      </p>
    </div>
  </section>
</BaseLayout>
```

**Verify**: `npm run build` completes, then:

```sh
test -f dist/404.html && echo OK
grep -c "<h1>Page not found</h1>" dist/404.html
grep -o "<title>[^<]*</title>" dist/404.html
```

Expected: `OK`, `1`, and `<title>Page not found · Chazin Lab</title>`.

### Step 2: Run the gates

**Verify**: `npm test` reports `pass 26`; `npx astro check` reports 0 errors, 0 warnings, 0 hints (the file count in its output rises by one).

## Test plan

No new unit tests (the page has no logic). The `dist/404.html` checks in step 1 are the regression check.

## Done criteria

- [ ] `test -f dist/404.html` succeeds after `npm run build`
- [ ] `grep -c 'aria-current="page"' dist/404.html` prints `0` (no nav item is marked current on the 404 page)
- [ ] `npm test` passes; `npx astro check` reports 0 errors
- [ ] `git status --short` lists only `src/pages/404.astro` (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `src/pages/404.astro` already exists.
- The build writes the page somewhere other than `dist/404.html` (for example `dist/404/index.html`). Do not change `astro.config.mjs` to work around it; report.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- If a navigation page is renamed or added, update the links in this page by hand; they are not generated from the `nav` list in `BaseLayout.astro`.
- GitHub Pages only serves `404.html` from the site root. If the site ever moves under a sub-path (a `base` setting in `astro.config.mjs`), the hard-coded `/research` style links here and in the layout all need the base prefix.
