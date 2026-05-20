---
name: pr-create
description: Analyze the current branch and create a pull request with a generated title and body
---

Create a pull request for the current branch against the base branch: **$ARGUMENTS** (default to `develop` if no argument provided).

## Your workflow

### Phase 0 — Release Management

Before opening the PR, run a SemVer release analysis and prepare a version bump commit.

#### Step 0-A: Find last tag
```
git describe --tags --abbrev=0
```
Store the result as `<last_tag>` (e.g. `v0.1.3`).

#### Step 0-B: Collect commits since last tag
```
git log <last_tag>..HEAD --no-merges --format="%H %s"
```
For each commit hash, also retrieve the body to check for breaking changes:
```
git show <hash> --format="%b" -s
```
> **Note:** This is intentionally tag-to-HEAD, not branch-to-HEAD. On a feature branch, it will include commits from earlier branches that share the same tag ancestor but haven't been released yet. This is the correct behavior — the bump type should reflect all unreleased work, not just the current branch.

If there are **no commits** since the last tag, skip Phase 0 entirely and jump straight to Step 1.

#### Step 0-C: Determine bump type

Apply these rules in priority order (highest wins):

1. **major** — subject contains `!` after the type token (e.g. `feat!:`, `fix(scope)!:`) OR body contains `BREAKING CHANGE:`
2. **minor** — subject starts with `feat:` or `feat(`
3. **patch** — everything else (`fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `test:`, `perf:`, `ci:`, commits without a conventional prefix)

Present the analysis to the user and wait for confirmation before continuing:

```
Release analysis:
  Suggested bump: MINOR — v0.1.3 → v0.1.4

  Commits since v0.1.3:
    feat(skills): add release-management skill   [minor]
    fix(watchdog): fix pagination edge case      [patch]

Proceed with MINOR bump? (yes / major / minor / patch to override)
```

If the user types `major`, `minor`, or `patch`, use that override instead.

#### Step 0-D: Compute new version
```
node -p "require('./package.json').version"
```
Split the result on `.` into `[major, minor, patch]` integers. Apply the bump:
- `major` — increment major, reset minor and patch to 0
- `minor` — increment minor, reset patch to 0
- `patch` — increment patch only

New version string: `X.Y.Z` (no `v` prefix in `package.json`).

#### Step 0-E: Update `package.json`
Use the **Read** tool to read `package.json`, then the **Edit** tool to replace `"version": "<old>"` with `"version": "<new>"`.

Do **NOT** use `npm version` — it creates its own commit and tag.

Verify with:
```
node -p "require('./package.json').version"
```

#### Step 0-F: Update `app/changelog/page.tsx`
Use the **Read** tool to read the file. Group the commits into sections by prefix:

| Prefix(es) | Section header |
|---|---|
| `feat:` / `feat(!):` | ✨ New Features |
| `fix:` | 🐛 Bug Fixes |
| `refactor:` / `perf:` | ⚡ Improvements |
| `chore:` / `ci:` | 🔧 Technical Changes |
| `docs:` / `style:` | 📝 Other Changes |
| `BREAKING CHANGE` in body | 💥 Breaking Changes |

Omit any section with no commits. Format today's date as "Month DD, YYYY".

Use the **Edit** tool to insert a new JSX block immediately after:
```tsx
          <div className="space-y-12">
```

Follow the exact JSX structure of the existing `v0.1.0` entry:
- Outer `<div className="border-l-2 border-violet-600 pl-6">`
- Version badge (`bg-violet-50 text-violet-700 border-violet-200`) + date span
- `<h2 className="text-2xl font-semibold text-gray-900 mb-4">Release vX.Y.Z</h2>`
- `<div className="space-y-4 text-gray-500">` containing one `<div>` per section
- Each section: `<h3>` with emoji + title, `<ul className="list-disc list-inside space-y-1 ml-2">` with one `<li>` per commit subject (strip the conventional prefix, e.g. `feat(skills): ` → just the description)

#### Step 0-G: Stage and commit
```
git add package.json app/changelog/page.tsx
git commit -m "chore: bump version to X.Y.Z"
```

#### Step 0-H: Tag and push the tag
Create an annotated tag on the version bump commit:
```
git tag -a vX.Y.Z -m "Release vX.Y.Z"
```
Then push the tag to the remote:
```
git push origin vX.Y.Z
```
Confirm to the user: `Tagged and pushed vX.Y.Z`.

---

### Phase 1 — Create the pull request

Run each of these steps using the Bash tool:

1. **Get current branch**
   ```
   git branch --show-current
   ```

2. **Get commit log** (understand what was worked on)
   ```
   git log <base>..HEAD --oneline --no-merges
   ```

3. **Get diff stat** (see which files changed)
   ```
   git diff <base>...HEAD --stat
   ```

4. **Get the full diff** (understand the code changes)
   ```
   git diff <base>...HEAD
   ```
   If the diff is very large, read individual files with the Read tool for key areas.

5. **Create the pull request** (use the version-bumped branch — Phase 0 already committed the bump)
   ```
   gh pr create --title "<title>" --body "<body>" --base <base>
   ```

## PR title rules

- Use conventional commit format: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`, `docs:`, `test:`
- Keep under 70 characters
- Be specific — not generic like "update files" or "make changes"

## PR body format

```markdown
## Summary
- Bullet points describing what changed and why

## Changes
- Technical details if the summary needs elaboration (omit if redundant)

## Test plan
- [ ] Item to verify manually
- [ ] Another item
```

## Project context

- **Stack:** Next.js (App Router) + React + TypeScript, Tailwind CSS + shadcn/ui, Supabase
- **Main branch:** `wordpress-plugin`
- **API routes** live in `app/api/` — serverless Next.js functions
- **Client components** use `"use client"`
- **UI primitives** live in `components/ui/` (shadcn/ui)

After creating the PR, output the PR URL.
