# Plan 005: The editor guide tells lab members what size of image to upload

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan
> in `plans/README.md` - unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d24e562..HEAD -- HOW_TO_UPDATE.md`
> If the file changed, compare the "Current state" excerpts against the live
> text before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `d24e562`, 2026-11-14

## Why this matters

Lab members add photos and figures by uploading them on GitHub's website, following `HOW_TO_UPDATE.md`. The guide says nothing about image size, so people upload files straight from a camera: one headshot in the repo is 8.4 MB at 6000x4000 pixels, the group photo is 4.3 MB. Visitors are not affected, because the build converts every image to small web-sized files. The cost is in the repository: git keeps every uploaded original forever, and the `.git` folder reached 18 MB within two days of the first uploads. The opposite problem also exists: one headshot is only 200x229 pixels, which is smaller than the frame it is shown in on high-resolution screens, so it looks soft. A few sentences of guidance prevent both.

## Current state

`HOW_TO_UPDATE.md` is the plain-language guide for lab members who do not code. The three places that mention uploading an image:

Line 40 (inside "Add a new lab member"):

```markdown
3. **Photo (optional):** upload a head-and-shoulders photo, upright (taller than wide), to `src/content/people/current/photos/` (for example `jane-doe.jpg`), then add the line `photo: ./photos/jane-doe.jpg` to the settings.
```

Line 59 (inside "Add or edit a research project"):

```markdown
- **Figure:** upload the image to `src/content/research/figures/`, then set `figure: ./figures/your-image.png`. Always write a `caption` that describes the image.
```

Line 66 (under "Change the home page text or figure"):

```markdown
Edit `src/content/pages/home.md`. The sentence below the `---` is the mission statement. To add the figure, upload the image to `src/content/pages/` and set `figure: ./your-image.png`. Always keep a `caption` that describes the image.
```

The section just before `## Publications` (line 74) is `### Change the address, email, directions link or "Joining the lab" text` (lines 71-72).

Facts that set the numbers below:

- Headshots are shown in a 4:5 upright frame, 160 CSS pixels wide, and the build produces a 400x500 version (`src/components/PersonCard.astro:16`). A source photo should therefore be at least 400x500; 800x1000 leaves room for sharper screens.
- Figures are shown at most 1152 pixels wide and the build produces versions up to 1600 pixels wide (`src/components/Figure.astro:21`).

Writing style to match (this matters as much as the content):

- Second person, short sentences, no jargon. The reader has never used git.
- Bold lead-ins such as `**Photo (optional):**`; file paths and settings in backticks.
- Never use the em dash character; use a plain hyphen or rewrite the sentence.

## Commands you will need

None beyond `git`. No build or test is affected by a Markdown doc outside `src/`.

## Scope

**In scope**:
- `HOW_TO_UPDATE.md`

**Out of scope** (do NOT touch):
- Every image file under `src/content/`. Do not resize, re-encode, replace or delete any of them, including the oversized and undersized ones. Replacing a person's photo is the lab's decision.
- `README.md`, `GLOSSARY.md`, `src/content.config.ts`. Do not add build-time size checks; a failing build would block non-technical editors.
- Rewriting git history to remove large files.

## Git workflow

- Branch: `improve/005-image-upload-guidance`.
- One commit, e.g. `Explain what size of photo or figure to upload`. No `Co-Authored-By` line. Do NOT push unless instructed.

## Steps

### Step 1: Add an "Image sizes" section

Insert this new section directly above the line `## Publications`:

```markdown
### Image sizes

The website shrinks every image for visitors automatically, but the file you upload is kept in the project's history forever, so please don't upload straight from a camera or phone.

- **Headshots:** about 800 x 1000 pixels (upright), and no smaller than 400 x 500. Under 500 KB.
- **Figures and the home page photo:** about 1600 pixels wide. Under 1 MB.
- Use `.jpg` for photos and `.png` for diagrams with text or sharp lines.

To shrink an image on a Mac, open it in Preview, choose **Tools > Adjust Size…**, set the width or height, and save. On Windows, open it in Photos and choose **Resize image**.
```

### Step 2: Point the three upload instructions at it

Make these three edits, changing nothing else on those lines:

- Line 40: after `upright (taller than wide),` insert ` about 800 x 1000 pixels (see [Image sizes](#image-sizes)),`.
- Line 59: after `Always write a `caption` that describes the image.` append ` See [Image sizes](#image-sizes) before uploading.`
- Line 66: after `Always keep a `caption` that describes the image.` append ` See [Image sizes](#image-sizes) before uploading.`

**Verify**:

```sh
grep -c "(#image-sizes)" HOW_TO_UPDATE.md
grep -n "^### Image sizes" HOW_TO_UPDATE.md
grep -c "$(printf '\342\200\224')" HOW_TO_UPDATE.md
git diff --stat
```

Expected: `3`; one match that appears before the `## Publications` line; `0` (that third command counts em dash characters, which must not appear); and only `HOW_TO_UPDATE.md` changed.

### Step 3: Report what the guide cannot fix

In your final report (not in any file), list these existing files so the lab can decide what to do with them:

- `src/content/people/current/photos/patrick-ginther.jpg` is 200x229: below the 400x500 minimum, a larger original is needed.
- `src/content/people/current/photos/zoey-hao.jpg` is 8.4 MB at 6000x4000 and is landscape, not upright.
- `src/content/pages/lab-photo-2025.jpg` is 4.3 MB; `src/content/people/current/photos/joshua-huang.jpg` is 1.4 MB.

## Test plan

None. This is a documentation change.

## Done criteria

- [ ] `grep -c "(#image-sizes)" HOW_TO_UPDATE.md` prints `3`
- [ ] `grep -c "^### Image sizes" HOW_TO_UPDATE.md` prints `1`
- [ ] `git status --short` lists only `HOW_TO_UPDATE.md` (plus `plans/README.md`)
- [ ] `git diff --stat -- src` is empty
- [ ] `plans/README.md` status row updated

## STOP conditions

- The three quoted lines are not found in `HOW_TO_UPDATE.md` (the guide has been rewritten).
- An image-size section already exists.
- You are about to modify, move or delete any image file.

## Maintenance notes

- If the headshot frame in `src/components/PersonCard.astro` or the widths in `src/components/Figure.astro` change, update the pixel numbers in the "Image sizes" section to match.
- Deferred on purpose: shrinking the existing oversized originals. It would shrink the working tree but not the git history, and replacing people's photos needs their say.
