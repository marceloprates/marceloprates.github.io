/**
 * committed-json.test.ts — guard against silently-empty resume JSONs.
 *
 * The build pipeline regenerates these files via `npm run
 * generate:resumes`, which depends on the local LaTeX clone at
 * `~/projects/active/personal/resume` (or RESUME_LOCAL_PATH env
 * override). If somebody runs `next build` without the LaTeX
 * source available, the old script silently wrote empty arrays,
 * and the deployed site shipped empty resume tabs without anyone
 * noticing until live traffic.
 *
 * This test catches that regression: any non-empty committed JSON
 * with an empty `work` array fails loudly with a clear pointer at
 * the resolution chain.
 *
 * Note: as of nav-redesign Phase B (2026-07-12), the JSONs are
 * gitignored (see `.gitignore`); they exist on disk only when the
 * generator has run. The import statements below double as a
 * presence check — if a file is missing the build is broken and
 * the test should fail loudly. The `ds` variant is the lone
 * exception: its LaTeX persona has not been populated yet, and
 * the test skips that one slot pending work in the LaTeX source.
 */
import { describe, expect, it } from "vitest";
import ai from "../ai.json";
import ds from "../ds.json";
import ml from "../ml.json";
// ai+ml.json is also generated; it shares the same work-list as ml
// so it would duplicate tests. We import it to keep TypeScript
// honest about the on-disk shape, and we test work[] only on the
// three personas explicitly listed below.
import aiMl from "../ai+ml.json";

const VARIANTS = [
	{ id: "ai", data: ai },
	{ id: "ds", data: ds },
	{ id: "ml", data: ml },
	{ id: "ai+ml", data: aiMl },
] as const;

describe("committed resume JSONs", () => {
	for (const v of VARIANTS) {
		it(`${v.id}.json has basics.name populated`, () => {
			expect(typeof v.data.basics?.name).toBe("string");
			expect(v.data.basics.name.length).toBeGreaterThan(0);
		});

		it(`${v.id}.json has at least one skill group`, () => {
			expect(Array.isArray(v.data.skills)).toBe(true);
			expect(v.data.skills.length).toBeGreaterThan(0);
		});
	}

	// Per the user's locked Phase B decision (2026-07-12), `ds.json`
	// is the junior-DS persona whose LaTeX source has no populated
	// work[] yet. The generator writes work: [] and that is correct
	// for now. Skip the work[] assertion for `ds` only; re-enable
	// once the LaTeX source is populated.
	for (const v of VARIANTS) {
		it.runIf(v.id !== "ds")(`${v.id}.json has non-empty work[]`, () => {
			expect(Array.isArray(v.data.work)).toBe(true);
			expect(v.data.work.length).toBeGreaterThan(0);
		});
	}
});
