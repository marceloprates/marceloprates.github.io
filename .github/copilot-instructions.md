## Repo snapshot

This is a personal site built with Next.js (App Router) + TailwindCSS and statically exported for GitHub Pages.

- App code: `src/` (App Router, components, hooks, lib, types)
- Content: `content/` — Markdown posts, projects, publications, talks
- Static public assets: `public/` (use `/images/...` paths in content)
- Bundled imports: `assets/` (images imported directly by components)

## Quick objectives for an AI coding agent

- Make safe, minimal changes that preserve static-export behaviour (the app is exported via `next export`).
- Preserve `basePath`/`assetPrefix` handling for production (`/page`) so static assets keep correct URLs.
- Keep image references in content as absolute paths starting with `/images/` (these are rewritten for `basePath` at build/export time).

## Key workflows & commands (verified from repo)

- Start dev server: `npm run dev` (local App Router dev at http://localhost:3000)
- Lint: `npm run lint`
# Copilot instructions

## Repo snapshot

Personal site built with Next.js (App Router) + TailwindCSS and statically exported for GitHub Pages.

- App code: `src/` (App Router, components, hooks, lib, types)
- Content: `content/` — Markdown posts, projects, publications, talks
- Static public assets: `public/` (serve at site root; use `/images/...` in content)
- Bundled imports: `assets/` (images imported directly by components)

## Quick objectives for an AI coding agent

- Make safe, minimal changes that preserve static-export behaviour (`next export`).
- Preserve `basePath`/`assetPrefix` handling for production (`/page`) so static assets keep correct URLs.
- Keep image references in content as absolute paths starting with `/images/` (these are rewritten for `basePath` at build/export time).

## Key workflows & commands

- Dev server: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Build (SSG): `npm run build`
- Export static site: `npm run export` → outputs to `out/`

When editing code that affects build/export, run `npm run build` then `npm run export` to validate the static output.

## Architecture & files to check before edits

- `next.config.js` and `config/next.config.ts` — check `basePath`, `assetPrefix`, and `images.unoptimized` for export compatibility.
- `src/app/` — App Router routes and layout; edits here affect routing and static export.
- `src/components/` — UI components; follow existing composition and Tailwind utility classes.
- `src/lib/` — small typed utilities belong here and are reused.
- `content/*` — Markdown + frontmatter. Example frontmatter keys in `content/posts/2024-03-17-ia-no-significa-nada.md`: `title`, `date`, `tags`, `categories`, `excerpt`, `original_path`.

## Project-specific conventions (do this, not that)

- Markdown image references: always use absolute site-root paths, e.g. `![](/images/misc/foo.png)`.
- For images used as module imports in components, place them in `assets/` and import them: `import img from '../../assets/...'` — these are hashed by the bundler.
- New images referenced in Markdown must be placed under `public/images/...`.
- Prefer server components by default; add `"use client"` only when interactivity is required.
- Use the `@/*` path alias which maps to `src/*`.
- Keep content in `content/` and do not embed build-time logic in Markdown files.
- Do not add non-standard Next config like `staticDirs`; use `public/` for static files.
- Keep `tsconfig.tsbuildinfo`, `.next/`, `out/` and caches out of git.

## Libraries & rendering patterns

- Use `react-markdown` with `remark-gfm`, `remark-math`, `rehype-katex`, and `rehype-raw` when rendering Markdown programmatically.
- Prefer Next `<Image>` for imported/local images inside components; use plain `<img>` in raw Markdown content.

## Examples of safe changes and pitfalls

- Safe: small UI tweaks in `src/components/*`, Tailwind class changes, updating Markdown frontmatter/body.
- Safe but verify: adding new routes under `src/app/`; run `npm run build && npm run export` to ensure they export.
- Danger: enabling Next.js features incompatible with `next export` (server-only APIs, SSR pages, Next image optimization unless `images.unoptimized=true`).

## Tests, linting, and quality checks

- Run `npm run lint` after edits. There are no automated tests detected—add small tests only for non-trivial logic changes.

## Deployment & integration

- The project exports a static site to `out/`. Production expects `basePath` `/page` for GitHub Pages.
- Publish the `out/` directory to `gh-pages` (or use CI that pushes `out/`), and ensure asset paths remain correct.

## Small checklist for PRs made by an AI coding agent

1. Confirm change is compatible with static export (`next export`).
2. Run `npm run build && npm run export` and sanity-check `out/` for missing assets or broken links.
3. Run `npm run lint` and fix warnings introduced by the change.
4. If modifying content, ensure images use `/images/...` absolute paths and new images are in `public/images/`.
5. Keep changes minimal and explain reasoning in the PR description.

## Where to look for examples in this repo

- Homepage and routing examples: `src/app/`
- Components: `src/components/`
- Content frontmatter example: `content/posts/2024-03-17-ia-no-significa-nada.md`
- Build/export rules: `README.md`, `next.config.js`, `config/next.config.ts`

---

If anything's missing or you want more exact snippets (e.g., `package.json` scripts or `next.config` snippets), tell me which area to expand and I will update this file.
