# Plan 004: The header fits on one tidy block on phones and the search hint is not cut off

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan
> in `plans/README.md` - unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d24e562..HEAD -- src/layouts/BaseLayout.astro src/pages/publications.astro`
> Plans 001 and 003 are expected to have changed `BaseLayout.astro` (a skip
> link, `id="main"`, and `<head>` tags). Those do not affect this plan. If the
> `<style>` block rules quoted under "Current state" differ, treat it as a
> STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001, 002, 003 landed first (same file; run in order)
- **Category**: bug (UI polish)
- **Planned at**: commit `d24e562`, 2026-11-14

## Why this matters

On a phone (390px wide), the five navigation links do not fit on one line, so "Contact" drops alone onto a second line under "Home". Together with the 100px-tall logo, the black header takes about 177px, roughly a fifth of the screen, before any content. On the Publications page, the search box hint "Search by title, author, journal or year" is cut off mid-word ("...journal or ye"). Both make the site look unfinished on the device most prospective students will first open it on.

## Current state

`src/layouts/BaseLayout.astro`, inside its `<style>` block (line numbers as of `d24e562`):

```css
  .header-inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-1) var(--space-3);
    padding-block: var(--space-2);
  }

  .wordmark {
    display: inline-flex;
  }

  /* Tall enough for the NMR peaks above the lettering to read as contour rings. */
  .wordmark-lab {
    height: 6.25rem;
    width: auto;
  }

  nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  nav a {
    color: var(--text);
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    padding-block: 0.25rem;
    border-bottom: 2px solid transparent;
  }
```

`src/pages/publications.astro:17-21`:

```astro
      <div class="search" hidden>
        <label for="pub-search" class="visually-hidden">Search publications</label>
        <input id="pub-search" type="search" placeholder="Search by title, author, journal or year" />
        <p id="pub-status" role="status" aria-live="polite"></p>
      </div>
```

Facts measured at planning time:

- The page container has `padding-inline: var(--space-3)` (1.5rem = 24px each side), so at a 390px screen the header content is 342px wide, and at 360px it is 312px.
- At `font-size: 0.95rem` the five labels (Home, Research, People, Publications, Contact) total about 327px of text, so they cannot fit in 342px with any usable gap.
- The logo image is 289x100 CSS px at the current height.
- The other breakpoints in this repo are written in rem as `@media (min-width: 48rem)` and `(min-width: 60rem)`.

Conventions to match:

- Spacing uses the tokens `--space-1` (0.5rem) to `--space-6`; avoid new hard-coded pixel values.
- CSS comments are short plain-English sentences explaining why.
- Never use the em dash character; use a plain hyphen.

## Commands you will need

Prefix every command with `export PATH=/opt/homebrew/bin:$PATH;` and run from the repo root.

| Purpose   | Command           | Expected on success |
|-----------|-------------------|---------------------|
| Tests     | `npm test`        | `pass 26`, `fail 0` |
| Typecheck | `npx astro check` | `0 errors`, `0 warnings`, `0 hints` |
| Build     | `npm run build`   | ends with `[build] Complete!` |

### Phone-width screenshots (read this before taking any)

Headless Chrome on macOS cannot make a window narrower than about 500px. A screenshot taken with `--window-size=390,...` is laid out at about 500px and cropped, which looks like content running off the right edge. It is not a real bug. Always measure phone layouts through an iframe of the exact width:

```sh
(/opt/anaconda3/bin/python -m http.server 4331 --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &)
shot() {  # usage: shot <width> <page-path> <output-name>
  printf '<!doctype html><body style="margin:0;background:#888"><iframe src="http://127.0.0.1:4331/%s" style="border:0;width:%spx;height:1200px;background:#fff"></iframe></body>' "$2" "$1" > /tmp/frame-$3.html
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --force-device-scale-factor=2 --window-size=700,1200 --virtual-time-budget=5000 --screenshot=/tmp/$3.png "file:///tmp/frame-$3.html" >/dev/null 2>&1
}
```

The page is the white column on the left of each image; the grey area to its right is the harness. Do not name a shell variable `path` in zsh: it overwrites `PATH`. Stop the server when finished: `pkill -f "http.server 4331"`.

## Scope

**In scope**:
- `src/layouts/BaseLayout.astro` (the `<style>` block only)
- `src/pages/publications.astro` (the `placeholder` attribute on line 19 only)

**Out of scope**:
- A hamburger menu or any JavaScript. Five links must stay visible.
- The desktop header (anything at 480px and wider must look exactly as before).
- The logo image file and the `<Image>` props (`height={100}`, `densities`).
- The search script in `publications.astro`.

## Git workflow

- Branch: `improve/004-phone-header-and-search`.
- One commit, e.g. `Tidy the header and the search hint on phones`. No `Co-Authored-By` line. Do NOT push unless instructed.

## Steps

### Step 1: Capture the "before" images

Run `npm run build`, start the server and define `shot` as above, then:

```sh
shot 390 "" before-390; shot 360 "" before-360
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1280,400 --screenshot=/tmp/before-1280.png http://127.0.0.1:4331/
```

**Verify**: `/tmp/before-390.png` shows "Contact" alone on a second nav line. If it does not, STOP (the problem is already fixed or the harness is wrong).

### Step 2: Add the narrow-screen header rules

In the `<style>` block of `src/layouts/BaseLayout.astro`, directly after the `nav a[aria-current='page'] { ... }` rule, add:

```css
  /* Phones: a smaller logo, and the five links spread across one line instead of wrapping. */
  @media (max-width: 30rem) {
    .wordmark-lab {
      height: 4.5rem;
    }

    nav {
      width: 100%;
    }

    nav ul {
      flex-wrap: nowrap;
      justify-content: space-between;
      gap: 0;
    }

    nav a {
      display: block;
      font-size: 0.8125rem;
      padding-block: var(--space-1);
    }
  }
```

**Verify**: `npm run build`, then `shot 390 "" after-390; shot 360 "" after-360; shot 320 "" after-320`. Open all three and confirm every item below:

1. All five links are on one line, none clipped, none touching its neighbor.
2. "Home" starts at the same left edge as the logo; "Contact" ends at the right page margin.
3. The gold underline shows under "Home".
4. No horizontal scrolling: the white column is exactly the iframe width with nothing cut off at its right edge.
5. The black header is shorter than in `before-390.png`.

If links touch or clip at 320px only, lower `font-size` to `0.75rem` inside a nested `@media (max-width: 21rem)` and re-check. If they clip at 360px or 390px, STOP.

### Step 3: Shorten the search hint

In `src/pages/publications.astro` line 19, change the attribute to `placeholder="Title, author, journal, year"`. Leave the visually hidden label "Search publications" as is; it is what screen readers announce.

**Verify**: `npm run build`, then `shot 360 publications/ pubs-360; shot 390 publications/ pubs-390`. In both, the full hint "Title, author, journal, year" is readable inside the box with space after it.

### Step 4: Confirm desktop is unchanged

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1280,400 --screenshot=/tmp/after-1280.png http://127.0.0.1:4331/
cmp /tmp/before-1280.png /tmp/after-1280.png && echo IDENTICAL
```

**Verify**: prints `IDENTICAL`. If it differs, open both; any visible difference in the header is a failure.

### Step 5: Run the gates

**Verify**: `npm test` reports `pass 26`; `npx astro check` reports 0 errors, 0 warnings, 0 hints. Stop the server.

## Test plan

No unit tests (CSS and one attribute). The screenshots in steps 2 to 4 are the checks; keep `/tmp/after-390.png`, `/tmp/after-360.png` and `/tmp/pubs-360.png` and attach or reference them in your report.

## Done criteria

- [ ] `grep -c "max-width: 30rem" src/layouts/BaseLayout.astro` prints `1`
- [ ] `grep -c 'placeholder="Title, author, journal, year"' src/pages/publications.astro` prints `1`
- [ ] `cmp /tmp/before-1280.png /tmp/after-1280.png` reports no difference
- [ ] The five checks in step 2 hold at 390px and 360px
- [ ] `npm test` passes; `npx astro check` reports 0 errors
- [ ] `git status --short` lists only the two in-scope files (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- The quoted CSS rules are not in `BaseLayout.astro` (drift), or a `max-width` media query already exists there.
- After step 2 the links still wrap or clip at 360px or 390px.
- The desktop screenshot changes.
- You find yourself wanting to add JavaScript or change the HTML structure of the header.

## Maintenance notes

- The one-line phone nav holds five short labels. Adding a sixth link, or renaming one to something longer than "Publications", will overflow at 360px; re-run the step 2 screenshots whenever the `nav` list in `BaseLayout.astro` changes.
- If the font changes from Montserrat (see the note in `astro.config.mjs` about Proxima Nova), label widths change; re-check the phone header.
- Reviewer: check on a real phone, since the links are about 38px tall and close together.
