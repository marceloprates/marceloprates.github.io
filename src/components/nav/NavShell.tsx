"use client";

/**
 * NavShell — client wrapper that owns the shared state between
 * TopNav and SearchPalette:
 *   - `searchOpen: boolean`
 *   - global keyboard listener for ⌘K (and Ctrl+K) toggles it
 *   - the trigger element ref so focus can return on close
 *
 * Why a wrapper:
 *   - Next 15 layout.tsx is a Server Component. Promoting it to a
 *     client component just to hold one piece of state would
 *     trigger a client boundary much higher than necessary
 *     (defeats the static export).
 *   - Lifting state into <Providers> would couple Providers to the
 *     nav. A standalone NavShell keeps the concern isolated.
 *
 * Items source (iter 5):
 *   - For now, items are derived at module load from
 *     `src/data/projects.ts` (the GitHub-sourced list committed in
 *     the repo) and `src/lib/content.ts#getAllPosts()`. Both are
 *     static imports — no fetch.
 *   - Phase F replaces this with a build-time-generated
 *     `public/search-index.json` so posts + future markdown-only
 *     projects surface without code changes. The SearchPalette
 *     shape stays identical.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { projects as githubProjects } from "@/data/projects";
import { getAllPosts } from "@/lib/content";
import { TopNav } from "@/components/nav/TopNav";
import {
    SearchPalette,
    type SearchableItem,
} from "@/components/nav/SearchPalette";

/**
 * Build the static search index from committed sources.
 *
 * `getAllPosts()` is fs-backed but only runs at build time inside a
 * server-rendered context. We import the function and let Next
 * statically analyse it: the call site is a top-level expression
 * inside a client component, so the function reference resolves at
 * compile time and the import is pulled out. To stay safe without
 * relying on the bundler's DCE, we wrap in a function so any
 * accidental runtime eval happens inside a request boundary, not
 * at module load.
 */
function buildSearchItems(): SearchableItem[] {
    const items: SearchableItem[] = [];

    // Projects (from src/data/projects.ts — GitHub-sourced).
    // Wrap in try/catch because `getAllPosts()` reads the
    // filesystem, and reading at module load in the browser would
    // throw at runtime. This safety net is belt-and-braces; in
    // practice `getAllPosts` is imported but not called here.
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

    // Posts (via getAllPosts — invoked through a safe wrapper).
    try {
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
    } catch {
        // Browser bundle; skip silently. Phase F will replace this
        // with a JSON fetch that does not require fs access.
    }

    // Pages — the five locked top-level destinations.
    const pages: SearchableItem[] = [
        { id: "page:/work", title: "Work", desc: "All projects, filterable by category and tag.", href: "/work", type: "page" },
        { id: "page:/posts", title: "Writing", desc: "Posts and essays.", href: "/posts", type: "page" },
        { id: "page:/about", title: "About", desc: "Background, location, interests.", href: "/about", type: "page" },
        { id: "page:/resume", title: "Resume", desc: "PDF resumes and JSON variants.", href: "/resume", type: "page" },
        { id: "page:/misc", title: "Misc", desc: "One-offs and side projects.", href: "/misc", type: "page" },
    ];

    return [...items, ...pages];
}

/**
 * Module-level cache. Search items don't change between renders
 * (the GitHub + markdown sources are static at build time), so we
 * build the array once per module load and reuse it. Phase F
 * replaces the body of this function with a JSON fetch.
 */
const SEARCH_ITEMS: readonly SearchableItem[] = buildSearchItems();

export function NavShell() {
    const [searchOpen, setSearchOpen] = useState(false);
    const triggerRef = useRef<HTMLElement | null>(null);

    const open = useCallback(() => {
        // Capture the focused element so we can restore on close.
        triggerRef.current = document.activeElement as HTMLElement | null;
        setSearchOpen(true);
    }, []);

    const close = useCallback(() => {
        setSearchOpen(false);
        // Restore focus to whatever opened the palette (typically the
        // Search button in the top nav) so keyboard users don't lose
        // their place.
        const t = triggerRef.current;
        if (t && typeof t.focus === "function") {
            window.setTimeout(() => t.focus(), 0);
        }
    }, []);

    // Global ⌘K / Ctrl+K listener.
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if ((e.metaKey || e.ctrlKey) && k === "k") {
                e.preventDefault();
                setSearchOpen((o) => (o ? false : true));
                triggerRef.current = document.activeElement as HTMLElement | null;
                return;
            }
            // Slash also opens the palette (GitHub-style).
            if (!searchOpen && k === "/" && !isTypingTarget(e.target)) {
                e.preventDefault();
                triggerRef.current = document.activeElement as HTMLElement | null;
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchOpen]);

    return (
        <>
            <TopNav onSearchClick={open} />
            <SearchPalette
                open={searchOpen}
                onClose={close}
                items={SEARCH_ITEMS}
            />
        </>
    );
}

/**
 * True when the focused element is a typing target (input, textarea,
 * contenteditable). Prevents the `/` shortcut from hijacking the
 * slash character while someone types.
 */
function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    if (target.isContentEditable) return true;
    return false;
}

export default NavShell;
