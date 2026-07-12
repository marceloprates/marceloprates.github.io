"use client";

/**
 * WorkGrid — the /work page's faceted grid.
 *
 * Pure presentational + URL-synced state. Receives the static list
 * of projects from the server (work/page.tsx) and renders a
 * filterable grid. The server reads `?primary=...&tag=...` once at
 * request time and passes the resolved values down; this client
 * component then mirrors them into `useSearchParams()` so user
 * interactions round-trip back into the URL via router.replace.
 *
 * Layout:
 *   1. <FilterBar> (primary segmented control + multi-select tag
 *      chips).
 *   2. The filtered card grid using the existing <ProjectCard>.
 *   3. Starship (the prompt-theme project) is one of the cards in
 *      the grid; it's a regular record, not a featured callout
 *      (the previous prominent banner was retired in the
 *      post-loop refinement so /work stops feeling like a
 *      dashboard with one tile that doesn't fit the others).
 *
 * Filtering:
 *   - primary === "all": no category filter.
 *   - primary === "code" | "art" | "writing" | "experiments": only
 *     projects with that primary.
 *   - tag: only projects whose tags include the tag (case
 *     insensitive).
 *   - Both apply with AND semantics.
 *
 * Accessibility floor:
 *   - Filter chips use `aria-pressed` to advertise selection state.
 *   - The "X projects" count updates live and lives in an aria-live
 *     region so screen readers announce filter changes.
 *   - Empty state announces "No projects match these filters" via
 *     role="status".
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useCallback } from "react";

import { ProjectCard } from "@/components/ProjectCard";
import {
    PRIMARY_CATEGORIES,
    PRIMARY_LABEL,
    type PrimaryCategory,
} from "@/data/project-taxonomy";
import type { WorkProject } from "@/lib/work-projects";
import {
    FilterBar,
    type ActiveFilters,
} from "@/components/work/FilterBar";

export interface WorkGridProps {
    /**
     * Static list from getWorkProjects() (server-rendered), with
     * project links pre-resolved by the caller via
     * resolveProjectLinks(...) so the SSR href matches the CSR
     * href byte-for-byte.
     */
    projects: readonly WorkProject[];
    /**
     * Initial filter state from server-side `?primary=...&tag=...`
     * parsing. The component then takes over with the URL.
     */
    initial: ActiveFilters;
}

export function WorkGrid({ projects, initial }: WorkGridProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Source of truth: the URL. `initial` is the SSR snapshot;
    // re-derive on every render so URL changes (browser back/forward)
    // are honored.
    const primary: PrimaryCategory | "all" = (() => {
        const v = searchParams?.get("primary");
        if (v && PRIMARY_CATEGORIES.includes(v as PrimaryCategory)) {
            return v as PrimaryCategory;
        }
        return initial.primary;
    })();
    const tag: string | null = searchParams?.get("tag") ?? initial.tag;

    /**
     * Apply the current filters. Both filters are AND'd.
     *
     * Memoized on the three things that actually change (project
     * list, primary, tag) so filter-toggle clicks don't recompute
     * the entire list when only the filter changed.
     */
    const filtered = useMemo(() => {
        return projects.filter((p) => {
            if (primary !== "all" && p.primary !== primary) return false;
            if (tag) {
                const tags = p.tags ?? [];
                if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
                    return false;
            }
            return true;
        });
    }, [projects, primary, tag]);

    /**
     * Compute the tag union for the primary-filtered subset so
     * the chips bar shows only the tags that COULD apply to the
     * active primary. Tags update reactively when primary changes.
     */
    const tagUniverse = useMemo(() => {
        const subset =
            primary === "all"
                ? projects
                : projects.filter((p) => p.primary === primary);
        const set = new Set<string>();
        for (const p of subset) {
            for (const t of p.tags ?? []) set.add(t.toLowerCase());
        }
        return Array.from(set).sort();
    }, [projects, primary]);

    /**
     * Update the URL when filters change. We use router.replace
     * (not push) so the back button doesn't fill up with filter
     * state — filters are transient UI, not navigations.
     */
    const setFilter = useCallback(
        (next: ActiveFilters) => {
            const params = new URLSearchParams(
                searchParams ? searchParams.toString() : "",
            );
            if (next.primary === "all") {
                params.delete("primary");
            } else {
                params.set("primary", next.primary);
            }
            if (!next.tag) {
                params.delete("tag");
            } else {
                params.set("tag", next.tag);
            }
            const qs = params.toString();
            router.replace(qs ? `/projects?${qs}` : "/projects", { scroll: false });
        },
        [router, searchParams],
    );

    return (
        <div className="space-y-8">
            <FilterBar
                primary={primary}
                tag={tag}
                tagUniverse={tagUniverse}
                onChange={setFilter}
            />

            <p
                aria-live="polite"
                className="text-sm text-gray-600 dark:text-gray-400"
            >
                {filtered.length === 0
                    ? "Showing 0 projects."
                    : `Showing ${filtered.length} ${
                          filtered.length === 1 ? "project" : "projects"
                      }${
                          primary === "all"
                              ? ""
                              : ` · ${PRIMARY_LABEL[primary as PrimaryCategory]}`
                      }${tag ? ` · tag: ${tag}` : ""}`}
            </p>

            {filtered.length === 0 ? (
                <p
                    role="status"
                    className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                    No projects match these filters. Try clearing one of them.
                </p>
            ) : (
                <ul
                    aria-label="Project cards"
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {filtered.map((project) => (
                        <li key={project.repo ?? project.title}>
                            {/* ProjectCard accepts Project; WorkProject
                                 extends Project, so passing directly is
                                 type-safe. */}
                            <ProjectCard project={project} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

