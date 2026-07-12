/**
 * /work project resolver.
 *
 * Joins the two project data sources (GitHub-sourced in
 * `src/data/projects.ts` and markdown-sourced in
 * `content/projects/*.md`) into a single WorkProject[] ready to feed
 * the /work faceted grid.
 *
 * Each record carries:
 *   - everything from `Project` (id, desc, tags, link, image, repo,
 *     stars, forks, gitstar rank, …)
 *   - `primary: PrimaryCategory` — resolved via assignPrimary()
 *     (markdown frontmatter wins; seed table fills the gaps).
 *
 * Tags are merged via mergeTags() (existing first, seed appended;
 * case-insensitive dedupe, first casing wins).
 *
 * Server-only (depends on fs-backed getAllProjects()).
 */

import type { Project } from "@/types";
import type { PrimaryCategory } from "@/data/project-taxonomy";
import { projects as githubProjects } from "@/data/projects";
import { getAllProjects } from "@/lib/content";
import { assignPrimary, mergeTags } from "@/lib/project-taxonomy.server";

export interface WorkProject extends Project {
    /** Resolved primary category. Always populated. */
    primary: PrimaryCategory;
}

/**
 * Build the unified /work projects list.
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
    // on /work. Today that's the Starship prompt-theme project; it
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

    return out;
}
