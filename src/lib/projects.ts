/**
 * Project link resolver.
 *
 * Decides whether a project has a dedicated local page
 * (/projects/{slug}) and returns the right href accordingly.
 *
 * Pure utility — takes the project + the metadata snapshot as
 * parameters so it runs identically on the server and in the
 * browser. The previous version (`getProjectLink`) read
 * `window.__PROJECT_METADATA__` at render time, which produced
 * divergent SSR vs CSR output and a hydration mismatch.
 *
 * Server Component (the /projects page) calls
 * `resolveProjectLinks(getWorkProjects(), getProjectMetadata())`
 * once at build time and threads the result into WorkGrid, so
 * the client never has to re-resolve. The legacy
 * `getProjectLink(project)` shim remains exported because an
 * older test imports it; callers should prefer
 * `resolveProjectLinks` for new code.
 */

import type { Project } from "@/types";

export interface ProjectMetadataEntry {
    readonly hasLocalPage: boolean;
    readonly slug?: string;
}

export type ProjectMetadata = Record<string, ProjectMetadataEntry>;

/**
 * Returns the right href for a single project, given a metadata
 * snapshot. Pure / deterministic — accepts any object with at
 * least `repo?` and `link` so it works on both `Project` and
 * `WorkProject` (which adds a `primary` field).
 */
export function resolveProjectLink<T extends Pick<Project, "repo" | "link">>(
    project: T,
    metadata: ProjectMetadata,
): string {
    if (project.repo && metadata[project.repo]?.hasLocalPage) {
        const meta = metadata[project.repo];
        const slug = meta.slug || project.repo.split("/")[1];
        return `/projects/${slug}`;
    }
    return project.link;
}

/**
 * Apply resolveProjectLink across an array. Returns a NEW array
 * with `link` overridden; original objects are not mutated.
 * Generic over the record type so it accepts Project[] (markdown
 * sources) and WorkProject[] (the /projects payload) identically.
 */
export function resolveProjectLinks<T extends Pick<Project, "repo" | "link">>(
    projects: readonly T[],
    metadata: ProjectMetadata,
): T[] {
    return projects.map((p) => ({
        ...p,
        link: resolveProjectLink(p, metadata),
    }));
}

/**
 * @deprecated Use resolveProjectLink(project, metadata) — passing
 * the metadata snapshot explicitly avoids SSR / CSR divergence.
 * Kept exported because vitest fixtures import it; new call
 * sites should use resolveProjectLink / resolveProjectLinks.
 */
export function getProjectLink(project: Project): string {
    // Server-side fallback path: when called from a Server
    // Component, `window` is undefined and we have no metadata
    // snapshot. The /projects page passes a snapshot explicitly
    // (via resolveProjectLinks) so this branch is hit only by
    // legacy test code.
    return project.link;
}
