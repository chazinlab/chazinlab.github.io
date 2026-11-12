# How to update the lab website

You don't need to know how to code. Everything you'll change is plain text in the `src/content/` folder.

> **Where things are:** the code lives at https://github.com/chazinlab/chazinlab.github.io and the live site is https://chazinlab.github.io.

## The basics: editing a file on GitHub

1. Go to the website's repository on GitHub and open the file you want to change.
2. Click the **pencil icon** (Edit this file).
3. Make your change.
4. Click **Commit changes…**, write a short note such as "Update Jane's bio", and confirm.

The website rebuilds itself within a few minutes. If something is wrong with the file, the old version of the site stays up, and GitHub shows a red ✗ next to your change. Click it to see which file and line need fixing.

## How content files are laid out

Each person and project is one `.md` file. The part between the two `---` lines holds **settings**; the text below them is what appears on the page:

```markdown
---
name: Jane Doe
role: Graduate Student
---

Jane studies how proteins repair damaged DNA. Outside the lab she plays the cello.
```

- Lines starting with `#` inside the settings are notes. They're ignored, so you can "switch on" a setting by deleting the `#`.
- If a value contains a colon (`:`), wrap it in quotes: `nowAt: 'Scientist: Structural Biology, Genentech'`.
- Anything marked `[Placeholder]` still needs real text.

## Common tasks

### Add a new lab member
1. Open `src/content/people/current/` and copy any existing file. Name the copy after the person, for example `jane-doe.md`.
2. Change `name` and `role`. Then write their bio below the `---`.
   - The page places people by `role` automatically, and sorts people with the same role by last name, so there is nothing to renumber.
   - `role` must match one of the roles listed in `src/content/people/roles.ts` exactly, including capital letters. To use a new role, or to change which roles come first, edit the list in that file.
3. **Photo (optional):** upload a square headshot to `src/content/people/current/photos/` (for example `jane-doe.jpg`), then add the line `photo: ./photos/jane-doe.jpg` to the settings.
4. **Email (optional):** add `email: jane.doe@vanderbilt.edu`.

### When someone leaves the lab
1. Create a new file in `src/content/people/alumni/` with this content:
   ```markdown
   ---
   name: Jane Doe
   role: Graduate Student
   from: 2021
   to: 2026
   nowAt: 'Postdoctoral Fellow, Stanford University'
   ---
   ```
   `from` and `to` are the years they joined and left. The People page shows them as "2021–2026", most recent first.
2. Delete their file (and photo) from `src/content/people/current/`.

### Add or edit a research project
- Projects live in `src/content/research/`, one file per project.
- `theme` is the file name of a theme in `src/content/themes/`, without `.md`, for example `genome-maintenance`.
- `order` sets the project's position within its theme.
- **Figure:** upload the image to `src/content/research/figures/`, then set `figure: ./figures/your-image.png`. Always write a `caption` that describes the image.
- **Key papers:** list PubMed IDs (the number at the end of a PubMed link), for example `keyPapers: [38500596, 38466836]`. The paper must already be on the Publications page.

### Edit or add a research theme
Themes live in `src/content/themes/`, one file per theme. Change `name` or the summary text below the `---`. To add a theme, copy an existing theme file and give it a new file name (for example `metal-homeostasis.md`). Projects then use that file name as their `theme`. `order` sets the theme's position on the Home and Research pages.

### Change the home page text or figure
Edit `src/content/pages/home.md`. The sentence below the `---` is the mission statement. To add the figure, upload the image to `src/content/pages/` and set `figure: ./your-image.png`. Always keep a `caption` that describes the image.

### Feature papers on the home page
In `src/content/pages/home.md`, list PubMed IDs: `featuredPapers: [38500596, 38466836]`. Leave it as `[]` to show the five most recent papers instead.

### Change the address, email, directions link or "Joining the lab" text
Edit `src/content/pages/contact.md`. The settings at the top hold the email, the address (one line per `-`) and the directions link. The text below the `---` is the "Joining the lab" section. The address also appears in the footer of every page.

## Publications

The publication list comes from PubMed automatically: every paper matching `Chazin WJ[Author]`, not counting errata and preprints. **Don't edit `src/data/publications.json` by hand.** It gets replaced every time the list refreshes.

- New papers usually show up within a month.
- To refresh right away, someone with the code on their computer runs `npm run publications`.
- If a paper by a different "Chazin WJ" ever shows up, ask whoever maintains the site to adjust the PubMed search in `src/site.config.ts`.

## Getting help

If a change breaks the build and you can't tell why, undo it: on GitHub, open the file's **History**, open the previous version, and copy its text back.
