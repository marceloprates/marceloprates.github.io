Personal site built with Next.js (App Router), TailwindCSS and static export for GitHub Pages.

## Quick start

- Dev server: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Build (SSG): `npm run build`
- Export static site: `npm run export` → output in `out/`

## Folder structure

- `src/` — App code (App Router), components, hooks, lib, types
- `content/` — Markdown content
	- `posts/`, `projects/`, `publications/`, `talks/`
- `public/` — Static assets served at site root
	- `images/` — All site images (migrated from the former top-level `images/`)
	- `*.svg` — Icons and other static files
- `assets/` — Bundled/static imports used by components (e.g. images imported via `import img from '...'`)
- `config/` — ESLint & Next config variants
- `scripts/` — One-off utilities (currently empty; image copy script removed)

## Images policy

- All publicly-referenced images live in `public/images/` and are referenced as `/images/...`.
- Markdown content should use absolute paths like `![](/images/misc/foo.png)`.
- Components using Next.js static imports can keep assets in `assets/` (these are bundled and hashed by Next.js).

Note: Production uses `basePath` `/page` for GitHub Pages. Absolute URLs like `/images/...` are automatically prefixed (`/page/images/...`) at build/export time.

## Deployment (GitHub Pages)

This project uses `next export` with:
- `output: 'export'`
- `images.unoptimized = true`
- `basePath`/`assetPrefix` set to `/page` in production

Exported site is written to `out/`. Push `out/` to the `gh-pages` branch or configure GitHub Pages to serve from that directory in CI.

## Conventions

- Content lives in `content/` in Markdown with frontmatter.
- Use `/images/...` for all image references in content.
- Keep `tsconfig.tsbuildinfo` and other build artifacts out of git (see `.gitignore`).

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
but are intentionally excluded from this site — see
`scripts/_variants.ts` for the inclusion list.

The pipeline has two pieces, both wired into `npm run build`:

1. **JSON data** — regenerated from a local LaTeX clone:
   - Source of truth: a clone of the private `marceloprates/Resume` LaTeX
     repo at `~/projects/active/personal/resume` (set `RESUME_LOCAL_PATH` to
     override the auto-detect fallback in `src/lib/paths.ts`).
   - Runs the `generate:resumes` script (`scripts/generate-json-resume.ts`)
     which parses the LaTeX `\Exp*Title` macros into the JSON Resume schema.
   - Output: `src/data/resumes/{ai,ai+ml,ds,ml}.json` — **committed to git**
     so the deployed site ships the latest content without needing the
     LaTeX clone at build time.
   - Regenerate with `npm run generate:resumes` after editing the LaTeX.

2. **PDF snapshots** — mirrored from the same LaTeX clone's `output/latest/`
   directory into `public/resumes/{ai,ai+ml,ds,ml}.pdf`. These are
   **gitignored** (build artifacts) and served as static assets by Next.js's
   static export. Regenerate with `npm run generate:resume-pdfs`.

The combined `npm run generate:resume-assets` runs both steps. The
`build` script invokes this automatically before `next build`.

### Why the JSONs are committed but PDFs are not

JSONs are the data layer for the deployed React app — the resume tabs
render from these files. Committing them means the deployed site always
ships with current content even if the LaTeX source is on a different
machine. PDFs are static download assets regenerated from the same
source on every build, so there's no benefit to versioning them.

### Smoke-checks before pushing

After regenerating, sanity-check that the JSONs aren't empty:

- `npm run precommit` runs the **committed-JSON guard vitest**
  (`src/data/resumes/__tests__/committed-json.test.ts`), which fails
  the build if any JSON has empty `work[]`, `basics.name`, or
  `skills[]`. This catches the failure mode where the script ran
  without a LaTeX source available.
