# Refactoring Specs — marceloprates.github.io

## Status: ALL COMPLETE ✅

All 7 specs completed in the `refactor-portfolio` Ralph loop (2026-05-20).

Commit: `7570342` — "refactor: complete SPEC.md — 7 specs done"

---

## SPEC-01: Delete dead `lib/content.ts`

### Problem

Two files serve the same purpose (reading `content/` directory with `gray-matter`):

- `lib/content.ts` — only has post functions, never imported
- `src/lib/content.ts` — has posts + projects, used throughout

### Action

Delete `lib/content.ts`. Verify no imports exist first.

### Verification

`grep -r "from.*lib/content\|from.*'lib/content\|from.*\"lib/content" . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs'` returns zero matches.

---

## SPEC-02: Delete stale `generate-github-pages.*` scripts

### Problem

Four files with near-identical names, only one is used in the build:

- `scripts/generate-github-pages-simple.mjs` — **ACTIVE** (called in `package.json` build script)
- `scripts/generate-github-pages.js` — dead (29L)
- `scripts/generate-github-pages.mjs` — dead (29L)
- `scripts/generate-github-pages.mts` — dead (41L)

### Action

Delete the three stub files. Keep `generate-github-pages-simple.mjs`.

### Verification

`ls scripts/generate-github-pages*.{js,mjs,mts}` returns only `generate-github-pages-simple.mjs`. `npm run build` succeeds.

---

## SPEC-03: Delete dead `config/next.config.ts`

### Problem

Dual Next.js config files:

- `next.config.js` — **ACTIVE** (referenced by `package.json`)
- `config/next.config.ts` — never used

### Action

Delete `config/next.config.ts`. Verify `config/next.config.js` (if it exists and is used) stays.

### Verification

`cat next.config.js` still exists and references no imports from `config/next.config.ts`. Build succeeds.

---

## SPEC-04: Audit `src/data/projects.json`

### Problem

Two project data sources with different content:

- `src/data/projects.ts` — imported as `rawProjects` in `page.tsx` (manual curated list)
- `src/data/projects.json` — unknown origin, possibly stale generated output

### Action

Read both files. Determine which is source-of-truth for what. Delete or consolidate. At minimum: document the purpose of `projects.json` in its header comment or delete it if it is a stale artifact.

### Verification

`projects.json` either has a clarifying header comment, or does not exist. No code silently reads it.

---

## SPEC-05: Extract LaTeX parsing from `page.tsx` → `src/lib/latex-parser.ts`

### Problem

`page.tsx` (686 lines) contains two large inline functions that belong in a dedicated module:

- `convertLatexToMarkdown()` (~70 lines of regex)
- `parseSkillsFromLatex()` (~50 lines of regex)

These are pure-ish transformations with no Next.js dependencies — they belong in `src/lib/`.

### Solution

Extract both functions into `src/lib/latex-parser.ts` as named exports. Replace inline definitions in `page.tsx` with imports. Add basic unit tests in `src/lib/__tests__/latex-parser.test.ts`.

### Verification

- `src/lib/latex-parser.ts` exists with `convertLatexToMarkdown` and `parseSkillsFromLatex` as named exports
- `page.tsx` imports from `@/lib/latex-parser`
- `npm run lint && npm run build` succeeds
- LaTeX → Markdown output is visually identical (spot-check resume section)

---

## SPEC-06: Extract project enrichment from `page.tsx` → `src/lib/project-enricher.ts`

### Problem

`page.tsx` contains at-lines functions that fetch GitHub stats and gitstar-ranking at request time:

- `parseGithubRepo()`
- `fetchRepo()`
- `fetchGitstar()`

These network calls belong in a build-time script, not at request time. And as inline functions they are untestable.

### Solution

Extract into `src/lib/project-enricher.ts`. The functions remain available for the build pipeline. Add `GITHUB_TOKEN` env-var awareness consistent with the rest of the codebase.

### Verification

- `src/lib/project-enricher.ts` exists with exported `parseGithubRepo`, `fetchRepo`, `fetchGitstar`
- `page.tsx` imports from `@/lib/project-enricher`
- `npm run lint && npm run build` succeeds

---

## SPEC-07: Audit `src/lib/projects.ts` vs `src/lib/project-metadata.server.ts`

### Problem

Two project-adjacent library files — may be duplicating work.

### Solution

Read both files. If one is a subset of the other, delete the subset. If they do different things, add a header comment to each explaining its role.

### Verification

Each file has a clear header comment explaining its purpose, or one file is deleted.

---

## Non-Goals (do not tackle in this loop)

- `src/app/__tests__/` test wiring — separate task
- `tailwind.config.js` vs `config/tailwind` — keep as-is
- Font trimming in `public/fonts/` — separate task
- Three.js SSR pattern — separate task
- `content/publications/` vs `data/publications.scholar.json` — separate task
