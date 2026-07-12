/**
 * Project link resolver.
 *
 * Decides whether a project has a dedicated local page
 * (/projects/{slug}) and returns the right href accordingly.
 *
 * Pure utility — takes the project + the metadata snapshot as
 * parameters so it runs identically on the server and in the
 * browser.
 *
 * The /projects page server-component calls
 * `resolveProjectLinks(getWorkProjects(), getProjectMetadata())`
 * once at build time and threads the result into WorkGrid, so
 * the client never has to re-resolve.
 */

import type { Project } from "@/types";

interface ProjectMetadataEntry {
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