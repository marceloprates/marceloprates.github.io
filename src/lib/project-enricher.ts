/**
 * Project enrichment: fetch GitHub stats and gitstar-ranking for repositories.
 *
 * Used at build time by page.tsx to attach stars, forks, and ranking data
 * to project cards. Results are also written to `src/data/github-projects.json`
 * for consumption by external tools.
 */

import fs from "fs";
import path from "path";
import type { Project } from "@/types";

/** Token sources — same priority as the rest of the codebase. */
const ghToken =
	process.env.GITHUB_TOKEN ||
	process.env.GH_TOKEN ||
	process.env.GITHUB_PAT ||
	process.env.PERSONAL_TOKEN;

/**
 * Parse an owner/repo string from a GitHub URL.
 * Returns null for non-GitHub URLs or URLs without enough path segments.
 */
export function parseGithubRepo(url: string): string | null {
	try {
		const u = new URL(url, "https://example.com");
		if (u.hostname.toLowerCase().endsWith("github.com")) {
			const parts = u.pathname.replace(/^\//, "").split("/").filter(Boolean);
			if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Fetch star and fork counts for a GitHub repository via the REST API.
 */
export async function fetchRepo(
	repo: string,
): Promise<{ stars?: number; forks?: number }> {
	try {
		const headers: Record<string, string> = {
			Accept: "application/vnd.github.v3+json",
		};
		if (ghToken) headers.Authorization = `token ${ghToken}`;
		const res = await fetch(`https://api.github.com/repos/${repo}`, {
			headers,
			next: { revalidate: 60 * 60 },
		});
		if (!res.ok) return {};
		const j = await res.json();
		return {
			stars:
				typeof j.stargazers_count === "number" ? j.stargazers_count : undefined,
			forks: typeof j.forks_count === "number" ? j.forks_count : undefined,
		};
	} catch {
		return {};
	}
}

/**
 * Fetch gitstar-ranking.com rank for a repository by scraping the HTML page.
 * Returns an empty object if the repo is not ranked or the page cannot be fetched.
 */
export async function fetchGitstar(
	repo: string,
): Promise<{ gitstarRank?: number; gitstarUrl?: string }> {
	try {
		const [owner, name] = repo.split("/");
		if (!owner || !name) return {};
		const url = `https://gitstar-ranking.com/${owner}/${name}`;
		const res = await fetch(url, { next: { revalidate: 60 * 60 } });
		if (!res.ok) return {};
		const html = await res.text();
		const attrRegex =
			/<div class='repository_attribute[^>]*'>\s*Rank\s*<\/div>\s*<div class='repository_value[^>]*'>\s*([0-9,]+)\s*<\/div>/i;
		const m = attrRegex.exec(html);
		if (m) {
			const rank = parseInt(m[1].replace(/,/g, ""), 10);
			if (Number.isFinite(rank)) return { gitstarRank: rank, gitstarUrl: url };
		}
		return {};
	} catch {
		return {};
	}
}

type GitHubProjectEntry = {
	repo: string;
	stars?: number;
	forks?: number;
	gitstarRank?: number;
	name: string;
	description?: string;
	link: string;
	topics?: string[];
};

export type GitHubProjectsData = GitHubProjectEntry[];

/**
 * Enrich a list of projects with GitHub stats and gitstar ranking.
 * Also writes the enriched data to `src/data/github-projects.json`.
 *
 * Returns the enriched projects and the raw GitHub projects data array.
 */
export async function enrichProjects(
	rawProjects: Project[],
): Promise<{ enriched: Project[]; githubData: GitHubProjectsData }> {
	const githubData: GitHubProjectsData = [];

	const enriched: Project[] = await Promise.all(
		rawProjects.map(async (p) => {
			const repo = p.repo || parseGithubRepo(p.link);
			if (!repo) return { ...p };

			const [stats, gsr] = await Promise.all([
				fetchRepo(repo),
				fetchGitstar(repo),
			]);

			githubData.push({
				repo,
				stars: stats.stars,
				forks: stats.forks,
				gitstarRank: gsr.gitstarRank,
				name: p.title,
				description: p.desc,
				link: p.link,
				topics: p.tags,
			});

			return {
				...p,
				repo,
				stars: stats.stars,
				forks: stats.forks,
				gitstarRank: gsr.gitstarRank,
				gitstarUrl: gsr.gitstarUrl,
			} as Project;
		}),
	);

	// Write github-projects.json for external consumers
	const outPath = path.join(
		process.cwd(),
		"src",
		"data",
		"github-projects.json",
	);
	try {
		fs.writeFileSync(outPath, JSON.stringify(githubData, null, 2));
	} catch (err) {
		console.error(
			"[project-enricher] Failed to write github-projects.json:",
			err,
		);
	}

	return { enriched, githubData };
}
