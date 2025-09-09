# scripts/

This folder contains helper scripts used by the project.


Files:

`postcss.config.mjs`
  - Purpose: PostCSS config used by the build toolchain (Tailwind, autoprefixer).
  - Note: This file is consumed implicitly by the build process and does not need manual invocation.

`validate-content-images.js`
  - Purpose: Lint/check markdown files under `content/` and ensure image references are either absolute URLs or site-root paths starting with `/images/`.
  - Usage: `node ./scripts/validate-content-images.js` or `npm run validate:content-images`.

Recommended actions:

- Keep `migrate-jekyll.js` as a migration artifact or move it to a `tools/` folder if you plan to reuse it later.
- Use `validate-content-images` in CI (already wired via `ci:check`) to avoid broken asset links on export.
