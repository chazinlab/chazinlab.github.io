# Plan 006: The GitHub Actions workflows use action versions that run on Node 24

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report - do not improvise. When done, update the status row for this plan
> in `plans/README.md` - unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d24e562..HEAD -- .github/workflows`
> If either workflow changed, compare the "Current state" excerpts against the
> live files before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: migration (CI)
- **Planned at**: commit `d24e562`, 2026-11-14

## Why this matters

The deploy workflow's log prints this warning on every run: "Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/deploy-pages@v4". GitHub is forcing the old action onto a newer runtime it was not built for, and will eventually stop running it. Newer major versions of each action that declare the Node 24 runtime already exist, so this is a version bump in two YAML files.

## Current state

Two workflow files, both in `.github/workflows/`:

`deploy.yml` (builds and publishes the site), the lines that reference actions:

```yaml
      - uses: actions/checkout@v5
        with:
          ref: main
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npx astro check
      - run: npm run build
      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist
```

```yaml
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`refresh-publications.yml` (monthly PubMed refresh):

```yaml
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
```

Latest releases, checked on 2026-11-14 with `gh api repos/<owner>/<repo>/releases/latest` and each action's `action.yml`:

| Action | In use | Latest | Runtime declared by latest |
|---|---|---|---|
| `actions/deploy-pages` | v4 | v5.0.1 | `node24` |
| `actions/upload-pages-artifact` | v4 | v5.0.0 | `composite` (no Node runtime of its own) |
| `actions/checkout` | v5 | v7.0.1 | `node24` |
| `actions/setup-node` | v5 | v7.1.0 | `node24` |

Important background: **the deploy job is currently failing for a reason unrelated to this plan.** The repository was made private and GitHub Pages is switched off, so `actions/deploy-pages` fails with "Ensure GitHub Pages has been enabled". That is a repository setting only the owner can change. Do not try to fix it, and do not treat that failure as caused by your change.

## Commands you will need

Prefix with `export PATH=/opt/homebrew/bin:$PATH;` and run from the repo root.

| Purpose | Command | Expected on success |
|---|---|---|
| Re-check a latest version | `gh api repos/actions/deploy-pages/releases/latest --jq .tag_name` | a tag such as `v5.0.1` |
| Check a version's runtime | `gh api "repos/actions/deploy-pages/contents/action.yml?ref=v5" --jq .content \| base64 -d \| grep "using:"` | `using: 'node24'` |
| Parse the YAML | `/opt/anaconda3/bin/python -c "import yaml,sys; [yaml.safe_load(open(f)) for f in sys.argv[1:]]; print('OK')" .github/workflows/deploy.yml .github/workflows/refresh-publications.yml` | `OK` |

## Scope

**In scope**:
- `.github/workflows/deploy.yml`
- `.github/workflows/refresh-publications.yml`

Only the version suffix after `@` on `uses:` lines may change.

**Out of scope**:
- `node-version: 24`, triggers, permissions, concurrency, step order, the `run:` steps.
- Repository settings (visibility, Pages).
- Pinning actions to commit SHAs. The repo uses major-version tags; keep that style.

## Git workflow

- Branch: `improve/006-actions-node24`.
- One commit, e.g. `Move the workflows to action versions that run on Node 24`. No `Co-Authored-By` line. Do NOT push unless instructed.

## Steps

### Step 1: Read the release notes for breaking changes

For each of the four actions, read the notes of every major release between the version in use and the target (deploy-pages v5; upload-pages-artifact v5; checkout v6 and v7; setup-node v6 and v7):

```sh
gh release view v5.0.0 --repo actions/deploy-pages
gh release list --repo actions/checkout --limit 15
```

You are checking for two things only: (a) an input this repo uses was renamed or removed (`ref` on checkout; `node-version` and `cache` on setup-node; `path` on upload-pages-artifact), and (b) `deploy-pages` v5 requires a specific `upload-pages-artifact` major.

**Verify**: write one line per action in your report: "no change to inputs used here" or the specific change found. Any finding under (a) is a STOP condition.

### Step 2: Confirm the targets still exist and declare Node 24

Run the "Check a version's runtime" command for `actions/deploy-pages` at `v5`, `actions/checkout` at `v7` and `actions/setup-node` at `v7`.

**Verify**: each prints a `using:` line containing `node24`.

### Step 3: Bump the versions

- `deploy.yml`: `actions/checkout@v5` to `@v7`; `actions/setup-node@v5` to `@v7`; `actions/upload-pages-artifact@v4` to `@v5`; `actions/deploy-pages@v4` to `@v5`.
- `refresh-publications.yml`: `actions/checkout@v5` to `@v7`; `actions/setup-node@v5` to `@v7`.

**Verify**:

```sh
grep -n "uses:" .github/workflows/*.yml
git diff --stat
```

Expected: the six `uses:` lines show `checkout@v7` (twice), `setup-node@v7` (twice), `upload-pages-artifact@v5`, `deploy-pages@v5`; the diff touches exactly 6 lines across the two files. Then run the "Parse the YAML" command and expect `OK`.

## Test plan

Workflows cannot be run locally. Real verification happens on GitHub after the branch is merged:

- The **build** job of "Deploy site" must pass and its log must no longer contain "Node.js 20 is deprecated".
- The **deploy** job passes only if GitHub Pages has been re-enabled by the owner. If it still fails with "Ensure GitHub Pages has been enabled", that is the pre-existing settings problem, not this change.

State this clearly in your report so the reviewer knows what remains to be checked.

## Done criteria

- [ ] `grep -c "@v4" .github/workflows/deploy.yml` prints `0`
- [ ] `grep -c "@v5" .github/workflows/refresh-publications.yml` prints `0`
- [ ] `grep -c "deploy-pages@v5" .github/workflows/deploy.yml` prints `1`
- [ ] Both files parse as YAML
- [ ] `git diff --stat` shows only the two workflow files, 6 changed lines in total (plus `plans/README.md`)
- [ ] `plans/README.md` status row updated, with a note that the on-GitHub check is pending

## STOP conditions

- A target major version no longer exists, or its `action.yml` does not declare `node24` (or `composite`).
- Release notes show that an input used in these workflows was renamed or removed.
- `gh` is not authenticated or cannot reach the API: do not guess versions from memory; report.
- You are asked, or tempted, to change repository visibility or Pages settings.

## Maintenance notes

- GitHub retires action runtimes roughly every two years. The warning to watch for in run logs is "Node.js NN is deprecated".
- If plan 007 (Prettier check) has not landed yet, it will add one `run:` step to `deploy.yml`; it does not conflict with these lines.
- Reviewer: after merge, open the latest "Deploy site" run and search its log for "deprecated".
