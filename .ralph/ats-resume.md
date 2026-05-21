## Task: Implement ATS Resume Parsing & Display per SPEC-RESUME.md

### Goal
Complete all 5 specs (R01–R05) for a proper JSON Resume pipeline:
1. Parse ATS LaTeX → JSON Resume at build time
2. Semantic HTML renderer
3. Tabbed variant selector (AI / DS / ML)
4. JSON-LD schema.org Person markup for SEO
5. Build integration (generate:resumes script)

### Progress

- [x] R01: `scripts/generate-json-resume.ts` — parses ATS LaTeX → JSON Resume
  - Fetches from GitHub or reads from `RESUME_LOCAL_PATH` env
  - Resolves `\Exp*` macros via `experience_catalog.tex`
  - Outputs `src/data/resumes/{ai,ds,ml}.json`
  - 8 jobs × 3 variants, correct name/position/dates/location
  - `npm run generate:resumes` → ✅
- [x] R02: `src/components/resume/RenderedResume.tsx` — semantic HTML
  - `<article>`, `<header>`, `<section>`, `<article>` for jobs
  - Contact links with lucide-react icons
  - Skills as pill groups with keywords
  - Experience bullets with `–_` prefix
- [x] R03: `src/components/resume/ResumeTabs.tsx` — tabbed switcher
  - Client component, React state
  - AI/ML Engineer / Data Scientist / ML Engineer tabs
  - Replaces prose card in `page.tsx`
- [x] R04: JSON-LD schema.org Person markup
  - `knowsAbout` from skills, `worksFor` from latest job
  - Injected via `<script type="application/ld+json">` in ResumeTabs
- [x] R05: Build integration
  - `npm run generate:resumes` → `tsx scripts/generate-json-resume.ts`
  - Added to `package.json` scripts

### Context
- Resume repo: ~/Projects/active/personal/resume/src/generated/
- Variants: ats__ai.tex, ats__ds.tex, ats__ml.tex
- ATS format: article class, \section*{}, itemize, \csname Exp* macros, \ResumeCoreSkillsInline
- Existing: src/lib/latex-parser.ts (for reference, not used in new pipeline)
- Package.json has ts-node in devDependencies already

### Rules
- Work sequentially: R01 → R02 → R03 → R04 → R05
- Verify each spec before moving to next (build, lint, visual spot-check)
- Use JSON Resume schema (jsonresume.org/schema) for output format
- Minimize custom code — regex patterns only where no library exists
- Do NOT touch existing tests, fonts, publications, or Three.js pages
- Commit after each spec: "spec-R0X: description"
- Stop when `npm run ci:check` passes