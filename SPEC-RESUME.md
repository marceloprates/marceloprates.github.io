# ATS Resume Parsing & Display — Specs

## Overview

Replace the current `react-markdown` pass-through of raw ATS LaTeX source (which produces broken output — unresolved `\csname` macros, ugly `itemize` bullets) with a proper **JSON Resume** pipeline:

1. LaTeX source → parsed into **JSON Resume** schema at build time
2. JSON Resume → semantic, recruiter-friendly **HTML** with tabbed variants
3. Each page includes **JSON-LD schema.org Person markup** for Google SEO
4. Fully static, no runtime dependencies, zero custom parsing libraries beyond regex

**Source files** (fetched from `Resume/src/generated/` at build time):

- `ats__ai.tex` — AI/ML Engineer variant
- `ats__ds.tex` — Data Scientist variant
- `ats__ml.tex` — ML Engineer variant

---

## SPEC-R01: Parse ATS LaTeX → JSON Resume at build time

### Problem

The current `latex-parser.ts` converts the whole LaTeX file to a Markdown blob, losing structure (section boundaries, job roles, bullet items). The result renders as a flat text dump with broken `\csname` macros.

### Solution

Create `scripts/generate-json-resume.ts` that:

1. Fetches all three `ats__*.tex` files from the Resume repo (or reads locally if `RESUME_LOCAL_PATH` env is set)
2. Parses each LaTeX file using regex patterns specific to the ATS format
3. Outputs a `src/data/resumes/ai.json`, `ds.json`, `ml.json` in **JSON Resume schema** format
4. Runs as part of `npm run build` (prepend to the build script)

**ATS LaTeX patterns to parse:**

```
\section*{Summary}      → basics.summary
\section*{Core Skills} → skills (semicolon-separated inline prose)
\section*{Experience}  → work[].highlights[]
\section*{Education}   → education[]
\section*{Selected Impact} → skip (derived, not needed)

% {JobTitle}           → work[].position
\leavevmode {Company}, {Location}  \hfill {StartDate} – {EndDate}
\textbf{Role}\hfill Date → work[].company, work[].startDate, work[].endDate
\begin{itemize}...\end{itemize} → work[].highlights[]
\csname Exp*...\endcsname → resolved to plain text via experience_catalog.tex
\ResumeCoreSkillsInline → skills[].keywords[]
```

**JSON Resume schema fields to populate:**
`basics` (name, label, email, phone, location, website, summary, profiles),
`work` (company, position, startDate, endDate, highlights[], url),
`skills` (name, level, keywords[]),
`education` (institution, area, studyType, startDate, endDate, gpa, courses[]),
`projects` (skip — not in ATS format),
`interests` (skip),
`references` (skip),
`languages` (skip — not in ATS format)

**Key files:**

- `scripts/generate-json-resume.ts` — build script
- `src/data/resumes/ai.json` — AI/ML variant
- `src/data/resumes/ds.json` — Data Scientist variant
- `src/data/resumes/ml.json` — ML Engineer variant

**Verification:**

- `npm run generate:resumes` succeeds
- All three JSON files conform to JSON Resume schema (validate with ajv or JSON Schema validator)
- `npm run build` succeeds with new data files

---

## SPEC-R02: Render JSON Resume as semantic HTML

### Problem

`react-markdown` renders the flat Markdown blob as generic `<p>`, `<ul>` tags — not recruiter-friendly, no section semantics, broken macro text.

### Solution

Create `src/components/resume/RenderedResume.tsx`:

- Receives a parsed JSON Resume object
- Renders semantic HTML: `<header>`, `<section id="summary">`, `<section id="experience">`, `<article class="job">`, `<ul class="highlights">`, etc.
- Applies Tailwind prose for typography
- Renders all sections in logical order: Summary → Skills → Experience → Education
- Contact info in structured microdata-ready markup
- External links (`LinkedIn`, `GitHub`) open in new tab with `rel="noopener noreferrer"`

**Verification:**

- `RenderedResume` renders all JSON Resume sections
- Links are clickable and open correctly
- No broken macros or LaTeX artefacts visible

---

## SPEC-R03: Tabbed variant selector (AI / DS / ML)

### Problem

Three variants exist but only `ats__ai.tex` is shown.

### Solution

Create `src/components/resume/ResumeTabs.tsx`:

- Client component (`'use client'`) using React state
- Three tabs: "AI/ML Engineer", "Data Scientist", "ML Engineer"
- Each tab loads the corresponding JSON from `src/data/resumes/`
- Active tab state persists in URL hash or localStorage (or just state — fine for a personal page)
- Default active tab: "AI/ML Engineer"

**Integration:**

- `src/app/page.tsx` → replace the single prose card in the `#resume` section with `<ResumeTabs />`

**Verification:**

- Clicking tabs switches content without page reload
- Default tab matches current URL (e.g. `/#resume-ds` sets DS tab active)

---

## SPEC-R04: JSON-LD schema.org Person markup

### Problem

The resume page has no structured data — invisible to search engines for person/resume queries.

### Solution

Add JSON-LD `<script type="application/ld+json">` in `layout.tsx` or the resume component, containing a **schema.org Person** entity referencing the JSON Resume `basics` data:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Marcelo Prates, PhD",
  "jobTitle": "Senior AI/ML Engineer",
  "email": "marceloorp@gmail.com",
  "url": "https://marceloprates.github.io",
  "sameAs": ["https://linkedin.com/in/marceloprates", "https://github.com/marceloprates"],
  "knowsAbout": ["Machine Learning", "Deep Learning", "GenAI", ...],
  "worksFor": { "@type": "Organization", "name": "HopHR" }
}
```

- Dynamically built from the active variant's JSON Resume `basics` object
- Injected via Next.js `metadata` or inline in the resume component
- The `knowsAbout` field is populated from `skills[].name` + `skills[].keywords`

**Verification:**

- View source → JSON-LD block present with correct `@type: Person`
- [Google Rich Results Test](https://search.google.com/test/rich-results) shows Person entity

---

## SPEC-R05: Build integration

### Problem

`npm run build` doesn't generate resume JSON files.

### Solution

1. Update `package.json` to prepend `generate:resumes` to the build script:
   ```json
   "build": "npm run generate:resumes && npm run generate:projects && node scripts/generate-github-projects.mjs && next build"
   ```
2. Add `"generate:resumes": "ts-node scripts/generate-json-resume.ts"` to `package.json`
3. Ensure `ts-node` is available (it's already in devDependencies)

**Verification:**

- `npm run build` generates all three JSON files
- If `generate:resumes` is run standalone with no network, it fails gracefully with a useful error (or falls back to stub data)
- `npm run ci:check` passes end-to-end

---

## Architecture summary

```
scripts/generate-json-resume.ts
  ├── fetches ats__ai.tex, ats__ds.tex, ats__ml.tex
  ├── parses LaTeX → JSON Resume schema
  └── writes src/data/resumes/{ai,ds,ml}.json

src/components/resume/
  ├── RenderedResume.tsx       — semantic HTML renderer
  └── ResumeTabs.tsx           — tabbed variant switcher

src/app/page.tsx
  └── ResumeTabs
        └── RenderedResume (×3)

layout.tsx (or resume component)
  └── <script type="application/ld+json"> — schema.org Person

src/data/resumes/
  ├── ai.json  — AI/ML variant (JSON Resume)
  ├── ds.json  — Data Scientist variant
  └── ml.json  — ML Engineer variant
```

---

## Non-Goals

- PDF download button (separate task)
- Cover letter integration
- Automated testing of LaTeX → JSON parsing (future task)
- Multi-language support
