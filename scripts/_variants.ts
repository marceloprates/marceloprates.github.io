/**
 * _variants.ts — shared VARIANTS allowlist for the resume pipeline.
 *
 * Single source of truth for which LaTeX variants get built, served,
 * and shown in the UI. Adding a variant here is a 1-line change that
 * flows through both scripts and the UI:
 *
 *   - scripts/generate-json-resume.ts (writes src/data/resumes/{id}.json)
 *   - scripts/generate-pdf-snapshots.ts (mirrors to public/resumes/{id}.pdf)
 *   - src/components/resume/ResumeTabs.tsx (renders the tab)
 *
 * To EXCLUDE a variant from the build (e.g. a job-targeted variant
 * that should not appear on the personal site), simply remove it
 * from this list. The targeted variants `ai+huawei` and
 * `ai+ml__applied-research-engineer` are intentionally absent.
 *
 * Filename conventions:
 *   - source .tex: src/generated/ats__{id}.tex (in the LaTeX repo)
 *   - source PDF:  output/latest/cv_ats__{id}.pdf (in the LaTeX repo)
 *   - target JSON: src/data/resumes/{id}.json (in this repo, committed)
 *   - target PDF:  public/resumes/{id}.pdf (in this repo, gitignored)
 */

export interface VariantSpec {
	/** Stable id used in URLs, JSON filenames, and PDF filenames. */
	id: string;
	/** Human-readable label shown in the Resume tab. */
	label: string;
	/** Source .tex filename in the LaTeX repo. */
	tex: string;
	/** Source PDF filename in the LaTeX repo's output/latest/. */
	pdf: string;
}

/**
 * The 4 approved variants shown on the personal site.
 *
 * INCLUSION LIST — anything not here is intentionally excluded.
 * Do not add targeted variants (huawei, applied-research-engineer,
 * lead-data-scientist, etc.) without an explicit decision that
 * the target audience should see them.
 */
export const VARIANTS: readonly VariantSpec[] = [
	{ id: "ai", label: "AI Engineer", tex: "ats__ai.tex", pdf: "cv_ats__ai.pdf" },
	{
		id: "ai+ml",
		label: "AI/ML Engineer",
		tex: "ats__ai+ml.tex",
		pdf: "cv_ats__ai+ml.pdf",
	},
	{ id: "ds", label: "Data Scientist", tex: "ats__ds.tex", pdf: "cv_ats__ds.pdf" },
	{ id: "ml", label: "ML Engineer", tex: "ats__ml.tex", pdf: "cv_ats__ml.pdf" },
] as const;