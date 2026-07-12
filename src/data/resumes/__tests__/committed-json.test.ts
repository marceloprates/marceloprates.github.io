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
 * This test catches that regression: any committed JSON with an
 * empty `work` array fails loudly with a clear pointer at the
 * resolution chain.
 */
import { describe, expect, it } from "vitest";
import ai from "../ai.json";
import ds from "../ds.json";
import ml from "../ml.json";

const VARIANTS = [
	{ id: "ai", data: ai },
	{ id: "ds", data: ds },
	{ id: "ml", data: ml },
] as const;

describe("committed resume JSONs", () => {
	for (const v of VARIANTS) {
		it(`${v.id}.json has non-empty work[]`, () => {
			expect(Array.isArray(v.data.work)).toBe(true);
			expect(v.data.work.length).toBeGreaterThan(0);
		});

		it(`${v.id}.json has basics.name populated`, () => {
			expect(typeof v.data.basics?.name).toBe("string");
			expect(v.data.basics.name.length).toBeGreaterThan(0);
		});

		it(`${v.id}.json has at least one skill group`, () => {
			expect(Array.isArray(v.data.skills)).toBe(true);
			expect(v.data.skills.length).toBeGreaterThan(0);
		});
	}
});
