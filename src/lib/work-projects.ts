/**
 * /projects project resolver.
 *
 * Joins the project data sources into a single WorkProject[] ready to
 * feed the /projects faceted grid:
 *   - GitHub-sourced (`src/data/projects.ts`) — canonical, carries stars/forks.
 *   - Markdown-sourced (`content/projects/*.md`) — local enrichment; deduped
 *     against GitHub by repo slug or title.
 *   - Portfolio-sourced (`portfolio-bodies/<owner>-<name>/portfolio.md`) —
 *     opted-in private (or public-with-portfolio.md) repos. Cached by
 *     `npm run scan:portfolio`. Decisions JSON wins on override.
 *
 * Each record carries:
 *   - everything from `Project` (id, desc, tags, link, image, repo,
 *     stars, forks, gitstar rank, private, tier, …)
 *   - `primary: PrimaryCategory` — resolved via assignPrimary()
 *     (explicit frontmatter wins; assignPrimary heuristic fills the gaps).
 *
 * Tags are merged via mergeTags() (existing first, seed appended;
 * case-insensitive dedupe, first casing wins).
 *
 * Server-only (depends on fs-backed getAllProjects / listPortfolioBodies /
 * loadPortfolioDecisions). No network calls.
 */

import path from "node:path";

import type { Project } from "@/types";
import type { PrimaryCategory } from "@/data/project-taxonomy";
import type { PortfolioDecisions } from "@/lib/portfolio-scan";
import { projects as githubProjects } from "@/data/projects";
import {
    getAllProjects,
    listPortfolioBodies,
    type PortfolioBodyRecord,
} from "@/lib/content";
import { assignPrimary, mergeTags } from "@/lib/project-taxonomy.server";
import { loadPortfolioDecisions } from "@/lib/portfolio-scan";

export interface WorkProject extends Project {
    /** Resolved primary category. Always populated. */
    primary: PrimaryCategory;
}

/**
 * Build the unified /projects projects list.
 *
 * Source priority + dedup rules:
 *   1. GitHub-sourced projects (canonical — carry stars/forks/gitstar
 *      metadata that markdown-only records cannot).
 *   2. Markdown-sourced projects (`content/projects/*.md`) that do NOT
 *      duplicate a GitHub record. Dedup matches by:
 *      a) GitHub `repo` second segment vs. markdown `slug` (case
 *         insensitive), so a markdown shadow of a GitHub repo is
 *         suppressed in favour of the GitHub-sourced card.
 *      b) `title` (case insensitive), as a safety net for markdown
 *         pages that simply describe the same project under a
 *         different name.
 *
 * Both sources are enriched with primary + merged tags.
 *
 * Pure on file-system reads (via getAllProjects). No network calls.
 */
export function getWorkProjects(): WorkProject[] {
    const out: WorkProject[] = [];

    // Pass 1: GitHub-sourced projects (canonical).
    for (const p of githubProjects) {
        out.push({
            ...p,
            primary: assignPrimary({ repo: p.repo }),
            tags: mergeTags({ existing: p.tags ?? [], repo: p.repo }),
        });
    }

    // Pass 2: Markdown-only projects (dedup against pass 1).
    const githubRepoSlugs = new Set(
        out
            .map((p) => p.repo?.split("/")[1]?.toLowerCase())
            .filter((s): s is string => Boolean(s)),
    );
    const githubTitles = new Set(
        out.map((p) => p.title.toLowerCase()),
    );

    for (const meta of getAllProjects()) {
        const slugLower = meta.slug.toLowerCase();
        const titleLower = meta.title.toLowerCase();
        if (githubRepoSlugs.has(slugLower)) continue;
        if (githubTitles.has(titleLower)) continue;

        out.push({
            title: meta.title,
            desc: meta.excerpt ?? "",
            tags: mergeTags({ existing: meta.tags ?? [], slug: meta.slug }),
            link: `/projects/${meta.slug}`,
            image: meta.image,
            primary: assignPrimary({ slug: meta.slug }),
        });
    }

    // Featured surfaces that aren't GitHub-backed but still belong
    // on /projects. Today that's the Starship prompt-theme project; it
    // renders as one more card in the grid via <ProjectCard>.
    out.push({
        title: "Starship",
        desc:
            "My personal Starship prompt, tailored for data-science workflows. Terminal-themed static page that demonstrates reusable prompt design.",
        tags: ["code", "prompt"],
        link: "/starship",
        image: "/images/projects/starship/cover.png",
        primary: assignPrimary({ slug: "starship" }),
    });

    // Pass 4: Portfolio bodies (private opted-in + public-with-portfolio).
    // Dedup against the existing out[] (GitHub + markdown + Starship).
    // Decisions JSON overrides win on conflict.
    const githubRepoSlugs3 = new Set(
        out
            .map((p) => p.repo?.split("/")[1]?.toLowerCase())
            .filter((s): s is string => Boolean(s)),
    );
    const githubTitles3 = new Set(out.map((p) => p.title.toLowerCase()));
    const decisionsPath = path.join(process.cwd(), "portfolio-decisions.json");
    const decisions = loadPortfolioDecisions(decisionsPath);
    for (const project of buildPortfolioWorkProjects(listPortfolioBodies(), decisions)) {
        const slugLower = project.repo?.split("/")[1]?.toLowerCase();
        const titleLower = project.title.toLowerCase();
        if (slugLower && githubRepoSlugs3.has(slugLower)) continue;
        if (githubTitles3.has(titleLower)) continue;
        out.push(project);
    }

    return out;
}

/**
 * First non-empty paragraph of a markdown body. Used as the card
 * excerpt when no `summary:` frontmatter override is present.
 */
function firstNonEmptyParagraph(markdown: string): string {
    const lines = markdown.split("\n");
    const buf: string[] = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) {
            if (buf.length > 0) break;
            continue;
        }
        // Skip ATX headings / blockquotes / lists — we want prose.
        if (trimmed.startsWith("#") || trimmed.startsWith(">") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
            continue;
        }
        buf.push(trimmed);
    }
    return buf.join(" ").trim();
}

/**
 * First ATX H1 (`# Title`) in a markdown body. Used as the title
 * fallback when frontmatter doesn't supply one.
 */
function firstH1(markdown: string): string | null {
    const match = markdown.match(/^\s*#\s+(.+?)\s*$/m);
    return match ? match[1] : null;
}

/**
 * Convert portfolio body records into WorkProject[] for ingestion
 * into `getWorkProjects()`. Pure — takes the records and decisions
 * explicitly so it's unit-testable.
 *
 * Decisions JSON overrides:
 *   - `summary`, `tags`, `cover`, `slug`, `primary`, `tier` from
 *     `decision.override` win over the in-body frontmatter.
 *   - `decision.include === false` causes the repo to be skipped
 *     (the cache already respects this; this is defense in depth in
 *     case someone hand-edits portfolio-bodies/ to bypass the cache).
 */
export function buildPortfolioWorkProjects(
    records: PortfolioBodyRecord[],
    decisions: PortfolioDecisions,
): WorkProject[] {
    const out: WorkProject[] = [];
    for (const rec of records) {
        const repoKey = `${rec.sidecar.owner}/${rec.sidecar.name}`;
        const decision = decisions[repoKey];
        // Defense in depth: skip when decisions explicitly opt out.
        if (decision?.include === false) continue;

        const fm = rec.frontmatter;
        const override = decision?.override ?? {};
        const slug = (typeof override.slug === "string" && override.slug.length > 0
            ? override.slug
            : rec.slug);

        // Resolve title: frontmatter > H1 > slug.
        let title: string;
        if (typeof fm.title === "string" && fm.title.length > 0) {
            title = fm.title;
        } else {
            title = firstH1(rec.content) ?? slug;
        }

        // Resolve desc: decisions summary > frontmatter summary > first prose paragraph.
        const summary =
            (typeof override.summary === "string" && override.summary.length > 0
                ? override.summary
                : undefined) ??
            (typeof fm.summary === "string" ? fm.summary : undefined) ??
            firstNonEmptyParagraph(rec.content);

        // Resolve tags, cover, primary, tier.
        const tags = Array.isArray(override.tags)
            ? override.tags
            : Array.isArray(fm.tags)
                ? fm.tags
                : [];
        const cover =
            (typeof override.cover === "string" && override.cover.length > 0
                ? override.cover
                : undefined) ?? (typeof fm.cover === "string" ? fm.cover : undefined);
        const primaryOverride =
            typeof override.primary === "string"
                ? (override.primary as PrimaryCategory)
                : typeof fm.primary === "string"
                    ? (fm.primary as PrimaryCategory)
                    : null;

        const repo = repoKey;
        const project: WorkProject = {
            title,
            desc: summary ?? "",
            tags,
            link: `/projects/${slug}`,
            image: cover,
            repo,
            stars: rec.sidecar.stars,
            // Only set private: true for private-visibility bodies. Public
            // bodies leave the field undefined so the badge UI never
            // surfaces for already-public repos.
            ...(rec.sidecar.visibility === "private" ? { private: true } : {}),
            primary: primaryOverride ?? assignPrimary({ repo }),
        };
        out.push(project);
    }
    return out;
}
