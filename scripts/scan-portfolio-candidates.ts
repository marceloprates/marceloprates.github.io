#!/usr/bin/env -S npx tsx
/**
 * scripts/scan-portfolio-candidates.ts
 *
 * Enumerates every repo the user owns (public + private), fetches
 * `portfolio.md` from each, and produces:
 *
 *   - portfolio-candidates.md   (gitignored) — review report
 *   - portfolio-decisions.json  (committed)  — opt-in/out decisions
 *
 * Staging (`portfolio-manifests-to-seed/`) and the body cache
 * (`portfolio-bodies/`) are written by separate Phase B commits.
 *
 * **No remote writes.** The script never pushes to GitHub.
 *
 * Auth: prefers `GH_TOKEN`/`GITHUB_TOKEN`/`GITHUB_PAT` env vars;
 * falls back to `gh auth token`. Errors clearly if neither.
 *
 * Run:
 *   npm run scan:portfolio
 *   PORTFOLIO_OWNER=othername npm run scan:portfolio   # override owner
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	buildCandidateReport,
	cacheIncludedBodies,
	emptyPortfolioDecisions,
	loadPortfolioDecisions,
	parsePortfolioManifest,
	stageSeedManifests,
	type CandidateRow,
	type ManifestParseResult,
	type RepoInfo,
} from "../src/lib/portfolio-scan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const OWNER = process.env.PORTFOLIO_OWNER ?? "marceloprates";
const REPORT_PATH = path.join(ROOT, "portfolio-candidates.md");
const DECISIONS_PATH = path.join(ROOT, "portfolio-decisions.json");
const SEED_DIR = path.join(ROOT, "portfolio-manifests-to-seed");
const BODIES_DIR = path.join(ROOT, "portfolio-bodies");
const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";
const USER_AGENT = "marceloprates-portfolio-scan";

/* ------------------------------------------------------------------ *
 * Auth
 * ------------------------------------------------------------------ */

async function getToken(): Promise<string> {
	const envToken =
		process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_PAT;
	if (envToken && envToken.trim().length > 0) return envToken.trim();

	// Fall back to `gh auth token`. The `gh` CLI is the most common
	// auth carrier on dev machines; CI usually sets GITHUB_TOKEN.
	return new Promise<string>((resolve, reject) => {
		const proc = spawn("gh", ["auth", "token"]);
		let stdout = "";
		let stderr = "";
		proc.stdout.on("data", (d) => {
			stdout += d.toString();
		});
		proc.stderr.on("data", (d) => {
			stderr += d.toString();
		});
		proc.on("error", () => {
			reject(
				new Error(
					`No GH_TOKEN/GITHUB_TOKEN/GITHUB_PAT env var AND \`gh\` CLI is not on PATH. ` +
						`Set GH_TOKEN (https://github.com/settings/tokens, 'repo' scope for privates) or run \`gh auth login\`.`,
				),
			);
		});
		proc.on("close", (code) => {
			if (code !== 0) {
				reject(
					new Error(
						`\`gh auth token\` failed (exit ${code}): ${stderr.trim() || "no stderr"}`,
					),
				);
				return;
			}
			const t = stdout.trim();
			if (!t) reject(new Error("`gh auth token` returned empty"));
			else resolve(t);
		});
	});
}

/* ------------------------------------------------------------------ *
 * Repo enumeration
 * ------------------------------------------------------------------ */

async function listAllRepos(token: string, owner: string): Promise<RepoInfo[]> {
	const headers = {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${token}`,
		"User-Agent": USER_AGENT,
	};

	const all: unknown[] = [];
	let page = 1;
	while (true) {
		const url = `${API}/users/${owner}/repos?per_page=100&page=${page}&type=all&sort=updated`;
		const res = await fetch(url, { headers });
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(
				`List repos failed: ${res.status} ${res.statusText} — ${text.slice(0, 200)}`,
			);
		}
		const pageRepos = (await res.json()) as unknown[];
		if (pageRepos.length === 0) break;
		all.push(...pageRepos);
		page++;
		if (page > 50) {
			// safety: 5000 repos is way past any reasonable personal account.
			throw new Error("Aborting pagination after 50 pages (5000 repos).");
		}
	}

	type GhRepo = {
		owner: { login: string };
		name: string;
		private: boolean;
		default_branch: string;
		description: string | null;
		language: string | null;
		stargazers_count: number;
		topics?: string[];
		fork: boolean;
		archived: boolean;
		disabled: boolean;
	};

	return (all as GhRepo[])
		.filter((r) => !r.fork && !r.archived && !r.disabled)
		.map((r) => ({
			owner: r.owner.login,
			name: r.name,
			visibility: r.private ? "private" : "public",
			defaultBranch: r.default_branch,
			description: r.description,
			primaryLanguage: r.language,
			stars: r.stargazers_count,
			topics: r.topics ?? [],
		}));
}

/* ------------------------------------------------------------------ *
 * Manifest fetch
 * ------------------------------------------------------------------ */

async function fetchManifest(
	repo: RepoInfo,
	token: string,
): Promise<{ raw: string | null; parseResult: ManifestParseResult }> {
	const url = `${RAW}/${repo.owner}/${repo.name}/${repo.defaultBranch}/portfolio.md`;
	const res = await fetch(url, {
		headers: {
			Accept: "text/plain",
			Authorization: `Bearer ${token}`,
			"User-Agent": USER_AGENT,
		},
	});
	if (res.status === 404) {
		return {
			raw: null,
			parseResult: { ok: false, error: "manifest not found" },
		};
	}
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(
			`Fetch ${repo.owner}/${repo.name}/portfolio.md failed: ${res.status} ${res.statusText} — ${text.slice(0, 200)}`,
		);
	}
	const raw = await res.text();
	return { raw, parseResult: parsePortfolioManifest(raw) };
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

function stateLabel(s: CandidateRow["manifestState"]): string {
	switch (s) {
		case "included":
			return "✓ included";
		case "excluded":
			return "✗ excluded";
		case "invalid":
			return "⚠ invalid";
		case "no-manifest":
			return "  no manifest";
	}
}

async function main(): Promise<void> {
	const token = await getToken();
	console.log(`[scan] owner=${OWNER}`);
	console.log(`[scan] enumerating repos (visibility: all)...`);

	const repos = await listAllRepos(token, OWNER);
	console.log(
		`[scan] found ${repos.length} repos (${repos.filter((r) => r.visibility === "private").length} private, ${repos.filter((r) => r.visibility === "public").length} public)`,
	);

	const rows: CandidateRow[] = [];
	for (const repo of repos) {
		let row: CandidateRow;
		try {
			const { raw, parseResult } = await fetchManifest(repo, token);
			if (raw === null) {
				row = { repo, manifestState: "no-manifest" };
			} else if (!parseResult.ok) {
				row = {
					repo,
					manifestState: "invalid",
					manifestError: parseResult.error,
					raw,
				};
			} else if (parseResult.data?.include) {
				row = {
					repo,
					manifestState: "included",
					frontmatter: parseResult.data,
					raw,
				};
			} else {
				row = {
					repo,
					manifestState: "excluded",
					frontmatter: parseResult.data,
					raw,
				};
			}
		} catch (err) {
			console.error(
				`  ! ${repo.owner}/${repo.name}: ${err instanceof Error ? err.message : String(err)}`,
			);
			row = {
				repo,
				manifestState: "invalid",
				manifestError: err instanceof Error ? err.message : String(err),
			};
		}
		rows.push(row);
		console.log(`  ${stateLabel(row.manifestState).padEnd(14)} ${repo.owner}/${repo.name}${row.manifestError ? ` (${row.manifestError})` : ""}`);
	}

	// Write the report (gitignored)
	const report = buildCandidateReport(rows, OWNER);
	fs.writeFileSync(REPORT_PATH, report);
	console.log(`[scan] wrote report → ${path.relative(ROOT, REPORT_PATH)}`);

	// Initialize decisions JSON if missing (first run)
	if (!fs.existsSync(DECISIONS_PATH)) {
		fs.writeFileSync(DECISIONS_PATH, JSON.stringify(emptyPortfolioDecisions(), null, 2) + "\n");
		console.log(
			`[scan] wrote empty decisions → ${path.relative(ROOT, DECISIONS_PATH)} (committed)`,
		);
	} else {
		console.log(
			`[scan] decisions already exist at ${path.relative(ROOT, DECISIONS_PATH)} (not overwritten; edit manually to opt in/out)`,
		);
	}

	// Stage seed manifests for private repos that don't have one yet.
	// **No remote writes.** The user copies these files into the source repo
	// and commits them per-repo. Public repos are NEVER auto-staged.
	const staging = stageSeedManifests(rows, SEED_DIR);
	if (staging.wrote.length > 0) {
		console.log(
			`[scan] staged ${staging.wrote.length} seed manifest(s) under ${path.relative(ROOT, SEED_DIR)}/ (gitignored; user commits per-repo)`,
		);
		for (const p of staging.wrote) {
			console.log(`  + ${path.relative(ROOT, p)}`);
		}
	} else {
		console.log(
			`[scan] no private repos needed staging (all have manifests, or none are private). ${path.relative(ROOT, SEED_DIR)}/ untouched.`,
		);
	}
	if (staging.skipped.length > 0) {
		const skipByReason = staging.skipped.reduce<Record<string, number>>((acc, s) => {
			acc[s.reason] = (acc[s.reason] ?? 0) + 1;
			return acc;
		}, {});
		const summary = Object.entries(skipByReason)
			.map(([reason, n]) => `${n} ${reason}`)
			.join("; ");
		console.log(`[scan] skipped staging: ${summary}`);
	}

	// Cache raw `portfolio.md` bodies locally for opted-in repos. This
	// way the build (`getProjectBySlug` fallback in Phase C) doesn't
	// depend on GitHub being reachable. Decisions JSON wins over the
	// in-repo manifest.
	const decisions = loadPortfolioDecisions(DECISIONS_PATH);
	const caching = cacheIncludedBodies(rows, decisions, BODIES_DIR);
	if (caching.wrote.length > 0) {
		console.log(
			`[scan] cached ${caching.wrote.length} body file(s) under ${path.relative(ROOT, BODIES_DIR)}/ (gitignored)`,
		);
		for (const p of caching.wrote) {
			console.log(`  + ${path.relative(ROOT, p)}`);
		}
	} else {
		console.log(
			`[scan] no bodies to cache (no opted-in repos with a manifest). ${path.relative(ROOT, BODIES_DIR)}/ untouched.`,
		);
	}
	if (caching.skipped.length > 0) {
		const skipByReason = caching.skipped.reduce<Record<string, number>>((acc, s) => {
			acc[s.reason] = (acc[s.reason] ?? 0) + 1;
			return acc;
		}, {});
		const summary = Object.entries(skipByReason)
			.map(([reason, n]) => `${n} ${reason}`)
			.join("; ");
		console.log(`[scan] skipped caching: ${summary}`);
	}

	const counts = rows.reduce(
		(acc, r) => {
			acc[r.manifestState]++;
			return acc;
		},
		{ included: 0, excluded: 0, "no-manifest": 0, invalid: 0 } as Record<
			CandidateRow["manifestState"],
			number
		>,
	);
	console.log(
		`[scan] done. included=${counts.included} excluded=${counts.excluded} no-manifest=${counts["no-manifest"]} invalid=${counts.invalid}`,
	);
}

main().catch((err) => {
	console.error("[scan] error:", err instanceof Error ? err.message : String(err));
	if (err instanceof Error && err.stack) console.error(err.stack);
	process.exit(1);
});
