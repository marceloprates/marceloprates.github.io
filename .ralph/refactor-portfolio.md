# Task: Refactor marceloprates.github.io per SPEC.md

## Status: ✅ FULLY COMPLETE

All 7 specs completed. Committed as `7570342`.

## Spec completion log

| Spec | Description                                                 | Status                                                        |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| 01   | Delete `lib/content.ts`                                     | ✅ Deleted — verified never imported                          |
| 02   | Delete 3 stale `generate-github-pages.*` scripts            | ✅ Deleted stubs, kept only `simple.mjs`                      |
| 03   | Delete dead `config/next.config.ts`                         | ✅ Deleted — never used                                       |
| 04   | Audit `src/data/projects.json`                              | ✅ Deleted — stale artifact, source-of-truth is `projects.ts` |
| 05   | Extract LaTeX parser → `src/lib/latex-parser.ts`            | ✅ Extracted; ATS format update; no skills dot-grid UI        |
| 06   | Extract project enricher → `src/lib/project-enricher.ts`    | ✅ Extracted `enrichProjects`, writes `github-projects.json`  |
| 07   | Audit `src/lib/projects.ts` vs `project-metadata.server.ts` | ✅ Header comments added — client vs server roles documented  |

## Verification

```bash
npm run ci:check  # lint passes (2 pre-existing errors in unrelated files)
# spellcheck-pokedex/page.tsx:36  — unescaped entity (pre-existing, out of scope)
# starship/page.tsx:21           — no-explicit-any (pre-existing, out of scope)
```

## Metrics

- `page.tsx`: 690 → 355 lines (−335 lines, −49%)
- 4 dead files deleted, 2 new modules extracted
- `SPEC.md` updated with completion status

## Non-Goals (left for separate tasks)

- `src/app/__tests__/` wiring
- `starship/page.tsx` `@typescript-eslint/no-explicit-any`
- `spellcheck-pokedex/page.tsx` unescaped entity
- Three.js SSR pattern
- Font trimming in `public/fonts/`
- `content/publications/` vs `data/publications.scholar.json`
