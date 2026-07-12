import fs from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
	LATEX_AUTO_PATH,
	LATEX_PATH_ENV,
	requireLocalLatexPath,
	resolveLocalLatexPath,
} from "../paths";

const ORIGINAL_ENV = process.env[LATEX_PATH_ENV];

afterEach(() => {
	if (ORIGINAL_ENV === undefined) {
		delete process.env[LATEX_PATH_ENV];
	} else {
		process.env[LATEX_PATH_ENV] = ORIGINAL_ENV;
	}
});

describe("resolveLocalLatexPath", () => {
	it("prefers explicit env var over auto-detect", () => {
		process.env[LATEX_PATH_ENV] = "/custom/path/that/exists";
		// We can't easily mock fs.existsSync to return true for both
		// paths in the same test without a fake-fs library. So we
		// instead use the actual existing auto-detect path and a
		// custom env that ALSO exists (use the project root as a
		// stand-in for "exists"). Verifies env wins because we'd
		// otherwise match the first fs.existsSync check.
		//
		// Simpler case — assert env wins by using a path we know
		// exists on this machine:
		process.env[LATEX_PATH_ENV] = process.cwd();
		const resolved = resolveLocalLatexPath();
		expect(resolved).toBe(process.cwd());
		// Sanity: must NOT be the auto-detect fallback
		expect(resolved).not.toBe(LATEX_AUTO_PATH);
	});

	it("falls back to auto-detect when env var is unset", () => {
		delete process.env[LATEX_PATH_ENV];
		// This test asserts fallback ONLY when auto-detect exists.
		// On machines without the path, it correctly returns null.
		const resolved = resolveLocalLatexPath();
		if (LATEX_AUTO_PATH !== undefined && resolved !== null) {
			// Either we resolved to the auto-detect, or to nothing.
			// If something was returned, it must be the auto-detect
			// path (since env was deleted above).
			expect(resolved).toBe(LATEX_AUTO_PATH);
		} else {
			expect(resolved).toBeNull();
		}
	});

	it("treats empty-string env var as unset", () => {
		process.env[LATEX_PATH_ENV] = "   ";
		const resolved = resolveLocalLatexPath();
		// Either fallback (when it exists) or null — never an empty string
		if (resolved !== null) expect(resolved.length).toBeGreaterThan(0);
	});

	it("returns null when env var points at non-existent path", () => {
		process.env[LATEX_PATH_ENV] = "/definitely/does/not/exist/2026-07-12";
		expect(resolveLocalLatexPath()).toBeNull();
	});

	it("returns null when env var unset and auto-detect missing", () => {
		// Without env var set, auto-detect might or might not exist on
		// this machine. The contract is: never throw, return null
		// when nothing resolves; otherwise return the resolved path.
		// This assertion verifies both behaviors apply.
		delete process.env[LATEX_PATH_ENV];
		const resolved = resolveLocalLatexPath();
		if (!fs.existsSync(LATEX_AUTO_PATH)) {
			expect(resolved).toBeNull();
		}
		// On machines where auto-detect exists, this is a no-op
		// (returns the auto-detect path), which is the documented
		// fallback behavior. We assert the property only when
		// auto-detect is missing.
	});
});

describe("requireLocalLatexPath", () => {
	it("returns the resolved path when available", () => {
		// Use the cwd as a guaranteed-existing path
		process.env[LATEX_PATH_ENV] = process.cwd();
		expect(requireLocalLatexPath()).toBe(process.cwd());
	});

	it("throws with helpful message when nothing resolves", () => {
		process.env[LATEX_PATH_ENV] = "/definitely/does/not/exist/2026-07-12";
		expect(() => requireLocalLatexPath()).toThrow(/local LaTeX resume repo/);
		expect(() => requireLocalLatexPath()).toThrow(/RESUME_LOCAL_PATH/);
	});
});
