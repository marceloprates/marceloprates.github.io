#!/usr/bin/env npx tsx
/**
 * build-search-index.ts — emits `public/search-index.json`.
 *
 * Used by the ⌘K command palette (SearchPalette, src/components/nav/
 * SearchPalette.tsx) at runtime. The JSON is the source of truth for
 * searchable items; the server-side resolver
 * (src/lib/search-items.server.ts) reads it at request time.
 *
 * Sources merged (in order, deduped by id):
 *   1. GitHub-sourced projects (src/data/projects.ts).
 *   2. Markdown-only projects (content/projects/*.md).
 *   3. Markdown posts (content/posts/*.md).
 *   4. The five locked top-level pages.
 *
 * Why a build-time artefact:
 *   - Layout.tsx reads it via fs once per request and threads the
 *     resulting array into <NavShell>. Pre-rendering happens
 *     during `next build`, and the JSON is in `public/` so it's
 *     served as a static asset when fetched by the browser too.
 *   - Edits to content/projects/*.md or content/posts/*.md don't
 *     require a full Next re-render — the JSON regenerates and
 *     the next page request sees fresh data.
 *
 * CLI:
 *   tsx scripts/build-search-index.ts            # writes public/search-index.json
 *   tsx scripts/build-search-index.ts --check    # exit 1 if JSON is stale
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import { projects as githubProjects } from '../src/data/projects';
import type { Project } from '../src/types';

const ROOT = path.join(process.cwd());
const OUT_PATH = path.join(ROOT, 'public', 'search-index.json');
const CONTENT_PROJECTS = path.join(ROOT, 'content', 'projects');
const CONTENT_POSTS = path.join(ROOT, 'content', 'posts');

interface SearchableItem {
    id: string;
    title: string;
    desc?: string;
    tags?: string[];
    href: string;
    type: 'project' | 'post' | 'page';
}

function buildProjectItems(): SearchableItem[] {
    const items: SearchableItem[] = [];

    for (const p of githubProjects as Project[]) {
        if (!p.title) continue;
        items.push({
            id: `project:${p.repo ?? p.title}`,
            title: p.title,
            desc: p.desc,
            tags: p.tags,
            href: p.link,
            type: 'project',
        });
    }

    if (fs.existsSync(CONTENT_PROJECTS)) {
        for (const file of fs.readdirSync(CONTENT_PROJECTS)) {
            if (!file.endsWith('.md') && !file.endsWith('.markdown')) continue;
            const raw = fs.readFileSync(path.join(CONTENT_PROJECTS, file), 'utf8');
            const parsed = matter(raw);
            const meta = parsed.data || {};
            const slug = file.replace(/\.(md|markdown)$/i, '');
            if (!meta.title) continue;

            // Skip markdown shadows of GitHub-sourced projects — the
            // dedup logic in src/lib/work-projects.ts treats them
            // identically; here we keep them too (less aggressive
            // than work-projects) since search results often benefit
            // from showing the project under multiple annotations.
            items.push({
                id: `project:md:${slug}`,
                title: meta.title,
                desc: meta.excerpt ?? '',
                tags: Array.isArray(meta.tags) ? meta.tags : undefined,
                href: `/projects/${slug}`,
                type: 'project',
            });
        }
    }

    return items;
}

function buildPostItems(): SearchableItem[] {
    if (!fs.existsSync(CONTENT_POSTS)) return [];
    const items: SearchableItem[] = [];
    for (const file of fs.readdirSync(CONTENT_POSTS)) {
        if (!file.endsWith('.md') && !file.endsWith('.markdown')) continue;
        const raw = fs.readFileSync(path.join(CONTENT_POSTS, file), 'utf8');
        const parsed = matter(raw);
        const meta = parsed.data || {};
        const slug = file.replace(/\.(md|markdown)$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        if (!meta.title) continue;
        items.push({
            id: `post:${slug}`,
            title: meta.title,
            desc: meta.excerpt ?? '',
            tags: Array.isArray(meta.tags) ? meta.tags : undefined,
            href: `/posts/${slug}`,
            type: 'post',
        });
    }
    return items;
}

function buildPageItems(): SearchableItem[] {
    return [
        { id: 'page:/projects', title: 'Projects', desc: 'All projects, filterable by category and tag.', href: '/projects', type: 'page' },
        { id: 'page:/posts', title: 'Writing', desc: 'Posts and essays.', href: '/posts', type: 'page' },
        { id: 'page:/about', title: 'About', desc: 'Background, location, interests.', href: '/about', type: 'page' },
        { id: 'page:/resume', title: 'Resume', desc: 'PDF resumes and JSON variants.', href: '/resume', type: 'page' },
        { id: 'page:/misc', title: 'Misc', desc: 'One-offs and side projects.', href: '/misc', type: 'page' },
    ];
}

function build(): SearchableItem[] {
    return [
        ...buildProjectItems(),
        ...buildPostItems(),
        ...buildPageItems(),
    ];
}

function main(): void {
    const check = process.argv.includes('--check');
    const next = build();
    const nextStr = JSON.stringify(next, null, 2);
    if (check) {
        if (!fs.existsSync(OUT_PATH)) {
            console.error('search-index.json does not exist; run build:search-index.');
            process.exit(1);
        }
        const current = fs.readFileSync(OUT_PATH, 'utf8');
        if (current.trim() !== nextStr.trim()) {
            console.error('search-index.json is stale; run build:search-index.');
            process.exit(1);
        }
        console.log(`OK · ${next.length} items`);
        return;
    }
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, nextStr);
    console.log(`Wrote ${OUT_PATH} (${next.length} items)`);
}

main();
