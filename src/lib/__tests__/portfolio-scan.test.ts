import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import matter from "gray-matter";
import {
	buildCandidateReport,
	buildSeedManifestTemplate,
	emptyPortfolioDecisions,
	parsePortfolioManifest,
	stageSeedManifests,
	stagingFolderFor,
	type CandidateRow,
	type RepoInfo,
} from "../portfolio-scan";
import { PORTFOLIO_DEFAULT_TIER, PortfolioFrontmatterSchema } from "@/data/portfolio-schema";

const VALID_MANIFEST = `---
include: true
tier: featured
summary: >
  A short pitch for the card.
tags: [python, llm]
primary: code
---

# My Project

This is the blogpost body that becomes the project page section.

## Background

More content here.
`;

const VALID_OPTOUT = `---
include: false
tier: normal
---

# Not ready yet
`;

const MISSING_INCLUDE = `---
tier: normal
summary: "Forgot include"
---
`;

const NON_BOOLEAN_INCLUDE = `---
include: "yes"
---
`;

const INVALID_PRIMARY = `---
include: true
primary: music
---
`;

const INVALID_TIER = `---
include: true
tier: top
---
`;

const NO_FRONTMATTER = `# Just a heading

No frontmatter at all.
`;

describe("parsePortfolioManifest", () => {
	it("parses a valid manifest with include: true", () => {
		const result = parsePortfolioManifest(VALID_MANIFEST);
		expect(result.ok).toBe(true);
		expect(result.data?.include).toBe(true);
		expect(result.data?.tier).toBe("featured");
		expect(result.data?.primary).toBe("code");
		expect(result.data?.tags).toEqual(["python", "llm"]);
		expect(result.data?.summary).toContain("A short pitch");
		expect(result.body).toContain("# My Project");
		expect(result.body).toContain("## Background");
	});

	it("parses a valid opt-out manifest (include: false)", () => {
		const result = parsePortfolioManifest(VALID_OPTOUT);
		expect(result.ok).toBe(true);
		expect(result.data?.include).toBe(false);
		expect(result.data?.tier).toBe(PORTFOLIO_DEFAULT_TIER);
	});

	it("defaults tier to PORTFOLIO_DEFAULT_TIER when omitted", () => {
		const result = parsePortfolioManifest(VALID_MANIFEST.replace(/tier: featured\n/, ""));
		expect(result.ok).toBe(true);
		expect(result.data?.tier).toBe(PORTFOLIO_DEFAULT_TIER);
	});

	it("rejects manifest missing include", () => {
		const result = parsePortfolioManifest(MISSING_INCLUDE);
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/include/);
	});

	it("rejects manifest with non-boolean include", () => {
		const result = parsePortfolioManifest(NON_BOOLEAN_INCLUDE);
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/include/);
	});

	it("rejects manifest with invalid primary value", () => {
		const result = parsePortfolioManifest(INVALID_PRIMARY);
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/primary/);
	});

	it("rejects manifest with invalid tier value", () => {
		const result = parsePortfolioManifest(INVALID_TIER);
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/tier/);
	});

	it("rejects manifest with no frontmatter delimiters", () => {
		const result = parsePortfolioManifest(NO_FRONTMATTER);
		expect(result.ok).toBe(false);
		expect(result.error).toBeDefined();
	});

	it("preserves unknown frontmatter fields via passthrough", () => {
		const raw = `---
include: true
custom_flag: true
notes: "internal-only annotation"
---

Body`;
		const result = parsePortfolioManifest(raw) as ReturnType<typeof parsePortfolioManifest> & {
			data?: { custom_flag?: boolean; notes?: string };
		};
		expect(result.ok).toBe(true);
		expect(result.data?.custom_flag).toBe(true);
		expect(result.data?.notes).toBe("internal-only annotation");
	});
});

describe("buildCandidateReport", () => {
	const repoA: RepoInfo = {
		owner: "marceloprates",
		name: "alpha",
		visibility: "private",
		defaultBranch: "main",
		description: "An alpha project",
		primaryLanguage: "Python",
		stars: 0,
		topics: [],
	};
	const repoB: RepoInfo = {
		owner: "marceloprates",
		name: "beta",
		visibility: "public",
		defaultBranch: "main",
		description: "A beta project",
		primaryLanguage: "TypeScript",
		stars: 12,
		topics: ["web", "tools"],
	};

	const rows: CandidateRow[] = [
		{
			repo: repoA,
			manifestState: "included",
			frontmatter: {
				include: true,
				tier: "featured",
				summary: "An alpha pitch",
				tags: ["python", "ml"],
				primary: "code",
			},
		},
		{
			repo: repoB,
			manifestState: "no-manifest",
		},
	];

	it("renders a markdown header + table", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		expect(out).toMatch(/^# Portfolio candidates/m);
		expect(out).toMatch(/\| Repo \| Visibility \| Include \| Tier \| Summary \| Tags \|/);
	});

	it("includes both repos in the table", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		expect(out).toContain("`marceloprates/alpha`");
		expect(out).toContain("`marceloprates/beta`");
	});

	it("marks included manifest state with ✓", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		expect(out).toMatch(/\| `marceloprates\/alpha` \|[^|]*\| ✓ \|/);
	});

	it("marks no-manifest state with _no manifest_", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		expect(out).toMatch(/\| `marceloprates\/beta` \|[^|]*\| _no manifest_ \|/);
	});

	it("sorts private repos before public", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		const alphaIdx = out.indexOf("`marceloprates/alpha`");
		const betaIdx = out.indexOf("`marceloprates/beta`");
		expect(alphaIdx).toBeLessThan(betaIdx);
	});

	it("escapes pipe characters in summary", () => {
		const rowsWithPipe: CandidateRow[] = [
			{
				repo: repoA,
				manifestState: "included",
				frontmatter: {
					include: true,
					tier: "normal",
					summary: "Has | pipe and | another",
				},
			},
		];
		const out = buildCandidateReport(rowsWithPipe, "marceloprates");
		expect(out).toContain("Has \\| pipe and \\| another");
	});

	it("limits summary to 80 characters", () => {
		const longSummary = "x".repeat(200);
		const rowsLong: CandidateRow[] = [
			{
				repo: repoA,
				manifestState: "included",
				frontmatter: { include: true, tier: "normal", summary: longSummary },
			},
		];
		const out = buildCandidateReport(rowsLong, "marceloprates");
		// The summary cell contains at most 80 'x' chars (no escaping since no |)
		expect(out).toMatch(/\| x{80} \|/);
	});

	it("renders a counts section", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		expect(out).toContain("## Counts");
		expect(out).toContain("Included: 1");
		expect(out).toContain("No manifest: 1");
	});

	it("renders a how-to section", () => {
		const out = buildCandidateReport(rows, "marceloprates");
		expect(out).toContain("## How to opt in / opt out");
		expect(out).toContain("portfolio-decisions.json");
	});

	it("marks invalid manifest state with ⚠", () => {
		const rowsInvalid: CandidateRow[] = [
			{
				repo: repoA,
				manifestState: "invalid",
				manifestError: "include: Required",
			},
		];
		const out = buildCandidateReport(rowsInvalid, "marceloprates");
		expect(out).toMatch(/\| `marceloprates\/alpha` \|[^|]*\| ⚠ invalid \|/);
	});

	it("falls back to GitHub topics when manifest tags are absent", () => {
		const rowsNoTags: CandidateRow[] = [
			{
				repo: repoB,
				manifestState: "no-manifest",
			},
		];
		const out = buildCandidateReport(rowsNoTags, "marceloprates");
		expect(out).toContain("web, tools");
	});
});

describe("emptyPortfolioDecisions", () => {
	it("returns an empty object", () => {
		const decisions = emptyPortfolioDecisions();
		expect(decisions).toEqual({});
	});

	it("returns a fresh object each call (no shared mutable state)", () => {
		const a = emptyPortfolioDecisions();
		const b = emptyPortfolioDecisions();
		expect(a).not.toBe(b);
		a["foo/bar"] = { include: true };
		expect(b["foo/bar"]).toBeUndefined();
	});
});

describe("stagingFolderFor", () => {
	it("uses '<owner>-<name>' (no slashes; filesystem-safe)", () => {
		const repo: RepoInfo = {
			owner: "marceloprates",
			name: "secret-project",
			visibility: "private",
			defaultBranch: "main",
			description: null,
			primaryLanguage: null,
			stars: 0,
			topics: [],
		};
		expect(stagingFolderFor(repo)).toBe("marceloprates-secret-project");
	});

	it("preserves dots and underscores in the repo name", () => {
		const repo: RepoInfo = {
			owner: "owner",
			name: "my.cool_project",
			visibility: "private",
			defaultBranch: "main",
			description: null,
			primaryLanguage: null,
			stars: 0,
			topics: [],
		};
		expect(stagingFolderFor(repo)).toBe("owner-my.cool_project");
	});
});

describe("buildSeedManifestTemplate", () => {
	const repo: RepoInfo = {
		owner: "marceloprates",
		name: "secret-project",
		visibility: "private",
		defaultBranch: "main",
		description: "A secret project for testing",
		primaryLanguage: "TypeScript",
		stars: 0,
		topics: [],
	};

	it("starts with a YAML frontmatter block", () => {
		const tpl = buildSeedManifestTemplate(repo);
		expect(tpl).toMatch(/^---\n/);
		expect(tpl).toMatch(/\n---\n/);
	});

	it("includes include: true and the default tier", () => {
		const tpl = buildSeedManifestTemplate(repo);
		expect(tpl).toMatch(/^include: true$/m);
		expect(tpl).toMatch(/^tier: normal$/m);
	});

	it("uses the repo description as the summary seed", () => {
		const tpl = buildSeedManifestTemplate(repo);
		expect(tpl).toContain("A secret project for testing");
	});

	it("uses a generic summary when description is null", () => {
		const tpl = buildSeedManifestTemplate({ ...repo, description: null });
		expect(tpl).toContain("Short pitch for secret-project");
	});

	it("uses a generic body when description is null", () => {
		const tpl = buildSeedManifestTemplate({ ...repo, description: null });
		expect(tpl).toContain("# secret-project");
		expect(tpl).toContain("/projects/<slug>");
	});

	it("includes the repo name as the H1", () => {
		const tpl = buildSeedManifestTemplate(repo);
		expect(tpl).toMatch(/^# secret-project$/m);
	});

	it("includes an HTML comment explaining how to opt out", () => {
		const tpl = buildSeedManifestTemplate(repo);
		expect(tpl).toMatch(/<!--/);
		expect(tpl).toMatch(/include: false/);
		expect(tpl).toMatch(/-->/);
	});

	it("frontmatter parses cleanly with PortfolioFrontmatterSchema (round-trip)", () => {
		const tpl = buildSeedManifestTemplate(repo);
		// Re-parse the generated frontmatter the way the scan script does
		// after the user commits this file to the source repo. Confirms
		// the seed template is consumable end-to-end.
		const parsed = matter(tpl);
		const result = PortfolioFrontmatterSchema.safeParse(parsed.data);
		expect(result.success).toBe(true);
	});
});

describe("stageSeedManifests (filesystem)", () => {
	let tmp: string;
	beforeEach(() => {
		tmp = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-stage-"));
	});
	afterEach(() => {
		fs.rmSync(tmp, { recursive: true, force: true });
	});

	const mkRepo = (overrides: Partial<RepoInfo>): RepoInfo => ({
		owner: "marceloprates",
		name: "repo",
		visibility: "private",
		defaultBranch: "main",
		description: null,
		primaryLanguage: null,
		stars: 0,
		topics: [],
		...overrides,
	});

	it("is a no-op when there are no private no-manifest repos", () => {
		const rows: CandidateRow[] = [
			{
				repo: mkRepo({ name: "public-ok", visibility: "public" }),
				manifestState: "no-manifest",
			},
			{
				repo: mkRepo({ name: "private-has-manifest" }),
				manifestState: "included",
			},
			{
				repo: mkRepo({ name: "private-excluded" }),
				manifestState: "excluded",
			},
			{
				repo: mkRepo({ name: "private-invalid" }),
				manifestState: "invalid",
			},
		];
		const result = stageSeedManifests(rows, tmp);
		expect(result.wrote).toEqual([]);
		// All 4 rows should be in the skipped list with reasons.
		expect(result.skipped.length).toBe(4);
		// No folders created.
		expect(fs.readdirSync(tmp)).toEqual([]);
	});

	it("writes one file per private no-manifest repo", () => {
		const rows: CandidateRow[] = [
			{
				repo: mkRepo({ name: "alpha", visibility: "private" }),
				manifestState: "no-manifest",
			},
			{
				repo: mkRepo({ name: "beta", visibility: "private" }),
				manifestState: "no-manifest",
			},
		];
		const result = stageSeedManifests(rows, tmp);
		expect(result.wrote.length).toBe(2);
		// Folders are <owner>-<name>/portfolio.md.
		expect(fs.existsSync(path.join(tmp, "marceloprates-alpha", "portfolio.md"))).toBe(true);
		expect(fs.existsSync(path.join(tmp, "marceloprates-beta", "portfolio.md"))).toBe(true);
	});

	it("does NOT stage public repos (safety check)", () => {
		const rows: CandidateRow[] = [
			{
				repo: mkRepo({ name: "public-one", visibility: "public" }),
				manifestState: "no-manifest",
			},
		];
		const result = stageSeedManifests(rows, tmp);
		expect(result.wrote).toEqual([]);
		expect(result.skipped[0].reason).toMatch(/public repo/);
	});

	it("does NOT overwrite or stage when a manifest already exists", () => {
		const rows: CandidateRow[] = [
			{
				repo: mkRepo({ name: "has-manifest", visibility: "private" }),
				manifestState: "included",
			},
		];
		const result = stageSeedManifests(rows, tmp);
		expect(result.wrote).toEqual([]);
		expect(result.skipped[0].reason).toMatch(/manifest state: included/);
	});

	it("creates the staging directory if it doesn't exist", () => {
		const nested = path.join(tmp, "nested", "deeper");
		const rows: CandidateRow[] = [
			{ repo: mkRepo({ name: "alpha" }), manifestState: "no-manifest" },
		];
		const result = stageSeedManifests(rows, nested);
		expect(result.wrote.length).toBe(1);
		expect(fs.existsSync(path.join(nested, "marceloprates-alpha", "portfolio.md"))).toBe(true);
	});

	it("is idempotent — re-running overwrites the seed file", () => {
		const rows: CandidateRow[] = [
			{ repo: mkRepo({ name: "alpha" }), manifestState: "no-manifest" },
		];
		stageSeedManifests(rows, tmp);
		const first = fs.readFileSync(
			path.join(tmp, "marceloprates-alpha", "portfolio.md"),
			"utf8",
		);
		stageSeedManifests(rows, tmp);
		const second = fs.readFileSync(
			path.join(tmp, "marceloprates-alpha", "portfolio.md"),
			"utf8",
		);
		// Same content; no corruption, no duplicate files.
		expect(second).toBe(first);
		expect(fs.readdirSync(tmp).length).toBe(1);
	});

	it("staged content is a valid portfolio.md (frontmatter parses via the lib's parser)", () => {
		const rows: CandidateRow[] = [
			{ repo: mkRepo({ name: "alpha", description: "An alpha" }), manifestState: "no-manifest" },
		];
		stageSeedManifests(rows, tmp);
		const staged = fs.readFileSync(
			path.join(tmp, "marceloprates-alpha", "portfolio.md"),
			"utf8",
		);
		const parsed = parsePortfolioManifest(staged);
		expect(parsed.ok).toBe(true);
		expect(parsed.data?.include).toBe(true);
		expect(parsed.data?.tier).toBe(PORTFOLIO_DEFAULT_TIER);
	});
});
