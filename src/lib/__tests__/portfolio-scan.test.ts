import { describe, expect, it } from "vitest";
import {
	buildCandidateReport,
	emptyPortfolioDecisions,
	parsePortfolioManifest,
	type CandidateRow,
	type RepoInfo,
} from "../portfolio-scan";
import { PORTFOLIO_DEFAULT_TIER } from "@/data/portfolio-schema";

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
