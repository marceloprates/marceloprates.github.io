/**
 * paths.ts — shared path-resolution for local development assets.
 *
 * The marceloprates.github.io site relies on assets that live outside
 * this repo (private LaTeX resume repo, etc.) for build-time
 * regeneration. This helper centralizes the "where do I find it"
 * resolution so the JSON-script and PDF-script agree on the same
 * priority order.
 *
 * Resolution priority:
 *   1. Explicit env var (RESUME_LOCAL_PATH). If set but the path
 *      does not exist, returns null (do NOT silently fall back —
 *      the user explicitly asked for a path that does not exist;
 *      failing loudly surfaces the misconfiguration).
 *   2. Auto-detected fallback: `<homedir>/projects/active/personal/resume`
 *      (matches the user's local clone; case is irrelevant on
 *      case-insensitive filesystems which is the default on macOS).
 *
 * Returns null when neither resolves. Callers choose between throwing
 * (fatal — used by generate-json-resume, where empty JSONs are a
 * silent regression) and warning (non-fatal — used by
 * generate-pdf-snapshots, where missing PDFs degrade gracefully).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const LATEX_PATH_ENV = "RESUME_LOCAL_PATH";

/** Default fallback path relative to $HOME. Exported for tests. */
export const LATEX_AUTO_PATH = path.join(
	os.homedir(),
	"projects",
	"active",
	"personal",
	"resume",
);

/**
 * Resolves the local LaTeX resume repo path. Returns null if neither
 * the explicit env var nor the auto-detected fallback resolves to an
 * existing directory.
 */
export function resolveLocalLatexPath(): string | null {
	const envPath = process.env[LATEX_PATH_ENV];
	if (envPath !== undefined && envPath.trim().length > 0) {
		return fs.existsSync(envPath) ? envPath : null;
	}
	return fs.existsSync(LATEX_AUTO_PATH) ? LATEX_AUTO_PATH : null;
}

/**
 * Strict variant of `resolveLocalLatexPath` that throws when neither
 * resolution source is available. Use this for assets where missing
 * data is a build-breaking regression (e.g. resume JSONs).
 */
export function requireLocalLatexPath(): string {
	const resolved = resolveLocalLatexPath();
	if (resolved === null) {
		throw new Error(
			`[paths] Cannot find local LaTeX resume repo.\n` +
				`  Set ${LATEX_PATH_ENV} explicitly, or clone to ${LATEX_AUTO_PATH}.\n` +
				`  Without a source path, the generated JSONs would be empty.`,
		);
	}
	return resolved;
}
