# Chazin Lab Website — Project Brief

Decisions agreed during planning (November 2026). Change this file if a decision changes.

## The lab
- **Chazin Lab** · PI: Walter Chazin · Department of Biochemistry, Vanderbilt University
- Research: genome maintenance and innate immunity
- **Primary audience:** prospective graduate students and postdocs
- Built by a lab member; the PI approves before anything goes live

## How it's built
- Astro static site; all editable content in Markdown files under `src/content/` (vocabulary in `GLOSSARY.md`)
- Built **from scratch** — nothing reused from the old lab websites
- Placeholder text is marked `[Placeholder]`; missing figures show as grey boxes
- **Local only for now.** Later: GitHub organization `chazinlab`, owned by the builder + PI, hosted free at `chazinlab.github.io`
- Non-technical lab members update content by editing files on GitHub — see `HOW_TO_UPDATE.md`

## Pages
| Page | Content |
|---|---|
| Home | Lab name, one-sentence mission, large figure, research-theme cards, 5 publications ("Recent" until the PI picks "Featured") |
| Research | Two themes (Genome Maintenance, Innate Immunity). Each project: title → figure + caption → 1–2 paragraphs → 2–3 key papers |
| People | Current members (photo, title, short bio, email), then a separate alumni list (name · role · years · where they are now). No individual profile pages |
| Publications | Fetched automatically from PubMed (`Chazin WJ[Author]`), refreshed monthly. Newest first, grouped by year, searchable. Chazin WJ in bold; PubMed / DOI / free full-text links |
| Contact | Address, PI email, directions link (no embedded map), "Joining the lab" paragraph. No contact form |

## Look
- White background, lots of whitespace, no Vanderbilt colors or logo, text wordmark "Chazin Lab"
- Font: **Montserrat** (free stand-in) → switch to **Proxima Nova** via Adobe Fonts if a license exists
- Body text grey `#555555`, headings `#333333`, links muted blue `#46698f`
- No dark mode; must work well on phones

## Open to-dos (not blocking)
- [ ] Check for an Adobe Creative Cloud license (Proxima Nova)
- [ ] Email Vanderbilt IT to confirm an independent site is okay before going live
- [ ] Gather real text, figures, headshots, alumni list
- [ ] PI chooses ~5 Featured Publications (`featuredPapers` in `src/content/pages/home.md`)
