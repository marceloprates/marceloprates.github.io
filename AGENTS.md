# marceloprates.github.io — Agent Instructions

Local-only agent context. Gitignored (`.gitignore:15`). README.md is the
public doc; this file is the agent's working brief.

---

## 1. Project Overview

Personal portfolio at **marceloprates.github.io**. Stack:

- **Next.js 15** (App Router, TypeScript, static export)
- **Tailwind CSS** with `@tailwindcss/typography` for prose
- **Three.js / React-Three-Fiber** for the starship canvas (`src/app/starship/`)
- **next-themes** (class-based dark mode)
- **Zod 4** for build-time config validation (`src/config/`)
- **Vitest** + **Playwright** for unit and e2e tests
- **cmdk + Fuse.js** for the ⌘K command palette (`src/components/nav/`)
- **Static export** to GitHub Pages — no SSR, no API routes, no `basePath`

External data sources (regenerated at build time):

- **LaTeX resume repo** (`marceloprates/Resume`, private) → JSON Resume + PDF snapshots
- **GitHub REST API** → project cards (`scripts/generate-github-projects.mjs`)
- **Markdown content** under `content/posts/*.md` and `content/projects/*.md`
- **Search index** → `public/search-index.json` (regenerated from the
  three sources above by `scripts/build-search-index.ts`)

---

## 2. Information Architecture (locked 2026-07-12)

The site is organised by **routes**, not in-page sections. The
home-page composition root (`src/app/page.tsx`) renders only
**Hero + About**. Every other surface is its own route, reached via
the locked top-level TopNav:

| TopNav label | Route | Notes |
|---|---|---|
| Work | `/work` | Faceted grid of every project, primary + tag filters, URL sync |
| Writing | `/posts` | Markdown posts (route unchanged; nav label is "Writing") |
| Open Source | `/work?tag=open-source` | Query-prefixed filter on /work |
| About | `/about` | Full About page, mirrors the home-page About section |
| Resume | `/resume` | Tabbed resume (AI / AI+ML / DS / ML) |

Plus the ⌘K command palette (`src/components/nav/SearchPalette.tsx`)
opens on Cmd+K / Ctrl+K / `/`; the Search button is the visible
trigger.

Project taxonomy (locked 2026-07-12): one primary + many tags.

- Primaries: `code`, `art`, `writing`, `experiments`.
- "Open Source" is a `tag: open-source` filter, not a primary.
- Seed table at `src/data/project-taxonomy.seed.ts`; frontmatter
  `primary:` overrides the seed.

---

## 3. Build & Dev Commands

```bash
npm run dev                    # build:search-index → next dev (http://localhost:3000)
npm run build                  # generate:resume-assets → build:search-index → next build
npm run lint                   # ESLint
npm run typecheck              # tsc --noEmit
npm run test                   # Vitest (200+ unit tests)
npm run e2e                    # Playwright (e2e tests)
npm run precommit              # lint + typecheck + image-validate + vitest (CI gate)
npm run ci:check               # lint + build + build:search-index + image validation
npm run validate:content-images
npm run validate:frontmatter
npm run fetch-scholar          # Pull Google Scholar stats
npm run generate:projects      # Regenerate github-projects.json only
npm run generate:resumes       # Regenerate src/data/resumes/*.json
npm run generate:resume-pdfs   # Mirror LaTeX PDFs into public/resumes/
npm run generate:resume-assets # Both resume steps (called by build)
npm run build:search-index     # Regenerate public/search-index.json from sources
```

`npm run build` produces a fully static `out/` directory served by
GitHub Pages. `dev` chains `build:search-index` so the Server
Component layout never crashes on a missing index.

---

## 4. Architecture Decisions

### Static export (no `basePath`)
- `next.config.js`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`
- `basePath: ''`, `assetPrefix: ''` — served from root as a user page
- All routes are pre-rendered HTML; **no API routes, no server actions**

### Composition root + section components
- `src/app/page.tsx` is a **composition root**: imports Hero + About
  from `src/components/sections/`. Renders them in the order declared
  by `src/config/sections.ts`. No business logic; no data fetching.
- Each section is a pure presentational component receiving props from
  the composition root. See `src/components/sections/AGENTS.md` (when
  present — Phase D reduced the surface so the sections dir is small).

### Top-level navigation
- `src/components/nav/TopNav.tsx`: 5-item sticky primary nav + a Search
  button stub. Touch targets are `h-11` (44 px) — comfortably exceeds
  the WCAG 2.2 AA 2.5.8 minimum (24×24 CSS px).
- `src/components/nav/SearchPalette.tsx`: cmdk palette with fuzzy search
  (Fuse.js). Triggered by the Search button, ⌘K / Ctrl+K, or `/`.
- `src/components/nav/NavShell.tsx`: client wrapper owning the
  `searchOpen` state, the global ⌘K listener, and the trigger-ref
  reset so focus returns to the Search button on close.
- `src/components/nav/MobileMenu`: collapsed into TopNav via the
  hamburger toggle; no separate component.

### Work page (faceted grid)
- `src/app/(content)/work/page.tsx`: server component, calls
  `getWorkProjects()` at build time and threads the array into the
  client `WorkGrid`.
- `src/components/work/WorkGrid.tsx`: filterable grid with
  `useSearchParams()` + `router.replace()` for URL sync.
- `src/components/work/FilterBar.tsx`: segmented primary control
  (role="radiogroup") + tag chip cloud (aria-pressed).
- Filters are AND'd; tag match is case-insensitive. Empty state
  carries `role="status"`.

### Search index
- `scripts/build-search-index.ts` reads `src/data/projects.ts`,
  `content/projects/*.md`, `content/posts/*.md` and emits
  `public/search-index.json`. Wired into `build` and `dev`.
- `src/lib/search-items.server.ts` is the Server Component reader.
  Throws if the JSON is missing — a hard pre-req of `npm run ci:check`.

### Config validation
- Build-time config (site metadata, section list, social links) is
  validated by **Zod 4** schemas in `src/config/schema.ts`.
- Concrete config files: `src/config/site.ts`, `src/config/sections.ts`.
- Invalid config fails the build — never silently ignore.

### Resume pipeline
- See `README.md § Resume pipeline` for the full flow.
- Path resolution: `RESUME_LOCAL_PATH` env → auto-detect
  `~/projects/active/personal/resume` → null. Helper in `src/lib/paths.ts`.
- Variant inclusion list (NOT auto-discovery) at `scripts/_variants.ts`.
  Adding a variant is an explicit decision.
- JSON Resume files and PDFs are **committed** (reverted from the
  2026-07-12 Phase B "gitignore + regenerate at build" approach on
  2026-07-18: the LaTeX repo is private, so CI cannot fetch it, so
  build-time regeneration ships empty CVs to production). Source of
  truth is still the local LaTeX repo at `~/projects/active/personal/resume`
  — re-run `npm run generate:resume-assets` and commit the regenerated
  files whenever the LaTeX source changes. The committed-json test
  (`src/data/resumes/__tests__/committed-json.test.ts`) fails loudly
  if any variant's `work[]` silently empties.

### Three.js / heavy client components
- Client components only (`'use client'`); wrapped in `dynamic()` to
  skip SSR. Static export means no SSR hooks, no server data.

### Private portfolio candidates (Phase A–D, 2026-07-12)
- Each owned repo opts in via a `portfolio.md` file at its root:
  YAML frontmatter (`include`, `summary`, `tags[]`, `cover`, `slug`,
  `primary`, `tier`) + body that renders on `/projects/<slug>` as a
  blogpost section. Schema at `src/data/portfolio-schema.ts` (loose
  passthrough, matching `ProjectFrontmatterSchema`).
- `npm run scan:portfolio` enumerates every repo the user owns
  (public + private), fetches `portfolio.md` from
  `raw.githubusercontent.com`, and produces three artifacts (all
  **gitignored**): `portfolio-candidates.md` (review report),
  `portfolio-manifests-to-seed/<owner>-<name>/portfolio.md` (seed
  templates for private repos missing a manifest), and
  `portfolio-bodies/<owner>-<name>/portfolio.md` +
  `portfolio.meta.json` (raw body + visibility sidecar for opted-in
  repos).
- **No remote writes.** The script never pushes to GitHub. The
  "stage locally" lock is non-negotiable: the user copies
  `portfolio-manifests-to-seed/*` into their repos and commits
  per-repo at their own pace.
- `portfolio-decisions.json` is **committed** and acts as the
  override layer. Decisions win over the in-repo manifest at every
  stage. Loader is lenient (`loadPortfolioDecisions` returns `{}`
  with a warning for missing/invalid JSON so a bad file can't break
  the build).
- Ingestion: `getWorkProjects()` adds a Pass 4 that reads cached
  portfolio bodies via `listPortfolioBodies()`, converts via
  `buildPortfolioWorkProjects()` (pure; takes records + decisions
  explicitly), dedupes against GitHub + markdown + Starship by repo
  slug or title. Body fallback: `getProjectBySlug()` checks local
  `content/projects/<slug>.md` first, falls back to
  `portfolio-bodies/<owner>-<name>/portfolio.md` via the lazy
  `buildPortfolioBodiesIndexForRoot()` helper.
- `ProjectCard` and the project detail page render `<PrivateBadge>`
  (amber pill, lock icon, `aria-label="Private repository"`) when
  `project.private === true`. The flag is set ONLY for
  private-visibility bodies (per the sidecar) — public opted-in
  repos never show the badge.
- Slug resolution chain (in order): `frontmatter.slug` → folder
  `<name>` part (from `<owner>-<name>`) → folder name. Title chain:
  `frontmatter.title` → first H1 → slug. Description chain:
  decisions summary → frontmatter summary → first prose paragraph.
- Single source of truth for opt-in: `isOptedIn(repo, manifestState,
  decisions)` in `src/lib/portfolio-scan.ts`. The "decisions win"
  rule is enforced here, not duplicated across modules.

---

## 5. File Structure (key paths)

```
src/
├── app/                          # App Router routes
│   ├── page.tsx                  # Composition root (Hero + About only)
│   ├── layout.tsx                # Root layout + SkipLink + NavShell + theme
│   ├── (content)/
│   │   ├── posts/page.tsx        # /posts (listing)
│   │   ├── posts/[slug]/page.tsx # Markdown post
│   │   ├── projects/page.tsx     # /projects (listing)
│   │   ├── projects/[slug]/page.tsx
│   │   ├── work/page.tsx         # /work (faceted grid; nav-redesign Phase D)
│   │   ├── about/page.tsx        # /about (full About page; Phase E)
│   │   └── resume/page.tsx       # /resume (tabs; Phase E)
│   ├── demo/, starship/          # Three.js client canvases (Phase C left these intact)
│   └── misc/                     # One-off pages (spellcheck-pokedex, etc.)
├── components/
│   ├── nav/                      # TopNav, NavShell, SearchPalette
│   ├── work/                     # WorkGrid, FilterBar
│   ├── sections/                 # Hero, About (Phase C reduced to two)
│   ├── resume/                   # ResumeTabs, RenderedResume
│   ├── BaseCard.tsx, ProjectCard.tsx, PostCard.tsx, ...
│   └── 3d/                       # Three.js primitives
├── config/                       # Zod-validated config (site + sections)
├── data/                         # Build-time JSON data (committed) + JSON Resume (gitignored)
├── lib/                          # Server + shared utilities
│   ├── paths.ts                  # RESUME_LOCAL_PATH resolution
│   ├── work-projects.ts          # getWorkProjects() — Phase A
│   ├── project-taxonomy.server.ts # assignPrimary + mergeTags — Phase A
│   └── search-items.server.ts    # Reads public/search-index.json — Phase F
└── types/                        # Shared TypeScript types

content/                          # Markdown content (posts, projects, publications, talks)
public/                           # Static assets served at site root
  ├── images/                     # All public images
  ├── resumes/                    # PDFs (gitignored)
  └── search-index.json           # Generated by `npm run build:search-index`
scripts/                          # Build-time generators (TS + .mjs)
e2e/                              # Playwright tests
.audit/                           # Audit + roadmap artifacts (gitignored)
.ralph/                           # Ralph loop state (gitignored)
```

---

## 6. Standards

### Size rules (hard guidelines)
| Target | Threshold |
|---|---|
| `src/lib/*` pure functions | < 100 LOC |
| `src/components/sections/*` | < 300 LOC |
| `src/app/page.tsx` (composition root) | < 100 LOC |
| Reusable primitives (cards, buttons) | < 500 LOC |
| `src/lib/*.ts` server modules | < 200 LOC |

If something grows past the threshold, **split it**. Don't add comments
explaining why it's OK to be long.

### Atomic commits
- One logical change per commit. Conventional Commits prefix
  (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `style:`).
- Body explains **why**, not **what** (the diff shows the what).
- Every commit must pass `npm run precommit`.

### No scope drift
- An AGENTS.md change goes in its own commit. Don't mix it with code.
- A test fix for a feature goes in the feature commit, not a follow-up.
- Multi-loop ralph work: each ralph loop is its own series of commits.

### Data privacy
- Never commit `.env*`, secrets, OAuth tokens, or PII.
- The resume pipeline reads a local LaTeX repo — never commit its content.
- `public/search-index.json` regenerates from local content; safe to
  keep gitignored.

---

## 7. Quality Gates

| Gate | What it checks | When |
|---|---|---|
| `npm run precommit` | lint + typecheck + image-validate + frontmatter + vitest | before every commit |
| `npm run ci:check` | lint + build + build:search-index + image validation | before pushing |
| `npm run e2e` | Playwright e2e + a11y (axe-core) | before merging, before major releases |
| Standalone axe-core script (`/tmp/marceloprates-audit/home-axe.mjs`) | per-route a11y violations | before pushing, when UI changes |

**WCAG 2.2 AA floor** (verified against every nav-redesign Phase B/D/F
change): touch targets ≥ 24×24 CSS px; focus-visible outline ≥ 3:1
contrast; SkipLink remains the first focusable element on every page;
sticky TopNav carries `scroll-margin-top: 64px` so the SkipLink target
isn't hidden behind the header (WCAG 2.4.11 Focus Not Obscured).

Currently green:
- 200+ vitest unit tests passing (1 intentionally skipped: ds.json
  work[] — the LaTeX source for the junior-DS persona has no entries;
  re-enable when populated)
- Playwright e2e covers `sections.spec.ts`, `misc-discoverability.spec.ts`,
  `navigation.spec.ts`, `work-page.spec.ts`
- TypeScript strict mode, no `any` in shipped code

---

## 8. Sub-AGENTS.md

Focused context for subtrees (also gitignored):

- `src/components/nav/AGENTS.md` (recommended; not yet written)
  — TopNav contract + how to add a new primary destination.
- `src/components/work/AGENTS.md` (recommended; not yet written)
  — filter semantics + URL sync contract.

---

## 9. Pointers

- **Public docs**: `README.md` (deployment, conventions, resume pipeline)
- **Audit findings**: `.audit/AUDIT.md` (gitignored, P0/P1/P2/QW/RF/SI)
- **Roadmap**: `.audit/ROADMAP.md` (gitignored, sequenced phases)
- **Ralph loop history**: `.ralph/*.md` (gitignored)
- **Nav-redesign summary**: `.ralph/nav-redesign-summary.md` (gitignored)
- **Plan**: `.ralph/nav-redesign.md` (gitignored)
- **Wiki cross-session memory**: `~/.llm-wiki/` (auto-loaded via `wiki_recall`)
- **Global agent context**: `~/AGENTS.md` (system-wide rules)
- **Project-tree context**: `~/Projects/AGENTS.md` (Projects-folder rules)
