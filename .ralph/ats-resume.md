## Task: Implement ATS Resume Parsing & Display per SPEC-RESUME.md — COMPLETE

### Goal

Complete all 5 specs (R01–R05) for a proper JSON Resume pipeline.

### Completed ✓

- [x] **R01**: `scripts/generate-json-resume.ts` — parses ATS LaTeX → JSON Resume
  - String-based extraction (`indexOf` + brace-counting) to avoid `\r` → CR bug
  - Loads `experience_catalog.tex` macro map for job metadata resolution
  - `RESUME_LOCAL_PATH` env support for offline dev
  - Outputs `src/data/resumes/{ai,ds,ml}.json` — 8 jobs, summary, 4-7 skill groups
  - `npm run generate:resumes` — ✅

- [x] **R02**: `src/components/resume/RenderedResume.tsx` — semantic HTML
  - `<article>`, `<header>`, `<section>`, job `<article>` with `<time>` dates
  - Lucide-react contact icons (Mail, LinkedIn, GitHub, Globe)
  - Skills as pill groups with `name` + `keywords[]`
  - Experience bullets with `–` prefix, first job highlighted with blue border

- [x] **R03**: `src/components/resume/ResumeTabs.tsx` — tabbed switcher
  - Client component (`'use client'`), React state, no page reload
  - AI/ML Engineer / Data Scientist / ML Engineer tabs
  - Active tab: blue border + blue text, inactive: gray
  - Replaced prose card in `page.tsx` `#resume` section

- [x] **R04**: JSON-LD schema.org Person markup
  - `knowsAbout` from skills (flat keywords array)
  - `worksFor` from latest job
  - `hasOccupation` with description
  - `sameAs` from LinkedIn/GitHub profiles
  - Injected as `<script type="application/ld+json">` in ResumeTabs

- [x] **R05**: Build integration
  - `npm run generate:resumes` → `npx tsx scripts/generate-json-resume.ts`
  - `npm run build` generates resumes first, then builds Next.js
  - `npm run build:full` includes GitHub projects fetch (requires token)
  - Removed stale remote fetch + `react-markdown` from `page.tsx`

### Commits

- `7570342` spec-R01-R07: Clean up dead code from codebase refactoring
- `5b4d3df` spec-R01-R05: ATS resume JSON pipeline with tabbed variants and JSON-LD
- `1b846be` spec-R01: Fix LaTeX parsing — lowercase \r bug, string-based extractor
- `ee721d0` chore: refresh github-projects.json timestamp

### Notes

- 3 pre-existing lint errors in unrelated files (spellcheck-pokedex `'` entity, starship `any` type) — out of scope, not introduced by this work
- `npm run ci:check` fails only due to pre-existing errors (not from resume changes)
- `npm run build` and `npm run build:full` both succeed
