/**
 * Project taxonomy seed table.
 *
 * Initial mapping from repo/slug to (primary, tags) for every project
 * currently in src/data/projects.ts. Authoritative for projects that
 * do NOT declare `frontmatter.primary` themselves.
 *
 * Lookup priority in src/lib/project-taxonomy.server.ts is:
 *   1. frontmatter `primary` (markdown frontmatter wins)
 *   2. this seed table by `repo`
 *   3. this seed table by `slug` (markdown-only projects)
 *   4. fallback primary = "code"
 *
 * Tags are merged (not replaced) with whatever tags the project
 * already carries — markdown frontmatter and GitHub-derived tags win
 * on case-preserving conflict.
 *
 * When a new project is added, add an entry here. When the user
 * disagrees with an inferred primary, declare `primary` in the
 * project's frontmatter and it will override this seed.
 */

import type { PrimaryCategory } from "./project-taxonomy";

export interface SeedEntry {
    readonly primary: PrimaryCategory;
    /** Extra tags to merge with the project's existing tags. */
    readonly tags: readonly string[];
}

export type SeedKey = string;

/**
 * Seed map. Keyed by either `repo` (owner/name) OR `slug` (the file
 * name under content/projects/ without `.md`). Two entries for the
 * same project are intentionally allowed: callers prefer `repo` first,
 * so when both keys exist the repo entry wins. Markdown-only projects
 * use the slug key.
 */
export const SEED: Record<SeedKey, SeedEntry> = {
    // GitHub-backed projects (src/data/projects.ts).
    "marceloprates/prettymaps": {
        primary: "art",
        tags: ["open-source", "code", "maps", "matplotlib"],
    },
    "marceloprates/easyshader": {
        primary: "art",
        tags: ["open-source", "code", "sdf", "raymarching"],
    },
    "marceloprates/Cosmos": {
        primary: "experiments",
        tags: ["open-source", "code", "latex", "ocr"],
    },
    "marceloprates/TSP-Animation": {
        primary: "art",
        tags: ["open-source", "code", "cli", "animation"],
    },
    "marceloprates/Turmites": {
        primary: "art",
        tags: ["open-source", "code", "processing", "turing"],
    },
    "marceloprates/Voxel-Watersim": {
        primary: "experiments",
        tags: ["code", "processing", "simulation"],
    },
};