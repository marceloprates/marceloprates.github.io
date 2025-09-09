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
