/**
 * Search items resolver (server-only).
 *
 * Builds the static search index used by SearchPalette. Owns the
 * fs-backed data fetch (getAllPosts reads content/posts/*.md) so
 * that no fs import is ever dragged into the client bundle.
 *
 * The layout (src/app/layout.tsx) calls this once at build / page
 * request time and threads the resulting array into <NavShell> as
 * a prop. NavShell forwards it to <SearchPalette>.
 *
 * Phase F (nav-redesign) replaces this with a build-time-generated
 * `public/search-index.json` so the data stays fresh on every
 * content change without a full page re-render. The shape of the
 * array stays identical, so NavShell and SearchPalette do not
 * change when that swap lands.
 */

import { projects as githubProjects } from "@/data/projects";
import { getAllPosts, getAllProjects } from "@/lib/content";
import type { SearchableItem } from "@/components/nav/SearchPalette";

/**
 * Build the search index from committed sources.
 *
 * Sources (in order, deduplicated by id):
 *   1. GitHub-sourced projects (src/data/projects.ts).
 *   2. Markdown-only projects (content/projects/*.md) — projects
 *      without a GitHub repo surface here for the first time.
 *   3. Markdown posts (content/posts/*.md).
 *   4. The five locked top-level pages (Work, Writing, About,
 *      Resume, Misc).
 */
export function getSearchItems(): SearchableItem[] {
    const items: SearchableItem[] = [];

    for (const p of githubProjects) {
        if (!p.title) continue;
        items.push({
            id: `project:${p.repo ?? p.title}`,
            title: p.title,
            desc: p.desc,
            tags: p.tags,
            href: p.link,
            type: "project",
        });
    }

    // Markdown-only project pages — surfaces on /work for the
    // first time; useful for any project without a GitHub repo.
    for (const meta of getAllProjects()) {
        if (!meta.title) continue;
        items.push({
            id: `project:md:${meta.slug}`,
            title: meta.title,
            desc: meta.excerpt,
            tags: meta.tags,
            href: `/projects/${meta.slug}`,
            type: "project",
        });
    }

    for (const post of getAllPosts()) {
        if (!post.title) continue;
        items.push({
            id: `post:${post.slug}`,
            title: post.title,
            desc: post.excerpt,
            tags: post.tags,
            href: `/posts/${post.slug}`,
            type: "post",
        });
    }

    const pages: SearchableItem[] = [
        { id: "page:/work", title: "Work", desc: "All projects, filterable by category and tag.", href: "/work", type: "page" },
        { id: "page:/posts", title: "Writing", desc: "Posts and essays.", href: "/posts", type: "page" },
        { id: "page:/about", title: "About", desc: "Background, location, interests.", href: "/about", type: "page" },
        { id: "page:/resume", title: "Resume", desc: "PDF resumes and JSON variants.", href: "/resume", type: "page" },
        { id: "page:/misc", title: "Misc", desc: "One-offs and side projects.", href: "/misc", type: "page" },
    ];

    return [...items, ...pages];
}
