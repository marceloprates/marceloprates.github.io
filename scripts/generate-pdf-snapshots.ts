#!/usr/bin/env npx tsx
/**
 * generate-pdf-snapshots.ts — copies per-variant resume PDFs from the
 * local LaTeX clone into `public/resumes/`, where Next.js's static
 * export will serve them as `/resumes/{variant}.pdf`.
 *
 * This is best-effort: missing PDFs print a loud warning but do NOT
 * fail the build (resume JSONs already shipped; download buttons are
 * a progressive enhancement).
 *
 * Source: ${RESUME_LOCAL_PATH or auto-detected}/output/latest/cv_ats__{variant}.pdf
 * Target: public/resumes/{variant}.pdf
 *
 * Skip-when-current: if the source's mtime matches the target's mtime,
 * skip the copy (avoids unnecessary IO + git churn).
 *
 * Usage: npx tsx scripts/generate-pdf-snapshots.ts
 */

import fs from "node:fs";
import path from "node:path";
import { resolveLocalLatexPath } from "../src/lib/paths";

const VARIANTS = [
	{ id: "ai", source: "cv_ats__ai.pdf" },
	{ id: "ds", source: "cv_ats__ds.pdf" },
	{ id: "ml", source: "cv_ats__ml.pdf" },
] as const;

const TARGET_DIR = path.join(process.cwd(), "public", "resumes");

type Outcome = "copied" | "skipped-unchanged" | "missing-source" | "missing-latex-repo";

interface VariantResult {
	id: (typeof VARIANTS)[number]["id"];
	outcome: Outcome;
	source?: string;
	target?: string;
}

function shouldCopy(sourcePath: string, targetPath: string): boolean {
	try {
		const sourceStat = fs.statSync(sourcePath);
		try {
			const targetStat = fs.statSync(targetPath);
			// Skip if target is at least as new as source (idempotent)
			return sourceStat.mtimeMs > targetStat.mtimeMs;
		} catch {
			// Target missing → must copy
			return true;
		}
	} catch {
		// Source missing → not a copy concern; caller will mark missing-source
		return false;
	}
}

function copyIfNewer(sourcePath: string, targetPath: string): Outcome {
	if (!shouldCopy(sourcePath, targetPath)) {
		// Distinguish "target newer" from "source missing" via fs.statSync
		try {
			fs.statSync(sourcePath);
			return "skipped-unchanged";
		} catch {
			return "missing-source";
		}
	}
	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
	fs.copyFileSync(sourcePath, targetPath);
	// Preserve source mtime so repeated runs stay idempotent
	const sourceStat = fs.statSync(sourcePath);
	fs.utimesSync(targetPath, sourceStat.atime, sourceStat.mtime);
	return "copied";
}

function main(): void {
	const latexPath = resolveLocalLatexPath();
	if (latexPath === null) {
		console.warn(
			`[pdf-snapshots] No local LaTeX repo found (RESUME_LOCAL_PATH env or ~/projects/active/personal/resume).`,
		);
		console.warn(`[pdf-snapshots] Skipping PDF generation.`);
		console.warn(
			`[pdf-snapshots] To enable downloads, clone the repo or set RESUME_LOCAL_PATH.`,
		);
		return;
	}

	const sourceDir = path.join(latexPath, "output", "latest");
	if (!fs.existsSync(sourceDir)) {
		console.warn(
			`[pdf-snapshots] LaTeX output dir missing: ${sourceDir}. Did you run 'make' in the resume repo?`,
		);
		console.warn(`[pdf-snapshots] Skipping PDF generation.`);
		return;
	}

	fs.mkdirSync(TARGET_DIR, { recursive: true });

	const results: VariantResult[] = VARIANTS.map((v) => {
		const sourcePath = path.join(sourceDir, v.source);
		const targetPath = path.join(TARGET_DIR, `${v.id}.pdf`);
		try {
			const outcome = copyIfNewer(sourcePath, targetPath);
			return { id: v.id, outcome, source: sourcePath, target: targetPath };
		} catch (err) {
			console.warn(
				`[pdf-snapshots] ${v.id}: ${(err as Error).message}; skipping.`,
			);
			return { id: v.id, outcome: "missing-source" };
		}
	});

	let copied = 0;
	for (const r of results) {
		switch (r.outcome) {
			case "copied":
				console.log(`[pdf-snapshots] ${r.id}: copied ${path.basename(r.source!)} → public/resumes/${r.id}.pdf`);
				copied += 1;
				break;
			case "skipped-unchanged":
				console.log(`[pdf-snapshots] ${r.id}: unchanged (skip)`);
				break;
			case "missing-source":
				console.warn(
					`[pdf-snapshots] ${r.id}: source PDF missing in ${path.relative(process.cwd(), sourceDir)}/; download button will 404 until regenerated.`,
				);
				break;
			case "missing-latex-repo":
				// unreachable from per-variant branch
				break;
		}
	}

	console.log(
		`[pdf-snapshots] ✅ ${copied}/${results.length} copied, ${results.length - copied} no-op.`,
	);
}

main();
