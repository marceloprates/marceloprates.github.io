# marceloprates.github.io

Personal portfolio site, deployed at **marceloprates.github.io**.
Built with **Next.js 15** (App Router, TypeScript), **Tailwind CSS**,
and static export for GitHub Pages.

> Agent-specific guidance lives in **AGENTS.md** (local-only, gitignored).
> This file is for humans.

---

## Quick start

```bash
npm install              # First time only
npm run dev              # http://localhost:3000
npm run precommit        # lint + typecheck + image-validate + vitest
npm run build            # Full build → out/ ready for GitHub Pages
```

## Folder structure

```
src/                     # App code (App Router), components, lib, types, config
  app/                   # Routes (page.tsx is a composition root)
  components/            # Reusable primitives + sections/ composition
    sections/            # Home-page sections (Hero, About, Resume, ...)
  config/                # Zod-validated build-time config (site, sections)
  data/                  # Build-time JSON data (committed)
    resumes/             # ai.json, ai+ml.json, ds.json, ml.json
  lib/                   # Server + shared utilities
  types/                 # Shared TypeScript types
content/                 # Markdown content
  posts/, projects/, publications/, talks/
public/                  # Static assets served at site root
  images/                # All public images (migrated from top-level images/)
  resumes/               # Generated PDFs (gitignored, populated at build)
assets/                  # Bundled/static imports (`import img from '...'`)
scripts/                 # Build-time generators
  _variants.ts           # Resume variant inclusion list (NOT auto-discovery)
  generate-json-resume.ts    # LaTeX → JSON Resume
  generate-pdf-snapshots.ts  # LaTeX PDFs → public/resumes/
  generate-github-*.mjs      # GitHub API → project + pages JSONs
  fetch-scholar.js           # Google Scholar profile → scholar.json
  validate-content-images.js # All <img> srcs resolve to real files
  capture-baseline.mjs       # Playwright DOM snapshots for diff/audit
e2e/                     # Playwright e2e tests
__tests__/               # Vitest unit tests (rare; most tests live next to source)
```

## Images policy

- All publicly-referenced images live in `public/images/` and are
  referenced as `/images/...`.
- Markdown content uses absolute paths like `![](/images/misc/foo.png)`.
- Components using Next.js static imports can keep assets in `assets/`
  (bundled and hashed by Next.js).

## Deployment (GitHub Pages)

This project uses Next.js **static export** with:

- `output: 'export'`
- `trailingSlash: true`
- `images.unoptimized = true`
- `basePath: ''`, `assetPrefix: ''` (no path prefix; site is a root user-page)

The `build` script runs `generate:resume-assets` + `generate:github-data`
+ `next build`. The fully static output is written to `out/`, ready to
serve from `marceloprates.github.io` (deploy via `gh-pages` branch or
GitHub Actions).

## Conventions

- **Content** lives in `content/` as Markdown with frontmatter.
- **Images** are referenced as `/images/...` in content.
- **Config** (site metadata, section order) lives in `src/config/` and is
  validated by Zod 4 at build time. Invalid config fails the build.
- **Atomic commits**: one logical change per commit, conventional-commits
  prefix (`feat:`, `fix:`, `refactor:`, etc.). Every commit must pass
  `npm run precommit`.
- **Build artifacts**: `tsbuildinfo`, `.next`, `out`, `public/resumes/`,
  and `AGENTS.md` are all in `.gitignore`.

## Resume pipeline

The Resume section on the home page shows four ATS variants:

| Tab | Variant id | Source `.tex` |
|---|---|---|
| AI Engineer | `ai` | `ats__ai.tex` |
| AI/ML Engineer | `ai+ml` | `ats__ai+ml.tex` |
| Data Scientist | `ds` | `ats__ds.tex` |
| ML Engineer | `ml` | `ats__ml.tex` |

Each tab has its own PDF download button. Job-targeted variants (e.g.
`ai+huawei`, `ai+ml__applied-research-engineer`) exist in the LaTeX repo
but are intentionally excluded — see `scripts/_variants.ts` for the
inclusion list. Adding a variant is an explicit decision, not a
side-effect of the LaTeX tree.

The pipeline has two pieces, both wired into `npm run build`:

### 1. JSON data — committed
- Source of truth: a clone of the private `marceloprates/Resume` LaTeX
  repo at `~/projects/active/personal/resume` (set `RESUME_LOCAL_PATH` to
  override the auto-detect fallback in `src/lib/paths.ts`).
- Runs `scripts/generate-json-resume.ts`, which parses the LaTeX
  `\Exp*Title` macros into the JSON Resume schema.
- Output: `src/data/resumes/{ai,ai+ml,ds,ml}.json` — **committed to git**
  so the deployed site ships the latest content even if the LaTeX clone
  is not on the build host.
- Regenerate with `npm run generate:resumes` after editing the LaTeX.

### 2. PDF snapshots — gitignored
- Mirrored from the same LaTeX clone's `output/latest/` directory into
  `public/resumes/{ai,ai+ml,ds,ml}.pdf`.
- **Gitignored** (build artifacts) and served as static assets by
  Next.js's static export.
- Regenerate with `npm run generate:resume-pdfs`.
- Step is best-effort: if the LaTeX clone is missing, the build emits a
  warning instead of failing.

The combined `npm run generate:resume-assets` runs both steps. The
`build` script invokes this automatically before `next build`.

### Why JSONs are committed but PDFs are not

JSONs are the data layer for the deployed React app — the resume tabs
render from these files. Committing them means the deployed site always
ships with current content even if the LaTeX source is on a different
machine. PDFs are static download assets regenerated from the same
source on every build, so there's no benefit to versioning them.

### Smoke-checks before pushing

- `npm run precommit` runs the **committed-JSON guard vitest**
  (`src/data/resumes/__tests__/committed-json.test.ts`), which fails
  the build if any JSON has empty `work[]`, `basics.name`, or
  `skills[]`. This catches the failure mode where the script ran
  without a LaTeX source available.
- Standalone axe-core script
  (`/tmp/marceloprates-audit/home-axe.mjs`) checks for a11y violations
  on `/`. Currently reports 0 violations.

## Pointers

- **Agent-specific context**: `AGENTS.md` (local-only, gitignored)
- **Audit findings + roadmap**: `.audit/AUDIT.md` (gitignored)
- **Ralph loop history**: `.ralph/*.md` (gitignored)
