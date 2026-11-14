# Plan 001: Muted text passes WCAG AA contrast and every page has a skip-to-content link

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan
> in `plans/README.md` - unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d24e562..HEAD -- src/styles/global.css src/layouts/BaseLayout.astro`
> If either file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (accessibility)
- **Planned at**: commit `d24e562`, 2026-11-14

## Why this matters

The site's secondary text color, `--muted: #8a8a8a`, has a contrast ratio of 3.45:1 on the white page background. WCAG AA requires 4.5:1 for normal-size text. That color is used for member roles, figure captions, the footer address, the small uppercase label on the home page and the search status line, so those are hard to read for visitors with low vision. Separately, keyboard and screen-reader users have to tab through the logo and five navigation links on every page before reaching the content, because there is no "Skip to content" link. Both are fixed with a few lines of CSS and one line of HTML.

## Current state

This is a static site built with Astro. Files involved:

- `src/styles/global.css` - design tokens and global styles; the only place colors are defined.
- `src/layouts/BaseLayout.astro` - the one layout every page uses: `<head>`, header with navigation, `<main>`, footer.

`src/styles/global.css:1-11`:

```css
/* Design tokens: change the look of the whole site from here. */
:root {
  --text: #555555;
  --heading: #333333;
  --muted: #8a8a8a;
  --link: #46698f;
  --link-hover: #2f4a68;
  --rule: #e6e6e6;
  --placeholder-bg: #f1f1f1;
  --bg: #ffffff;
```

`src/styles/global.css:118-125` (end of file):

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

`src/layouts/BaseLayout.astro:40-43` and `:69-71`:

```astro
  <body>
    <header class="site-header">
      <div class="container header-inner">
        <a class="wordmark" href="/">
```

```astro
    <main>
      <slot />
    </main>
```

`--muted` is used in 8 places (`grep -rn "var(--muted)" src`): `global.css:112`, `BaseLayout.astro:159`, `PersonCard.astro:50` and `:60`, `Figure.astro:47` and `:56`, `publications.astro:87`, `people.astro:71`. You change only the token; do not edit those 8 sites.

Conventions to match:

- Colors and spacing come from the tokens in `global.css` (`--space-1` to `--space-6`, `--radius`, `--bg`, `--heading`, `--link`). Do not hard-code new colors outside `:root`.
- CSS comments are short, plain-English sentences that explain why, written for a non-programmer. Example from `global.css:114`: `/* A short label, not running text: the reading-width limit on paragraphs would wrap it early. */`
- Never use the em dash character in any text you write; use a plain hyphen.

## Commands you will need

Node is not on the default PATH on this machine. Prefix every command with `export PATH=/opt/homebrew/bin:$PATH;` and run from the repo root (`~/Desktop/lab_website`).

| Purpose   | Command                | Expected on success |
|-----------|------------------------|---------------------|
| Tests     | `npm test`             | `pass 26`, `fail 0` |
| Typecheck | `npx astro check`      | `0 errors`, `0 warnings`, `0 hints` |
| Build     | `npm run build`        | ends with `[build] Complete!` |

## Scope

**In scope** (the only files you should modify):
- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`

**Out of scope** (do NOT touch):
- The 8 files/lines that use `var(--muted)`. The token change covers them.
- Header colors in `BaseLayout.astro:100-105` (`--link: #cfae70` on black already passes at 9.94:1).
- `--text`, `--heading`, `--link`: they already pass (7.46:1, 12.63:1, 5.71:1).

## Git workflow

- Branch: `improve/001-contrast-and-skip-link` from `main`.
- One commit. Message style in this repo is a plain imperative sentence, no prefix, e.g. `Show headshots in an upright frame instead of a circle`. Suggested: `Darken muted text to pass contrast checks and add a skip-to-content link`.
- Do not add any `Co-Authored-By` line. Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Darken the muted token

In `src/styles/global.css`, change line 5 from `--muted: #8a8a8a;` to `--muted: #6b6b6b;`.

**Verify**: run this and expect both numbers to be 4.5 or higher (expected: `5.33` and `4.72`, the second being muted text on the grey placeholder box):

```sh
/opt/anaconda3/bin/python -c "
def L(h):
    c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
r=lambda a,b: round((max(L(a),L(b))+0.05)/(min(L(a),L(b))+0.05),2)
print(r('6b6b6b','ffffff'), r('6b6b6b','f1f1f1'))"
```

Also: `grep -n "8a8a8a" -r src` returns no matches.

### Step 2: Give `<main>` an id and add the skip link

In `src/layouts/BaseLayout.astro`:

1. Change `<main>` to `<main id="main">`.
2. Insert this as the first child of `<body>`, directly above `<header class="site-header">`:

```astro
    <a class="skip-link" href="#main">Skip to content</a>
```

### Step 3: Style the skip link

Append to the end of `src/styles/global.css`:

```css
/* Hidden until a keyboard user presses Tab: lets them jump past the navigation straight to the page. */
.skip-link {
  position: absolute;
  top: var(--space-1);
  left: var(--space-1);
  z-index: 1;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--heading);
  font-weight: 600;
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}
```

**Verify**: `npm run build` completes, then:

```sh
grep -c 'class="skip-link" href="#main"' dist/index.html dist/people/index.html dist/research/index.html dist/publications/index.html dist/contact/index.html
grep -c '<main id="main"' dist/index.html
```

Every count is `1`. (The built HTML is minified onto a few long lines and `grep -c` counts lines, so `1` means "present".)

### Step 4: Run the gates

**Verify**: `npm test` reports `pass 26`, `fail 0`; `npx astro check` reports 0 errors, 0 warnings, 0 hints.

### Step 5: Look at it

Serve the build and take one screenshot to confirm the link is invisible until focused and that muted text is visibly darker:

```sh
(/opt/anaconda3/bin/python -m http.server 4331 --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1280,900 --screenshot=/tmp/plan001.png http://127.0.0.1:4331/people/
```

Open `/tmp/plan001.png`. Expected: no "Skip to content" text visible anywhere; the role lines under each name (for example "Principal Investigator") are a medium-dark grey. Stop the server afterwards (`pkill -f "http.server 4331"`).

## Test plan

No new automated tests: this repo's tests cover the `*-model.ts` rule modules only, and this change is CSS and one HTML line. The grep checks in step 3 and the contrast script in step 1 are the regression checks.

## Done criteria

- [ ] `grep -n "8a8a8a" -r src` returns nothing; `grep -n "muted: #6b6b6b" src/styles/global.css` returns one line
- [ ] Contrast script prints two numbers, both >= 4.5
- [ ] `grep -c 'class="skip-link"' dist/index.html` prints `1` after `npm run build`
- [ ] `npm test` passes 26 tests; `npx astro check` reports 0 errors
- [ ] `git status --short` lists only `src/styles/global.css` and `src/layouts/BaseLayout.astro` (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `global.css` line 5 is not `--muted: #8a8a8a;`, or `BaseLayout.astro` has no bare `<main>` tag (the code has drifted).
- A `.skip-link` rule or a `<main id=...>` already exists.
- The screenshot in step 5 shows the skip link visible without focus.
- A verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Any new text color should be checked against 4.5:1 on white with the script in step 1 before it is added to `:root`.
- If the header ever stops being the first thing in `<body>`, keep the skip link first.
- Reviewer: check the link appears on first Tab press in a real browser and that pressing Enter moves focus past the nav.
