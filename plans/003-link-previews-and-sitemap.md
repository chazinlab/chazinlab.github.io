# Plan 003: Shared links show a title card, and search engines get a sitemap

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan
> in `plans/README.md` - unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d24e562..HEAD -- src/layouts/BaseLayout.astro astro.config.mjs package.json public`
> Plans 001 and 002 are expected to have landed first: 001 adds a skip link and
> `id="main"` to `BaseLayout.astro`, which does not affect this plan. Any other
> change to the `<head>` block or the frontmatter of `BaseLayout.astro` is a
> STOP condition.

## Status

- **Priority**: P2
- **Effort**: S-M
- **Risk**: LOW
- **Depends on**: plans/001 and plans/002 landed first (all edit or build on `BaseLayout.astro`; run in order, not in parallel)
- **Category**: direction (SEO, sharing)
- **Planned at**: commit `d24e562`, 2026-11-14

## Why this matters

The site exists mainly to recruit graduate students and postdocs, and its link gets passed around in Slack, email and social media. Today the pages have only a `<title>` and a description, so a pasted link shows as a bare URL with no title card or image. There is also no canonical URL and no sitemap, so search engines have to discover pages by crawling. This plan adds the standard Open Graph and Twitter tags, a share image, a canonical link, a sitemap and a `robots.txt`.

## Current state

- `astro.config.mjs` (whole file, 22 lines) already sets the public URL, which makes absolute URLs available as `Astro.site`:

```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://chazinlab.github.io',

  fonts: [
    {
      // Montserrat is a free stand-in for Proxima Nova.
      ...
      provider: fontProviders.fontsource(),
      name: 'Montserrat',
      cssVariable: '--font-sans',
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      fallbacks: ['sans-serif'],
    },
  ],
});
```

- `src/layouts/BaseLayout.astro:9-25` (frontmatter) and `:30-39` (`<head>`):

```astro
interface Props {
  /** Page name for the browser tab; omit on the home page. */
  title?: string;
  description?: string;
}

const { title, description = `${site.name}, ${site.affiliation}` } = Astro.props;
...
const currentPath = Astro.url.pathname.replace(/\/$/, '') || '/';
const contact = await contactDetails();
```

```astro
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title ? `${title} · ${site.name}` : site.name}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/png" href="/favicon.png" sizes="192x192" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <Font cssVariable="--font-sans" preload />
  </head>
```

- `site` is imported from `src/site.config.ts` and has `name: 'Chazin Lab'` and `affiliation: 'Departments of Biochemistry and Chemistry, Vanderbilt University'`.
- `public/` holds files copied to the site root unchanged. It currently contains `favicon.ico`, `favicon.png`, `apple-touch-icon.png`.
- `src/assets/chazin-lab-logo-white.png` is the lab logo, 2139x741, white lettering on a transparent background.
- `package.json` dependencies today: `astro ^7.4.11`, `yaml ^2.9.1`. The official sitemap integration is `@astrojs/sitemap` (3.7.5 at planning time).
- Built pages use directory URLs: `dist/research/index.html` is served at `/research/`.

Conventions to match:

- Comments are short plain-English sentences. Prop doc comments use `/** ... */` as shown above.
- Never use the em dash character; use a plain hyphen.

## Commands you will need

Prefix every command with `export PATH=/opt/homebrew/bin:$PATH;` and run from the repo root.

| Purpose   | Command                        | Expected on success |
|-----------|--------------------------------|---------------------|
| Install   | `npm install @astrojs/sitemap` | exit 0, no `ERESOLVE` or peer dependency error |
| Tests     | `npm test`                     | `pass 26`, `fail 0` |
| Typecheck | `npx astro check`              | `0 errors`, `0 warnings`, `0 hints` |
| Build     | `npm run build`                | ends with `[build] Complete!` |

## Scope

**In scope**:
- `src/layouts/BaseLayout.astro` (frontmatter and `<head>` only)
- `astro.config.mjs`
- `package.json`, `package-lock.json` (only the change made by `npm install @astrojs/sitemap`)
- `public/og-image.png` (create)
- `public/robots.txt` (create)

**Out of scope**:
- Per-page share images or per-person pages. One site-wide image is the whole feature.
- JSON-LD structured data, analytics, or any `<script>`.
- The `<body>` of `BaseLayout.astro`, the favicon links, and the `<Font>` line.
- `src/site.config.ts`.

## Git workflow

- Branch: `improve/003-link-previews-and-sitemap`.
- Two commits: (1) share tags, image and canonical link; (2) sitemap and robots.txt. Plain imperative sentences, e.g. `Add link-preview tags and a share image`. No `Co-Authored-By` line. Do NOT push unless instructed.

## Steps

### Step 1: Generate the share image

Run (this reads the logo and writes `public/og-image.png`; nothing else):

```sh
/opt/anaconda3/bin/python - <<'EOF'
from PIL import Image
logo = Image.open('src/assets/chazin-lab-logo-white.png').convert('RGBA')
w = 880
logo = logo.resize((w, round(logo.height * w / logo.width)), Image.LANCZOS)
card = Image.new('RGB', (1200, 630), '#000000')
card.paste(logo, ((1200 - logo.width) // 2, (630 - logo.height) // 2), logo)
card.save('public/og-image.png', optimize=True)
print(card.size)
EOF
```

**Verify**: prints `(1200, 630)`; `sips -g pixelWidth -g pixelHeight public/og-image.png` reports 1200 and 630; the file is under 300 KB (`ls -la public/og-image.png`). Open the image and confirm: black background, white "Chazin Lab" logo with one red dot, centered, not cropped.

### Step 2: Emit canonical and share tags

In `src/layouts/BaseLayout.astro` frontmatter, directly after the line `const contact = await contactDetails();`, add:

```astro
// Absolute addresses, for search engines and for the preview card shown when a link is shared.
const pageTitle = title ? `${title} · ${site.name}` : site.name;
const pageUrl = new URL(Astro.url.pathname, Astro.site);
const shareImage = new URL('/og-image.png', Astro.site);
```

In `<head>`, replace the `<title>` line with `<title>{pageTitle}</title>` and insert these lines directly after the `<meta name="description" ... />` line:

```astro
    <link rel="canonical" href={pageUrl} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.name} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={pageUrl} />
    <meta property="og:image" content={shareImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={`${site.name} logo`} />
    <meta name="twitter:card" content="summary_large_image" />
```

**Verify**: `npx astro check` reports 0 errors. Then `npm run build` and:

```sh
grep -o '<link rel="canonical"[^>]*>' dist/research/index.html
grep -o '<meta property="og:image" [^>]*>' dist/index.html
for f in dist/index.html dist/research/index.html dist/people/index.html dist/publications/index.html dist/contact/index.html; do grep -o 'property="og:' $f | wc -l; done
```

Expected: canonical `href="https://chazinlab.github.io/research/"`; og:image `content="https://chazinlab.github.io/og-image.png"`; each of the five counts is `9`. (The built HTML is minified onto a few long lines, so count matches with `grep -o ... | wc -l`, never with `grep -c`, which counts lines.) Commit.

### Step 3: Add the sitemap integration

1. `npm install @astrojs/sitemap`
2. In `astro.config.mjs`, add the import under the existing import, and an `integrations` line under `site`:

```js
import sitemap from '@astrojs/sitemap';
```

```js
  site: 'https://chazinlab.github.io',

  // Writes sitemap-index.xml at build time so search engines can find every page.
  integrations: [sitemap()],
```

**Verify**: `npm run build` completes and:

```sh
test -f dist/sitemap-index.xml && echo OK
grep -o "<loc>[^<]*</loc>" dist/sitemap-0.xml
```

Expected: `OK`, and exactly five `<loc>` entries: the home page plus `/contact/`, `/people/`, `/publications/`, `/research/`. No entry for `404`.

### Step 4: Add robots.txt

Create `public/robots.txt` with exactly:

```
User-agent: *
Allow: /

Sitemap: https://chazinlab.github.io/sitemap-index.xml
```

**Verify**: after `npm run build`, `cat dist/robots.txt` prints those four lines.

### Step 5: Run the gates

**Verify**: `npm test` reports `pass 26`; `npx astro check` reports 0 errors, 0 warnings, 0 hints; `npm audit` reports `found 0 vulnerabilities`. Commit.

## Test plan

No unit tests: there is no rule logic. The grep checks in steps 2 to 4 are the regression checks.

## Done criteria

- [ ] `public/og-image.png` is 1200x630
- [ ] After `npm run build`: `grep -o 'rel="canonical"' dist/index.html | wc -l` prints `1`; `grep -o 'property="og:' dist/index.html | wc -l` prints `9`
- [ ] `dist/sitemap-index.xml` and `dist/robots.txt` exist; `dist/sitemap-0.xml` has 5 `<loc>` entries
- [ ] `npm test` passes; `npx astro check` reports 0 errors; `npm audit` reports 0 vulnerabilities
- [ ] `git status --short` shows only the in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `npm install @astrojs/sitemap` reports a peer dependency conflict with `astro` 7, or the build fails after adding the integration. Do not use `--force` or `--legacy-peer-deps`; revert step 3, keep steps 1, 2 and 4 minus the `Sitemap:` line, and report.
- `Astro.site` is undefined at build time (the `site` setting was removed from `astro.config.mjs`).
- The `<head>` block does not match the excerpt above.
- The sitemap lists `404` or any URL not on `https://chazinlab.github.io`.

## Maintenance notes

- If the site moves to a custom domain, change `site` in `astro.config.mjs` and the `Sitemap:` line in `public/robots.txt`; every other URL follows from `Astro.site`.
- If the logo changes, re-run the script in step 1 to regenerate `public/og-image.png`.
- Preview cards are cached by Slack, LinkedIn and others for days. After deploying, check with a fresh URL (for example add `?v=2`) rather than assuming the tags are broken.
- Reviewer: paste the live home page URL into Slack once deployed and confirm the card shows the logo image and "Chazin Lab".
