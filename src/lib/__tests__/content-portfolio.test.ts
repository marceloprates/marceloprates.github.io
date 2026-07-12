import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	_resetPortfolioBodiesIndexForTests,
	buildPortfolioBodiesIndexForRoot,
	getProjectBySlug,
	readPortfolioBodyFromFile,
} from "../content";

const VALID_BODY = `---
include: true
tier: featured
summary: >
  A pitch for the body fallback test.
tags: [python, llm]
---

# My Private Project

Some blogpost body content for testing the body fallback.
`;

const PUBLIC_BODY = `---
include: true
summary: A public-side body.
---

# Public Project Body
`;

describe("buildPortfolioBodiesIndexForRoot (pure)", () => {
	let tmp: string;
	beforeEach(() => {
		tmp = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-index-"));
	});
	afterEach(() => {
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	it("returns empty map when root doesn't exist", () => {
		expect(buildPortfolioBodiesIndexForRoot(path.join(tmp, "missing"))).toEqual(
			new Map(),
		);
	});

	it("returns empty map when root has no portfolio.md files", () => {
		expect(buildPortfolioBodiesIndexForRoot(tmp)).toEqual(new Map());
	});

	it("indexes a single folder by its <name> part of <owner>-<name>", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "portfolio.md"), VALID_BODY);
		const map = buildPortfolioBodiesIndexForRoot(tmp);
		expect(map.size).toBe(1);
		expect(map.get("alpha")).toBe(path.join(dir, "portfolio.md"));
	});

	it("prefers explicit frontmatter slug over folder-derived slug", () => {
		const dir = path.join(tmp, "marceloprates-something");
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(
			path.join(dir, "portfolio.md"),
			VALID_BODY.replace("tags: [python, llm]", "tags: [python, llm]\nslug: my-custom-slug"),
		);
		const map = buildPortfolioBodiesIndexForRoot(tmp);
		expect(map.get("my-custom-slug")).toBe(path.join(dir, "portfolio.md"));
		expect(map.has("something")).toBe(false);
	});

	it("indexes multiple folders", () => {
		for (const name of ["alpha", "beta", "gamma"]) {
			const dir = path.join(tmp, `marceloprates-${name}`);
			fs.mkdirSync(dir, { recursive: true });
			fs.writeFileSync(path.join(dir, "portfolio.md"), VALID_BODY);
		}
		const map = buildPortfolioBodiesIndexForRoot(tmp);
		expect(map.size).toBe(3);
		expect(map.has("alpha")).toBe(true);
		expect(map.has("beta")).toBe(true);
		expect(map.has("gamma")).toBe(true);
	});

	it("ignores non-directory entries (e.g. stray files at root)", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "portfolio.md"), VALID_BODY);
		// Stray file at the root — should be ignored, not crash.
		fs.writeFileSync(path.join(tmp, "stray.md"), VALID_BODY);
		const map = buildPortfolioBodiesIndexForRoot(tmp);
		expect(map.size).toBe(1);
	});

	it("ignores folders without a portfolio.md", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "README.md"), "# not a portfolio");
		const map = buildPortfolioBodiesIndexForRoot(tmp);
		expect(map.size).toBe(0);
	});
});

describe("readPortfolioBodyFromFile (filesystem)", () => {
	let tmp: string;
	beforeEach(() => {
		tmp = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-read-"));
	});
	afterEach(() => {
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	function writeSidecar(filePath: string, visibility: "public" | "private") {
		const sidecar = {
			owner: "marceloprates",
			name: path.basename(path.dirname(filePath)).replace(/^marceloprates-/, ""),
			visibility,
			defaultBranch: "main",
			stars: 0,
		};
		fs.writeFileSync(
			path.join(path.dirname(filePath), "portfolio.meta.json"),
			JSON.stringify(sidecar, null, 2),
		);
	}

	it("returns null when the sidecar is missing", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		fs.writeFileSync(filePath, VALID_BODY);
		expect(readPortfolioBodyFromFile("alpha", filePath)).toBeNull();
	});

	it("returns null when the sidecar is malformed", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		fs.writeFileSync(filePath, VALID_BODY);
		fs.writeFileSync(path.join(dir, "portfolio.meta.json"), "{not valid json");
		expect(readPortfolioBodyFromFile("alpha", filePath)).toBeNull();
	});

	it("returns null when sidecar visibility is not public/private", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		fs.writeFileSync(filePath, VALID_BODY);
		fs.writeFileSync(
			path.join(dir, "portfolio.meta.json"),
			JSON.stringify({ visibility: "internal" }),
		);
		expect(readPortfolioBodyFromFile("alpha", filePath)).toBeNull();
	});

	it("returns meta + content for a private repo body", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		fs.writeFileSync(filePath, VALID_BODY);
		writeSidecar(filePath, "private");

		const result = readPortfolioBodyFromFile("alpha", filePath);
		expect(result).not.toBeNull();
		expect(result?.meta.private).toBe(true);
		expect(result?.meta.title).toBe("My Private Project"); // from H1
		expect(result?.meta.slug).toBe("alpha");
		expect(result?.content).toContain("Some blogpost body content");
	});

	it("does NOT set private: true for a public repo body", () => {
		const dir = path.join(tmp, "marceloprates-beta");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		fs.writeFileSync(filePath, PUBLIC_BODY);
		writeSidecar(filePath, "public");

		const result = readPortfolioBodyFromFile("beta", filePath);
		expect(result).not.toBeNull();
		expect(result?.meta.private).toBeUndefined();
	});

	it("prefers frontmatter title over H1", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		const withTitle = VALID_BODY.replace(
			"include: true",
			"include: true\ntitle: My Explicit Title",
		);
		fs.writeFileSync(filePath, withTitle);
		writeSidecar(filePath, "private");

		const result = readPortfolioBodyFromFile("alpha", filePath);
		expect(result?.meta.title).toBe("My Explicit Title");
	});

	it("falls back to slug as title when no frontmatter title and no H1", () => {
		const dir = path.join(tmp, "marceloprates-alpha");
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		const noTitle = `---
include: true
---
No heading here, just body.
`;
		fs.writeFileSync(filePath, noTitle);
		writeSidecar(filePath, "private");

		const result = readPortfolioBodyFromFile("alpha", filePath);
		expect(result?.meta.title).toBe("alpha");
	});
});

describe("getProjectBySlug (body fallback integration)", () => {
	let cwdSpy: ReturnType<typeof vi.spyOn>;
	let tmp: string;
	beforeEach(() => {
		_resetPortfolioBodiesIndexForTests();
		tmp = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-fallback-"));
		cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tmp);
	});
	afterEach(() => {
		cwdSpy.mockRestore();
		_resetPortfolioBodiesIndexForTests();
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	function seedPortfolioBody(opts: {
		owner?: string;
		name: string;
		body?: string;
		visibility: "public" | "private";
	}) {
		const owner = opts.owner ?? "marceloprates";
		const dir = path.join(tmp, "portfolio-bodies", `${owner}-${opts.name}`);
		fs.mkdirSync(dir, { recursive: true });
		const filePath = path.join(dir, "portfolio.md");
		fs.writeFileSync(filePath, opts.body ?? VALID_BODY);
		fs.writeFileSync(
			path.join(dir, "portfolio.meta.json"),
			JSON.stringify({
				owner,
				name: opts.name,
				visibility: opts.visibility,
				defaultBranch: "main",
				stars: 0,
			}),
		);
	}

	it("returns the cached body when content/projects/<slug>.md is absent", () => {
		seedPortfolioBody({ name: "alpha", visibility: "private" });
		const result = getProjectBySlug("alpha");
		expect(result).not.toBeNull();
		expect(result?.meta.private).toBe(true);
		expect(result?.meta.slug).toBe("alpha");
	});

	it("returns null when neither local nor portfolio bodies have the slug", () => {
		expect(getProjectBySlug("nothing-here")).toBeNull();
	});

	it("returns the local content/projects/<slug>.md FIRST when it exists, ignoring portfolio bodies", () => {
		// Seed both: local (public, no private flag) and portfolio (private).
		// The local one should win — that's the existing-public-flow contract.
		const localDir = path.join(tmp, "content", "projects");
		fs.mkdirSync(localDir, { recursive: true });
		fs.writeFileSync(
			path.join(localDir, "alpha.md"),
			`---
title: Local Alpha
excerpt: From content/projects
---
Local body content`,
		);
		seedPortfolioBody({
			name: "alpha",
			visibility: "private",
			body: `---
include: true
---
# Portfolio Alpha Body`,
		});

		const result = getProjectBySlug("alpha");
		expect(result?.meta.title).toBe("Local Alpha");
		expect(result?.meta.private).toBeUndefined();
		expect(result?.content).toContain("Local body content");
	});

	it("respects frontmatter slug for lookup", () => {
		seedPortfolioBody({
			name: "internal-name",
			visibility: "private",
			body: VALID_BODY.replace("tags: [python, llm]", "tags: [python, llm]\nslug: custom"),
		});
		expect(getProjectBySlug("custom")?.meta.slug).toBe("custom");
		expect(getProjectBySlug("internal-name")).toBeNull();
	});
});
